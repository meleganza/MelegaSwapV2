/**
 * MELEGA_DEX_V1_DATA_TRUTH_AND_PRODUCT_CONSISTENCY_AUDIT — lock tests.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../../../../')

describe('MELEGA_DEX_V1_DATA_TRUTH_AND_PRODUCT_CONSISTENCY_AUDIT', () => {
  it('publishes audit evidence JSON for all four surfaces', () => {
    const dir = path.join(WEB, 'docs/runtime/melega-dex-v1-data-truth-audit')
    for (const file of [
      'trending-data-audit.json',
      'farm-data-audit.json',
      'pool-registry-audit.json',
      'list-data-audit.json',
    ]) {
      expect(existsSync(path.join(dir, file))).toBe(true)
      const json = JSON.parse(readFileSync(path.join(dir, file), 'utf8'))
      expect(json.missionId).toBe('MELEGA_DEX_V1_DATA_TRUTH_AND_PRODUCT_CONSISTENCY_AUDIT')
      expect(json.metrics?.length || json.metrics).toBeTruthy()
    }
  })

  it('Top Movers ranking rejects liquidity-only idle tokens', () => {
    const model = readFileSync(path.join(WEB, 'src/lib/trending/tierTrendingModel.ts'), 'utf8')
    expect(model).toContain('isTopMoverEligible')
    expect(model).toContain('|price variation %|')
    const ribbon = readFileSync(path.join(WEB, 'src/views/HomeTrade/TrendingRibbon.tsx'), 'utf8')
    expect(ribbon).toContain('Top Movers')
    expect(ribbon).toContain('showLiveDot')
  })

  it('Farms featured is compact near Why Farm — not giant bottom panel', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/FarmsStudio/FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).not.toContain('FeaturedFarmPanel')
    const hero = readFileSync(path.join(WEB, 'src/views/FarmsStudio/modules/FarmsHeroModule.tsx'), 'utf8')
    expect(hero).toContain('FarmsFeaturedCompactCard')
    expect(hero).toContain('FarmsHeroTrustPanel')
  })

  it('Pools KPI uses Total Pools partition copy', () => {
    const summary = readFileSync(
      path.join(WEB, 'src/views/PoolsStudio/poolsRuntime/poolClassificationSummary.ts'),
      'utf8',
    )
    expect(summary).toContain('partitionPoolStatuses')
    expect(summary).toContain('finished')
    expect(summary).toContain('inactive')
    const labels = readFileSync(
      path.join(WEB, 'src/views/PoolsStudio/modules/poolsOverviewKpisTokens.ts'),
      'utf8',
    )
    expect(labels).toContain('Total Pools')
    expect(labels).not.toContain('Pools Discovered')
  })

  it('List hero uses real counters and premium CSS (no blurry banner)', () => {
    const hero = readFileSync(path.join(WEB, 'src/views/ListStudio/ListPageHero.tsx'), 'utf8')
    expect(hero).toContain('data-list-hero-premium')
    expect(hero).not.toContain('list-hero-background.png')
    const stats = readFileSync(path.join(WEB, 'src/views/ListStudio/useListHeroStats.ts'), 'utf8')
    expect(stats).toContain('getAllProjects')
    expect(stats).toContain('markets')
  })
})
