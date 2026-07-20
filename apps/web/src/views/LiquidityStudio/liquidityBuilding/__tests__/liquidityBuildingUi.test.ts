import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  BLOCKED_ACTIVATION_GATES,
  EMPTY_SETUP_DRAFT,
  PROGRAM_STATUS_LABEL,
  PROGRAM_STATUSES,
  canSubmitMutatingAction,
  setupDraftReadyForReview,
  transitionProgramStatus,
} from '../programStatus'

describe('LB014 Liquidity Building UI domain', () => {
  it('exposes all required lifecycle status labels', () => {
    const required = [
      'Not Active',
      'Setup Required',
      'Awaiting Approval',
      'Awaiting Deposit',
      'Ready',
      'Active',
      'Paused',
      'Budget Depleted',
      'Stopped',
    ]
    for (const label of required) {
      expect(Object.values(PROGRAM_STATUS_LABEL)).toContain(label)
    }
    expect(PROGRAM_STATUSES).toHaveLength(11)
  })

  it('transitions setup → approve → deposit → ready → active without inventing skips', () => {
    let s = transitionProgramStatus('NOT_ACTIVE', 'START_SETUP')
    expect(s).toBe('SETUP_REQUIRED')
    s = transitionProgramStatus(s, 'REQUEST_APPROVAL')
    expect(s).toBe('AWAITING_APPROVAL')
    s = transitionProgramStatus(s, 'APPROVAL_CONFIRMED')
    expect(s).toBe('AWAITING_DEPOSIT')
    s = transitionProgramStatus(s, 'DEPOSIT_CONFIRMED')
    expect(s).toBe('READY')
    s = transitionProgramStatus(s, 'ACTIVATE')
    expect(s).toBe('ACTIVE')
    s = transitionProgramStatus(s, 'PAUSE')
    expect(s).toBe('PAUSED')
    s = transitionProgramStatus(s, 'RESUME')
    expect(s).toBe('ACTIVE')
    s = transitionProgramStatus(s, 'BUDGET_DEPLETED')
    expect(s).toBe('BUDGET_DEPLETED')
    s = transitionProgramStatus(s, 'STOP')
    expect(s).toBe('STOPPED')
  })

  it('blocks mutating actions when activation gates are closed', () => {
    const gate = canSubmitMutatingAction({
      walletConnected: true,
      correctChain: true,
      gates: BLOCKED_ACTIVATION_GATES,
    })
    expect(gate.ok).toBe(false)
    expect(gate.reason).toBe('DEPLOYMENT_INPUTS_BLOCKED')
  })

  it('requires complete setup draft before review', () => {
    expect(setupDraftReadyForReview(EMPTY_SETUP_DRAFT)).toBe(false)
    expect(
      setupDraftReadyForReview({
        ...EMPTY_SETUP_DRAFT,
        tokenAddress: '0xabc',
        tokenSymbol: 'TKN',
        tokenBudget: '1000',
        strategy: 'FULL_AI',
        epochSeconds: 300,
      }),
    ).toBe(true)
  })

  it('Liquidity Studio mounts Liquidity Building panel (no placeholder CTA)', () => {
    const screen = readFileSync(path.join(__dirname, '../../LiquidityStudioScreen.tsx'), 'utf8')
    expect(screen).toMatch(/LiquidityBuildingPanel/)
    expect(screen).not.toMatch(/Coming soon/i)

    const panel = readFileSync(path.join(__dirname, '../../components/LiquidityBuildingPanel.tsx'), 'utf8')
    expect(panel).toMatch(/Start Building Liquidity/)
    expect(panel).toMatch(/data-liquidity-building-panel/)
    expect(panel).not.toMatch(/fake metrics|mock activity|simulated liquidity/i)
    expect(panel).toMatch(/No simulated balances/)
  })
})
