import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildOpportunityScore } from 'views/RadarStudio/radarRuntime/buildOpportunityScore'
import { buildMarketSources, countAvailableSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'

export interface InfrastructureScore {
  score: number
  confidence: number
  reason: string
}

export function buildInfrastructureScore(project: EnrichedProjectRecord): InfrastructureScore {
  const rating = buildProjectRating(project)
  const radar = buildOpportunityScore(project)
  const sources = buildMarketSources(project, project.asOf)
  const sourcePts = Math.min(15, countAvailableSources(sources) * 2)

  let capabilityPts = 0
  if (project.capabilities.liquidity.status === 'live') capabilityPts += 8
  if (project.capabilities.pool.status === 'live') capabilityPts += 10
  if (project.capabilities.farm.status === 'live') capabilityPts += 10
  if (project.capabilities.machineManifest.status === 'live') capabilityPts += 6
  if (project.capabilities.radar.status === 'live') capabilityPts += 5
  else if (project.capabilities.radar.status === 'partial') capabilityPts += 2

  const score = Math.round(Math.min(100, rating.score * 0.45 + radar.score * 0.25 + capabilityPts + sourcePts))
  const confidence = Math.round((rating.confidence + radar.confidence) / 2)

  return {
    score,
    confidence,
    reason: `Infrastructure readiness from registry capabilities, Projects rating, and Radar opportunity signals. External market feeds may be unavailable.`,
  }
}
