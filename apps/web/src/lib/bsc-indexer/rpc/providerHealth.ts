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

const QUARANTINE_MS = 15 * 60 * 1000
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

export function isProviderQuarantined(url: string): boolean {
  const record = healthByUrl.get(url)
  if (!record?.quarantinedUntil) return false
  return Date.parse(record.quarantinedUntil) > Date.now()
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
  if (
    record.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES ||
    reason.includes('404') ||
    reason.toLowerCase().includes('not found') ||
    reason.toLowerCase().includes('unauthorized')
  ) {
    record.quarantinedUntil = new Date(Date.now() + QUARANTINE_MS).toISOString()
  }
}

export function getProviderHealthSnapshot(): ProviderHealthRecord[] {
  return [...healthByUrl.values()].map((r) => ({ ...r, url: redactUrl(r.url) }))
}

export function resetProviderHealthForTests(): void {
  healthByUrl.clear()
}
