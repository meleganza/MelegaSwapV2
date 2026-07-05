import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildAiRecommendations } from 'views/ProjectsStudio/projectsRuntime/buildAiRecommendations'
import { buildMarketSources, countAvailableSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import { buildProjectHealth } from 'views/ProjectsStudio/projectsRuntime/buildProjectHealth'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'

export interface RadarOpportunityScore {
  score: number
  recommendation: string
  confidence: number
  reasons: string[]
  summary: string
}

export function buildOpportunityScore(project: EnrichedProjectRecord): RadarOpportunityScore {
  const rating = buildProjectRating(project)
  const health = buildProjectHealth(project)
  const sources = buildMarketSources(project, project.asOf)
  const onChain = buildOnChainMetrics(project)
  const recommendations = buildAiRecommendations(project)

  const greens = health.filter((h) => h.tone === 'green').length
  const sourceCount = countAvailableSources(sources)

  const reasons: string[] = []
  if (project.capabilities.liquidity.status === 'live') reasons.push('Liquidity surface live on Melega')
  if (project.websiteUrl) reasons.push('Official website indexed')
  if (project.docsUrl) reasons.push('Documentation present in registry')
  if (project.trustBadges.includes('canonical')) reasons.push('Canonical registry verification')
  if (onChain.contractVerification !== '—' && onChain.contractVerification !== 'Unavailable') {
    reasons.push(`Contract status: ${onChain.contractVerification}`)
  }
  if (sourceCount > 0) reasons.push(`${sourceCount} intelligence source(s) available`)

  const liquidityUnavailable = onChain.liquidity === '—' || onChain.liquidity === 'Unavailable'
  const volumeUnavailable = onChain.volume === '—' || onChain.volume === 'Unavailable'
  let adjusted = rating.score
  if (liquidityUnavailable && volumeUnavailable) adjusted = Math.max(35, adjusted - 8)
  adjusted = Math.min(100, Math.max(0, adjusted + Math.min(6, greens)))

  const primaryRec = recommendations[0]?.text ?? 'Continue monitoring registry signals'

  return {
    score: Math.round(adjusted),
    recommendation: primaryRec.split('—')[0].trim(),
    confidence: rating.confidence,
    reasons: reasons.length ? reasons.slice(0, 5) : ['Registry baseline only — external market feeds unavailable'],
    summary: `Rule-based opportunity score from registry health, verification, and source availability. Liquidity and volume metrics not estimated.`,
  }
}
