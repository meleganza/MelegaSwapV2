import { analyzeEconomicState, buildDependencyGraph } from './orchestrator-analysis'
import { buildRecommendations } from './orchestrator-recommendations'
import {
  ORCHESTRATOR_AS_OF,
  ORCHESTRATOR_CROSS_LINKS,
  ORCHESTRATOR_DISCLAIMER,
  ORCHESTRATOR_SESSION_ID,
} from './orchestrator-session'
import { EconomicOrchestratorReadModel } from './orchestrator-types'

export const resolveEconomicOrchestratorReadModel = (): EconomicOrchestratorReadModel => {
  const ctx = analyzeEconomicState()
  const recommendations = buildRecommendations()
  const nextActions = recommendations.filter(
    (recommendation) => recommendation.priority === 'critical' || recommendation.priority === 'high',
  )

  const blockedReasons = [
    'Orchestrator is read-only — no blockchain writes or contract interaction.',
    ...(!ctx.labsConnected
      ? ['Labs runtime not connected — narrative-driven recommendations use waiting/planned status.']
      : []),
    ...(recommendations.some((recommendation) => recommendation.status === 'not_indexed')
      ? ['Some requirements are not_indexed — recommendations will not claim fake completion.']
      : []),
  ]

  return {
    asOf: ORCHESTRATOR_AS_OF,
    disclaimer: ORCHESTRATOR_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    phase: 'civilization_services_economic_orchestrator',
    constitutional: ctx.constitutional,
    session: {
      sessionId: ORCHESTRATOR_SESSION_ID,
      asOf: ORCHESTRATOR_AS_OF,
      readOnly: true,
      executionEnabled: false,
    },
    inputs: ctx.inputs.map((input) => ({ ...input })),
    currentState: {
      ...ctx.currentState,
      pipelineStages: ctx.currentState.pipelineStages.map((stage) => ({ ...stage })),
    },
    recommendations,
    nextActions,
    dependencyGraph: buildDependencyGraph(ctx),
    blockedReasons,
    crossLinks: ORCHESTRATOR_CROSS_LINKS.map((link) => ({ ...link })),
  }
}
