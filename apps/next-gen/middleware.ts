import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { publicReadDecision, SECURITY_HEADERS } from './lib/betaGate'

function applySecurity(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function middleware(request: NextRequest): NextResponse {
  if (publicReadDecision(request.nextUrl.pathname) === 'redirect-home') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return applySecurity(NextResponse.redirect(url, 307))
  }
  return applySecurity(NextResponse.next())
}
