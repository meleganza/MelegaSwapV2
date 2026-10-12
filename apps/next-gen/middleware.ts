import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  BETA_COOKIE_NAME,
  configuredBetaToken,
  decideBetaRequest,
  presentationMatches,
  SECURITY_HEADERS,
} from './lib/betaGate'

function applySecurity(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Direct member access is required so Next.js records this name for the edge sandbox.
  const token = configuredBetaToken(process.env.BETA_ACCESS_TOKEN)
  const cookieValue = request.cookies.get(BETA_COOKIE_NAME)?.value ?? null
  const authenticated = token ? await presentationMatches(token, request.headers.get('authorization'), cookieValue) : false
  const decision = decideBetaRequest({
    method: request.method,
    pathname: request.nextUrl.pathname,
    configured: token !== null,
    authenticated,
    acceptsHtml: (request.headers.get('accept') || '').includes('text/html'),
  })

  if (decision.type === 'allow') return applySecurity(NextResponse.next())

  if (decision.type === 'redirect') {
    const url = request.nextUrl.clone()
    url.pathname = decision.pathname
    url.search = ''
    return applySecurity(NextResponse.redirect(url, 307))
  }

  return applySecurity(new NextResponse(null, { status: 401 }))
}
