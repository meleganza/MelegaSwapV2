/**
 * UX001 — human-facing labels for machine enums.
 * Underlying API enums remain unchanged; this adapter is presentation-only.
 */

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  56: 'BNB Smart Chain',
  137: 'Polygon',
  8453: 'Base',
}

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  UNAVAILABLE: 'Unavailable',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PAUSED: 'Paused',
  DEPRECATED: 'Deprecated',
  READY: 'Ready',
  PARTIALLY_SATISFIED: 'Partially complete',
  UNSATISFIED: 'Incomplete',
  SATISFIED: 'Complete',
  PROJECT_ATTESTED: 'Declared by the project',
  INDEPENDENTLY_VERIFIED: 'Independently verified',
  MELEGA_VERIFIED: 'Verified by Melega',
  OBSERVED: 'Observed in registry',
  UNRESOLVED: 'Not yet verified',
  VENUE_REGISTRY: 'Melega DEX market',
  UNKNOWN: 'Unknown',
  OPERATIONAL: 'Operational',
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In progress',
  UPCOMING: 'Upcoming',
  PLANNED: 'Planned',
}

export function humanChainName(chainId: number | null | undefined): string {
  if (chainId == null || Number.isNaN(Number(chainId))) return 'Unknown network'
  return CHAIN_NAMES[Number(chainId)] ?? `Chain ${chainId}`
}

export function humanEnumLabel(raw: string | null | undefined): string {
  if (!raw) return 'Unavailable'
  const key = raw.trim().toUpperCase()
  if (STATUS_LABELS[key]) return STATUS_LABELS[key]
  return raw
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function shortenAddress(address: string, left = 6, right = 4): string {
  if (!address || address.length < left + right + 2) return address
  return `${address.slice(0, left)}…${address.slice(-right)}`
}

export function formatRelativeTime(iso: string | null | undefined, now = Date.now()): string | null {
  if (!iso) return null
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return null
  const deltaSec = Math.round((now - ts) / 1000)
  if (deltaSec < 60) return 'Updated just now'
  if (deltaSec < 3600) return `Updated ${Math.floor(deltaSec / 60)} min ago`
  if (deltaSec < 86400) return `Updated ${Math.floor(deltaSec / 3600)} hr ago`
  if (deltaSec < 86400 * 14) return `Updated ${Math.floor(deltaSec / 86400)} days ago`
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatCompactUsd(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null
  if (value === 0) return '$0'
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  if (abs >= 1) return `$${value.toFixed(2)}`
  if (abs >= 0.0001) return `$${value.toFixed(6)}`
  return `$${value.toExponential(2)}`
}

export function formatPrice(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null
  if (value === 0) return '$0'
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.0001) return `$${value.toPrecision(4)}`
  return `$${value.toExponential(2)}`
}

/** True when a string looks like a UPI / internal machine id that must not appear in primary UX. */
export function looksLikeMachineId(value: string): boolean {
  return (
    value.startsWith('upi://') ||
    value.startsWith('uai://') ||
    value.startsWith('uvi://') ||
    /^evd_/i.test(value) ||
    /^dst_/i.test(value) ||
    /CIVILIZATION_READINESS/i.test(value)
  )
}
