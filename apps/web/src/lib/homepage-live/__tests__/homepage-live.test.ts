import { describe, expect, it } from 'vitest'
import { resolveHomepageLiveSections } from '../resolve-homepage-live'

describe('homepage live sections', () => {
  it('returns indexed projects and assets without fabricated metrics', () => {
    const sections = resolveHomepageLiveSections()
    expect(sections.trendingProjects.length).toBeGreaterThan(0)
    expect(sections.trendingAssets.length).toBeGreaterThan(0)
    sections.trendingProjects.forEach((item) => {
      expect(item.href).toMatch(/^\/projects\//)
      expect(item.label.length).toBeGreaterThan(0)
    })
  })

  it('uses venue registry for farms and pools without APR fields', () => {
    const sections = resolveHomepageLiveSections()
    sections.topFarms.forEach((item) => {
      expect(item.meta).not.toMatch(/APR/i)
      expect(item.href).toBe('/farms')
    })
    sections.topPools.forEach((item) => {
      expect(item.meta).not.toMatch(/APR/i)
      expect(item.href).toBe('/pools')
    })
  })
})
