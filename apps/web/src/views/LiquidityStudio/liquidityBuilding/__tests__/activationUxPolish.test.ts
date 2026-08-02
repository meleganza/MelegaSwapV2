/**
 * MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_ACTIVATION_UX_POLISH
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { formatLbTokenAmount, looksLikeRawWei } from '../formatLbAmount'
import { mapProgramViewToMetrics } from '../mapProgramView'
import { LB_UX } from '../uxCopy'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LB activation UX polish', () => {
  it('formats wei reserves as human token amounts', () => {
    expect(formatLbTokenAmount('1000000000000000000', 18, 'MARCO')).toBe('1 MARCO')
    expect(formatLbTokenAmount('1500000000000000000', 18, 'MARCO')).toBe('1.5 MARCO')
    expect(formatLbTokenAmount('1', 18, 'MARCO')).toBe('1 MARCO')
    expect(looksLikeRawWei('1000000000000000000')).toBe(true)
    expect(looksLikeRawWei('1 MARCO')).toBe(false)
  })

  it('never leaves raw wei in mapped budget remaining labels', () => {
    const metrics = mapProgramViewToMetrics(
      {
        remainingBudget: '1000000000000000000',
        tokensMatched: '0',
        totalQuoteAdded: '0',
        totalLpMinted: '0',
        executionCount: 0,
      },
      { decimals: 18, projectSymbol: 'MARCO' },
    )
    expect(metrics.budgetRemainingLabel).toBe('1 MARCO')
    expect(looksLikeRawWei(metrics.budgetRemainingLabel)).toBe(false)
  })

  it('active view is a product summary with Technical Details collapsed', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('liq-lb-active-title')
    expect(card).toContain('LB_UX.activeProductTitle')
    expect(card).toContain('liq-lb-active-pair')
    expect(card).toContain('liq-lb-active-reserve')
    expect(card).toContain('liq-lb-active-strategy')
    expect(card).toContain('liq-lb-active-goal')
    expect(card).toContain('liq-lb-active-advanced')
    expect(card).toContain('liq-lb-program-address')
    expect(LB_UX.activeProductTitle).toBe('AI Liquidity Builder Active')
  })

  it('activation guide explains wallet confirmations before prompts', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('liq-lb-activation-guide')
    expect(card).toContain('LB_UX.activationStepApprove')
    expect(card).toContain('LB_UX.activationStepDeposit')
    expect(card).toContain('LB_UX.activationStepActivate')
    expect(card).toContain('liq-lb-activation-live')
    expect(card).toContain('onProgress')
    expect(LB_UX.activationStepApprove).toBe('1/3 Token approval')
    expect(LB_UX.activationLiveCreating).toBe('Creating program')
  })

  it('uses compact responsive layout for laptop viewports', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('compactLayout')
    expect(card).toContain('$compact={compactLayout}')
    expect(card).toContain('@media (max-width: 900px)')
    expect(card).toContain('@media (max-width: 480px)')
  })

  it('does not touch forbidden contract / swap cores', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).not.toMatch(/exchange\.ts|contracts\.ts|MasterChef/)
    const flow = load('liquidityBuilding/founderActivateFlow.ts')
    expect(flow).toContain('onProgress')
    expect(flow).toContain('createProgram')
    expect(flow).toContain('depositBudget')
  })
})
