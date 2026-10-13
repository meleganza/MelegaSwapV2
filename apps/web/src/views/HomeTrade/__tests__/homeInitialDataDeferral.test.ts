import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { featuredMarketsFallbackKey } from '../useFeaturedProjectMarkets'

const root = path.resolve(__dirname, '../../..')
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8')

describe('Home initial data deferral', () => {
  it('does not open the featured-markets fallback while the canonical snapshot is in flight or already populated', () => {
    expect(featuredMarketsFallbackKey({ isLoading: true, featuredCount: 0 })).toBeNull()
    expect(featuredMarketsFallbackKey({ isLoading: false, featuredCount: 4 })).toBeNull()
    expect(featuredMarketsFallbackKey({ isLoading: false, featuredCount: 0 })).toBe('/api/indexer/featured-markets/')
  })

  it('keeps Home market count on the canonical snapshot and skips the unused activity indexer', () => {
    const data = read('views/HomeTrade/useHomeTradeData.ts')
    expect(data).toContain('marketSnapshot.markets')
    expect(data).toContain('useCanonicalMarketSnapshot')
    expect(data).toContain('marketSnapshot.volume24hUsd')
    expect(data).not.toContain('useAmmPairRegistry')
    expect(data).not.toContain('useProtocolActivityFeed(')
    expect(data).not.toContain('/api/indexer/pairs')
    expect(data).not.toContain('/api/protocol/activity')
    expect(data).toContain('useGetTopFarmsByApr(yieldVisibility.discoveryNear)')
    expect(data).toContain('useGetTopPoolsByApr(yieldSectionNear)')
    expect(data).toContain('useTopMoversSnapshot')
  })

  it('starts the full farm poll and featured candles only from visible Home sections', () => {
    const runtime = read('views/HomeTrade/HomeTradeDataRuntime.tsx')
    const screen = read('views/HomeTrade/DexHomeScreen.tsx')
    const pools = read('views/Home/hooks/useGetTopPoolsByApr.tsx')
    const featured = read('views/HomeTrade/FeaturedProjectsRail.tsx')
    expect(runtime).toContain('HomeFarmPoll')
    expect(runtime).toContain('yieldVisibility.kpiNear || yieldVisibility.discoveryNear')
    expect(screen).toContain('HomeYieldVisibilityProvider')
    expect(pools).not.toContain('usePollFarmsWithUserData')
    expect(pools).toContain('isIntersecting')
    expect(pools).toContain('fetchFarmsPublicDataAsync')
    expect(featured).toContain('intersectionRatio >= 0.2')
    expect(featured).toContain('enabled={chartsEnabled}')
  })
})
