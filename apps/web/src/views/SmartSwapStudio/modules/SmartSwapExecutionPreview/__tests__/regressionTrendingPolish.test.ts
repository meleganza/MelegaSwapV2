import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const viewsRoot = join(__dirname, '../../../..')
const srcRoot = join(__dirname, '../../../../../')

describe('SMART_SWAP_FINAL_REGRESSION_AND_TRENDING_POLISH', () => {
  const homeCss = readFileSync(join(viewsRoot, 'HomeTrade/HomeTradeGlobalStyle.tsx'), 'utf8')
  const tradeCss = readFileSync(join(viewsRoot, 'Trade/TradeTerminalGlobalStyle.tsx'), 'utf8')
  const moduleSrc = readFileSync(join(__dirname, '../SmartSwapExecutionPreviewModule.tsx'), 'utf8')
  const trendingSrc = readFileSync(join(viewsRoot, 'HomeTrade/useDexTrendingRankings.ts'), 'utf8')
  const ribbonSrc = readFileSync(join(viewsRoot, 'HomeTrade/TrendingRibbon.tsx'), 'utf8')
  const tickerSrc = readFileSync(
    join(srcRoot, 'design-system/melega/components/Ticker/MelegaTicker.tsx'),
    'utf8',
  )

  it('removes CTA translateY overlap lifts on Instant home', () => {
    expect(homeCss).toMatch(/justify-content:\s*flex-start/)
    expect(homeCss).not.toMatch(/translateY\(-24px\)/)
    expect(homeCss).not.toMatch(/translateY\(-25px\)/)
    expect(homeCss).not.toMatch(/margin-top:\s*auto\s*!important/)
  })

  it('hides form Details inside #swap-page only', () => {
    expect(homeCss).toMatch(/#swap-page \[data-execution-details-accordion\]/)
    expect(homeCss).toMatch(/#execution-details-toggle/)
    expect(tradeCss).toMatch(/#swap-page \[data-execution-details-accordion\]/)
    expect(moduleSrc).toMatch(/#smart-execution-details-toggle|smart-execution-details-toggle/)
    expect(moduleSrc).toMatch(/>Details</)
    expect(moduleSrc).not.toMatch(/Show details/)
  })

  it('Smart intel stack orders Route → Metrics → Fee → AI → Details', () => {
    expect(moduleSrc).toMatch(/data-smart-route-card/)
    expect(moduleSrc).toMatch(/order:\s*1/)
    expect(moduleSrc).toMatch(/order:\s*5/)
    expect(moduleSrc).toMatch(/data-insight='ai'/)
  })

  it('trending ranks from swaps/pairs without withMove membership gate', () => {
    expect(trendingSrc).toMatch(/TOKEN_LIST_BY_ADDRESS/)
    expect(trendingSrc).toMatch(/tradeablePair/)
    expect(trendingSrc).toMatch(/resolveDisplayMeta/)
    expect(trendingSrc).not.toMatch(/const pool = withMove/)
    expect(trendingSrc).toMatch(/rankTierAssets\(active,\s*TRENDING_LIMIT\)/)
  })

  it('ticker has live dot + marquee pause + mobile scroll', () => {
    expect(tickerSrc).toMatch(/showLiveDot/)
    expect(tickerSrc).toMatch(/data-trending-live-dot/)
    expect(tickerSrc).toMatch(/onMouseEnter/)
    expect(tickerSrc).toMatch(/overflow-x:\s*\$\{/)
    expect(ribbonSrc).toMatch(/showLiveDot/)
  })
})
