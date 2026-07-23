import { describe, expect, it } from 'vitest'
import { liquidityStudioLayout, liquidityTypography } from '../liquidityStudioTokens'

describe('R761 liquidityTypography', () => {
  it('defines canonical numeric surfaces aligned with Trade', () => {
    expect(liquidityTypography.fontVariantNumeric).toBe('tabular-nums')
    expect(liquidityTypography.statValue.size).toBe('22px')
    expect(liquidityTypography.lpInfoLabel.size).toBe('12px')
    expect(liquidityTypography.lpInfoValue.size).toBe('14px')
    expect(liquidityTypography.builderAmount.size).toBe('32px')
  })

  it('keeps activity and preview at fixed institutional heights', () => {
    // Sourced from tradeLayout.recentSwapsHeight (Trade-aligned).
    expect(liquidityStudioLayout.activityHeight).toBe('260px')
    expect(liquidityStudioLayout.previewMinHeight).toBe('440px')
    expect(liquidityStudioLayout.builderMinHeight).toBe('440px')
    expect(liquidityStudioLayout.executionStepGap).toBe('10px')
    expect(liquidityStudioLayout.executionButtonGap).toBe('14px')
  })
})
