import { createHash, createHmac } from 'crypto'
import { ethers } from 'ethers'
import { mutateDexMcreditsProfile, type ProfileLedgerStore } from './profileLedger'
import { buildDexMcreditsTransferMessage, type DexTransferDirection } from './profileTransferMessage'

export { buildDexMcreditsTransferMessage, type DexTransferDirection } from './profileTransferMessage'
type Runtime = {
  env?: Record<string, string | undefined>
  fetch?: (input: string, init?: RequestInit) => Promise<Response>
  now?: () => number
  store?: ProfileLedgerStore
}

function config(env: Record<string, string | undefined> = process.env) {
  return {
    endpoint: (env.MARCO_CREDITS_ENDPOINT ?? 'https://marco.melega.ai').replace(/\/+$/, ''),
    secret: env.MARCO_MCREDITS_TRANSFER_SECRET ?? null,
    enabled: env.MARCO_MCREDITS_TRANSFER_ENABLED === 'true',
  }
}

function signedHeaders(secret: string, body: string, now: () => number) {
  const timestamp = String(Math.floor(now() / 1000))
  return {
    'content-type': 'application/json',
    'x-marco-issuer': 'MELEGA_DEX',
    'x-marco-timestamp': timestamp,
    'x-marco-signature': createHmac('sha256', secret).update(`v1.${timestamp}.${body}`).digest('hex'),
  }
}

function fingerprint(input: { direction: DexTransferDirection; amountMinor: string; externalReference: string; passportSubject: string }) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex')
}

async function reconcile(cfg: ReturnType<typeof config>, reference: string, runtime: Runtime) {
  const body = JSON.stringify({ surface: 'melega_dex' })
  try {
    const response = await (runtime.fetch ?? fetch)(
      `${cfg.endpoint}/api/public/mcredits/transfer/${encodeURIComponent(reference)}`,
      { method: 'POST', headers: signedHeaders(cfg.secret || '', body, runtime.now ?? Date.now), body },
    )
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null
    const status = String(payload?.status ?? (response.status === 404 ? 'NOT_FOUND' : 'UNREACHABLE'))
    const transfer = payload && typeof payload.transfer === 'object' ? payload.transfer as Record<string, unknown> : null
    const transferId = typeof transfer?.transfer_id === 'string' ? transfer.transfer_id : null
    return { status, transferId }
  } catch {
    return { status: 'UNREACHABLE', transferId: null }
  }
}

export async function transferDexProfileMcredits(input: {
  wallet: string
  signature: string
  issuedAt: string
  direction: DexTransferDirection
  amountMinor: string
  externalReference: string
  customerAuthorization: string
  passportSubject: string
}, runtime: Runtime = {}) {
  const cfg = config(runtime.env)
  if (!cfg.enabled || !cfg.secret) return { ok: false as const, gate: 'TRANSFER_NOT_CONFIGURED' }
  if (!ethers.utils.isAddress(input.wallet) || !/^[1-9]\d*$/.test(input.amountMinor) || BigInt(input.amountMinor) % 100n !== 0n) {
    return { ok: false as const, gate: 'INVALID_TRANSFER' }
  }
  const issuedMs = Date.parse(input.issuedAt)
  if (!Number.isFinite(issuedMs) || Math.abs((runtime.now ?? Date.now)() - issuedMs) > 5 * 60_000) {
    return { ok: false as const, gate: 'WALLET_PROOF_EXPIRED' }
  }
  const message = buildDexMcreditsTransferMessage(input)
  let recovered: string
  try { recovered = ethers.utils.verifyMessage(message, input.signature) } catch { return { ok: false as const, gate: 'INVALID_WALLET_SIGNATURE' } }
  if (recovered.toLowerCase() !== input.wallet.toLowerCase()) return { ok: false as const, gate: 'WALLET_SIGNER_MISMATCH' }

  const operationFingerprint = fingerprint({
    direction: input.direction,
    amountMinor: input.amountMinor,
    externalReference: input.externalReference,
    passportSubject: input.passportSubject,
  })
  let balanceMinor: string | null = null
  if (input.direction === 'APP_TO_PASSPORT') {
    try {
      const debited = await mutateDexMcreditsProfile({
        wallet: input.wallet,
        reference: `passport-transfer-out:${input.externalReference}`,
        fingerprint: operationFingerprint,
        deltaMinor: -BigInt(input.amountMinor),
        rejectIfReference: `passport-transfer-reversal:${input.externalReference}`,
        store: runtime.store,
      })
      const { balanceMinor: debitedBalance } = debited.profile
      balanceMinor = debitedBalance
    } catch (error) {
      return { ok: false as const, gate: (error as { code?: string }).code ?? 'LOCAL_DEBIT_FAILED' }
    }
  }

  const payload = {
    surface: 'melega_dex', direction: input.direction, amount_minor: input.amountMinor,
    external_reference: input.externalReference, passport_subject: input.passportSubject,
    app_debit_reference: input.direction === 'APP_TO_PASSPORT' ? `passport-transfer-out:${input.externalReference}` : null,
    mcredits_transfer_authorization: input.customerAuthorization,
  }
  const body = JSON.stringify(payload)
  let response: Response | null = null
  try {
    response = await (runtime.fetch ?? fetch)(`${cfg.endpoint}/api/public/mcredits/transfer`, {
      method: 'POST', headers: signedHeaders(cfg.secret, body, runtime.now ?? Date.now), body,
    })
  } catch { /* reconcile below */ }
  const result = response ? await response.json().catch(() => null) as Record<string, unknown> | null : null
  const transfer = result && typeof result.transfer === 'object' ? result.transfer as Record<string, unknown> : null
  let transferId = typeof transfer?.transfer_id === 'string' ? transfer.transfer_id : null
  let duplicate = result?.duplicate === true
  if (!response?.ok || result?.ok !== true || !transferId) {
    const truth = await reconcile(cfg, input.externalReference, runtime)
    if (truth.status === 'COMPLETED' && truth.transferId) {
      ({ transferId } = truth)
      duplicate = true
    } else if (input.direction === 'APP_TO_PASSPORT' && ['NOT_FOUND', 'FAILED'].includes(truth.status)) {
      try {
        await mutateDexMcreditsProfile({
          wallet: input.wallet,
          reference: `passport-transfer-reversal:${input.externalReference}`,
          fingerprint: operationFingerprint,
          deltaMinor: BigInt(input.amountMinor),
          store: runtime.store,
        })
        return { ok: false as const, gate: String(result?.error ?? 'PASSPORT_TRANSFER_REFUSED') }
      } catch {
        return { ok: false as const, gate: 'LOCAL_REVERSAL_PENDING_RETRY' }
      }
    } else {
      return { ok: false as const, gate: 'PASSPORT_TRANSFER_UNREACHABLE' }
    }
  }

  if (input.direction === 'PASSPORT_TO_APP') {
    try {
      const credited = await mutateDexMcreditsProfile({
        wallet: input.wallet,
        reference: `passport-transfer-in:${transferId}`,
        fingerprint: operationFingerprint,
        deltaMinor: BigInt(input.amountMinor),
        store: runtime.store,
      })
      duplicate ||= credited.duplicate
      const { balanceMinor: creditedBalance } = credited.profile
      balanceMinor = creditedBalance
    } catch {
      return { ok: false as const, gate: 'LOCAL_CREDIT_PENDING_RETRY', transferId }
    }
  }
  return { ok: true as const, transferId, duplicate, balanceMinor }
}
