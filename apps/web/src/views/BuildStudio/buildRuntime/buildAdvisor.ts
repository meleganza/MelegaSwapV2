import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildInfrastructureScore } from './buildInfrastructureScore'
import { buildInfrastructureSuggestions } from './buildInfrastructureSuggestions'
import { buildOpportunityScore } from 'views/RadarStudio/radarRuntime/buildOpportunityScore'

export interface BuildAdvisorData {
  confidence: number
  infrastructureReady: number
  nextAction: string
  d87Contribution: string
  reasoning: string[]
  workflow: string[]
}

export function buildAdvisorData(project?: EnrichedProjectRecord): BuildAdvisorData {
  if (!project) {
    return {
      confidence: 0,
      infrastructureReady: 0,
      nextAction: 'Import Existing Token',
      d87Contribution: 'Low',
      reasoning: ['Begin with import-first infrastructure validation via contract address.'],
      workflow: [
        'Import Existing Token',
        'Projects Verification',
        'Radar Indexing',
        'Create Staking Pool',
        'Professional Audit',
      ],
    }
  }

  const infra = buildInfrastructureScore(project)
  const radar = buildOpportunityScore(project)
  const suggestions = buildInfrastructureSuggestions(project)
  const next = suggestions[0]?.title ?? 'Complete infrastructure validation'

  const workflow = [
    'Import Existing Token',
    ...suggestions.slice(0, 4).map((s) => s.title),
    'Professional Audit',
  ]

  return {
    confidence: infra.confidence,
    infrastructureReady: infra.score,
    nextAction: next,
    d87Contribution: infra.score >= 80 ? 'High' : infra.score >= 60 ? 'Medium' : 'Low',
    reasoning: [
      infra.reason,
      `Radar opportunity confidence: ${radar.confidence}%.`,
      'Build Studio prepares infrastructure only — execution routes to dedicated runtimes.',
    ],
    workflow: [...new Set(workflow)],
  }
}
