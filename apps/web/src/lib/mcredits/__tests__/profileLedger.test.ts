import { Wallet } from 'ethers'
import { describe, expect, it, vi } from 'vitest'
import {
  mutateDexMcreditsProfile,
  type DexMcreditsProfile,
  type ProfileLedgerStore,
} from '../profileLedger'
import { buildDexMcreditsTransferMessage, transferDexProfileMcredits } from '../profileTransfer'

function memoryStore(): ProfileLedgerStore & { profile: DexMcreditsProfile | null; revision: number } {
  return {
    profile: null,
    revision: 0,
    async load() { return { profile: this.profile ? structuredClone(this.profile) : null, etag: this.profile ? String(this.revision) : null } },
    async save(_wallet, profile, etag) {
      const expected = this.profile ? String(this.revision) : null
      if (etag !== expected) throw Object.assign(new Error('precondition'), { status: 412 })
      this.profile = structuredClone(profile)
      this.revision += 1
    },
  }
}

const wallet = Wallet.createRandom()
const now = Date.parse('2026-10-24T12:00:00.000Z')
const env = {
  MARCO_MCREDITS_TRANSFER_ENABLED: 'true',
  MARCO_MCREDITS_TRANSFER_SECRET: 'transfer-secret',
  MARCO_CREDITS_ENDPOINT: 'https://passport.example',
}

async function signedInput(direction: 'PASSPORT_TO_APP' | 'APP_TO_PASSPORT', overrides: Record<string, string> = {}) {
  const input = {
    wallet: wallet.address,
    direction,
    amountMinor: '1000',
    externalReference: 'dex:test-1',
    passportSubject: 'MP-2610-TEST1',
    issuedAt: new Date(now).toISOString(),
    customerAuthorization: 'mctr_customer_authorization',
    ...overrides,
  }
  return { ...input, signature: await wallet.signMessage(buildDexMcreditsTransferMessage(input)) }
}

describe('DEX durable Mcredits profile ledger', () => {
  it('applies a reference exactly once and refuses a changed replay', async () => {
    const store = memoryStore()
    const first = await mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'in:1', fingerprint: 'a', deltaMinor: 1000n, store })
    const retry = await mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'in:1', fingerprint: 'a', deltaMinor: 1000n, store })
    expect(first.profile.balanceMinor).toBe('1000')
    expect(retry.duplicate).toBe(true)
    await expect(mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'in:1', fingerprint: 'b', deltaMinor: 1000n, store }))
      .rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' })
  })

  it('serializes concurrent debits with ETag CAS and prevents overspend', async () => {
    const store = memoryStore()
    await mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'fund', fingerprint: 'fund', deltaMinor: 1000n, store })
    const outcomes = await Promise.allSettled([
      mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'out:1', fingerprint: '1', deltaMinor: -700n, store }),
      mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'out:2', fingerprint: '2', deltaMinor: -700n, store }),
    ])
    expect(outcomes.filter((row) => row.status === 'fulfilled')).toHaveLength(1)
    expect(outcomes.filter((row) => row.status === 'rejected')[0]).toMatchObject({ reason: { code: 'INSUFFICIENT_MCREDITS' } })
    expect(store.profile?.balanceMinor).toBe('300')
  })

  it('requires the connected profile wallet signature and exact whole-Mcredits precision', async () => {
    const input = await signedInput('PASSPORT_TO_APP')
    const bad = await transferDexProfileMcredits({ ...input, wallet: Wallet.createRandom().address }, { env, now: () => now, store: memoryStore() })
    expect(bad).toMatchObject({ ok: false, gate: 'WALLET_SIGNER_MISMATCH' })
    const fractional = await signedInput('PASSPORT_TO_APP', { amountMinor: '101' })
    expect(await transferDexProfileMcredits(fractional, { env, now: () => now, store: memoryStore() }))
      .toMatchObject({ ok: false, gate: 'INVALID_TRANSFER' })
  })

  it('credits only after Passport completion and signs the exact issuer contract', async () => {
    const store = memoryStore()
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({
      ok: true, duplicate: false, transfer: { transfer_id: 'transfer-1' },
    }), { status: 200 }))
    const result = await transferDexProfileMcredits(await signedInput('PASSPORT_TO_APP'), { env, now: () => now, store, fetch })
    expect(result).toMatchObject({ ok: true, transferId: 'transfer-1', balanceMinor: '1000' })
    expect(store.profile?.balanceMinor).toBe('1000')
    const headers = fetch.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers['x-marco-issuer']).toBe('MELEGA_DEX')
    expect(headers['x-marco-signature']).toMatch(/^[a-f0-9]{64}$/)
    expect(headers.authorization).toBeUndefined()
  })

  it('debits first, reconciles uncertainty, and never reverses without definitive failure', async () => {
    const store = memoryStore()
    await mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'fund', fingerprint: 'fund', deltaMinor: 2000n, store })
    const fetch = vi.fn(async (url: string) => {
      if (url.endsWith('/api/public/mcredits/transfer')) throw new Error('lost response')
      return new Response(JSON.stringify({ status: 'PENDING' }), { status: 200 })
    })
    const result = await transferDexProfileMcredits(await signedInput('APP_TO_PASSPORT'), { env, now: () => now, store, fetch })
    expect(result).toMatchObject({ ok: false, gate: 'PASSPORT_TRANSFER_UNREACHABLE' })
    expect(store.profile?.balanceMinor).toBe('1000')
    expect(store.profile?.entries.some((entry) => entry.reference.startsWith('passport-transfer-reversal:'))).toBe(false)
  })

  it('reverses a debit only after NOT_FOUND and makes that reference terminal', async () => {
    const store = memoryStore()
    await mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'fund', fingerprint: 'fund', deltaMinor: 2000n, store })
    const fetch = vi.fn(async (url: string) => url.endsWith('/api/public/mcredits/transfer')
      ? new Response(JSON.stringify({ ok: false, error: 'AUTHORIZATION_INVALID' }), { status: 400 })
      : new Response(JSON.stringify({ status: 'NOT_FOUND' }), { status: 404 }))
    const input = await signedInput('APP_TO_PASSPORT')
    expect(await transferDexProfileMcredits(input, { env, now: () => now, store, fetch }))
      .toMatchObject({ ok: false, gate: 'AUTHORIZATION_INVALID' })
    expect(store.profile?.balanceMinor).toBe('2000')
    expect(await transferDexProfileMcredits(input, { env, now: () => now, store, fetch }))
      .toMatchObject({ ok: false, gate: 'IDEMPOTENCY_CONFLICT' })
  })

  it('accepts a renewed Passport authorization on the same uncertain operation without a second debit', async () => {
    const store = memoryStore()
    await mutateDexMcreditsProfile({ wallet: wallet.address, reference: 'fund', fingerprint: 'fund', deltaMinor: 2000n, store })
    const pendingFetch = vi.fn(async (url: string) => {
      if (url.endsWith('/api/public/mcredits/transfer')) throw new Error('timeout')
      return new Response(JSON.stringify({ status: 'PENDING' }), { status: 200 })
    })
    const first = await signedInput('APP_TO_PASSPORT')
    expect(await transferDexProfileMcredits(first, { env, now: () => now, store, fetch: pendingFetch }))
      .toMatchObject({ ok: false, gate: 'PASSPORT_TRANSFER_UNREACHABLE' })
    const renewed = await signedInput('APP_TO_PASSPORT', { customerAuthorization: 'mctr_renewed_authorization' })
    const completedFetch = vi.fn(async () => new Response(JSON.stringify({
      ok: true, duplicate: true, transfer: { transfer_id: 'transfer-renewed' },
    }), { status: 200 }))
    expect(await transferDexProfileMcredits(renewed, { env, now: () => now, store, fetch: completedFetch }))
      .toMatchObject({ ok: true, transferId: 'transfer-renewed' })
    expect(store.profile?.balanceMinor).toBe('1000')
    expect(store.profile?.entries.filter((entry) => entry.reference.startsWith('passport-transfer-out:'))).toHaveLength(1)
  })
})
