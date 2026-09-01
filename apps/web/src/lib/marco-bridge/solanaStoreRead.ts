import { CANONICAL_BNB_SOLANA_GATE } from './canonicalBnbSolanaGate'
import { parseOftStoreAccount } from './solanaUnpause'

export const SOLANA_STORE_RPC_PRIMARY =
  process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export const SOLANA_STORE_RPC_FALLBACK =
  process.env.SOLANA_RPC_FALLBACK_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_FALLBACK_URL ||
  'https://solana-rpc.publicnode.com'

export const SOLANA_STORE_RPC_TIMEOUT_MS = Number(process.env.SOLANA_RPC_TIMEOUT_MS || 4_000)

export type SolanaStorePauseRead =
  | {
      ok: true
      paused: boolean
      store: string
      owner: string
      mint: string
    }
  | {
      ok: false
      reason: 'rpc_error' | 'mismatch' | 'timeout' | 'decode_error'
      detail: string
    }

type SolanaAccountInfo = {
  result?: {
    value?: {
      data?: [string, string] | string
      owner?: string
    } | null
  }
}

function decodeAccountData(data: [string, string] | string | undefined): Uint8Array | null {
  if (Array.isArray(data) && data[1] === 'base64' && typeof data[0] === 'string') {
    return Uint8Array.from(Buffer.from(data[0], 'base64'))
  }
  if (typeof data === 'string') {
    return Uint8Array.from(Buffer.from(data, 'base64'))
  }
  return null
}

async function rpcGetAccountInfo(
  url: string,
  store: string,
  fetcher: typeof fetch,
  timeoutMs: number,
): Promise<SolanaAccountInfo> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetcher(url, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [store, { encoding: 'base64', commitment: 'confirmed' }],
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Solana RPC HTTP ${response.status}`)
    return (await response.json()) as SolanaAccountInfo
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      const timeout = new Error('Solana RPC timeout')
      timeout.name = 'TimeoutError'
      throw timeout
    }
    throw cause
  } finally {
    clearTimeout(timer)
  }
}

function interpretAccount(payload: SolanaAccountInfo): SolanaStorePauseRead {
  const value = payload.result?.value
  if (!value) {
    return { ok: false, reason: 'mismatch', detail: 'Canonical Solana OFT store account is missing.' }
  }
  if (value.owner !== CANONICAL_BNB_SOLANA_GATE.programId) {
    return { ok: false, reason: 'mismatch', detail: 'Canonical Solana OFT store owner program mismatch.' }
  }
  const raw = decodeAccountData(value.data)
  if (!raw) {
    return { ok: false, reason: 'decode_error', detail: 'Canonical Solana OFT store data is not decodable.' }
  }
  try {
    const parsed = parseOftStoreAccount(raw, value.owner)
    if (parsed.mint !== CANONICAL_BNB_SOLANA_GATE.mint) {
      return { ok: false, reason: 'mismatch', detail: 'Canonical Solana OFT store mint mismatch.' }
    }
    if (parsed.programId !== CANONICAL_BNB_SOLANA_GATE.programId) {
      return { ok: false, reason: 'mismatch', detail: 'Canonical Solana OFT store program mismatch.' }
    }
    return {
      ok: true,
      paused: parsed.paused,
      store: CANONICAL_BNB_SOLANA_GATE.store,
      owner: parsed.programId,
      mint: parsed.mint,
    }
  } catch (cause) {
    return {
      ok: false,
      reason: 'decode_error',
      detail: cause instanceof Error ? cause.message : 'Canonical Solana OFT store decode failed.',
    }
  }
}

export async function readCanonicalSolanaStorePause(input: {
  fetcher?: typeof fetch
  primaryUrl?: string
  fallbackUrl?: string
  timeoutMs?: number
} = {}): Promise<SolanaStorePauseRead> {
  const fetcher = input.fetcher ?? fetch
  const timeoutMs = input.timeoutMs ?? SOLANA_STORE_RPC_TIMEOUT_MS
  const endpoints = [input.primaryUrl ?? SOLANA_STORE_RPC_PRIMARY, input.fallbackUrl ?? SOLANA_STORE_RPC_FALLBACK]
  let lastError = 'Solana store RPC failed.'
  let lastReason: 'rpc_error' | 'timeout' = 'rpc_error'

  for (const url of endpoints) {
    try {
      const payload = await rpcGetAccountInfo(url, CANONICAL_BNB_SOLANA_GATE.store, fetcher, timeoutMs)
      return interpretAccount(payload)
    } catch (cause) {
      lastReason = cause instanceof Error && cause.name === 'TimeoutError' ? 'timeout' : 'rpc_error'
      lastError = cause instanceof Error ? cause.message : 'Solana store RPC failed.'
    }
  }

  return { ok: false, reason: lastReason, detail: lastError }
}

/** Fail-closed: BNB→Solana is executable only with a live paused=false read. */
export function solanaStoreBlocksCanonicalRoute(read: SolanaStorePauseRead): boolean {
  return !read.ok || read.paused
}
