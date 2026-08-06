/**
 * MELEGASWAP_V2_PROJECT_DISCOVERY_AND_PROJECT_PAGE_V2 — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../..')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_PROJECT_DISCOVERY_AND_PROJECT_PAGE_V2', () => {
  it('Projects directory: featured + dropdown filters + ProjectCard', () => {
    const screen = load('views/ProjectsStudio/ProjectsStudioScreen.tsx')
    const filters = load('views/ProjectsStudio/components/ProjectsFilterRow.tsx')
    const card = load('views/ProjectsStudio/components/ProjectGridCard.tsx')
    expect(screen).toContain('FeaturedProjectsSection')
    expect(filters).toContain('data-projects-filters="dropdowns"')
    expect(filters).toContain('projects-filter-status')
    expect(filters).not.toContain('FILTER_STATUS.map')
    expect(card).toContain('export const ProjectCard')
    expect(card).toContain('Unavailable')
    expect(card).toContain('project-card-spark')
  })

  it('never shows Source not configured in UI reason labels', () => {
    const reasons = load('lib/projects-data/dataReasonCodes.ts')
    const metrics = load('views/ProjectsStudio/projectsRuntime/onChainMetrics.ts')
    expect(reasons).toContain("DATA_SOURCE_NOT_CONFIGURED: 'Unavailable'")
    expect(reasons).toMatch(/holderUnavailableMetric[\s\S]*display: 'Unavailable'/)
    expect(metrics).toContain("holders: 'Unavailable'")
    expect(metrics).not.toMatch(/holders:\s*'Source not configured'/)
  })

  it('project-hq mounts Project Page V3 (V2 retained for regression)', () => {
    const page = load('pages/project-hq/[slug].tsx')
    expect(page).toContain('ProjectPageV3Shell')
    expect(page).not.toContain('ProjectPageV1Shell')
    expect(page).not.toContain("from 'views/ProjectPage/v2/ProjectPageV2Shell'")
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v3/ProjectPageV3Shell.tsx'))).toBe(true)
    expect(existsSync(path.join(WEB, 'views/ProjectPage/v2/ProjectPageV2Shell.tsx'))).toBe(true)
  })

  it('V2 hero has info | swap+chart, market strip, economy, grow, claim', () => {
    const shell = load('views/ProjectPage/v2/ProjectPageV2Shell.tsx')
    expect(shell).toContain('project-v2-hero')
    expect(shell).toContain('ProjectTradingEmbed')
    expect(shell).toContain('ProjectCharts')
    expect(shell).toContain('project-v2-market')
    expect(shell).toContain('Project Economy')
    expect(shell).toContain('Grow Your Project')
    expect(shell).toContain('project-v2-grow-featured')
    expect(shell).toContain('#featured')
    expect(shell).toContain('#trend-boost')
    expect(shell).toContain('Claim Project')
    expect(shell).toContain('intent=claim-project')
    expect(shell).not.toMatch(/views\/Swap\/SmartSwap/)
  })

  it('ships evidence report', () => {
    expect(
      existsSync(
        path.resolve(__dirname, '../../../docs/runtime/project-discovery-project-page-v2/REPORT.md'),
      ),
    ).toBe(true)
  })
})
