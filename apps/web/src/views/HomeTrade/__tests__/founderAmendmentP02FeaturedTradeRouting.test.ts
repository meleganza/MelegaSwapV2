/**
 * Founder Review P0 — Featured Trade lands on the real Swap shell.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  FOUNDER_FEATURED_SLUGS,
  resolveFeaturedProject,
  resolveFounderFeaturedProjects,
  resolveFounderFeaturedProjectsUnfiltered,
} from '../featuredProjectsCatalog'

const ROOT = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Founder Review P0 — Featured Trade → /swap', () => {
  it('FeaturedProjectsRail Trade pushes to /swap with currencies', () => {
    const src = load('FeaturedProjectsRail.tsx')
    expect(src).toContain("inputCurrency: 'BNB'")
    expect(src).toContain('outputCurrency: p.address')
    expect(src).toContain('`/swap?${q.toString()}`')
    expect(src).not.toContain('/project-hq/${p.slug}?${q}')
    expect(src).not.toContain('/?focus=swap')
    expect(src).toContain('href={`/project-hq/${p.slug}`}')
  })

  it('featuredProjectsCatalog marks entries without a canonical project identity ineligible for rotation', () => {
    const unfiltered = resolveFounderFeaturedProjectsUnfiltered()
    const filtered = resolveFounderFeaturedProjects()
    expect(filtered.length).toBeLessThanOrEqual(unfiltered.length)
    for (const p of filtered) {
      expect(p.eligibleForRotation).toBe(true)
      expect(p.href).toMatch(/^\/@/)
    }
    const bogus = resolveFeaturedProject('not-a-real-slug' as (typeof FOUNDER_FEATURED_SLUGS)[number])
    expect(bogus.eligibleForRotation).toBe(false)
    expect(resolveFounderFeaturedProjects()).not.toContainEqual(expect.objectContaining({ slug: 'not-a-real-slug' }))
  })

  it('ProjectTradingEmbed still prefers URL query pair when present', () => {
    const src = load('../ProjectPage/v1/ProjectTradingEmbed.tsx')
    expect(src).toContain('queryPair ?? defaultPair')
    expect(src).toContain("router.query.inputCurrency === 'string'")
    expect(src).toContain("router.query.outputCurrency === 'string'")
  })
})
