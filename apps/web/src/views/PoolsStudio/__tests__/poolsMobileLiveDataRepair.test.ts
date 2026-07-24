/**
 * DEX_V1_POOLS_MOBILE_LIVE_DATA_REPAIR — focused contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { MELEGA_FACTORY_BSC } from 'lib/bsc-indexer/constants'
import { mapFactoryPairToPreviewCard } from '../poolsRuntime/useMelegaFactoryPools'

const ROOT = path.resolve(__dirname, '../../..')

describe('DEX_V1_POOLS_MOBILE_LIVE_DATA_REPAIR', () => {
  it('does not demote shared bottom nav to sticky on Pools', () => {
    const css = readFileSync(path.join(ROOT, 'views/PoolsStudio/PoolsStudioGlobalStyle.tsx'), 'utf8')
    expect(css).not.toMatch(/nav\[aria-label='Main navigation'\]/)
    expect(css).not.toMatch(/position:\s*sticky;\s*\n\s*bottom:\s*0/)
  })

  it('maps factory pairs with unavailable valuation — never $0.00', () => {
    const card = mapFactoryPairToPreviewCard({
      pairAddress: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
      token0: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
      token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      symbol0: 'MARCO',
      symbol1: 'WBNB',
      classification: 'tradeable',
      metadataStatus: 'partial',
      active: true,
    })
    expect(card.id.startsWith('amm-')).toBe(true)
    expect(card.tvl).not.toMatch(/\$0/)
    expect(card.tvl).toMatch(/Unavailable|—/)
    expect(card.name).toContain('MARCO')
  })

  it('uses canonical Melega Factory address', () => {
    expect(MELEGA_FACTORY_BSC.toLowerCase()).toBe('0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c')
    const hook = readFileSync(path.join(ROOT, 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools.ts'), 'utf8')
    expect(hook).toContain('MELEGA_FACTORY_BSC')
    expect(hook).toContain('/api/indexer/pairs')
  })

  it('Create Pool and Add Liquidity route to Liquidity Studio add view', () => {
    const header = readFileSync(path.join(ROOT, 'views/PoolsStudio/components/PoolsStudioPageHeader.tsx'), 'utf8')
    expect(header).toContain('/liquidity-studio?view=add')
    expect(header).not.toContain('build-studio?intent=staking-pool')
  })

  it('Trending ribbon uses truthful Live label when ranking empty and no hardcoded 0.00036', () => {
    const ribbon = readFileSync(path.join(ROOT, 'views/HomeTrade/TrendingRibbon.tsx'), 'utf8')
    expect(ribbon).toContain('Live on Melega DEX')
    expect(ribbon).toContain('Trending on Melega DEX')
    expect(ribbon).not.toContain('0.00036')
    const rankings = readFileSync(path.join(ROOT, 'views/HomeTrade/useDexTrendingRankings.ts'), 'utf8')
    expect(rankings).not.toContain('0.00036')
    expect(rankings).toContain("secondary: priceLabel || '—'")
  })
})
