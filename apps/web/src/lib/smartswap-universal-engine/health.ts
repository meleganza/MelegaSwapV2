export const VENUE_HEALTH_STATE = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  UNAVAILABLE: 'UNAVAILABLE',
  DISABLED: 'DISABLED',
} as const

export type VenueHealthState = (typeof VENUE_HEALTH_STATE)[keyof typeof VENUE_HEALTH_STATE]

export interface VenueHealthSignals {
  quoteLatencyMs: number | null
  quoteSuccessRate: number | null
  staleQuoteRate: number | null
  providerHealthy: boolean | null
  depthConfidence: number | null
  simulationSuccessRate: number | null
  executionSuccessRate: number | null
  receiptVerificationRate: number | null
  circuitBreakerOpen: boolean
}

export interface VenueHealthSnapshot {
  venueId: string
  state: VenueHealthState
  signals: VenueHealthSignals
  reason: string | null
  updatedAt: string
}

export function defaultHealthSignals(overrides: Partial<VenueHealthSignals> = {}): VenueHealthSignals {
  return {
    quoteLatencyMs: null,
    quoteSuccessRate: null,
    staleQuoteRate: null,
    providerHealthy: null,
    depthConfidence: null,
    simulationSuccessRate: null,
    executionSuccessRate: null,
    receiptVerificationRate: null,
    circuitBreakerOpen: false,
    ...overrides,
  }
}

export function healthSnapshot(
  venueId: string,
  state: VenueHealthState,
  reason: string | null = null,
  signals: Partial<VenueHealthSignals> = {},
  updatedAt = new Date().toISOString(),
): VenueHealthSnapshot {
  return {
    venueId,
    state,
    signals: defaultHealthSignals(signals),
    reason,
    updatedAt,
  }
}

export function isQuoteEligible(health: VenueHealthSnapshot): boolean {
  return health.state === VENUE_HEALTH_STATE.HEALTHY || health.state === VENUE_HEALTH_STATE.DEGRADED
}
