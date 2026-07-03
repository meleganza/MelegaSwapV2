import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildProjectHealth } from 'views/ProjectsStudio/projectsRuntime/buildProjectHealth'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'
import type { HeatmapProject } from '../radarStudioData'

const AVAILABLE_SCORE = 90
const UNAVAILABLE_SCORE = 0

function cell(available: boolean): number {
  return available ? AVAILABLE_SCORE : UNAVAILABLE_SCORE
}

export function buildHeatmapRow(project: EnrichedProjectRecord, rank: number): HeatmapProject {
  const sym = project.resources.tokens[0]?.symbol ?? project.displayName
  const health = buildProjectHealth(project)
  const healthByKey = Object.fromEntries(health.map((h) => [h.key, h.tone]))

  const socialAvailable = Boolean(project.socialLinks?.length)
  const auditAvailable =
    project.trustBadges.includes('canonical') || project.verificationStatus === 'observed'
  const contractAvailable = Boolean(project.resources.tokens[0]?.address)
  const githubAvailable = Boolean(
    project.socialLinks?.some((s) => s.type === 'github' || s.url.includes('github.com')),
  )

  return {
    rank,
    name: sym,
    symbol: sym,
    liquidity: cell(project.capabilities.liquidity.status === 'live'),
    volume: UNAVAILABLE_SCORE,
    whales: UNAVAILABLE_SCORE,
    holders: UNAVAILABLE_SCORE,
    developers: cell(githubAvailable),
    community: cell(healthByKey.community === 'green' || socialAvailable),
    momentum: UNAVAILABLE_SCORE,
    social: cell(socialAvailable),
    audit: cell(auditAvailable),
    contract: cell(contractAvailable && healthByKey.contract !== 'red'),
    ownership: UNAVAILABLE_SCORE,
    taxes: UNAVAILABLE_SCORE,
    lpLock: UNAVAILABLE_SCORE,
  }
}

export function buildHeatmapRows(projects: EnrichedProjectRecord[]): HeatmapProject[] {
  return [...projects]
    .sort((a, b) => buildProjectRating(b).score - buildProjectRating(a).score)
    .map((project, index) => buildHeatmapRow(project, index + 1))
}
