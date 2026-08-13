/**
 * Founder acceptance — AI Builder Configure → Review & activate.
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

describe('AI Builder founder two-step advancement', () => {
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

  it('exposes Configure plan → Review & activate without a redundant intermediate click', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('data-lb-single-surface')
    expect(card).toContain('liq-lb-single-surface')
    expect(card).toContain('BUILDER_STEPS')
    expect(card).toContain("label: 'Configure plan'")
    expect(card).toContain("label: 'Review & activate'")
    expect(card).toContain('type BuilderStep = 1 | 2')
    expect(card).toContain('liq-lb-step-configure')
    expect(card).toContain('liq-lb-step-review')
    expect(card).toContain('liq-lb-step-activate')
    expect(card).toContain('LbDeployReadinessPanel')
    expect(card).toContain('Two required inputs')
    expect(card).toContain('Customize recommended plan')
    expect(card).not.toContain('WIZARD_STEPS')
    expect(card).not.toContain("['Setup', 'Strategy', 'Review']")
    expect(card).not.toContain("'Continue to Activate'")
  })

  it('CTA state machine covers step advance / Connect / Pair / Activate', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain("'Connect Wallet'")
    expect(card).toContain("'Choose Token to Grow'")
    expect(card).toContain("'Enter Token Reserve'")
    expect(card).toContain("'Review & Activate'")
    expect(card).toContain("'Pair Required'")
    expect(card).toContain("'Approve Tokens'")
    expect(card).toContain("'Activate Liquidity Program'")
    expect(card).toContain('LB_UX.activationInProgress')
    expect(card).toContain('LB_UX.programActiveLabel')
    expect(card).toContain('Liquidity Building contracts not deployed on BNB Smart Chain')
    expect(card).toContain('useWagmiSwitchNetwork')
    expect(card).toContain('requestDepositAndActivate')
    expect(card).toContain('setupTokenResolved')
    expect(card).toContain('setupBudgetPositive')
    expect(card).toContain('liq-lb-step-error')
    expect(card).toContain('primaryDisabled')
    expect(card).toContain('liq-lb-activation-guide')
    expect(card).toContain('liq-lb-activation-live')
    expect(card).toContain("builderStep === 2 && !card.walletConnected")
    expect(card).toContain('switchNetworkAsync(56)')
    expect(card).not.toContain("method: 'wallet_switchEthereumChain'")
  })

  it('treats wallet and network as guided CTA states, not product availability failures', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('Wallet and network are guided CTA states')
    expect(card).toContain("if (!card.walletConnected) return 'Connect Wallet'")
    expect(card).toContain('if (!card.correctChain) return LB_UX.switchNetwork')
  })

  it('keeps the first SSR and client render deterministic before applying the deep link', () => {
    const runtime = load('liquidityRuntime/useLiquidityMintRuntime.tsx')
    expect(runtime).toContain("useState<LiquidityStudioMode>('My Positions')")
    expect(runtime).not.toContain('LIQUIDITY_VIEW_TO_MODE')
    expect(runtime).not.toContain('useState(initialView)')
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
