/**
 * MELEGA_DEX_V1_PRODUCT_INFORMATION_ARCHITECTURE_REFINEMENT — Home gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

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
  })

  it('Featured rail rotates four project cards', () => {
    const featured = load('FeaturedProjectsRail.tsx')
    expect(featured).toContain('Featured Projects')
    expect(featured).toContain('ROTATE_MS')
    expect(featured).toContain('getAllProjects')
  })

  it('Ecosystem grid includes required product names', () => {
    const eco = load('ExploreMelegaEcosystem.tsx')
    for (const name of ['PASSPORT', 'SMARTDROP', 'LABS', 'SPACE', 'RADAR', 'MAIORA']) {
      expect(eco).toContain(name)
    }
  })

  it('Top Movers ranking prefers abs% then volume then swaps; no activity-only fallback', () => {
    const rankings = load('useDexTrendingRankings.ts')
    expect(rankings).toContain('volume24h')
    expect(rankings).toContain('tradeCount24h')
    expect(rankings).toContain('Never fabricate')
    expect(rankings).not.toContain('return rankTierAssets(active')
  })
})
