/**
 * Founder acceptance — AI Builder wizard advancement gates (3-step).
 * Source-level + programStatus unit tests (no wallet / chain writes).
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  EMPTY_SETUP_DRAFT,
  setupBudgetPositive,
  setupDraftReadyForReview,
  setupTokenResolved,
  type SetupDraft,
} from '../liquidityBuilding/programStatus'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function draft(partial: Partial<SetupDraft>): SetupDraft {
  return { ...EMPTY_SETUP_DRAFT, ...partial }
}

describe('AI Builder wizard advancement (Part M)', () => {
  it('blocks Setup without resolved token', () => {
    expect(setupTokenResolved(EMPTY_SETUP_DRAFT)).toBe(false)
    expect(
      setupTokenResolved(
        draft({ tokenAddress: '0xabc', tokenSymbol: null }),
      ),
    ).toBe(false)
    expect(
      setupTokenResolved(
        draft({ tokenAddress: '0xabc', tokenSymbol: 'MARCO' }),
      ),
    ).toBe(true)
  })

  it('blocks Setup without positive budget', () => {
    expect(setupBudgetPositive(draft({ tokenBudget: '' }))).toBe(false)
    expect(setupBudgetPositive(draft({ tokenBudget: '0' }))).toBe(false)
    expect(setupBudgetPositive(draft({ tokenBudget: '-1' }))).toBe(false)
    expect(setupBudgetPositive(draft({ tokenBudget: '1.5' }))).toBe(true)
  })

  it('requires full draft for Strategy→Review', () => {
    const incomplete = draft({
      tokenAddress: '0xabc',
      tokenSymbol: 'MARCO',
      tokenBudget: '',
    })
    expect(setupDraftReadyForReview(incomplete)).toBe(false)

    const ready = draft({
      tokenAddress: '0xabc',
      tokenSymbol: 'MARCO',
      tokenBudget: '10',
      strategy: 'FULL_AI',
      epochSeconds: 300,
    })
    expect(setupDraftReadyForReview(ready)).toBe(true)
  })

  it('openReview returns boolean and only advances when draftReady', () => {
    const hook = load('liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(hook).toContain('openReview: () => boolean')
    expect(hook).toContain('if (!setupDraftReadyForReview(draft)) return false')
    expect(hook).toContain("setPhase('review')")
    expect(hook).toContain('return true')
  })

  it('Continue to Review does not setUiStep(2) when openReview fails', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('const opened = card.openReview()')
    expect(card).toContain('if (!opened)')
    expect(card).toContain('setUiStep(2)')
    const openedIdx = card.indexOf('const opened = card.openReview()')
    const failIdx = card.indexOf('if (!opened)', openedIdx)
    const stepIdx = card.indexOf('setUiStep(2)', openedIdx)
    expect(failIdx).toBeGreaterThan(openedIdx)
    expect(stepIdx).toBeGreaterThan(failIdx)
  })

  it('final Review step surfaces Connect Wallet or Activate without silent disabled gate', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('activeStep === 2 && !card.walletConnected')
    expect(card).toContain('Continue to Review')
    expect(card).toContain('eth_requestAccounts')
    expect(card).toContain('setupTokenResolved')
    expect(card).toContain('setupBudgetPositive')
    expect(card).toContain('liq-lb-step-error')
  })

  it('marks wizard steps complete only when corresponding valid state exists', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('stepDone[i]')
    expect(card).toContain('tokenReady')
    expect(card).toContain('budgetReady')
    expect(card).toContain('reviewReached')
  })

  it('wizard is three steps: Setup, Strategy, Review', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain("['Setup', 'Strategy', 'Review']")
    expect(card).not.toContain("['Setup', 'Budget', 'Strategy', 'Review', 'Activate']")
  })
})
