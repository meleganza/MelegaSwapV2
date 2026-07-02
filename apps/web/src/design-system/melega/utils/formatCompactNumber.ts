/**
 * Canonical compact financial notation for Melega terminal surfaces.
 * 842 · 8.42K · 84.2K · 842K · 8.42M · 84.2M · 8.42B
 */
function trimZeros(value: string): string {
  return value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

export function formatCompactMagnitude(abs: number): string {
  if (!Number.isFinite(abs)) return '—'
  if (abs < 1000) return `${Math.round(abs)}`

  const formatScaled = (scaled: number, unit: string): string => {
    if (scaled >= 100) return `${trimZeros((Math.round(scaled * 10) / 10).toFixed(1))}${unit}`
    if (scaled >= 10) return `${trimZeros(scaled.toFixed(2))}${unit}`
    return `${trimZeros(scaled.toFixed(2))}${unit}`
  }

  if (abs < 1_000_000) return formatScaled(abs / 1000, 'K')
  if (abs < 1_000_000_000) return formatScaled(abs / 1_000_000, 'M')
  return formatScaled(abs / 1_000_000_000, 'B')
}

export function formatCompactNumber(
  value: number,
  options?: { prefix?: string; suffix?: string },
): string {
  const sign = value < 0 ? '-' : ''
  const prefix = options?.prefix ?? ''
  const suffix = options?.suffix ?? ''
  return `${sign}${prefix}${formatCompactMagnitude(Math.abs(value))}${suffix}`
}

/** Normalize display strings — never emit ellipsis truncation for numeric values. */
export function formatCompactDisplay(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed.includes('...') || trimmed.includes('…')) return trimmed
  if (/[KMB]\b/i.test(trimmed)) return trimmed

  const match = trimmed.match(/^([^0-9-]*)([0-9,.\-+]+)(.*)$/)
  if (!match) return trimmed

  const [, prefix = '', numPart, suffix = ''] = match
  const parsed = Number(numPart.replace(/,/g, ''))
  if (!Number.isFinite(parsed)) return trimmed

  const compact = formatCompactMagnitude(Math.abs(parsed))
  const spacedSuffix = suffix ? (suffix.startsWith(' ') ? suffix : ` ${suffix}`) : ''
  return `${prefix}${parsed < 0 ? '-' : ''}${compact}${spacedSuffix}`.replace(/^--/, '-')
}
