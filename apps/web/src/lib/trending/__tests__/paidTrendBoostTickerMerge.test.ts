import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { mergeTickerWithPaidPlacements, tickerItemIsEligible } from '../paidTickerPlacements'
import type { PaidTickerPlacement } from '../paidTickerPlacements'
import { mapActiveTrendBoostPlacements } from '../activeTrendBoostPlacements'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import { resolveProjectByContractAddress, resolveProjectBySlug } from 'registry/projects/identity/resolveProject'
import { loadProjectReadinessDocument } from 'registry/projects/identity/readiness/buildProjectReadinessDocument'
import { chainIdFromPath, resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'

const WEB = path.resolve(__dirname, '../../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

const NOW = Date.parse('2026-09-17T18:00:00.000Z')
const MM72_ADDRESS = '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E'
const AARON_ADDRESS = '0x31B5BE085aF875B675392f5B37a1d0B8c3860222'

const mm72Active: PaidTickerPlacement = {
  id: 'trend_0d06939b9fc34ff39224e07e',
  kind: 'boosted',
  symbol: 'MM72',
  chainId: 56,
  address: MM72_ADDRESS,
  href: '/@mm72/',
  startsAt: '2026-09-17T15:06:00.000Z',
  endsAt: '2026-09-18T15:06:00.000Z',
}

const aaronActive: PaidTickerPlacement = {
  id: 'trend_21cc5a9c1ca645d291723766',
  kind: 'boosted',
  symbol: 'AARON',
  chainId: 56,
  address: AARON_ADDRESS,
  href: '/@aaron/',
  startsAt: '2026-09-17T15:10:00.000Z',
  endsAt: '2026-09-18T15:10:00.000Z',
}

const organic = [
  {
    id: 'trade-asset-floki',
    primary: 'FLOKI',
    accent: '+12.4%',
    accentPositive: true,
    href: '/swap?outputCurrency=0x1111111111111111111111111111111111111111',
  },
  {
    id: 'trade-asset-mm72',
    primary: 'MM72',
    accent: '-3.2%',
    accentPositive: false,
    href: `/swap?outputCurrency=${MM72_ADDRESS}`,
  },
]

describe('paid Trend Boost ticker merge', () => {
  it('1. organic-only ticker is unchanged', () => {
    const merged = mergeTickerWithPaidPlacements({ organic, boosted: [], featured: [], nowMs: NOW })
    expect(merged).toEqual(organic)
  })

  it('2. active paid placement is merged ahead of organic movers', () => {
    const merged = mergeTickerWithPaidPlacements({ organic: [organic[0]], boosted: [aaronActive], nowMs: NOW })
    expect(merged[0].primary).toBe('AARON')
    expect(merged[0].secondary).toBe('Boosted')
    expect(merged[0].tokenAddress).toBe(AARON_ADDRESS)
    expect(merged[0].chainId).toBe(56)
    expect(merged[0].href).toBe('/@aaron/')
    expect(merged[1].primary).toBe('FLOKI')
    expect(merged[1].tokenAddress).toBeUndefined()
  })

  it('3. active MM72 placement is merged', () => {
    const merged = mergeTickerWithPaidPlacements({ organic: [organic[0]], boosted: [mm72Active], nowMs: NOW })
    expect(merged.some((item) => item.id.includes('trend_0d06939b9fc34ff39224e07e'))).toBe(true)
    expect(merged[0].primary).toBe('MM72')
    expect(merged[0].tokenAddress).toBe(MM72_ADDRESS)
    expect(merged[0].chainId).toBe(56)
    expect(merged[0].href).toBe('/@mm72/')
  })

  it('4. active AARON placement is merged', () => {
    const merged = mergeTickerWithPaidPlacements({ organic: [organic[0]], boosted: [aaronActive], nowMs: NOW })
    expect(merged.some((item) => item.id.includes('trend_21cc5a9c1ca645d291723766'))).toBe(true)
    expect(merged[0].primary).toBe('AARON')
  })

  it('5. two active placements are both visible in paid-first order', () => {
    const merged = mergeTickerWithPaidPlacements({
      organic: [organic[0]],
      boosted: [mm72Active, aaronActive],
      nowMs: NOW,
    })
    expect(merged.map((item) => item.primary)).toEqual(['MM72', 'AARON', 'FLOKI'])
  })

  it('6. paid + organic same token is deduplicated', () => {
    const merged = mergeTickerWithPaidPlacements({ organic, boosted: [mm72Active], nowMs: NOW })
    expect(merged.filter((item) => /MM72/i.test(item.primary))).toHaveLength(1)
    expect(merged[0].primary).toBe('MM72')
    expect(merged.filter((item) => item.primary === 'MM72')).toHaveLength(1)
  })

  it('7. expired placement is excluded', () => {
    const expired: PaidTickerPlacement = { ...aaronActive, endsAt: '2026-09-17T15:00:00.000Z' }
    const merged = mergeTickerWithPaidPlacements({ organic: [organic[0]], boosted: [expired], nowMs: NOW })
    expect(merged.map((item) => item.primary)).toEqual(['FLOKI'])
  })

  it('8. unavailable paid API does not kill the organic ticker', () => {
    const merged = mergeTickerWithPaidPlacements({ organic, boosted: undefined, featured: undefined, nowMs: NOW })
    expect(merged).toEqual(organic)
    expect(mapActiveTrendBoostPlacements([])).toEqual([])
  })

  it('9. paid rows do not invent market percentages', () => {
    const merged = mergeTickerWithPaidPlacements({ organic: [organic[0]], boosted: [mm72Active], nowMs: NOW })
    expect(merged[0].accent).toMatch(/^\d+[mhd]$/)
    expect(merged[0].accent).not.toMatch(/%/)
    expect(merged[0].secondary).toBe('Boosted')
    expect(merged[1].accent).toBe('+12.4%')
    expect(tickerItemIsEligible(merged[0])).toBe(true)
  })

  it('10. existing ticker order semantics are preserved: boosted → organic → featured', () => {
    const featured: PaidTickerPlacement = {
      ...aaronActive,
      id: 'featured-aaron',
      kind: 'featured',
    }
    const merged = mergeTickerWithPaidPlacements({
      organic: [organic[0]],
      boosted: [mm72Active],
      featured: [featured],
      nowMs: NOW,
    })
    expect(merged.map((item) => item.primary)).toEqual(['MM72', 'FLOKI', 'AARON · Featured'])
    expect(merged[0].tokenAddress).toBe(MM72_ADDRESS)
    expect(merged[0].chainId).toBe(56)
    expect(merged[2].tokenAddress).toBeUndefined()
    expect(merged[2].chainId).toBeUndefined()
    expect(merged[2].href).toBe('/@aaron/')
  })

  it('carries boosted placement identity without rewriting canonical hrefs', () => {
    const merged = mergeTickerWithPaidPlacements({
      organic: [organic[0]],
      boosted: [mm72Active, aaronActive],
      nowMs: NOW,
    })
    expect(merged[0]).toMatchObject({
      primary: 'MM72',
      tokenAddress: MM72_ADDRESS,
      chainId: 56,
      href: '/@mm72/',
    })
    expect(merged[1]).toMatchObject({
      primary: 'AARON',
      tokenAddress: AARON_ADDRESS,
      chainId: 56,
      href: '/@aaron/',
    })
  })

  it('maps certified MM72 and AARON active API rows without fabricating identity', () => {
    const mapped = mapActiveTrendBoostPlacements([
      {
        orderId: 'trend_0d06939b9fc34ff39224e07e',
        projectId: 'mm72',
        projectSlug: 'mm72',
        projectContract: MM72_ADDRESS,
        chainId: 56,
        startsAt: mm72Active.startsAt ?? null,
        endsAt: mm72Active.endsAt ?? null,
      },
      {
        orderId: 'trend_21cc5a9c1ca645d291723766',
        projectId: 'aaron',
        projectSlug: 'aaron',
        projectContract: AARON_ADDRESS,
        chainId: 56,
        startsAt: aaronActive.startsAt ?? null,
        endsAt: aaronActive.endsAt ?? null,
      },
    ])
    expect(mapped.map((row) => row.symbol)).toEqual(['MM72', 'AARON'])
    expect(mapped[0].id).toBe('trend_0d06939b9fc34ff39224e07e')
    expect(mapped[1].id).toBe('trend_21cc5a9c1ca645d291723766')
  })

  it('Top Movers context consumes the paid feed through the canonical merge helper', () => {
    const context = load('views/HomeTrade/TopMoversSnapshotContext.tsx')
    expect(context).toContain("from 'lib/trending/paidTickerPlacements'")
    expect(context).toContain('mergeTickerWithPaidPlacements')
    expect(context).toContain('/api/trend-boost/active')
    expect(context).toContain('fetchActiveTrendBoostPlacements')
    expect(context).toContain('refreshInterval: TICKER_REFRESH_MS')
    expect(context).not.toContain("from './useDexTrendingRankings'")
    expect(context).not.toContain('setInterval')
    expect(context).toContain('shouldRetryOnError: false')
    const helper = load('lib/trending/activeTrendBoostPlacements.ts')
    expect(helper).toContain("fetch('/api/trend-boost/active')")
    expect(helper).toContain('if (!res.ok) return []')
  })
})

describe('Melega Score canonical binding', () => {
  it('11. score present is rendered from readinessDocument.readiness.score', () => {
    const shell = load('views/ProjectPage/v7/ProjectPageV7Shell.tsx')
    expect(shell).toContain('readinessDocument?.readiness?.score')
    expect(shell).toContain("typeof score === 'number' ? Math.round(score) : '—'")
    const marco = loadProjectReadinessDocument('marco', { generatedAt: '2026-09-17T18:00:00.000Z' })
    expect(typeof marco?.readiness.score).toBe('number')
  })

  it('12. missing score uses a controlled unavailable state', () => {
    const shell = load('views/ProjectPage/v7/ProjectPageV7Shell.tsx')
    expect(shell).toContain("data-score-state={typeof score === 'number' ? 'available' : 'unavailable'}")
    expect(shell).toContain('project-v7-score-unavailable')
    expect(shell).toContain('Score not yet indexed')
    expect(loadProjectReadinessDocument('not-a-real-project')).toBeNull()
  })

  it('13. AARON contract is normalized to the listed BSC address', () => {
    expect(normalizeEvmAddress(AARON_ADDRESS)).toBe(AARON_ADDRESS.toLowerCase())
    expect(normalizeEvmAddress(AARON_ADDRESS.toLowerCase())).toBe(AARON_ADDRESS.toLowerCase())
    expect(resolveProjectByContractAddress(AARON_ADDRESS)?.slug).toBe('aaron')
  })

  it('14. AARON chain mapping is BSC (56)', () => {
    const resolved = resolveProjectBySlug('aaron')
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    expect(resolved.project.resources.tokens[0]?.chainId).toBe(56)
    expect(resolved.project.supportedChains).toEqual([56])
    expect(chainIdFromPath('bsc')).toBe(56)
  })

  it('15. AARON project slug mapping resolves /@aaron and the readiness document', () => {
    const resolved = resolveProjectBySlug('@aaron')
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    expect(resolved.slug).toBe('aaron')
    expect(resolveCanonicalProjectHref({ slug: 'aaron', chainId: 56, address: AARON_ADDRESS })).toMatch(/^\/@aaron/)
    const readiness = loadProjectReadinessDocument('aaron', { generatedAt: '2026-09-17T18:00:00.000Z' })
    expect(readiness?.slug).toBe('aaron')
    expect(typeof readiness?.readiness.score).toBe('number')
  })
})
