/**
 * Shadow quote source. Never signs, never broadcasts.
 * SYNTHETIC vs FACTUAL must remain labeled.
 */

export const SHADOW_QUOTE_KIND = {
  SYNTHETIC: 'SYNTHETIC',
  FACTUAL: 'FACTUAL',
} as const

export type ShadowQuoteKind = (typeof SHADOW_QUOTE_KIND)[keyof typeof SHADOW_QUOTE_KIND]

export interface ShadowQuoteObservation {
  kind: ShadowQuoteKind
  amountOutRaw: string
  path: string[]
  gasUnits: string | null
  priceImpactPercent: number | null
  quotedAt: string
}

export interface ShadowQuoteRequest {
  chainId: number
  router: string
  amountInRaw: string
  path: string[]
  signal: AbortSignal
}

export interface ShadowQuoteSource {
  fetch(request: ShadowQuoteRequest): Promise<ShadowQuoteObservation>
}

export function createSyntheticQuoteSource(
  quotes: Record<string, { amountOutRaw: string; gasUnits?: string | null; priceImpactPercent?: number | null }>,
): ShadowQuoteSource {
  return {
    async fetch(request) {
      const key = `${request.chainId}:${request.path.join('>').toLowerCase()}`
      const hit = quotes[key]
      if (!hit || hit.amountOutRaw === '0') throw new Error('NO_ROUTE')
      return {
        kind: SHADOW_QUOTE_KIND.SYNTHETIC,
        amountOutRaw: hit.amountOutRaw,
        path: request.path,
        gasUnits: hit.gasUnits ?? null,
        priceImpactPercent: hit.priceImpactPercent ?? null,
        quotedAt: '2026-08-20T00:00:00.000Z',
      }
    },
  }
}

/**
 * Chains where every certified V2 venue is also quoted through one hop via the chain's wrapped native (BSC cutover
 * chain). Same bounded candidate set for EVERY venue on that chain, so no venue is compared direct-only against another
 * venue's multi-hop route. Never invents hops from symbols.
 */
export const V2_WRAPPED_NATIVE_HOP_CHAIN_IDS: ReadonlySet<number> = new Set([56])

/** Candidate V2 paths for one venue: direct [in,out], plus [in,wrappedNative,out] when neither end is wrapped native. */
export function v2CandidatePaths(chainId: number, inAddress: string, outAddress: string, wrappedNative: string | undefined): string[][] {
  const tokenIn = inAddress.toLowerCase()
  const tokenOut = outAddress.toLowerCase()
  const paths = [[tokenIn, tokenOut]]
  const wrapped = wrappedNative?.toLowerCase()
  if (wrapped && V2_WRAPPED_NATIVE_HOP_CHAIN_IDS.has(chainId) && tokenIn !== wrapped && tokenOut !== wrapped) {
    paths.push([tokenIn, wrapped, tokenOut])
  }
  return paths
}

/**
 * Quote every candidate path on the SAME venue router with the SAME exact (net) input; the highest amountOut wins
 * (ties keep the shorter/earlier path). If every candidate fails, the direct path's failure reason is preserved.
 */
export async function fetchBestV2PathQuote(
  source: ShadowQuoteSource,
  base: Omit<ShadowQuoteRequest, 'path'>,
  paths: string[][],
): Promise<ShadowQuoteObservation> {
  const settled = await Promise.allSettled(paths.map((path) => source.fetch({ ...base, path })))
  let best: ShadowQuoteObservation | null = null
  let bestOut = BigInt(0)
  for (let i = 0; i < settled.length; i += 1) {
    const result = settled[i]
    const raw = result.status === 'fulfilled' ? result.value.amountOutRaw : null
    if (result.status === 'fulfilled' && raw && /^\d+$/.test(raw) && BigInt(raw) > bestOut) {
      // The quoted path is the requested candidate (the exact path the executor route hash will bind).
      best = { ...result.value, path: paths[i] }
      bestOut = BigInt(raw)
    }
  }
  if (best) return best
  const first = settled[0]
  if (first && first.status === 'rejected') throw first.reason
  throw new Error('NO_ROUTE')
}
