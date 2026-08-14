/**
 * Project discovery + project page restructure — unit contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  FILTER_CHAINS,
  FILTER_STATUS,
  PROJECT_FILTER_CHIPS,
} from 'views/ProjectsStudio/projectsStudioData'
import { CLAIM_PROJECT_HREF } from 'views/ProjectsStudio/components/ProjectsStudioPageHeader'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('project discovery and project page restructure', () => {
  it('Home Trending Projects CTA routes to /projects', () => {
    const src = load('views/HomeTrade/DexHomeScreen.tsx')
    expect(src).toMatch(/\/projects\?sort=trending/)
    expect(src).not.toMatch(/router\.push\('\/trending'\)/)
  })

  it('next.config soft-redirects /trending into Projects ranking', () => {
    const cfg = load('../next.config.mjs')
    expect(cfg).toMatch(/source:\s*'\/trending'/)
    expect(cfg).toMatch(/destination:\s*'\/projects\?sort=trending'/)
    expect(cfg).not.toMatch(/destination:\s*'\/\?focus=projects'/)
  })

  it('Projects directory uses compact multi-column cards with chain badge actions', () => {
    const card = load('views/ProjectsStudio/components/ProjectGridCard.tsx')
    const grid = load('views/ProjectsStudio/components/ProjectsGrid.tsx')
    expect(card).toContain('MelegaExploreChainBadge')
    expect(card).toContain('View Project')
    expect(card).toContain('Trade')
    expect(card).toContain('Featured')
    expect(grid).toMatch(/repeat\(4/)
  })

  it('exposes search + chain/status filters including Arbitrum and Avalanche', () => {
    expect([...FILTER_CHAINS]).toEqual(
      expect.arrayContaining(['BSC', 'Base', 'Polygon', 'Ethereum', 'Arbitrum', 'Avalanche']),
    )
    expect([...FILTER_STATUS]).toEqual(
      expect.arrayContaining(['Featured', 'Boosted', 'Verified', 'New']),
    )
    expect([...PROJECT_FILTER_CHIPS]).toContain('Trending')
    expect([...FILTER_STATUS]).not.toContain('Trending')
    const filters = load('views/ProjectsStudio/components/ProjectsFilterRow.tsx')
    expect(filters).toContain('projects-directory-search')
  })

  it('ships Claim Project CTA and /project/{slug} alias page', () => {
    expect(CLAIM_PROJECT_HREF).toContain('intent=claim-project')
    expect(existsSync(path.join(ROOT, 'pages/project/[slug].tsx'))).toBe(true)
    const alias = load('pages/project/[slug].tsx')
    expect(alias).toContain('canonicalProjectPath')
    expect(alias).toContain('resolveProjectByContractAddress')
    expect(alias).toContain('Claim Project')
  })

  it('Project Page hero exposes Buy · Add Wallet · Trade · Farm · Pool · Liquidity · Claim', () => {
    const shell = load('views/ProjectPage/v1/ProjectPageV1Shell.tsx')
    expect(shell).toContain('project-v1-buy')
    expect(shell).toContain('project-v1-add-wallet-secondary')
    expect(shell).toContain('project-v1-trade')
    expect(shell).toContain('project-v1-next-farm')
    expect(shell).toContain('project-v1-next-pool')
    expect(shell).toContain('project-v1-liquidity')
    expect(shell).toContain('project-v1-claim')
    expect(shell).toContain('MelegaExploreChainBadge')
    expect(shell).toMatch(/const github = document\.resources\.find/)
  })
})
