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
    expect(LB_UX.noActiveProgramTitle).toBe('Create your first AI Liquidity Program')
    expect(LB_UX.noActiveProgramCta).toBe('Create Liquidity Program')
    expect(LB_UX.quoteAssetLabel).toBe('Create Market Against')
    expect(LB_UX.reserveLabel).toBe('Token Reserve')
    expect(LB_UX.technicalTitle).toBe('Advanced / Technical Details')
  })

  it('token selection uses search + address paste (no fixed BNB/MARCO chips)', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('lb-token-select')
    expect(card).toContain('lb-token-address-input')
    expect(card).toContain('CurrencySearchModal')
    expect(card).toContain('lb-token-listing-status')
    expect(card).toContain('lb-token-market-status')
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

  it('goals and strategies expose tooltips', () => {
    for (const g of LIQUIDITY_GOAL_OPTIONS) {
      expect(g.tooltip.length).toBeGreaterThan(10)
    }
    for (const s of STRATEGY_PRESET_OPTIONS) {
      expect(s.tooltip.length).toBeGreaterThan(10)
    }
    expect(LIQUIDITY_GOAL_OPTIONS.map((g) => g.label)).toEqual([
      'Steady Growth',
      'Deeper Market',
      'Launch Support',
    ])
    expect(STRATEGY_PRESET_OPTIONS.map((s) => s.title)).toEqual([
      'Conservative',
      'Balanced',
      'AI Optimized',
      'Aggressive',
    ])
  })

  it('moves market/deploy/pair/execution readiness into Advanced', () => {
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
    // Primary configure grid must not host a Market status meta cell
    const configure = card.slice(
      card.indexOf('liq-lb-step-configure'),
      card.indexOf('data-testid="liq-lb-advanced"'),
    )
    expect(configure).not.toContain('<MetaLabel>Market status</MetaLabel>')
    expect(configure).not.toContain('<MetaLabel>Ready to activate</MetaLabel>')
  })

  it('ships contextual docs routes', () => {
    const pages = [
      'src/pages/docs/liquidity-builder/token-reserve.tsx',
      'src/pages/docs/liquidity-builder/strategies.tsx',
      'src/pages/docs/liquidity-builder/execution.tsx',
      'src/pages/docs/liquidity-builder/fees.tsx',
    ]
    for (const p of pages) {
      expect(existsSync(path.join(WEB, p))).toBe(true)
    }
    expect(LB_UX.docsTokenReserve).toBe('/docs/liquidity-builder/token-reserve')
    expect(LB_UX.docsStrategies).toBe('/docs/liquidity-builder/strategies')
    expect(LB_UX.docsExecution).toBe('/docs/liquidity-builder/execution')
    expect(LB_UX.docsFees).toBe('/docs/liquidity-builder/fees')
  })
})
