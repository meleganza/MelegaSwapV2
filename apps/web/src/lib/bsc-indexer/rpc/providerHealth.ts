/**
 * Provider health / quarantine (R773 + R791-INFRA-003 load reduction).
 *
 * Rate-limit (429) uses a short cooldown so primary can recover.
 * Hard failures (404/unauthorized) keep a longer quarantine.
 */

export interface ProviderHealthRecord {
  url: string
  label: string
  healthy: boolean
  lastSuccessAt?: string
  lastFailureAt?: string
  lastFailureReason?: string
  consecutiveFailures: number
  quarantinedUntil?: string
}

/** Hard-failure quarantine (404 / unauthorized / repeated errors). */
export const HARD_QUARANTINE_MS = 15 * 60 * 1000
/** Rate-limit quarantine — short so fallback does not become indefinite primary. */
export const RATE_LIMIT_QUARANTINE_MS = 60 * 1000
const MAX_CONSECUTIVE_FAILURES = 2

const healthByUrl = new Map<string, ProviderHealthRecord>()

function redactUrl(url: string): string {
  if (url.length <= 48) return url
  return `${url.slice(0, 36)}…`
}

function getOrCreate(url: string, label: string): ProviderHealthRecord {
  const existing = healthByUrl.get(url)
  if (existing) return existing
  const created: ProviderHealthRecord = {
    url,
    label,
    healthy: true,
    consecutiveFailures: 0,
  }
  healthByUrl.set(url, created)
  return created
}

export function isRateLimitReason(reason: string): boolean {
  const msg = reason.toLowerCase()
  return (
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('limit exceeded') ||
    msg.includes('-32005')
  )
}

export function isHardFailureReason(reason: string): boolean {
  const msg = reason.toLowerCase()
  return msg.includes('404') || msg.includes('not found') || msg.includes('unauthorized')
}

export function isProviderQuarantined(url: string): boolean {
  const record = healthByUrl.get(url)
  if (!record?.quarantinedUntil) return false
  return Date.parse(record.quarantinedUntil) > Date.now()
}

/** True when quarantine has expired (or never set) — primary may be probed again. */
export function isProviderEligibleForRecovery(url: string): boolean {
  return !isProviderQuarantined(url)
}

export function recordProviderSuccess(url: string, label: string): void {
  const record = getOrCreate(url, label)
  record.healthy = true
  record.consecutiveFailures = 0
  record.lastSuccessAt = new Date().toISOString()
  record.lastFailureReason = undefined
  record.quarantinedUntil = undefined
}

export function recordProviderFailure(url: string, label: string, reason: string): void {
  const record = getOrCreate(url, label)
  record.healthy = false
  record.consecutiveFailures += 1
  record.lastFailureAt = new Date().toISOString()
  record.lastFailureReason = reason

  if (isRateLimitReason(reason)) {
    // Immediate short quarantine — do not burn retries on the same URL this tick.
    record.quarantinedUntil = new Date(Date.now() + RATE_LIMIT_QUARANTINE_MS).toISOString()
    return
  }

  if (
    record.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ||
    isHardFailureReason(reason)
  ) {
    record.quarantinedUntil = new Date(Date.now() + HARD_QUARANTINE_MS).toISOString()
  }
}

export function getProviderHealthSnapshot(): ProviderHealthRecord[] {
  return [...healthByUrl.values()].map((r) => ({ ...r, url: redactUrl(r.url) }))
}

export function resetProviderHealthForTests(): void {
  healthByUrl.clear()
}

/** Test helper — force quarantine expiry for recovery assertions. */
export function expireProviderQuarantineForTests(url: string): void {
  const record = healthByUrl.get(url)
  if (!record) return
  record.quarantinedUntil = new Date(Date.now() - 1).toISOString()
}
