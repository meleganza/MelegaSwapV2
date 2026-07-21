import { describe, expect, it } from 'vitest'
import { homeTypography, homeTradeLayout } from '../homeTradeTokens'
import { tradeTypography } from 'views/Trade/tradeTokens'

describe('R760 homeTypography', () => {
  it('mirrors Trade numeric surfaces', () => {
    expect(homeTypography.fontVariantNumeric).toBe(tradeTypography.fontVariantNumeric)
    expect(homeTypography.statValue.size).toBe(tradeTypography.statValue.size)
    expect(homeTypography.heroSubtitleMaxWidth).toBe('720px')
  })

  it('uses fixed live activity height aligned with Trade swaps', () => {
    expect(homeTradeLayout.liveActivityHeight).toBe('260px')
    expect(homeTradeLayout.activityRowHeight).toBe('52px')
    expect(homeTradeLayout.sectionGap).toBe('28px')
  })
})
