import { createHash } from 'crypto'
import { BlobPreconditionFailedError, get, put } from '@vercel/blob'

export type DexMcreditsLedgerEntry = {
  reference: string
  fingerprint: string
  deltaMinor: string
  balanceAfterMinor: string
  createdAt: string
}

export type DexMcreditsProfile = {
  schema: 'melega.dex-mcredits-profile.v1'
  wallet: string
  balanceMinor: string
  entries: DexMcreditsLedgerEntry[]
  updatedAt: string
}

type Loaded = { profile: DexMcreditsProfile | null; etag: string | null }
export type ProfileLedgerStore = {
  load(wallet: string): Promise<Loaded>
  save(wallet: string, profile: DexMcreditsProfile, etag: string | null): Promise<void>
}

export class DexMcreditsLedgerError extends Error {
  constructor(public readonly code: 'STORAGE_UNAVAILABLE' | 'INSUFFICIENT_MCREDITS' | 'IDEMPOTENCY_CONFLICT') {
    super(code)
    this.name = 'DexMcreditsLedgerError'
  }
}

const PREFIX = 'monetization/v1/mcredits-profiles/'
const MAX_CAS_ATTEMPTS = 8

function token() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || null
}

function canonicalWallet(wallet: string) {
  return wallet.toLowerCase()
}

function key(wallet: string) {
  return `${PREFIX}${createHash('sha256').update(canonicalWallet(wallet)).digest('hex')}.json`
}

const blobStore: ProfileLedgerStore = {
  async load(wallet) {
    const storageToken = token()
    if (!storageToken) throw new DexMcreditsLedgerError('STORAGE_UNAVAILABLE')
    try {
      const result = await get(key(wallet), { access: 'private', token: storageToken, useCache: false })
      if (!result || result.statusCode !== 200) return { profile: null, etag: null }
      return { profile: await new Response(result.stream).json() as DexMcreditsProfile, etag: result.blob.etag }
    } catch (error) {
      const status = (error as { status?: number; statusCode?: number }).status ??
        (error as { statusCode?: number }).statusCode
      if (status === 404) return { profile: null, etag: null }
      throw error
    }
  },
  async save(wallet, profile, etag) {
    const storageToken = token()
    if (!storageToken) throw new DexMcreditsLedgerError('STORAGE_UNAVAILABLE')
    await put(key(wallet), JSON.stringify(profile), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: Boolean(etag),
      ...(etag ? { ifMatch: etag } : {}),
      contentType: 'application/json',
      token: storageToken,
    })
  },
}

function validProfile(profile: DexMcreditsProfile | null, wallet: string) {
  return profile?.schema === 'melega.dex-mcredits-profile.v1' && profile.wallet === canonicalWallet(wallet)
}

export async function mutateDexMcreditsProfile(input: {
  wallet: string
  reference: string
  fingerprint: string
  deltaMinor: bigint
  rejectIfReference?: string
  now?: () => Date
  store?: ProfileLedgerStore
}): Promise<{ profile: DexMcreditsProfile; duplicate: boolean }> {
  const store = input.store ?? blobStore
  const wallet = canonicalWallet(input.wallet)
  if (!/^0x[a-f0-9]{40}$/.test(wallet) || !input.reference.trim() || !input.fingerprint.trim() || input.deltaMinor === 0n) {
    throw new DexMcreditsLedgerError('IDEMPOTENCY_CONFLICT')
  }
  const attemptMutation = async (attempt: number): Promise<{ profile: DexMcreditsProfile; duplicate: boolean }> => {
    if (attempt >= MAX_CAS_ATTEMPTS) throw new DexMcreditsLedgerError('STORAGE_UNAVAILABLE')
    const loaded = await store.load(wallet)
    if (loaded.profile && !validProfile(loaded.profile, wallet)) {
      throw new DexMcreditsLedgerError('IDEMPOTENCY_CONFLICT')
    }
    const current = loaded.profile ?? {
      schema: 'melega.dex-mcredits-profile.v1' as const,
      wallet,
      balanceMinor: '0',
      entries: [],
      updatedAt: (input.now ?? (() => new Date()))().toISOString(),
    }
    if (input.rejectIfReference && current.entries.some((entry) => entry.reference === input.rejectIfReference)) {
      throw new DexMcreditsLedgerError('IDEMPOTENCY_CONFLICT')
    }
    const prior = current.entries.find((entry) => entry.reference === input.reference)
    if (prior) {
      if (prior.fingerprint !== input.fingerprint || prior.deltaMinor !== input.deltaMinor.toString()) {
        throw new DexMcreditsLedgerError('IDEMPOTENCY_CONFLICT')
      }
      return { profile: current, duplicate: true }
    }
    const balance = BigInt(current.balanceMinor) + input.deltaMinor
    if (balance < 0n) throw new DexMcreditsLedgerError('INSUFFICIENT_MCREDITS')
    const createdAt = (input.now ?? (() => new Date()))().toISOString()
    const next: DexMcreditsProfile = {
      ...current,
      balanceMinor: balance.toString(),
      entries: [...current.entries, {
        reference: input.reference,
        fingerprint: input.fingerprint,
        deltaMinor: input.deltaMinor.toString(),
        balanceAfterMinor: balance.toString(),
        createdAt,
      }],
      updatedAt: createdAt,
    }
    try {
      await store.save(wallet, next, loaded.etag)
      return { profile: next, duplicate: false }
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError || (error as { status?: number }).status === 412) {
        return attemptMutation(attempt + 1)
      }
      // A create racing another create is also retried by reading the winner.
      if (!loaded.etag && /already exists|overwrite|conflict/i.test(String((error as Error).message))) {
        return attemptMutation(attempt + 1)
      }
      throw error
    }
  }
  return attemptMutation(0)
}

export async function readDexMcreditsProfile(wallet: string, store: ProfileLedgerStore = blobStore) {
  const loaded = await store.load(canonicalWallet(wallet))
  return validProfile(loaded.profile, wallet) ? loaded.profile : null
}
