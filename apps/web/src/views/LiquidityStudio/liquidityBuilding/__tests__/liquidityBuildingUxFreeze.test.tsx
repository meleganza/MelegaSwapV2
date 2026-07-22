import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  BLOCKED_ACTIVATION_GATES,
  canSubmitMutatingAction,
  setupDraftReadyForReview,
  transitionProgramStatus,
  EMPTY_SETUP_DRAFT,
} from '../programStatus'
import {
  DECISION_FREQUENCY_OPTIONS,
  LB_UX,
  availableManageActions,
  translateActivityReason,
  EMPTY_PROGRAM_METRICS,
} from '../uxCopy'

describe('LB016 Liquidity Building UX freeze', () => {
  it('initial card copy is frozen', () => {
    expect(LB_UX.entryLead).toMatch(/token reserve/i)
    expect(LB_UX.entryLead).toMatch(/protocol-owned liquidity/i)
    expect(LB_UX.startCta).toBe('Set Up Liquidity Building')
    expect(LB_UX.entryTitle).toBe('Build lasting liquidity automatically')
    expect(LB_UX.aiBadge).toBe('AI Powered')
  })

  it('blocked state uses Activation Pending — not infra jargon', () => {
    expect(LB_UX.activationPendingTitle).toBe('Liquidity Building Ready')
    expect(LB_UX.activationPendingBadge).toBe('Activation Pending')
    expect(LB_UX.readinessContracts).toBe('Contracts')
    expect(LB_UX.readinessRuntime).toBe('Runtime')
    expect(LB_UX.activationPendingBody).not.toMatch(/KMS|Treasury|BC003S/i)
    const panel = readFileSync(path.join(__dirname, '../../components/LiquidityBuildingPanel.tsx'), 'utf8')
    expect(panel).toMatch(/lb-blocked-banner/)
    expect(panel).not.toMatch(/\bKMS\b|\bBC003S\b/)
  })

  it('setup flow uses Decision Frequency and Full AI default', () => {
    expect(EMPTY_SETUP_DRAFT.strategy).toBe('FULL_AI')
    expect(DECISION_FREQUENCY_OPTIONS.map((o) => o.label)).toEqual([
      '5 minutes',
      '15 minutes',
      '30 minutes',
      '1 hour',
    ])
    expect(LB_UX.decisionFrequencyLabel).toBe('Decision Frequency')
    expect(LB_UX.strategyFullAiTag).toBe('Recommended')
    expect(LB_UX.strategyRangeTag).toBe('Advanced')
    expect(setupDraftReadyForReview({ ...EMPTY_SETUP_DRAFT, tokenAddress: '0x1', tokenSymbol: 'T', tokenBudget: '10' })).toBe(
      true,
    )
  })

  it('review CTA is Deposit Budget & Activate and stays blocked without gates', () => {
    expect(LB_UX.reviewCta).toBe('Deposit Budget & Activate')
    const gate = canSubmitMutatingAction({
      walletConnected: true,
      correctChain: true,
      gates: BLOCKED_ACTIVATION_GATES,
    })
    expect(gate.ok).toBe(false)
  })

  it('active dashboard shows Unavailable / None yet — never fake zeros as earnings', () => {
    const dash = readFileSync(path.join(__dirname, '../LbActiveDashboardView.tsx'), 'utf8')
    expect(EMPTY_PROGRAM_METRICS.liquidityBuiltLabel).toBeNull()
    expect(EMPTY_PROGRAM_METRICS.budgetRemainingLabel).toBeNull()
    expect(EMPTY_PROGRAM_METRICS.executionCount).toBeNull()
    expect(dash).toMatch(/lb-metric-liquidity/)
    expect(dash).toMatch(/LB_UX\.metricUnavailable/)
    expect(dash).toMatch(/lb-metric-executions/)
    expect(dash).toMatch(/LB_UX\.metricNoneYet/)
    expect(dash).toMatch(/lb-activity-empty/)
    expect(dash).not.toMatch(/APY/)
  })

  it('pause and stop actions map to ACTIVE lifecycle only', () => {
    expect(availableManageActions('ACTIVE')).toContain('PAUSE')
    expect(availableManageActions('ACTIVE')).toContain('STOP')
    expect(availableManageActions('PAUSED')).toContain('RESUME')
    expect(availableManageActions('NOT_ACTIVE')).toEqual([])
    expect(transitionProgramStatus('ACTIVE', 'PAUSE')).toBe('PAUSED')
    expect(transitionProgramStatus('ACTIVE', 'STOP')).toBe('STOPPED')
  })

  it('activity reasons are human-translated', () => {
    expect(translateActivityReason('SAFETY_PROTECTION')).toBe('Safety protection')
    expect(translateActivityReason('INSUFFICIENT_ELIGIBLE_DEMAND')).toBe('Insufficient eligible demand')
    expect(translateActivityReason('KMS_TIMEOUT')).toBe('Conditions not favorable')
  })

  it('panel source has no mock metrics / fake activity / unavailable misleading CTA labels when gated', () => {
    const panel = readFileSync(path.join(__dirname, '../../components/LiquidityBuildingPanel.tsx'), 'utf8')
    expect(panel).toMatch(/data-lb016/)
    expect(panel).toMatch(/Deposit Budget & Activate|Activation Required|LB_UX\.reviewCta|LB_UX\.activationRequired/)
    expect(panel).not.toMatch(/fake APY|simulated earnings|mock activity feed/i)
    expect(panel).toMatch(/Decision Frequency|decisionFrequencyLabel/)
    expect(panel).toMatch(/lb-setup-view/)
    expect(panel).toMatch(/lb-review-view/)
  })

  it('empty / wallet-disconnected paths remain defined in copy', () => {
    expect(LB_UX.walletConnect).toBe('Connect Wallet')
    expect(LB_UX.emptyNoProgram).toBeTruthy()
    expect(LB_UX.switchNetwork).toBe('Switch Network')
  })
})
