import { Interface } from '@ethersproject/abi'
import { VENUE_HEALTH_STATE, healthSnapshot, type VenueHealthSnapshot } from './health'
import { SHADOW_QUOTE_KIND, type ShadowQuoteObservation, type ShadowQuoteSource } from './shadowQuoteSource'

const V2_ROUTER = new Interface([
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
])

export function encodeGetAmountsOut(amountInRaw: string, path: string[]): string {
  return V2_ROUTER.encodeFunctionData('getAmountsOut', [amountInRaw, path])
}

export function decodeGetAmountsOut(data: string): string {
  const decoded = V2_ROUTER.decodeFunctionResult('getAmountsOut', data)
  const amounts = decoded[0] as Array<{ toString(): string }>
  const last = amounts[amounts.length - 1]
  if (!last) throw new Error('NO_ROUTE')
  return last.toString()
}

/**
 * Optional factual eth_call source. Read-only. Never broadcasts.
 */
export function createFactualV2QuoteSource(input: {
  rpcUrlByChain: Partial<Record<number, string>>
  fetchImpl?: typeof fetch
}): ShadowQuoteSource {
  const fetchImpl = input.fetchImpl ?? fetch
  return {
    async fetch(request) {
      const rpc = input.rpcUrlByChain[request.chainId]
      if (!rpc) throw new Error('RPC_UNAVAILABLE')
      const data = encodeGetAmountsOut(request.amountInRaw, request.path)
      const response = await fetchImpl(rpc, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{ to: request.router, data }, 'latest'],
        }),
        signal: request.signal,
      })
      const payload = (await response.json()) as { result?: string; error?: { message?: string } }
      if (!payload.result || payload.result === '0x') {
        throw new Error(payload.error?.message || 'NO_ROUTE')
      }
      return {
        kind: SHADOW_QUOTE_KIND.FACTUAL,
        amountOutRaw: decodeGetAmountsOut(payload.result),
        path: request.path,
        gasUnits: null,
        priceImpactPercent: null,
        quotedAt: new Date().toISOString(),
      }
    },
  }
}

export interface EvmRpcReadinessProbeInput {
  venueId: string
  chainId: number
  rpcUrlByChain: Partial<Record<number, string>>
  signal: AbortSignal
  fetchImpl?: typeof fetch
  nowIso?: string
}

function readinessSnapshot(
  venueId: string,
  state: (typeof VENUE_HEALTH_STATE)[keyof typeof VENUE_HEALTH_STATE],
  reason: string | null,
  providerHealthy: boolean,
  nowIso?: string,
): VenueHealthSnapshot {
  if (nowIso !== undefined) {
    return healthSnapshot(venueId, state, reason, { providerHealthy }, nowIso)
  }
  return healthSnapshot(venueId, state, reason, { providerHealthy })
}

function parseHexQuantity(value: unknown): bigint | null {
  if (typeof value !== 'string') return null
  const hex = value.trim()
  if (!/^0x[0-9a-fA-F]+$/.test(hex)) return null
  try {
    return BigInt(hex)
  } catch {
    return null
  }
}

async function jsonRpcCall(
  fetchImpl: typeof fetch,
  rpcUrl: string,
  method: 'eth_chainId' | 'eth_blockNumber',
  signal: AbortSignal,
): Promise<{ ok: true; result: unknown } | { ok: false }> {
  try {
    const response = await fetchImpl(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params: [],
      }),
      signal,
    })
    if (!response.ok) return { ok: false }
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      return { ok: false }
    }
    if (payload == null || typeof payload !== 'object') return { ok: false }
    const record = payload as { result?: unknown; error?: unknown }
    if (record.error != null) return { ok: false }
    if (!('result' in record)) return { ok: false }
    return { ok: true, result: record.result }
  } catch {
    return { ok: false }
  }
}

/**
 * Read-only EVM JSON-RPC readiness probe. Never broadcasts. Does not time itself out.
 * Caller supplies AbortSignal. Operational failures resolve as UNAVAILABLE.
 */
export async function probeEvmRpcReadiness(input: EvmRpcReadinessProbeInput): Promise<VenueHealthSnapshot> {
  const rpc = input.rpcUrlByChain[input.chainId]
  if (typeof rpc !== 'string' || rpc.trim() === '') {
    return readinessSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-url-missing',
      false,
      input.nowIso,
    )
  }

  const fetchImpl = input.fetchImpl ?? fetch
  const chain = await jsonRpcCall(fetchImpl, rpc, 'eth_chainId', input.signal)
  if (!chain.ok) {
    return readinessSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-unavailable',
      false,
      input.nowIso,
    )
  }
  const reportedChainId = parseHexQuantity(chain.result)
  if (reportedChainId == null) {
    return readinessSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-unavailable',
      false,
      input.nowIso,
    )
  }
  if (reportedChainId !== BigInt(input.chainId)) {
    return readinessSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-chain-mismatch',
      false,
      input.nowIso,
    )
  }

  const block = await jsonRpcCall(fetchImpl, rpc, 'eth_blockNumber', input.signal)
  if (!block.ok) {
    return readinessSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-unavailable',
      false,
      input.nowIso,
    )
  }
  const blockNumber = parseHexQuantity(block.result)
  if (blockNumber == null || blockNumber < 0n) {
    return readinessSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-unavailable',
      false,
      input.nowIso,
    )
  }

  return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.HEALTHY, null, true, input.nowIso)
}
