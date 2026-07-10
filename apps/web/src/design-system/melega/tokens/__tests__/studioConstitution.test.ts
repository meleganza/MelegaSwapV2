import { describe, expect, it } from 'vitest'
import { premiumStudioLayout } from '../premiumStudio'
import {
  STUDIO_PAGE_TITLES,
  studioConstitutionLayout,
} from '../studioConstitution'

describe('R758 studioConstitution', () => {
  it('extends premium rhythm without drift', () => {
    expect(studioConstitutionLayout.sectionGap).toBe(premiumStudioLayout.sectionGap)
    expect(studioConstitutionLayout.cardRadius).toBe(premiumStudioLayout.cardRadius)
    expect(studioConstitutionLayout.kpiHeight).toBe(premiumStudioLayout.kpiHeight)
    expect(studioConstitutionLayout.heroMarginBottom).toBe(premiumStudioLayout.sectionGap)
  })

  it('uses Title Case studio names — never ALL CAPS', () => {
    const titles = Object.values(STUDIO_PAGE_TITLES)
    expect(titles).toHaveLength(8)
    for (const title of titles) {
      expect(title).not.toMatch(/^[A-Z\s]+$/)
      expect(title[0]).toBe(title[0].toUpperCase())
    }
    expect(STUDIO_PAGE_TITLES.pools).toBe('Pools')
    expect(STUDIO_PAGE_TITLES.radar).toBe('DEX Intelligence')
    expect(STUDIO_PAGE_TITLES.identityHub).toBe('Identity Hub')
    expect(STUDIO_PAGE_TITLES.liquidity).toBe('Liquidity Studio')
    expect(STUDIO_PAGE_TITLES.build).toBe('Build Studio')
  })
})
