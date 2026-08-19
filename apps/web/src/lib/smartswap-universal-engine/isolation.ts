import { VENUE_HEALTH_STATE, type VenueHealthSnapshot, healthSnapshot } from './health'

export interface CircuitBreakerConfig {
  failureThreshold: number
  cooldownMs: number
}

export const DEFAULT_CIRCUIT_BREAKER: CircuitBreakerConfig = {
  failureThreshold: 3,
  cooldownMs: 15_000,
}

type BreakerEntry = { failures: number; openedAt: number | null }

export class VenueCircuitBreaker {
  private readonly entries = new Map<string, BreakerEntry>()

  constructor(private readonly config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER) {}

  recordSuccess(venueId: string): void {
    this.entries.set(venueId, { failures: 0, openedAt: null })
  }

  recordFailure(venueId: string, now = Date.now()): void {
    const current = this.entries.get(venueId) ?? { failures: 0, openedAt: null }
    const failures = current.failures + 1
    this.entries.set(venueId, {
      failures,
      openedAt: failures >= this.config.failureThreshold ? now : current.openedAt,
    })
  }

  isOpen(venueId: string, now = Date.now()): boolean {
    const current = this.entries.get(venueId)
    if (!current?.openedAt) return false
    if (now - current.openedAt >= this.config.cooldownMs) {
      this.entries.set(venueId, { failures: 0, openedAt: null })
      return false
    }
    return true
  }

  healthFor(venueId: string, nowIso = new Date().toISOString()): VenueHealthSnapshot {
    if (this.isOpen(venueId)) {
      return healthSnapshot(venueId, VENUE_HEALTH_STATE.UNAVAILABLE, 'circuit-breaker-open', {
        circuitBreakerOpen: true,
      }, nowIso)
    }
    return healthSnapshot(venueId, VENUE_HEALTH_STATE.HEALTHY, null, { circuitBreakerOpen: false }, nowIso)
  }
}

export function normalizeAdapterError(cause: unknown): { code: string; message: string } {
  const message = cause instanceof Error ? cause.message : String(cause)
  if (message === 'ADAPTER_TIMEOUT') return { code: 'ADAPTER_TIMEOUT', message }
  if (message.startsWith('VENUE_CAPABILITY_UNSUPPORTED')) {
    return { code: 'VENUE_CAPABILITY_UNSUPPORTED', message }
  }
  if (message.startsWith('V2_SHADOW_EXECUTION_FORBIDDEN')) {
    return { code: 'V2_SHADOW_EXECUTION_FORBIDDEN', message }
  }
  return { code: 'VENUE_ERROR', message }
}
