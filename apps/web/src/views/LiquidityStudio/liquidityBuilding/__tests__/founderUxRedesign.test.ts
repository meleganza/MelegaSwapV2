import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { EMPTY_SETUP_DRAFT, setupDraftReadyForReview, type SetupDraft } from '../programStatus'
import { mapStrategyPreset, QUOTE_ASSET_OPTIONS, STRATEGY_PRESET_OPTIONS } from '../strategyPresets'
import { LB_UX } from '../uxCopy'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Liquidity Builder founder UX redesign', () => {
  it('uses founder terminology in primary copy', () => {
    expect(LB_UX.reserveLabel).toBe('Token Reserve')
    expect(LB_UX.quoteAssetLabel).toBe('Quote Asset')
    expect(LB_UX.tokenToGrowLabel).toBe('Token to Grow')
    expect(LB_UX.noActiveProgramTitle).toBe('No liquidity program exists for this token yet')
    expect(LB_UX.noActiveProgramCta).toBe('Create Liquidity Program')
    expect(LB_UX.entrySupport).toContain('deposit my tokens')
  })

  it('exposes quote assets WBNB USDT USDC independently of token', () => {
    expect(QUOTE_ASSET_OPTIONS.map((q) => q.key)).toEqual(['WBNB', 'USDT', 'USDC'])
    expect(EMPTY_SETUP_DRAFT.quoteAssetKey).toBe('WBNB')
    expect(EMPTY_SETUP_DRAFT.tokenSymbol).toBeNull()
  })

  it('maps strategy presets without inventing fee changes', () => {
    expect(STRATEGY_PRESET_OPTIONS.map((s) => s.key)).toEqual([
      'CONSERVATIVE',
      'BALANCED',
      'AI_OPTIMIZED',
      'AGGRESSIVE',
    ])
    expect(mapStrategyPreset('AI_OPTIMIZED').strategy).toBe('FULL_AI')
    expect(mapStrategyPreset('CONSERVATIVE').strategy).toBe('DYNAMIC_RANGE')
  })

  it('keeps token and quote draft fields independent', () => {
    const draft: SetupDraft = {
      ...EMPTY_SETUP_DRAFT,
      tokenAddress: '0x1111111111111111111111111111111111111111',
      tokenSymbol: 'MM72',
      quoteAssetKey: 'WBNB',
      tokenBudget: '1000000',
      strategyPreset: 'AI_OPTIMIZED',
    }
    expect(draft.tokenSymbol).toBe('MM72')
    expect(draft.quoteAssetKey).toBe('WBNB')
    expect(setupDraftReadyForReview(draft)).toBe(true)
  })

  it('card surfaces selected token on chip and quote picker', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('LB_UX.tokenToGrowLabel')
    expect(card).toContain('LB_UX.quoteAssetLabel')
    expect(card).toContain('LB_UX.reserveLabel')
    expect(card).toContain('LB_UX.liquidityGoalLabel')
    expect(card).toContain('Liquidity Strategy')
    expect(card).toContain('Activate Liquidity Program')
    expect(card).toContain('data-selected-token')
    expect(card).toContain('lb-token-selected-label')
    expect(card).toContain('setQuoteAssetKey')
    expect(card).toContain('setStrategyPreset')
    expect(card).not.toContain('Liquidity Budget')
    expect(card).not.toContain('>Budget Asset<')
    expect(card).not.toContain('Target Ratio')
    expect(card).not.toContain('Transaction readiness')
    expect(card).not.toContain('No active Liquidity Building program for this wallet and token')
  })

  it('pair detection accepts quote key separately from project token', () => {
    const det = load('liquidityBuilding/useMelegaPairDetection.ts')
    expect(det).toContain('quoteKey')
    expect(det).toContain('resolveQuoteCurrency')
    const hook = load('liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(hook).toContain('useMelegaPairDetection(selectedCurrency, draft.quoteAssetKey)')
    expect(hook).toContain('setQuoteAssetKey')
    expect(hook).toContain('setToken')
  })
})
