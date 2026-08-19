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
