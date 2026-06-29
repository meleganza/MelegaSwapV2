import { resolveEconomicOrchestratorReadModel } from './orchestrator-read-model'
import { EconomicOrchestratorManifest } from './orchestrator-types'

export const ORCHESTRATOR_MANIFEST_ID = 'manifest://melega/platform/economic-orchestrator@0.1.0'

export const serializeEconomicOrchestratorManifest = (): EconomicOrchestratorManifest => {
  const model = resolveEconomicOrchestratorReadModel()

  return {
    manifest: ORCHESTRATOR_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    constitutional: model.constitutional,
    session: model.session,
    inputs: model.inputs,
    current_state: model.currentState,
    recommendations: model.recommendations,
    next_actions: model.nextActions,
    dependency_graph: model.dependencyGraph,
    blocked_reasons: model.blockedReasons,
    cross_links: model.crossLinks,
  }
}
