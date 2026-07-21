import { NextRequest, NextResponse } from 'next/server'

// Sanctioned Countries: Belarus, Cuba, Democratic Republic of Congo, Iran, Iraq, North Korea, Sudan, Syria, Zimbabwe.
const BLOCK_COUNTRIES = { BY: 'BY', CU: 'CU', CD: 'CD', IR: 'IR', IQ: 'IQ', KP: 'KP', SD: 'SD', SY: 'SY', ZW: 'ZW' }

// Sanctioned Regions: Crimea
const BLOCK_REGIONS = { 'UA-43': 'UA-43' }

/**
 * PROJECT_OS_P0: rewrite canonical `/@{slug}` → `/project-hq/{slug}` at the edge.
 * Complements next.config rewrites so production always resolves Project Pages.
 */
function rewriteCanonicalProjectPage(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  const match = pathname.match(/^\/@([a-z0-9-]+)\/?$/)
  if (!match) return null
  const slug = match[1]
  const url = req.nextUrl.clone()
  url.pathname = `/project-hq/${slug}`
  return NextResponse.rewrite(url)
}

export async function middleware(req: NextRequest) {
  const projectRewrite = rewriteCanonicalProjectPage(req)
  if (projectRewrite) return projectRewrite

  const res = NextResponse.next()
  const { geo } = req
  const { country, region } = geo

  const shouldBlock: boolean = BLOCK_COUNTRIES[country] || BLOCK_REGIONS[`${country}-${region}`]

  if (shouldBlock) {
    return NextResponse.redirect(new URL('/451', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/swap',
    '/pool',
    '/pools',
    '/farms',
    '/add',
    '/ilo',
    '/remove',
    '/prediction',
    '/find',
    '/limit-orders',
    '/lottery',
    '/nft',
    '/viewNFTs',
    '/nftmarket',
    '/info/:path*',
    '/@:slug',
    '/@:slug/',
  ],
}
