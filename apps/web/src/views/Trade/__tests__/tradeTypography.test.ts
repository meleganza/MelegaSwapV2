import { describe, expect, it } from 'vitest'
import { tradeLayout, tradeTypography } from '../tradeTokens'

describe('R759 tradeTypography', () => {
  it('defines canonical numeric surfaces', () => {
    expect(tradeTypography.fontVariantNumeric).toBe('tabular-nums')
    expect(tradeTypography.statValue.size).toBe('22px')
    expect(tradeTypography.heroPrice.size).toBe('34px')
    expect(tradeTypography.tableCell.size).toBe('13px')
  })

  it('keeps chart and swaps at fixed institutional heights', () => {
    expect(tradeLayout.chartAreaHeight).toBe('255px')
    expect(tradeLayout.tradeTerminalRecentSwapsHeight).toBe('304px')
    expect(tradeLayout.swapRowHeight).toBe('42px')
    expect(tradeLayout.swapTableHeadHeight).toBe('32px')
    expect(tradeLayout.statCardMinHeight).toBe('108px')
  })
})
