/**
 * Founder acceptance — AI Builder single-surface advancement gates (Wave 03).
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

describe('AI Builder single-surface advancement (Wave 03)', () => {
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

  it('requires full draft for activation readiness', () => {
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

  it('single surface — no WIZARD_STEPS tracker or Back navigation', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('data-lb-single-surface')
    expect(card).toContain('liq-lb-single-surface')
    expect(card).not.toContain('WIZARD_STEPS')
    expect(card).not.toContain("['Setup', 'Strategy', 'Review']")
    expect(card).not.toContain('liq-lb-wizard')
    expect(card).not.toContain('AI-POWERED')
    expect(card).not.toContain('RECOMMENDED')
    expect(card).not.toContain('>Back<')
    expect(card).not.toContain("onClick={onBack}")
  })

  it('CTA state machine labels cover Connect / Select / Budget / Pair / Activate / diagnostic', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain("'Connect Wallet'")
    expect(card).toContain("'Select Token'")
    expect(card).toContain("'Enter Budget'")
    expect(card).toContain("'Pair Required'")
    expect(card).toContain("'Approve'")
    expect(card).toContain("'Activate Liquidity Builder'")
    expect(card).toContain("'Activating'")
    expect(card).toContain("'Active'")
    expect(card).toContain('Liquidity Building contracts not deployed on BNB Smart Chain')
    expect(card).not.toContain("'Activation Unavailable'")
    expect(card).toContain('eth_requestAccounts')
    expect(card).toContain('requestDepositAndActivate')
    expect(card).toContain('setupTokenResolved')
    expect(card).toContain('setupBudgetPositive')
    expect(card).toContain('liq-lb-step-error')
  })

  it('keeps fail-closed requestDepositAndActivate path (no fake activation)', () => {
    const hook = load('liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(hook).toContain('requestDepositAndActivate')
    expect(hook).toContain("programRead.source !== 'ON_CHAIN'")
    expect(hook).toContain('if (!mutateGate.ok)')
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('card.requestDepositAndActivate()')
  })
})
