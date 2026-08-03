/**
 * MELEGA_DEX_V1 Home IA + Founder acceptance gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { resolveFounderFeaturedProjects, FOUNDER_FEATURED_SLUGS } from '../featuredProjectsCatalog'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Product IA refinement — Home', () => {
  it('removes QuickRail nav cards and mounts Featured + Ecosystem', () => {
    const home = load('DexHomeScreen.tsx')
    expect(home).not.toContain('dex-home-quick-actions')
    expect(home).not.toContain('Explore Projects')
    expect(home).not.toContain('Liquidity Builder')
    expect(home).toContain('FeaturedProjectsRail')
    expect(home).toContain('ExploreMelegaEcosystem')
    expect(home).toContain("label: 'Listed Projects'")
    expect(home).toContain("label: '24H Volume'")
    expect(home).toContain("label: 'Markets'")
    expect(home).toContain("label: 'Active Farms'")
    expect(home).toContain("label: 'Active Pools'")
    expect(home).not.toContain("label: 'Indexed Tokens'")
  })

  it('Featured rail renders four founder projects without detached heading', () => {
    const featured = load('FeaturedProjectsRail.tsx')
    expect(featured).not.toContain('>Featured Projects<')
    expect(featured).toContain('resolveFounderFeaturedProjects')
    expect(featured).toContain('useFeaturedProjectMarkets')
    expect(featured).toContain('Trade')
    expect(featured).toContain('View Project')
    expect(featured).toContain('BNB Smart Chain')
    expect(featured).toContain('halo')
    expect(featured).toContain('rgba(255, 255, 255, 0.1)')
    expect(featured).toContain('repeat(4, minmax(0, 1fr))')
    expect(featured).toContain('Never 2×2')
    expect(featured).toContain('Liquidity')
    expect(featured).toContain('Volume')
    expect(featured).toContain('Mkt Cap')
    expect(featured).not.toContain('toExponential')
    const markets = load('useFeaturedProjectMarkets.ts')
    expect(markets).not.toContain('toExponential')
    expect(markets).toContain('formatHumanDecimal')
    expect(markets).toContain('Price updating')
    expect(markets).toContain('No 24H baseline')
    expect(markets).toContain('<0.000001')
    const resolved = resolveFounderFeaturedProjects()
    expect(resolved).toHaveLength(4)
    expect(FOUNDER_FEATURED_SLUGS).toEqual(['mm72', 'eyed', 'young-degens', 'blion'])
    for (const card of resolved) {
      expect(card.resolved).toBe(true)
      expect(card.address).toMatch(/^0x/i)
    }
  })

  it('Ecosystem grid includes required product names', () => {
    const eco = load('ExploreMelegaEcosystem.tsx')
    const destinations = load('ecosystemDestinations.ts')
    expect(eco).toContain('ECOSYSTEM_DESTINATIONS')
    for (const name of ['PASSPORT', 'SMARTDROP', 'LABS', 'SPACE', 'RADAR', 'MAIORA']) {
      expect(destinations).toContain(name)
    }
  })

  it('Top Movers ranking prefers abs% then swaps then volume; ranks full indexed universe', () => {
    const rankings = load('useDexTrendingRankings.ts')
    expect(rankings).toContain('volume24h')
    expect(rankings).toContain('tradeCount24h')
    expect(rankings).toContain('Never fabricate')
    expect(rankings).toContain('computeChangeFromObservations')
    expect(rankings).toContain('getCanonicalIndexedAssets')
    expect(rankings).toContain('indexedUniverse')
    expect(rankings).not.toContain('return rankTierAssets(active')
    expect(rankings).not.toContain('.slice(0, 120)')
  })

  it('Featured mounts above KPI rail in DexHomeScreen', () => {
    const home = load('DexHomeScreen.tsx')
    const featuredIdx = home.indexOf('<FeaturedProjectsRail')
    const kpiIdx = home.indexOf('dex-home-kpi-rail')
    expect(featuredIdx).toBeGreaterThan(-1)
    expect(kpiIdx).toBeGreaterThan(featuredIdx)
  })
})
