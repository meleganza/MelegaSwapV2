import { describe, expect, it } from 'vitest'
import { decideLiquidityBuilding, candidateGrossQuoteTarget } from '../index'

const base = {
  program: '0xProg',
  epochId: '1',
  observationReference: '0xobs',
  eligibleNetBuyFlow: '1000000000000000000',
  anchorProjectReserve: '1000000000000000000000',
  anchorQuoteReserve: '1000000000000000000000',
  remainingBudget: '1000000000000000000000',
  epochAlreadyExecuted: false,
  selectedRateBps: 2500,
}

describe('LB009 decision engine', () => {
  it('11. Full AI within ceiling', () => {
    const d = decideLiquidityBuilding({ ...base, strategyMode: 'FullAi', selectedRateBps: 2500 })
    expect(d.decision).toBe('EXECUTE')
    expect(d.selectedRateBps).toBe(2500)
    expect(d.grossQuoteTarget).toBe(candidateGrossQuoteTarget(base.eligibleNetBuyFlow, 2500))
  })

  it('12. Full AI above ceiling clamps to 5000', () => {
    const d = decideLiquidityBuilding({ ...base, strategyMode: 'FullAi', selectedRateBps: 9000 })
    expect(d.decision).toBe('EXECUTE')
    expect(d.selectedRateBps).toBe(5000)
  })

  it('13. Dynamic range minimum', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'DynamicRange',
      ownerMinimumRateBps: 1000,
      ownerMaximumRateBps: 3000,
      selectedRateBps: 1000,
    })
    expect(d.decision).toBe('EXECUTE')
    expect(d.selectedRateBps).toBe(1000)
  })

  it('14. Dynamic range maximum', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'DynamicRange',
      ownerMinimumRateBps: 1000,
      ownerMaximumRateBps: 3000,
      selectedRateBps: 3000,
    })
    expect(d.decision).toBe('EXECUTE')
  })

  it('15. Dynamic range violation', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'DynamicRange',
      ownerMinimumRateBps: 1000,
      ownerMaximumRateBps: 3000,
      selectedRateBps: 4000,
    })
    expect(d.decision).toBe('SKIP')
    expect(d.reasonCode).toBe('DYNAMIC_RANGE_VIOLATION')
  })

  it('16. insufficient flow', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'FullAi',
      eligibleNetBuyFlow: '0',
    })
    expect(d.decision).toBe('WAIT')
    expect(d.reasonCode).toBe('ELIGIBLE_FLOW_ZERO')
  })

  it('17. insufficient liquidity / zero reserves', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'FullAi',
      anchorQuoteReserve: '0',
    })
    expect(d.decision).toBe('SKIP')
    expect(d.reasonCode).toBe('ZERO_RESERVES')
  })

  it('18. budget cap', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'FullAi',
      remainingBudget: '0',
    })
    expect(d.decision).toBe('SKIP')
    expect(d.reasonCode).toBe('BUDGET_EXHAUSTED')
  })

  it('19. impact rejection', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'FullAi',
      selectedRateBps: 5000,
      eligibleNetBuyFlow: '100000000000000000000',
      anchorQuoteReserve: '1000000000000000000',
      hardCurveImpactBps: 100,
    })
    expect(d.decision).toBe('SKIP')
    expect(d.reasonCode).toBe('HARD_IMPACT_EXCEEDED')
  })

  it('20. skip decision epoch already executed', () => {
    const d = decideLiquidityBuilding({
      ...base,
      strategyMode: 'FullAi',
      epochAlreadyExecuted: true,
    })
    expect(d.decision).toBe('SKIP')
    expect(d.reasonCode).toBe('EPOCH_ALREADY_EXECUTED')
  })
})
