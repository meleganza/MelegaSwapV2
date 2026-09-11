/**
 * Health scoped by venue + chain + capability.
 * An unsupported pair must not mark the entire venue unhealthy.
 */

import { VENUE_HEALTH_STATE, healthSnapshot, type VenueHealthSnapshot, type VenueHealthState } from './health'
import { VenueCircuitBreaker, type CircuitBreakerConfig } from './isolation'

export const HEALTH_EVENT = {
  QUOTE_SUCCESS: 'QUOTE_SUCCESS',
  QUOTE_FAILURE: 'QUOTE_FAILURE',
  TIMEOUT: 'TIMEOUT',
  STALE_QUOTE: 'STALE_QUOTE',
  UNSUPPORTED_PAIR: 'UNSUPPORTED_PAIR',
  UNSUPPORTED_CHAIN: 'UNSUPPORTED_CHAIN',
  NO_ROUTE: 'NO_ROUTE',
  NORMALIZATION_ERROR: 'NORMALIZATION_ERROR',
} as const

export type HealthEvent = (typeof HEALTH_EVENT)[keyof typeof HEALTH_EVENT]

export function healthScopeKey(venueId: string, chainId: number | null, capability = 'QUOTE'): string {
  return `${venueId}:${chainId ?? 'any'}:${capability}`
}

const PAIR_SCOPED: ReadonlySet<HealthEvent> = new Set([
  HEALTH_EVENT.UNSUPPORTED_PAIR,
  HEALTH_EVENT.UNSUPPORTED_CHAIN,
  HEALTH_EVENT.NO_ROUTE,
])

export function classifyAdapterError(message: string): HealthEvent {
  if (message === 'ADAPTER_TIMEOUT') return HEALTH_EVENT.TIMEOUT
  if (message.includes('QUOTE_STALE')) return HEALTH_EVENT.STALE_QUOTE
  if (message.includes('NO_ROUTE')) return HEALTH_EVENT.NO_ROUTE
  if (message.includes('VENUE_PAIR_UNSUPPORTED') || message.includes('EXACT_OUT_UNSUPPORTED')) {
    return HEALTH_EVENT.UNSUPPORTED_PAIR
  }
  if (message.includes('VENUE_CHAIN_UNSUPPORTED') || message.includes('WRONG_CHAIN_ASSET')) {
    return HEALTH_EVENT.UNSUPPORTED_CHAIN
  }
  if (message.includes('CROSS_CHAIN_FORBIDDEN') || message.includes('SAME_CHAIN')) {
    return HEALTH_EVENT.UNSUPPORTED_CHAIN
  }
  if (message.includes('NORMALIZATION') || message.includes('INVALID')) return HEALTH_EVENT.NORMALIZATION_ERROR
  return HEALTH_EVENT.QUOTE_FAILURE
}

export class ScopedVenueHealth {
  private readonly latencies = new Map<string, number[]>()
  private readonly lastEvent = new Map<string, HealthEvent>()
  readonly breaker: VenueCircuitBreaker

  constructor(config?: CircuitBreakerConfig) {
    this.breaker = new VenueCircuitBreaker(config)
  }

  record(scope: string, event: HealthEvent, latencyMs: number | null = null): void {
    this.lastEvent.set(scope, event)
    if (latencyMs != null) {
      const samples = this.latencies.get(scope) ?? []
      samples.push(latencyMs)
      this.latencies.set(scope, samples)
    }
    if (PAIR_SCOPED.has(event) || event === HEALTH_EVENT.STALE_QUOTE) return
    if (event === HEALTH_EVENT.QUOTE_SUCCESS) {
      this.breaker.recordSuccess(scope)
      return
    }
    this.breaker.recordFailure(scope)
  }

  snapshot(scope: string, venueId: string, nowIso = new Date().toISOString()): VenueHealthSnapshot {
    const samples = this.latencies.get(scope) ?? []
    const last = this.lastEvent.get(scope)
    let state: VenueHealthState = VENUE_HEALTH_STATE.HEALTHY
    let reason: string | null = last ?? null
    if (this.breaker.isOpen(scope)) {
      state = VENUE_HEALTH_STATE.UNAVAILABLE
      reason = 'circuit-breaker-open'
    } else if (last === HEALTH_EVENT.QUOTE_FAILURE || last === HEALTH_EVENT.TIMEOUT || last === HEALTH_EVENT.NORMALIZATION_ERROR) {
      state = VENUE_HEALTH_STATE.DEGRADED
    }
    return healthSnapshot(
      venueId,
      state,
      reason,
      {
        quoteLatencyMs: samples.length ? samples[samples.length - 1] : null,
        circuitBreakerOpen: this.breaker.isOpen(scope),
      },
      nowIso,
    )
  }

  latenciesFor(scope: string): number[] {
    return [...(this.latencies.get(scope) ?? [])]
  }
}
