import { describe, expect, it } from 'vitest'
import {
  emptyProgramSnapshot,
  lifecycleToProgramStatus,
  mapProgramViewToMetrics,
  snapshotFromProgramView,
  OnChainLifecycle,
} from '../mapProgramView'
import { activityFromLatestExecution, mapActivityEvents } from '../mapActivityEvents'
import { isDeployedAddress, LB_DEPLOYED_ADDRESSES, ZERO_ADDRESS } from '../addresses'
import { canSubmitMutatingAction, BLOCKED_ACTIVATION_GATES } from '../programStatus'
import { LB_UX } from '../uxCopy'

describe('LB017 live data wiring', () => {
  it('maps ProgramView to metrics without inventing liquidity', () => {
    const empty = mapProgramViewToMetrics(null)
    expect(empty.liquidityBuiltLabel).toBeNull()
    expect(empty.executionCount).toBeNull()

    const zeroExec = mapProgramViewToMetrics({
      remainingBudget: '1000',
      tokensMatched: '0',
      totalQuoteAdded: '0',
      totalLpMinted: '0',
      executionCount: 0,
    })
    expect(zeroExec.budgetRemainingLabel).toBe('1000')
    expect(zeroExec.liquidityBuiltLabel).toBeNull()
    expect(zeroExec.lpPositionLabel).toBeNull()
    expect(zeroExec.executionCount).toBe(0)

    const live = mapProgramViewToMetrics({
      remainingBudget: '500',
      tokensMatched: '10',
      totalQuoteAdded: '2',
      totalLpMinted: '3',
      executionCount: 2,
    })
    expect(live.liquidityBuiltLabel).toMatch(/Matched 10/)
    expect(live.executionCount).toBe(2)
    expect(live.lpPositionLabel).toBe('3 LP')
  })

  it('maps lifecycle to program status', () => {
    expect(lifecycleToProgramStatus(OnChainLifecycle.Active)).toBe('ACTIVE')
    expect(lifecycleToProgramStatus(OnChainLifecycle.Paused)).toBe('PAUSED')
    expect(lifecycleToProgramStatus(OnChainLifecycle.Stopped)).toBe('STOPPED')
    expect(lifecycleToProgramStatus(null)).toBeNull()
  })

  it('snapshot is unavailable when no program', () => {
    expect(emptyProgramSnapshot().available).toBe(false)
    expect(emptyProgramSnapshot().metrics.liquidityBuiltLabel).toBeNull()
  })

  it('snapshotFromProgramView is on-chain only', () => {
    const snap = snapshotFromProgramView('0xabc', {
      lifecycle: OnChainLifecycle.Active,
      owner: '0xowner',
      remainingBudget: '9',
      executionCount: 0,
      tokensMatched: '0',
      totalQuoteAdded: '0',
      totalLpMinted: '0',
    })
    expect(snap.available).toBe(true)
    expect(snap.status).toBe('ACTIVE')
    expect(snap.metrics.executionCount).toBe(0)
    expect(snap.metrics.liquidityBuiltLabel).toBeNull()
  })

  it('activity mapping dedupes and translates events', () => {
    const items = mapActivityEvents([
      { id: '1', type: 'ExecutionCompleted', projectTokenSold: '1', grossQuoteAcquired: '2', quoteAssetAdded: '3' },
      { id: '1', type: 'ExecutionCompleted', projectTokenSold: '9', grossQuoteAcquired: '9', quoteAssetAdded: '9' },
      { id: '2', type: 'ExecutionSkipped', skipReason: 'SAFETY_PROTECTION' },
      { id: '3', type: 'Waiting', skipReason: 'WAIT' },
      { id: '4', type: 'ProgramPaused' },
    ])
    expect(items).toHaveLength(4)
    expect(items[0].title).toBe('Liquidity built from market demand')
    expect(items[1].reason).toBe('Safety protection')
    expect(items[2].kind).toBe('WAITING')
    expect(items[3].title).toBe('Program paused')
  })

  it('latest execution activity empty when zero executions', () => {
    expect(
      activityFromLatestExecution({
        executionCount: 0,
        latest: { executionId: '0x1' },
      }),
    ).toEqual([])
    expect(
      activityFromLatestExecution({
        executionCount: 1,
        latest: {
          executionId: '0xdead',
          projectTokenSold: '5',
          grossQuoteAcquired: '6',
          quoteAssetAdded: '7',
        },
      }),
    ).toHaveLength(1)
  })

  it('deployed addresses remain null — no placeholders', () => {
    expect(LB_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
    expect(LB_DEPLOYED_ADDRESSES.programAddress).toBeNull()
    expect(isDeployedAddress(null)).toBe(false)
    expect(isDeployedAddress(ZERO_ADDRESS)).toBe(false)
    expect(isDeployedAddress('0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C')).toBe(true)
  })

  it('activation cannot bypass closed gates', () => {
    expect(
      canSubmitMutatingAction({
        walletConnected: true,
        correctChain: true,
        gates: BLOCKED_ACTIVATION_GATES,
      }).ok,
    ).toBe(false)
  })

  it('empty activity copy is honest', () => {
    expect(LB_UX.emptyNoProgram).toBe('No liquidity executions yet.')
    expect(LB_UX.programUnavailable).toMatch(/unavailable until Liquidity Building contracts are deployed/i)
  })
})
