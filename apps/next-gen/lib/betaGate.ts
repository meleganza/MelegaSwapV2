export const SECURITY_HEADERS: Record<string, string> = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Melega-Surface': 'next-gen-beta',
  'Cache-Control': 'private, no-store',
}

/** Retired password page. Every other path is open read-only beta. */
export function publicReadDecision(pathname: string): 'allow' | 'redirect-home' {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  if (normalized === '/access') return 'redirect-home'
  return 'allow'
}
