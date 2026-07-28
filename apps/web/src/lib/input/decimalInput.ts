/**
 * Raw decimal string editing — never coerce keystrokes through Number.
 * Supports intermediate states: "", ".", "0.", "1.", "1.0", "0.0001"
 */
const DECIMAL_RE = /^\d*(?:\.\d*)?$/

export function sanitizeDecimalInput(raw: string, maxDecimals = 18): string {
  if (raw == null) return ''
  let next = String(raw).replace(/,/g, '.').replace(/[^\d.]/g, '')
  const firstDot = next.indexOf('.')
  if (firstDot !== -1) {
    next = `${next.slice(0, firstDot + 1)}${next.slice(firstDot + 1).replace(/\./g, '')}`
  }
  // Preserve bare "." as editable intermediate; prefix only when digits follow.
  if (next === '.') return '.'
  if (next.startsWith('.')) next = `0${next}`
  // Collapse leading zeros except "0." / "0"
  if (next.length > 1 && next.startsWith('0') && next[1] !== '.') {
    next = next.replace(/^0+/, '') || '0'
  }
  if (next.includes('.')) {
    const [whole, frac = ''] = next.split('.')
    next = `${whole}.${frac.slice(0, Math.max(0, maxDecimals))}`
  }
  if (!DECIMAL_RE.test(next) && next !== '') return ''
  return next
}

export function isEditableDecimalState(value: string): boolean {
  return value === '' || value === '.' || DECIMAL_RE.test(value)
}

/** Parse for math — returns null for incomplete intermediate states. */
export function parseDecimalInput(value: string): number | null {
  if (value === '' || value === '.' || value.endsWith('.')) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
