import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { measureListedProjectsCount } from 'lib/market-registry/listedProjectsCount'
import { formatUsdCompact, formatUsdPrice, tokenUsdFromWbnbQuote } from 'lib/bsc-indexer/usdValuation'
import {
  formatFeaturedChange,
  formatFeaturedPrice,
  formatFeaturedMarketCap,
  formatFeaturedVolume,
} from 'views/HomeTrade/useFeaturedProjectMarkets'
import { resolveTrendingItemsForDisplay } from 'lib/trending/durableTrendingSnapshot'
import { LIST_HERO_BNB_IMG_PX, LIST_HERO_BNB_LOGO, LIST_HERO_BNB_ORBIT_PX } from 'views/ListStudio/ListPageHero'

const WEB = path.resolve(__dirname, '../../..') // apps/web
const ROOT = path.resolve(WEB, '../..')
const SRC = path.resolve(WEB, 'src')

describe('MELEGA_DEX_V1_FOUNDER_REGRESSION_REPAIR', () => {
  it('Listed Projects counts indexed tokens, not static Featured five', () => {
    const m = measureListedProjectsCount()
    expect(m.finalCount).toBeGreaterThan(50)
    expect(m.finalCount).not.toBe(5)
    expect(m.duplicatesRemoved).toBeGreaterThanOrEqual(0)
    expect(m.provenance).toContain('deduped')
  })

  it('USD valuation helpers convert WBNB quotes and format compact USD', () => {
    expect(tokenUsdFromWbnbQuote(0.001, 600)).toBeCloseTo(0.6, 5)
    expect(formatUsdPrice(0.6)).toContain('$')
    expect(formatUsdCompact(0.005)).toBe('<$0.01')
    expect(formatUsdCompact(1200)).toBe('$1.2K')
  })

  it('Featured change never shows Insufficient observations', () => {
    expect(formatFeaturedChange(undefined).text).not.toContain('Insufficient')
    expect(formatFeaturedChange({ changePct: null } as never).text).not.toContain('Insufficient')
    expect(formatFeaturedPrice(undefined)).toBe('Price updating')
    expect(formatFeaturedMarketCap(undefined)).toBe('—')
    expect(formatFeaturedChange({ status: 'NO_RECENT_TRADES', changePct: null } as never).text).toBe('')
    expect(formatFeaturedVolume({ status: 'NO_RECENT_TRADES' } as never)).toBe('$0.00')
    expect(formatFeaturedVolume({ status: 'STALE' } as never)).toBe('—')
    expect(formatUsdPrice(0.000000259849)).toBe('$0.0₆25985')
  })

  it('durable trending snapshot prefers live and falls back to last-good', () => {
    const live = [{ id: 'a', primary: 'AAA', accent: '↑ 1%' }]
    const good = [{ id: 'b', primary: 'BBB', accent: '↓ 2%' }]
    expect(resolveTrendingItemsForDisplay(live as never, good as never).fromDurable).toBe(false)
    expect(resolveTrendingItemsForDisplay([], good as never).fromDurable).toBe(true)
    expect(resolveTrendingItemsForDisplay([], good as never).items[0].primary).toBe('BBB')
  })

  it('Liquidity Builder is exploded configuration surface with how-it-works', () => {
    const card = readFileSync(path.join(SRC, 'views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx'), 'utf8')
    expect(card).toContain('data-lb-surface="exploded"')
    expect(card).toContain('liq-lb-how-it-works')
    expect(card).toContain('liq-lb-exploded-grid')
    expect(card).toContain('Build your liquidity automatically')
    expect(card).toContain('LbDeployReadinessPanel')
    expect(card).toContain('Liquidity Building contracts not deployed on BNB Smart Chain')
  })

  it('Pools explore retains unfiltered last-good inventory', () => {
    const hook = readFileSync(path.join(SRC, 'views/PoolsStudio/modules/usePoolsExplorePools.ts'), 'utf8')
    expect(hook).toContain("filter: 'All'")
    expect(hook).toContain('Showing last known active pools while refreshing')
    expect(hook).toContain('8_000')
  })

  it('Create Pool is a permanently expanded operational workspace and Featured band is denser', () => {
    const create = readFileSync(path.join(SRC, 'views/PoolsStudio/components/CreatePoolCta.tsx'), 'utf8')
    expect(create).toContain('data-ps-create-pool-permanently-expanded')
    expect(create).toContain('data-ps-create-pool-expanded="true"')
    expect(create).not.toContain('data-ps-create-pool-compact')
    expect(create).not.toMatch(/data-ps-create-pool-expand(?!ed)/)
    expect(create).not.toContain('data-ps-create-pool-close')
    const featured = readFileSync(path.join(SRC, 'views/PoolsStudio/modules/PoolsFeaturedPoolBand.tsx'), 'utf8')
    expect(featured).toContain('max-height: 120px')
    expect(featured).toContain('font-size: 12px')
  })

  it('List BNB orbit uses larger full-bleed canonical asset', () => {
    expect(LIST_HERO_BNB_ORBIT_PX).toBe(44)
    expect(LIST_HERO_BNB_IMG_PX).toBe(36)
    expect(LIST_HERO_BNB_LOGO).toContain('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')
    expect(existsSync(path.join(WEB, 'public', LIST_HERO_BNB_LOGO.replace(/^\//, '')))).toBe(true)
  })

  it('preserves Create Token factory bind and LB factory address', () => {
    const ct = readFileSync(path.join(ROOT, 'apps/web/src/config/constants/createTokenFactoryDeployment.ts'), 'utf8')
    expect(ct).toContain('0x6DbB5d7162842dA94ef9172AedC8D148d203d311')
    const lb = readFileSync(path.join(ROOT, 'apps/web/src/config/constants/liquidityBuildingDeployment.ts'), 'utf8')
    expect(lb).toContain("lbFactory: '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'")
  })

  it('Featured markets builder emits USD fields', () => {
    const src = readFileSync(path.join(SRC, 'lib/bsc-indexer/featuredMarkets.ts'), 'utf8')
    expect(src).toContain('latestPriceUsd')
    expect(src).toContain('volume24hUsd')
    expect(src).toContain('Fully Diluted Value')
    expect(src).not.toContain('Insufficient observations')
  })
})
