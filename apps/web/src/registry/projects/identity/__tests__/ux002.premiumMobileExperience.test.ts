/**
 * UX002 — Premium Project Page experience (Zero Rebuild V1).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.join(__dirname, '../../../../')
const V1 = path.join(ROOT, 'views/ProjectPage/v1')
const IDENTITY = path.join(ROOT, 'registry/projects/identity')

describe('UX002 premium Project Page V1 IA', () => {
  it('is one dense long page without sticky tab navigation', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    const trading = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')
    expect(shell).toContain('data-project-nav="none"')
    expect(shell).toContain('data-project-rebuild="zero-rebuild-v1"')
    expect(shell).not.toContain('ProjectStickyNav')
    expect(shell).toContain('data-project-section="identity-hero"')
    expect(shell).toContain('data-project-section="live-market"')
    expect(trading).toContain('data-project-section="trading"')
    expect(shell).toContain('data-project-section="featured-promotion"')
  })

  it('section order places in-hero Smart Swap, then market, chart, project', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    const heroIdx = shell.indexOf('data-project-section="identity-hero"')
    const tradingCompIdx = shell.indexOf('<ProjectTradingEmbed')
    const marketIdx = shell.indexOf('data-project-section="live-market"')
    const chartsCompIdx = shell.indexOf('<ProjectCharts')
    const projectIdx = shell.indexOf('data-project-section="project"')
    const featuredIdx = shell.indexOf('data-project-section="featured-promotion"')
    expect(heroIdx).toBeGreaterThan(-1)
    expect(tradingCompIdx).toBeGreaterThan(heroIdx)
    expect(marketIdx).toBeGreaterThan(tradingCompIdx)
    expect(chartsCompIdx).toBeGreaterThan(marketIdx)
    expect(projectIdx).toBeGreaterThan(chartsCompIdx)
    expect(featuredIdx).toBeGreaterThan(projectIdx)
  })

  it('hero includes Buy/Trade CTAs and contract copy', () => {
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).toContain('project-v1-buy')
    expect(shell).toContain('project-v1-trade')
    expect(shell).toContain('project-v1-copy-contract')
    expect(shell).not.toContain('Owner access')
  })

  it('trading embed reuses SmartSwapForm', () => {
    const buy = readFileSync(path.join(V1, 'ProjectTradingEmbed.tsx'), 'utf8')
    const island = readFileSync(path.join(V1, 'ProjectSwapFormIsland.tsx'), 'utf8')
    expect(buy).toContain('ProjectSwapFormIsland')
    expect(island).toContain('SmartSwapForm')
    expect(island).toContain('views/Swap/SmartSwap')
  })

  it('theme is dense with reduced empty space', () => {
    const theme = readFileSync(path.join(V1, 'theme.ts'), 'utf8')
    expect(theme).toContain('max-width: 1180px')
    expect(theme).toContain('margin: 0 0 10px')
    expect(theme).toContain('grid-template-columns')
  })

  it('no registry schema or builder edits required for shell', () => {
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
    const shell = readFileSync(path.join(V1, 'ProjectPageV1Shell.tsx'), 'utf8')
    expect(shell).not.toContain('buildProjectTokenomicsDocument')
    expect(shell).not.toContain('buildProjectRoadmapDocument')
  })
})
