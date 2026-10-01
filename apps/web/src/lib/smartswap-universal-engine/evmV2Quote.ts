import { Interface } from '@ethersproject/abi'
import { MELEGA_DEX_VENUE, PANCAKE_SWAP_VENUE, UNISWAP_VENUE, type CertifiedEvmVenue } from './certifiedVenues'
import { VENUE_HEALTH_STATE, healthSnapshot, type VenueHealthSnapshot } from './health'
import { collectBoundedParallel, type LatencyBudget } from './latency'
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

/* ------------------------------------------------------------------------------------------------------------
 * Factual V2 price impact (informational only; never used for route selection).
 *
 * Source of truth: the exact quoted V2 path and the reserves of each hop's pair on the SAME venue's factory
 * (Pancake reserves for Pancake, Melega reserves for Melega). No oracle/USD prices, no slippage, no legacy trade.
 *
 * Convention = the existing Melega DEX UI "Price Impact" (utils/exchange.ts computeTradePriceBreakdown →
 * priceImpactWithoutFee): pure x*y=k curve impact, LP fee EXCLUDED, i.e. Trade.priceImpact − realizedLPFee:
 *
 *   midOut        = amountIn * Π(reserveOut_i / reserveIn_i)          (hop mid outputs chained, exact rational)
 *   rawDeviation  = (midOut − amountOut) / midOut                      (amountOut = router getAmountsOut)
 *   realizedLPFee = 1 − Π(1 − lpFeeBps_i / 10_000)                     (Pancake V2 25 bps, Melega V2 25 bps)
 *   impact        = rawDeviation − realizedLPFee = Π(1 − f_i) − amountOut / midOut
 *   priceImpactPercent = impact * 100                                  (0.25 means 0.25%)
 *
 * amountIn is the venue input the quote was made for (netVenueInputRaw: the 20 bps SmartSwap fee was already
 * removed upstream), so the SmartSwap fee is never counted as AMM impact.
 * ---------------------------------------------------------------------------------------------------------- */

const V2_FACTORY = new Interface(['function getPair(address tokenA, address tokenB) view returns (address pair)'])
const V2_PAIR = new Interface([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
])

const BPS = BigInt(10_000)
/** Result scale: 1e-6 of a percentage point. */
const PERCENT_SCALE = BigInt(1_000_000)
/** A negative result within one scale unit can only be integer-division rounding; anything below is bad data. */
const ROUNDING_TOLERANCE_UNITS = BigInt(1)
const HUNDRED_PERCENT_UNITS = BigInt(100) * PERCENT_SCALE
/** Reserve-read budget from request start, inside the existing 1200ms quote timeout. */
export const V2_PRICE_IMPACT_GRACE_MS = 750

export interface V2ImpactHop {
  reserveIn: bigint
  reserveOut: bigint
  lpFeeBps: number
}

function validImpactHops(hops: V2ImpactHop[]): boolean {
  return (
    hops.length > 0 &&
    hops.every(
      (hop) =>
        hop.reserveIn > BigInt(0) &&
        hop.reserveOut > BigInt(0) &&
        Number.isInteger(hop.lpFeeBps) &&
        hop.lpFeeBps >= 0 &&
        hop.lpFeeBps < 10_000,
    )
  )
}

/** Theoretical pre-trade mid output (no fee, no impact), hop mid outputs chained; floored only at the end. */
export function computeV2MidOutputRaw(amountInRaw: bigint, hops: V2ImpactHop[]): bigint | null {
  if (amountInRaw <= BigInt(0) || !validImpactHops(hops)) return null
  const num = hops.reduce((acc, hop) => acc * hop.reserveOut, amountInRaw)
  const den = hops.reduce((acc, hop) => acc * hop.reserveIn, BigInt(1))
  return num / den
}

/**
 * Factual V2 price impact in percent units (see formula above). BigInt throughout; Number only for the final
 * 1e-6-precision percentage. Returns null for malformed inputs or genuinely inconsistent data (never invented).
 */
export function computeV2PriceImpactPercent(input: {
  amountInRaw: bigint
  amountOutRaw: bigint
  hops: V2ImpactHop[]
}): number | null {
  const { amountInRaw, amountOutRaw, hops } = input
  if (amountInRaw <= BigInt(0) || amountOutRaw <= BigInt(0) || !validImpactHops(hops)) return null
  const reservesOut = hops.reduce((acc, hop) => acc * hop.reserveOut, BigInt(1))
  const reservesIn = hops.reduce((acc, hop) => acc * hop.reserveIn, BigInt(1))
  const feeKept = hops.reduce((acc, hop) => acc * (BPS - BigInt(hop.lpFeeBps)), BigInt(1))
  const bpsPow = hops.reduce((acc) => acc * BPS, BigInt(1))
  // impact = feeKept/bpsPow − amountOut*reservesIn/(amountIn*reservesOut), over one common denominator.
  const numerator = feeKept * amountInRaw * reservesOut - amountOutRaw * reservesIn * bpsPow
  const denominator = bpsPow * amountInRaw * reservesOut
  const units = (numerator * BigInt(100) * PERCENT_SCALE) / denominator
  if (units < BigInt(0)) {
    if (units >= -ROUNDING_TOLERANCE_UNITS) return 0
    return null
  }
  if (units > HUNDRED_PERCENT_UNITS) return null
  return Number(units) / Number(PERCENT_SCALE)
}

const CERTIFIED_V2_VENUES: CertifiedEvmVenue[] = [PANCAKE_SWAP_VENUE, MELEGA_DEX_VENUE, UNISWAP_VENUE]

/** The certified venue that owns this router on this chain (its factory + LP fee are that venue's own truth). */
export function resolveCertifiedV2Venue(chainId: number, router: string): CertifiedEvmVenue | null {
  const target = router.toLowerCase()
  return CERTIFIED_V2_VENUES.find((venue) => venue.routers[chainId]?.toLowerCase() === target) ?? null
}

interface V2PairMetadata {
  pair: string
  token0: string
  token1: string
}

/** Pair address and token0/token1 are immutable once a pair exists; zero/failed lookups are never cached. */
const PAIR_METADATA_CACHE = new Map<string, V2PairMetadata>()

export function resetV2PairMetadataCacheForTests(): void {
  PAIR_METADATA_CACHE.clear()
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

async function readOnlyEthCall(
  fetchImpl: typeof fetch,
  rpc: string,
  to: string,
  data: string,
  signal: AbortSignal | undefined,
): Promise<string> {
  const response = await fetchImpl(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] }),
    signal,
  })
  if (!response.ok) throw new Error('RPC_HTTP_ERROR')
  const payload = (await response.json()) as { result?: string; error?: { message?: string } }
  if (!payload || typeof payload.result !== 'string' || payload.result === '0x') {
    throw new Error(payload?.error?.message || 'EMPTY_RESULT')
  }
  return payload.result
}

async function readHopReserves(
  call: (to: string, data: string) => Promise<string>,
  chainId: number,
  factory: string,
  tokenIn: string,
  tokenOut: string,
  lpFeeBps: number,
): Promise<V2ImpactHop> {
  const a = tokenIn.toLowerCase()
  const b = tokenOut.toLowerCase()
  const key = `${chainId}:${factory.toLowerCase()}:${a < b ? `${a}:${b}` : `${b}:${a}`}`
  let meta = PAIR_METADATA_CACHE.get(key)
  let reservesData: string
  if (meta) {
    reservesData = await call(meta.pair, V2_PAIR.encodeFunctionData('getReserves'))
  } else {
    const pairRaw = V2_FACTORY.decodeFunctionResult(
      'getPair',
      await call(factory, V2_FACTORY.encodeFunctionData('getPair', [tokenIn, tokenOut])),
    )[0] as string
    const pair = pairRaw.toLowerCase()
    if (pair === ZERO_ADDRESS) throw new Error('PAIR_NOT_FOUND')
    const [t0, t1, reserves] = await Promise.all([
      call(pair, V2_PAIR.encodeFunctionData('token0')),
      call(pair, V2_PAIR.encodeFunctionData('token1')),
      call(pair, V2_PAIR.encodeFunctionData('getReserves')),
    ])
    const token0 = (V2_PAIR.decodeFunctionResult('token0', t0)[0] as string).toLowerCase()
    const token1 = (V2_PAIR.decodeFunctionResult('token1', t1)[0] as string).toLowerCase()
    if (!((token0 === a && token1 === b) || (token0 === b && token1 === a))) throw new Error('PAIR_TOKENS_MISMATCH')
    meta = { pair, token0, token1 }
    // Keep long-lived browser sessions bounded; reserves themselves are never cached.
    if (PAIR_METADATA_CACHE.size >= 256) PAIR_METADATA_CACHE.delete(PAIR_METADATA_CACHE.keys().next().value)
    PAIR_METADATA_CACHE.set(key, meta)
    reservesData = reserves
  }
  const decoded = V2_PAIR.decodeFunctionResult('getReserves', reservesData)
  const reserve0 = BigInt(decoded[0].toString())
  const reserve1 = BigInt(decoded[1].toString())
  const inIsToken0 = meta.token0 === a
  return {
    reserveIn: inIsToken0 ? reserve0 : reserve1,
    reserveOut: inIsToken0 ? reserve1 : reserve0,
    lpFeeBps,
  }
}

/**
 * Read-only reserves for every hop of the exact quoted path on the router's own certified venue.
 * Resolves null (never throws) on unsupported venue metadata, missing pair, RPC failure or malformed data.
 */
export async function readV2PathReserves(input: {
  fetchImpl: typeof fetch
  rpc: string
  chainId: number
  router: string
  path: string[]
  signal?: AbortSignal
}): Promise<V2ImpactHop[] | null> {
  try {
    const venue = resolveCertifiedV2Venue(input.chainId, input.router)
    const factory = venue?.v2Factories?.[input.chainId]
    if (!venue || !factory || input.path.length < 2) return null
    const call = (to: string, data: string) => readOnlyEthCall(input.fetchImpl, input.rpc, to, data, input.signal)
    return await Promise.all(
      input.path
        .slice(0, -1)
        .map((tokenIn, i) =>
          readHopReserves(call, input.chainId, factory, tokenIn, input.path[i + 1], venue.v2LpFeeBps),
        ),
    )
  } catch {
    return null
  }
}

/** Reads may straddle blocks. Never attach impact when these reserves cannot reproduce the quoted output. */
function reservesMatchQuote(amountIn: bigint, amountOut: bigint, hops: V2ImpactHop[]): boolean {
  if (!validImpactHops(hops)) return false
  const reproduced = hops.reduce((current, hop) => {
    const withFee = current * (BPS - BigInt(hop.lpFeeBps))
    return (withFee * hop.reserveOut) / (hop.reserveIn * BPS + withFee)
  }, amountIn)
  return reproduced === amountOut
}

/**
 * Optional factual eth_call source. Read-only. Never broadcasts.
 * getAmountsOut alone decides the quote; the factual price impact is attached when the reserve reads succeed
 * (otherwise priceImpactPercent stays null and the quote is unchanged).
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
      // The reserve deadline starts alongside the router call, not after it. A slow router quote
      // must not acquire an extra wait that can turn a usable route into an adapter timeout.
      const reserveController = new AbortController()
      const abortReserves = () => reserveController.abort()
      request.signal?.addEventListener('abort', abortReserves, { once: true })
      if (request.signal?.aborted) abortReserves()
      const reserveTimer = setTimeout(abortReserves, V2_PRICE_IMPACT_GRACE_MS)
      const reserves = Promise.race([
        readV2PathReserves({
          fetchImpl,
          rpc,
          chainId: request.chainId,
          router: request.router,
          path: request.path,
          signal: reserveController.signal,
        }),
        new Promise<null>((resolve) => {
          if (reserveController.signal.aborted) resolve(null)
          else reserveController.signal.addEventListener('abort', () => resolve(null), { once: true })
        }),
      ])
      try {
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
        const amountOutRaw = decodeGetAmountsOut(payload.result)
        let priceImpactPercent: number | null = null
        try {
          const hops = await reserves
          priceImpactPercent =
            hops && reservesMatchQuote(BigInt(request.amountInRaw), BigInt(amountOutRaw), hops)
              ? computeV2PriceImpactPercent({
                  amountInRaw: BigInt(request.amountInRaw),
                  amountOutRaw: BigInt(amountOutRaw),
                  hops,
                })
              : null
        } catch {
          priceImpactPercent = null
        }
        return {
          kind: SHADOW_QUOTE_KIND.FACTUAL,
          amountOutRaw,
          path: request.path,
          gasUnits: null,
          priceImpactPercent,
          quotedAt: new Date().toISOString(),
        }
      } finally {
        clearTimeout(reserveTimer)
        request.signal?.removeEventListener('abort', abortReserves)
        abortReserves()
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
    return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-url-missing', false, input.nowIso)
  }

  const fetchImpl = input.fetchImpl ?? fetch
  const chain = await jsonRpcCall(fetchImpl, rpc, 'eth_chainId', input.signal)
  if (!chain.ok) {
    return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', false, input.nowIso)
  }
  const reportedChainId = parseHexQuantity(chain.result)
  if (reportedChainId == null) {
    return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', false, input.nowIso)
  }
  if (reportedChainId !== BigInt(input.chainId)) {
    return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-chain-mismatch', false, input.nowIso)
  }

  const block = await jsonRpcCall(fetchImpl, rpc, 'eth_blockNumber', input.signal)
  if (!block.ok) {
    return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', false, input.nowIso)
  }
  const blockNumber = parseHexQuantity(block.result)
  if (blockNumber == null || blockNumber < 0n) {
    return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'rpc-unavailable', false, input.nowIso)
  }

  return readinessSnapshot(input.venueId, VENUE_HEALTH_STATE.HEALTHY, null, true, input.nowIso)
}

export interface BoundedEvmRpcReadinessProbeInput {
  venueId: string
  chainId: number
  rpcUrlByChain: Partial<Record<number, string>>
  fetchImpl?: typeof fetch
  nowIso?: string
  budget?: LatencyBudget
  now?: () => number
}

/**
 * A1 probe wrapped in collectBoundedParallel. Timeout/cancel map to UNAVAILABLE / rpc-timeout.
 * Does not add its own timer. Does not change unbounded probe semantics.
 */
export async function probeEvmRpcReadinessBounded(
  input: BoundedEvmRpcReadinessProbeInput,
): Promise<VenueHealthSnapshot> {
  const tasks = [
    {
      id: `rpc-readiness:${input.venueId}:${input.chainId}`,
      run: (signal: AbortSignal) =>
        probeEvmRpcReadiness({
          venueId: input.venueId,
          chainId: input.chainId,
          rpcUrlByChain: input.rpcUrlByChain,
          signal,
          fetchImpl: input.fetchImpl,
          nowIso: input.nowIso,
        }),
    },
  ]
  const results =
    input.now !== undefined
      ? await collectBoundedParallel(tasks, input.budget, input.now)
      : await collectBoundedParallel(tasks, input.budget)
  const row = results[0]
  if (row?.status === 'ok') return row.value
  if (row?.status === 'timeout' || row?.status === 'cancelled') {
    return healthSnapshot(
      input.venueId,
      VENUE_HEALTH_STATE.UNAVAILABLE,
      'rpc-timeout',
      { providerHealthy: false },
      input.nowIso,
    )
  }
  return healthSnapshot(
    input.venueId,
    VENUE_HEALTH_STATE.UNAVAILABLE,
    'rpc-unavailable',
    { providerHealthy: false },
    input.nowIso,
  )
}
