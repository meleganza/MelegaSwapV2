/**
 * Product UX Redesign V2 — founder-facing Liquidity Builder.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { LIQUIDITY_GOAL_OPTIONS, QUOTE_ASSET_OPTIONS, STRATEGY_PRESET_OPTIONS } from '../strategyPresets'
import { LB_UX } from '../uxCopy'

const ROOT = path.resolve(__dirname, '../..')
const WEB = path.resolve(__dirname, '../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('AI Liquidity Builder product UX redesign V2', () => {
  it('header copy is concise founder product line', () => {
    expect(LB_UX.entryLead).toBe('Create an automated liquidity growth program for your token.')
    expect(LB_UX.entrySupport).toMatch(/token reserve/i)
    expect(LB_UX.noActiveProgramTitle).toBe('Create your first AI Liquidity Program')
    expect(LB_UX.noActiveProgramCta).toBe('Create Liquidity Program')
    expect(LB_UX.quoteAssetLabel).toBe('Create Market Against')
    expect(LB_UX.quoteAssetSupport).toBe('The asset paired with your token to create market liquidity.')
    expect(LB_UX.reserveLabel).toBe('Token Reserve')
    expect(LB_UX.technicalTitle).toBe('Technical Details')
  })

  it('token selection uses search + address paste (no fixed BNB/MARCO chips)', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('lb-token-select')
    expect(card).toContain('lb-token-address-input')
    expect(card).toContain('CurrencySearchModal')
    expect(card).toContain('CurrencyLogo')
    expect(card).toContain('lb-token-identity')
    expect(card).toContain('lb-token-listing-status')
    expect(card).toContain('lb-token-market-status')
    expect(card).toContain('lb-token-external-hint')
    expect(card).not.toContain('lb-token-quick-marco')
    expect(card).not.toContain('MARCO_ADDR')
    expect(card).not.toContain('Liquidity Budget')
    expect(card).not.toContain('Budget Asset')
    expect(card).not.toContain('Target Ratio')
    expect(card).not.toContain('Transaction readiness')
  })

  it('quote selection exposes WBNB USDT USDC as Create Market Against', () => {
    expect(QUOTE_ASSET_OPTIONS.map((q) => q.key)).toEqual(['WBNB', 'USDT', 'USDC'])
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('lb-quote-${q.key.toLowerCase()}')
    expect(card).toContain('setQuoteAssetKey')
    expect(card).toContain('LB_UX.quoteAssetLabel')
    expect(card).toContain('QUOTE_ASSET_OPTIONS.map')
  })

  it('goals and strategies expose operational tooltips', () => {
    expect(LIQUIDITY_GOAL_OPTIONS.map((g) => g.tooltip)).toEqual([
      'Gradual liquidity expansion with lower market impact.',
      'Prioritizes liquidity depth and lower slippage for larger trades.',
      'Designed for new tokens requiring initial market formation.',
    ])
    expect(STRATEGY_PRESET_OPTIONS.find((s) => s.key === 'CONSERVATIVE')?.tooltip).toMatch(/lower market impact/i)
    expect(STRATEGY_PRESET_OPTIONS.find((s) => s.key === 'AI_OPTIMIZED')?.tooltip).toMatch(/demand, volume and volatility/i)
    expect(STRATEGY_PRESET_OPTIONS.find((s) => s.key === 'AGGRESSIVE')?.tooltip).toMatch(/higher market impact/i)
  })

  it('moves market/deploy/pair/execution readiness into Technical Details', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('liq-lb-advanced')
    expect(card).toContain('LB_UX.technicalTitle')
    expect(card).toContain('Detected pair:')
    expect(card).toContain('Deploy readiness:')
    expect(card).toContain('Execution readiness:')
    const advIdx = card.indexOf('data-testid="liq-lb-advanced"')
    const deployUsage = card.indexOf('<LbDeployReadinessPanel', advIdx)
    expect(advIdx).toBeGreaterThan(-1)
    expect(deployUsage).toBeGreaterThan(advIdx)
    const configure = card.slice(
      card.indexOf('liq-lb-step-configure'),
      card.indexOf('data-testid="liq-lb-advanced"'),
    )
    expect(configure).not.toContain('<MetaLabel>Market status</MetaLabel>')
    expect(configure).not.toContain('<MetaLabel>Ready to activate</MetaLabel>')
  })

  it('ships all contextual docs routes', () => {
    const pages = [
      'src/pages/docs/liquidity-builder/overview.tsx',
      'src/pages/docs/liquidity-builder/token-reserve.tsx',
      'src/pages/docs/liquidity-builder/liquidity-goals.tsx',
      'src/pages/docs/liquidity-builder/strategies.tsx',
      'src/pages/docs/liquidity-builder/execution.tsx',
      'src/pages/docs/liquidity-builder/fees.tsx',
    ]
    for (const p of pages) {
      expect(existsSync(path.join(WEB, p))).toBe(true)
    }
    expect(LB_UX.docsOverview).toBe('/docs/liquidity-builder/overview')
    expect(LB_UX.docsTokenReserve).toBe('/docs/liquidity-builder/token-reserve')
    expect(LB_UX.docsLiquidityGoals).toBe('/docs/liquidity-builder/liquidity-goals')
    expect(LB_UX.docsStrategies).toBe('/docs/liquidity-builder/strategies')
    expect(LB_UX.docsExecution).toBe('/docs/liquidity-builder/execution')
    expect(LB_UX.docsFees).toBe('/docs/liquidity-builder/fees')
  })

  it('hero uses tight auto-height packing (no empty band)', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('$tight')
    expect(card).toContain('no empty band')
    expect(card).toContain('<Desc data-testid="liq-lb-header-desc">')
  })
})
