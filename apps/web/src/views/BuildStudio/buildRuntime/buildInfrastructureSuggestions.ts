import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildAiRecommendations } from 'views/ProjectsStudio/projectsRuntime/buildAiRecommendations'

export interface InfrastructureSuggestion {
  id: string
  title: string
  estimatedImpact: string
  estimatedCompletion: string
  dependencies: string
}

export function buildInfrastructureSuggestions(project: EnrichedProjectRecord): InfrastructureSuggestion[] {
  const recs = buildAiRecommendations(project)
  const suggestions: InfrastructureSuggestion[] = []

  if (project.capabilities.pool.status !== 'live') {
    suggestions.push({
      id: 'staking-pool',
      title: 'Create Staking Pool',
      estimatedImpact: 'High — holder incentives',
      estimatedCompletion: '~30 min',
      dependencies: 'Pools Runtime',
    })
  }

  recs.forEach((rec) => {
    if (rec.id === 'radar-indexing') {
      suggestions.push({
        id: rec.id,
        title: 'Radar Indexing',
        estimatedImpact: 'High — operational visibility',
        estimatedCompletion: '~15 min',
        dependencies: 'Radar Runtime',
      })
    }
    if (rec.id === 'audit-recommended' || rec.id === 'space-audit') {
      suggestions.push({
        id: 'professional-audit',
        title: 'Professional Audit',
        estimatedImpact: 'High — trust signal',
        estimatedCompletion: '2–5 days',
        dependencies: 'Melega Space',
      })
    }
    if (rec.id === 'trending-eligible') {
      suggestions.push({
        id: rec.id,
        title: 'Trending Eligibility',
        estimatedImpact: 'Medium — discovery',
        estimatedCompletion: '~20 min',
        dependencies: 'Projects + Trending',
      })
    }
    if (rec.id === 'reward-marco') {
      suggestions.push({
        id: rec.id,
        title: 'Reward MARCO Holders',
        estimatedImpact: 'High — ecosystem alignment',
        estimatedCompletion: '~25 min',
        dependencies: 'Pools Runtime',
      })
    }
    if (rec.id === 'missing-website') {
      suggestions.push({
        id: 'projects-verification',
        title: 'Projects Verification',
        estimatedImpact: 'Medium — identity completeness',
        estimatedCompletion: '~20 min',
        dependencies: 'Projects Runtime',
      })
    }
  })

  if (project.capabilities.smartdrop.status !== 'live') {
    suggestions.push({
      id: 'smartdrop',
      title: 'SmartDrop Campaign',
      estimatedImpact: 'Medium — distribution infrastructure',
      estimatedCompletion: '~45 min',
      dependencies: 'SmartDrop module',
    })
  }

  return suggestions
}
