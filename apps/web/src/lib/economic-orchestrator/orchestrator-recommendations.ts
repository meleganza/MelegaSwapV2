import { ORCHESTRATOR_RULES } from './orchestrator-rules'
import {
  ORCHESTRATOR_AS_OF,
  ORCHESTRATOR_DISCLAIMER,
  ORCHESTRATOR_SESSION_ID,
  sortRecommendations,
} from './orchestrator-session'
import { OrchestratorRecommendation } from './orchestrator-types'
import { analyzeEconomicState } from './orchestrator-analysis'

const dedupeRecommendations = (
  recommendations: OrchestratorRecommendation[],
): OrchestratorRecommendation[] => {
  const seen = new Set<string>()
  return recommendations.filter((recommendation) => {
    if (seen.has(recommendation.id)) return false
    seen.add(recommendation.id)
    return true
  })
}

export const buildRecommendations = (): OrchestratorRecommendation[] => {
  const ctx = analyzeEconomicState()
  const matched = ORCHESTRATOR_RULES.filter((rule) => rule.when(ctx)).map((rule) => rule.build(ctx))
  return sortRecommendations(dedupeRecommendations(matched))
}

export {
  ORCHESTRATOR_AS_OF,
  ORCHESTRATOR_DISCLAIMER,
  ORCHESTRATOR_SESSION_ID,
}
