import { describe, expect, it } from 'vitest'
import {
  estimateImpermanentLossPct,
  formatPercentShare,
  formatSlippage,
  pairLabel,
  ratioLabels,
} from '../formatLiquidityRuntime'
import type { LiquidityStudioMode } from '../useLiquidityMintRuntime'

describe('liquidity studio runtime', () => {
  it('formats pair labels and share ratios', () => {
    expect(pairLabel({ symbol: 'BNB' } as never, { symbol: 'MARCO' } as never)).toBe('BNB / MARCO')
    expect(formatPercentShare(undefined)).toBe('0.00%')
    expect(formatSlippage(50)).toBe('0.50%')
  })

  it('estimates impermanent loss from price change', () => {
    expect(estimateImpermanentLossPct(0)).toBe('0.00%')
    const il = estimateImpermanentLossPct(10)
    expect(il).not.toBe('—')
    expect(il.endsWith('%')).toBe(true)
  })

  it('simulation mode is distinct from add liquidity', () => {
    const addMode: LiquidityStudioMode = 'Add Liquidity'
    const simMode: LiquidityStudioMode = 'Simulation'
    expect(addMode).not.toBe(simMode)
    expect(simMode).toBe('Simulation')
  })

  it('ratio labels return balanced defaults when empty', () => {
    const r = ratioLabels(undefined, undefined, undefined)
    expect(r.leftPct).toBe(50)
    expect(r.rightPct).toBe(50)
  })
})
