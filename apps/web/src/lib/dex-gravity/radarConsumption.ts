/**
 * Radar opportunityRef — consume-only stub.
 * DEX never detects, ranks, or owns Opportunity Truth.
 */

export interface OpportunityRefPrefill {
  opportunityRef?: string
  source: 'radar-consumption'
  consumed: boolean
  radarAvailable: boolean
}

const RADAR_BASE_URL =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_RADAR_URL?.trim() : undefined

export function isRadarUrlConfigured(): boolean {
  return Boolean(RADAR_BASE_URL)
}

export function parseOpportunityRefFromQuery(
  query: Record<string, string | string[] | undefined>,
): string | undefined {
  const raw = query.opportunityRef ?? query.opportunity_ref
  if (!raw) return undefined
  return Array.isArray(raw) ? raw[0] : raw
}

/**
 * Consumes an opportunityRef for Trade/Liquidity prefill.
 * Does not fetch or validate opportunity truth — graceful no-op when Radar unavailable.
 */
export function consumeOpportunityRef(opportunityRef?: string): OpportunityRefPrefill {
  if (!opportunityRef) {
    return { source: 'radar-consumption', consumed: false, radarAvailable: isRadarUrlConfigured() }
  }

  if (!isRadarUrlConfigured()) {
    return {
      opportunityRef,
      source: 'radar-consumption',
      consumed: false,
      radarAvailable: false,
    }
  }

  return {
    opportunityRef,
    source: 'radar-consumption',
    consumed: true,
    radarAvailable: true,
  }
}
