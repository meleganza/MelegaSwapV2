/**
 * Founder amendment P0-2 — Featured Trade must navigate to the project page swap
 * embed (never keep the shopper on Home), and ineligible catalog entries must never
 * be offered for rotation. ProjectTradingEmbed must prefer the URL query pair.
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

describe('Founder amendment P0-2 — Featured Trade routing', () => {
  it('FeaturedProjectsRail Trade pushes to project-hq swap embed, never a Home-only swap', () => {
    const src = load('FeaturedProjectsRail.tsx')
    expect(src).toContain("`inputCurrency=BNB&outputCurrency=${p.address}&focus=swap&source=featured-home`")
    // Filesystem route for reliable client mount; pretty /@slug kept as `as`.
    expect(src).toContain('`/project-hq/${p.slug}?${q}`')
    expect(src).toContain("router.push(href, as)")
    expect(src).not.toContain('router.push(`${p.href}?${q}`)')
    // Trade must be disabled until a real project identity (address + slug) resolves.
    expect(src).toContain('disabled={!p.address || !p.slug}')
    // View Project uses filesystem route (rewrite-only /@ soft-nav leaves Home mounted).
    // Do NOT pass styled-components `as={p.href}` — that treats `/@slug` as a DOM tag and crashes Home.
    expect(src).toContain('href={`/project-hq/${p.slug}`}')
    expect(src).not.toMatch(/ViewLink[^>]*\sas=\{p\.href\}/)
  })

  it('featuredProjectsCatalog marks entries without a canonical project identity ineligible for rotation', () => {
    const unfiltered = resolveFounderFeaturedProjectsUnfiltered()
    const filtered = resolveFounderFeaturedProjects()
    expect(filtered.length).toBeLessThanOrEqual(unfiltered.length)
    for (const p of filtered) {
      expect(p.eligibleForRotation).toBe(true)
      expect(p.href).toMatch(/^\/@/)
    }
    // A slug with no registry/token-list identity resolves but is excluded from rotation.
    const bogus = resolveFeaturedProject('not-a-real-slug' as (typeof FOUNDER_FEATURED_SLUGS)[number])
    expect(bogus.eligibleForRotation).toBe(false)
    expect(resolveFounderFeaturedProjects()).not.toContainEqual(expect.objectContaining({ slug: 'not-a-real-slug' }))
  })

  it('ProjectTradingEmbed prefers URL query inputCurrency/outputCurrency over the project default pair', () => {
    const src = load('../ProjectPage/v1/ProjectTradingEmbed.tsx')
    expect(src).toContain('queryPair ?? defaultPair')
    expect(src).toContain("router.query.inputCurrency === 'string'")
    expect(src).toContain("router.query.outputCurrency === 'string'")
    // focus=swap scrolls/focuses the embedded swap instead of leaving it to be found manually.
    expect(src).toContain("router.query.focus === 'swap'")
    expect(src).toContain('scrollIntoView')
    expect(src).toContain('.focus(')
    // source=featured-home is threaded through for observability, not gated/blocked.
    expect(src).toContain("router.query.source === 'string'")
    expect(src).toContain('data-trade-source={tradeSource}')
  })
})
