/**
 * PP001 — Safe URL validation for project-authored / registry resources.
 */

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:'])

export function isSafeHttpUrl(raw: string | null | undefined): boolean {
  if (typeof raw !== 'string' || !raw.trim()) return false
  try {
    const url = new URL(raw.trim())
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return false
    if (url.username || url.password) return false
    if (!url.hostname) return false
    return true
  } catch {
    return false
  }
}

export function sanitizePlainText(raw: string | null | undefined, maxLen = 4000): string | null {
  if (typeof raw !== 'string') return null
  const stripped = raw
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
  if (!stripped) return null
  return stripped.length > maxLen ? stripped.slice(0, maxLen) : stripped
}
