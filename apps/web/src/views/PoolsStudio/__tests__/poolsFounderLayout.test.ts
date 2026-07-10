import { describe, expect, it } from 'vitest'
import { poolsFeaturedHero, poolsStudioLayout } from '../poolsStudioTokens'

describe('R762 pools founder layout', () => {
  it('matches Farms mobile hero rhythm', () => {
    expect(poolsStudioLayout.mobileContentPaddingTop).toBe('16px')
  })

  it('aligns reward advisor with featured hero height', () => {
    expect(poolsFeaturedHero.height).toBe('300px')
    expect(poolsStudioLayout.sidebarAdvisorHeight).toBe('220px')
  })

  it('uses fluid pool grid columns', () => {
    expect(poolsStudioLayout.poolCardWidth).toBe('312px')
    expect(poolsStudioLayout.explorerMaxWidth).toBe('940px')
  })
})
