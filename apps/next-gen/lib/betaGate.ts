export const BETA_COOKIE_NAME = 'ng_beta'
export const BETA_TOKEN_MIN_LENGTH = 16
const SESSION_MAX_AGE = 60 * 60 * 12

export function configuredBetaToken(value: string | undefined = process.env.BETA_ACCESS_TOKEN): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length < BETA_TOKEN_MIN_LENGTH) return null
  return trimmed
}

export function cookieSecure(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL === '1' || env.BETA_COOKIE_SECURE === '1'
}

export async function digestHex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function constantEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return diff === 0
}

export function parseBearer(authorization: string | null): string | null {
  if (!authorization) return null
  const match = /^Bearer ([!-~]+)$/.exec(authorization)
  if (!match) return null
  return match[1]
}

export async function presentationMatches(
  envToken: string,
  authorization: string | null,
  cookieValue: string | null,
): Promise<boolean> {
  const expected = await digestHex(envToken)
  if (cookieValue && constantEqual(cookieValue, expected)) return true
  const bearer = parseBearer(authorization)
  if (!bearer || bearer.length > 256) return false
  const presented = await digestHex(bearer)
  return constantEqual(presented, expected)
}

export type BetaDecision =
  | { type: 'allow' }
  | { type: 'redirect'; pathname: '/access' | '/' }
  | { type: 'closed' }
  | { type: 'deny' }

const PUBLIC_PATHS = new Set(['/access', '/robots.txt', '/favicon.ico'])

export function decideBetaRequest(input: {
  method: string
  pathname: string
  configured: boolean
  authenticated: boolean
  acceptsHtml: boolean
}): BetaDecision {
  const pathname = input.pathname.length > 1 && input.pathname.endsWith('/') ? input.pathname.slice(0, -1) : input.pathname
  const method = input.method.toUpperCase()

  if (pathname === '/api/access' || pathname === '/api/leave') return { type: 'allow' }
  if (PUBLIC_PATHS.has(pathname)) {
    if (pathname === '/access' && input.configured && input.authenticated) return { type: 'redirect', pathname: '/' }
    return { type: 'allow' }
  }
  if (!input.configured) {
    if (method === 'GET' && input.acceptsHtml) return { type: 'redirect', pathname: '/access' }
    return { type: 'closed' }
  }
  if (input.authenticated) return { type: 'allow' }
  if (method === 'GET' && input.acceptsHtml) return { type: 'redirect', pathname: '/access' }
  return { type: 'deny' }
}

export function betaSessionCookie(hash: string, secure: boolean): string {
  const parts = [
    `${BETA_COOKIE_NAME}=${hash}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Strict',
    `Max-Age=${SESSION_MAX_AGE}`,
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export function clearBetaSessionCookie(secure: boolean): string {
  const parts = [`${BETA_COOKIE_NAME}=`, 'HttpOnly', 'Path=/', 'SameSite=Strict', 'Max-Age=0']
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Melega-Surface': 'next-gen-beta',
  'Cache-Control': 'private, no-store',
}
