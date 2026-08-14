/**
 * Consumer display honesty for the Global Data Truth Layer.
 * Uncertified / missing values render as "—" — never invent zeros or diagnostic phrases.
 */
const MISSING = new Set([
  '',
  '—',
  'Unavailable',
  'Waiting for explorer',
  'Price updating',
  'No recent swaps',
  'N/A',
  'n/a',
  'null',
  'undefined',
])

export function isMissingTruthValue(value?: string | null): boolean {
  if (value == null) return true
  const v = value.trim()
  if (!v) return true
  if (MISSING.has(v)) return true
  if (/source not configured/i.test(v)) return true
  if (/waiting for explorer/i.test(v)) return true
  if (/not available/i.test(v) && v.length < 40) return true
  return false
}

/** Map any unresolved metric to em-dash for consumer UI. */
export function truthDash(value?: string | null): string {
  return isMissingTruthValue(value) ? '—' : String(value).trim()
}

export function truthNumberOrDash(value?: number | null, format?: (n: number) => string): string {
  if (value == null || !Number.isFinite(value) || value < 0) return '—'
  if (value === 0) return format ? format(0) : '0'
  return format ? format(value) : String(value)
}
