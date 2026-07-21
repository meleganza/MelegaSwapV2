/**
 * UX002 — Premium mobile Project Page consumer experience.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.join(__dirname, '../../../../')
const CONSUMER = path.join(ROOT, 'views/ProjectPage/consumer')
const IDENTITY = path.join(ROOT, 'registry/projects/identity')

describe('UX002 premium mobile consumer IA', () => {
  it('sticky nav includes Buy, Community, and Security renamed in trust section', () => {
    const nav = readFileSync(path.join(CONSUMER, 'ProjectStickyNav.tsx'), 'utf8')
    expect(nav).toContain("'buy'")
    expect(nav).toContain("'community'")
    expect(nav).toContain("'about'")
    expect(nav).not.toContain("'swap'")
    expect(nav).toMatch(/Overview|Chart|Buy|About|Community|Tokenomics|Roadmap|Earn|More/)
    expect(nav).toContain('44px')

    const trust = readFileSync(path.join(CONSUMER, 'ProjectTransparencySummary.tsx'), 'utf8')
    expect(trust).toContain('Security & Transparency')
    expect(trust).toContain('View technical report')
    expect(trust).not.toContain('View technical transparency report')
  })

  it('shell order places Community after About and Buy before About', () => {
    const shell = readFileSync(path.join(CONSUMER, 'ProjectConsumerShell.tsx'), 'utf8')
    const aboutIdx = shell.indexOf('id="about"')
    const communityIdx = shell.indexOf('id="community"')
    const buyIdx = shell.indexOf('id="buy"')
    const chartIdx = shell.indexOf('id="chart"')
    const trustIdx = shell.indexOf('id="trust"')
    const earnIdx = shell.indexOf('id="earn"')

    expect(chartIdx).toBeGreaterThan(-1)
    expect(buyIdx).toBeGreaterThan(chartIdx)
    expect(aboutIdx).toBeGreaterThan(buyIdx)
    expect(communityIdx).toBeGreaterThan(aboutIdx)
    expect(earnIdx).toBeGreaterThan(communityIdx)
    expect(trustIdx).toBeGreaterThan(earnIdx)
    expect(shell).not.toContain('ProjectMarketSnapshot')
    expect(shell).not.toContain('ProjectUtilitiesSection')
  })

  it('hero promotes Buy MARCO and removes dense social row', () => {
    const hero = readFileSync(path.join(CONSUMER, 'ProjectHero.tsx'), 'utf8')
    expect(hero).toContain('getBuyCtaLabel')
    expect(hero).toContain('#buy')
    expect(hero).toContain('92px')
    expect(hero).not.toContain('SocialRow')
    expect(hero).not.toContain('SocialLink')

    const helpers = readFileSync(path.join(CONSUMER, 'helpers.ts'), 'utf8')
    expect(helpers).toContain("'Buy MARCO'")
  })

  it('buy card rebrand and microcopy', () => {
    const buy = readFileSync(path.join(CONSUMER, 'ProjectSwapCard.tsx'), 'utf8')
    expect(buy).toContain('getBuySectionTitle')
    expect(buy).toContain('Buy with BNB on')
    expect(buy).toContain('SmartSwapForm')
    expect(buy).not.toMatch(/>\s*Swap\s*</)

    const helpers = readFileSync(path.join(CONSUMER, 'helpers.ts'), 'utf8')
    expect(helpers).toContain("'Buy MARCO'")
  })

  it('tokenomics shows Publishing soon for unpublished states', () => {
    const tok = readFileSync(path.join(CONSUMER, 'ProjectTokenomicsSection.tsx'), 'utf8')
    expect(tok).toContain('Publishing soon')
    expect(tok).not.toMatch(/Tokenomics data is unavailable/i)
  })

  it('theme spacing and motion respect reduced motion', () => {
    const theme = readFileSync(path.join(CONSUMER, 'theme.ts'), 'utf8')
    expect(theme).toContain('17px')
    expect(theme).toContain('1.55')
    expect(theme).toContain('38px')
    expect(theme).toContain('prefers-reduced-motion')
    expect(theme).toContain('fadeInUp')
  })

  it('no registry schema or builder edits in identity layer', () => {
    const schemaPaths = [
      'tokenomics/schema.ts',
      'roadmap/schema.ts',
      'tokenomics/buildProjectTokenomicsDocument.ts',
      'roadmap/buildProjectRoadmapDocument.ts',
    ]
    for (const rel of schemaPaths) {
      const full = path.join(IDENTITY, rel)
      expect(() => readFileSync(full, 'utf8')).not.toThrow()
    }
    const shell = readFileSync(path.join(CONSUMER, 'ProjectConsumerShell.tsx'), 'utf8')
    expect(shell).not.toContain('buildProjectTokenomicsDocument')
    expect(shell).not.toContain('buildProjectRoadmapDocument')
  })
})
