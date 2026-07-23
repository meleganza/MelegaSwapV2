/**
 * LIQUIDITY_PIXEL_PERFECTION_001 — fixed-dimension composition guards.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LIQUIDITY_PIXEL_PERFECTION_001', () => {
  it('locks 672/32/672 grid and 860px main row', () => {
    const tokens = load('onePage/onePageTokens.ts')
    const page = load('onePage/UnifiedLiquidityPage.tsx')
    expect(tokens).toContain("col: '672px'")
    expect(tokens).toContain("colGap: '32px'")
    expect(tokens).toContain("mainRowH: '860px'")
    expect(tokens).toContain("contentMax: '1376px'")
    expect(tokens).toContain("mainTopPad: '32px'")
    expect(tokens).toContain("belowMainGap: '24px'")
    expect(page).toContain('liqOne.col')
    expect(page).toContain('liqOne.colGap')
    expect(page).toContain('liqOne.mainRowH')
    expect(page).toContain('data-pixel-main-row="860"')
  })

  it('left LB card uses fixed header/wizard/body/footer heights', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('liqOne.mainRowH')
    expect(card).toContain('liqOne.lbHeaderExpanded')
    expect(card).toContain('liqOne.lbHeaderCollapsed')
    expect(card).toContain('liqOne.lbWizardH')
    expect(card).toContain('liqOne.lbBodyH')
    expect(card).toContain('liqOne.lbFooterH')
    expect(card).toContain('overflow: hidden')
    expect(card).toMatch(/data-pixel-lb-body=\{heroCollapsed \? '580' : '442'\}/)
    expect(card).not.toContain('Back to Liquidity Studio')
    expect(card).not.toContain('View Pools')
    expect(card).not.toContain('View Old Liquidity')
  })

  it('right column is 520 + 16 + 324', () => {
    const tokens = load('onePage/onePageTokens.ts')
    const add = load('onePage/AddLiquidityCard.tsx')
    const snap = load('onePage/DexLiquiditySnapshot.tsx')
    expect(tokens).toContain("addH: '520px'")
    expect(tokens).toContain("addHeaderH: '96px'")
    expect(tokens).toContain("addPairH: '70px'")
    expect(tokens).toContain("addFormH: '250px'")
    expect(tokens).toContain("addSummaryH: '44px'")
    expect(tokens).toContain("addFooterH: '60px'")
    expect(tokens).toContain("snapH: '324px'")
    expect(tokens).toContain("rightGap: '16px'")
    expect(add).toContain('liqOne.addH')
    expect(add).toContain('liqOne.addHeaderH')
    expect(add).toContain('liqOne.addPairH')
    expect(add).toContain('liqOne.addFormH')
    expect(add).toContain('liqOne.addSummaryH')
    expect(add).toContain('liqOne.addFooterH')
    expect(tokens).toContain("snapHeadH: '44px'")
    expect(tokens).toContain("snapKpiH: '76px'")
    expect(tokens).toContain("snapChartH: '132px'")
    expect(tokens).toContain("snapFooterH: '72px'")
    expect(snap).toContain('liqOne.snapH')
    expect(snap).toContain('liqOne.snapHeadH')
    expect(snap).toContain('liqOne.snapKpiH')
    expect(snap).toContain('liqOne.snapChartH')
    expect(snap).toContain('liqOne.snapFooterH')
    expect(snap).toContain('Awaiting Indexer')
    expect(snap).not.toContain('$58.74M')
  })

  it('overview is 180px with locked five-column widths', () => {
    const tokens = load('onePage/onePageTokens.ts')
    const overview = load('onePage/WalletLiquidityOverview.tsx')
    expect(tokens).toContain("overviewH: '180px'")
    expect(tokens).toContain("overviewInnerH: '148px'")
    expect(tokens).toContain("overviewColA: '336px'")
    expect(tokens).toContain("overviewColE: '192px'")
    expect(overview).toContain('liqOne.overviewH')
    expect(overview).toContain('liqOne.overviewColA')
    expect(overview).toContain('Total LP Value')
    expect(overview).toContain('Holdings Breakdown')
    expect(overview).toContain('Active Positions')
    expect(overview).toContain('Networks')
    expect(overview).toContain('Unclaimed Fees')
    expect(overview).toContain('Fees unavailable')
    expect(overview).not.toMatch(/>\s*TVL\s*</)
  })

  it('positions rows are 72px and education is 96px', () => {
    const positions = load('onePage/LiquidityPositions.tsx')
    const edu = load('onePage/LiquidityEducationRail.tsx')
    expect(positions).toContain('liqOne.positionsHeadH')
    expect(positions).toContain('liqOne.positionsRowH')
    expect(edu).toContain('liqOne.educationH')
  })

  it('wizard steps stay in-card without navigation routes', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain("['Setup', 'Budget', 'Strategy', 'Review', 'Activate']")
    expect(card).not.toContain("router.push('/liquidity-studio?view=building&step=")
    expect(card).toContain('useLiquidityBuildingCard')
  })
})
