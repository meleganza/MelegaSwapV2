/**
 * Founder acceptance — AI Builder Set up → Review → Activate.
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

describe('AI Builder founder 3-step advancement', () => {
  it('blocks Configure without resolved token', () => {
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

  it('blocks Configure without positive reserve', () => {
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

  it('exposes Set up → Review → Activate only (no Setup/Strategy/Review wizard)', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('data-lb-single-surface')
    expect(card).toContain('liq-lb-single-surface')
    expect(card).toContain('BUILDER_STEPS')
    expect(card).toContain("label: 'Set up'")
    expect(card).toContain("label: 'Review'")
    expect(card).toContain("label: 'Activate'")
    expect(card).toContain('liq-lb-step-configure')
    expect(card).toContain('liq-lb-step-review')
    expect(card).toContain('liq-lb-step-activate')
    expect(card).toContain('LbDeployReadinessPanel')
    expect(card).not.toContain('WIZARD_STEPS')
    expect(card).not.toContain("['Setup', 'Strategy', 'Review']")
  })

  it('CTA state machine covers step advance / Connect / Pair / Activate', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain("'Connect Wallet'")
    expect(card).toContain("'Choose Token to Grow'")
    expect(card).toContain("'Enter Token Reserve'")
    expect(card).toContain("'Continue to Review'")
    expect(card).toContain("'Continue to Activate'")
    expect(card).toContain("'Pair Required'")
    expect(card).toContain("'Approve Tokens'")
    expect(card).toContain("'Activate Liquidity Program'")
    expect(card).toContain('LB_UX.activationInProgress')
    expect(card).toContain("'Program Active'")
    expect(card).toContain('Liquidity Building contracts not deployed on BNB Smart Chain')
    expect(card).toContain('eth_requestAccounts')
    expect(card).toContain('requestDepositAndActivate')
    expect(card).toContain('setupTokenResolved')
    expect(card).toContain('setupBudgetPositive')
    expect(card).toContain('liq-lb-step-error')
    expect(card).toContain('primaryDisabled')
    expect(card).toContain('liq-lb-activation-guide')
    expect(card).toContain('liq-lb-activation-live')
  })

  it('keeps fail-closed requestDepositAndActivate path (no fake activation)', () => {
    const hook = load('liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(hook).toContain('requestDepositAndActivate')
    expect(hook).toContain('activateProgram')
    expect(hook).toContain('if (!mutateGate.ok)')
    expect(hook).not.toContain('bound program writer')
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toMatch(/card\.requestDepositAndActivate\(\{/)
  })

  it('mounts founder deploy readiness panel without developer diagnostics strip', () => {
    const panel = load('onePage/LbDeployReadinessPanel.tsx')
    expect(panel).toContain('Detected pair')
    expect(panel).toContain('Pool')
    expect(panel).toContain('Factory')
    expect(panel).toContain('Router')
    expect(panel).toContain('Execution readiness')
    expect(panel).toContain('Deployment readiness')
  })
})
