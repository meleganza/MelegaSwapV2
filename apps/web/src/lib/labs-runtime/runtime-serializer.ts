import { resolveLabsRuntimeReadModel } from './runtime-read-model'
import { LabsRuntimeManifest } from './runtime-types'

export const LABS_RUNTIME_MANIFEST_ID = 'manifest://melega/platform/labs-runtime@0.1.0'

export const serializeLabsRuntimeManifest = (): LabsRuntimeManifest => {
  const model = resolveLabsRuntimeReadModel()

  return {
    manifest: LABS_RUNTIME_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    constitutional: model.constitutional,
    session: model.session,
    labs_connected: model.labsConnected,
    last_observed: model.lastObserved,
    last_event: model.lastEvent,
    pipeline_state: model.pipelineState,
    observed_narratives: model.observedNarratives,
    recent_events: model.recentEvents,
    event_definitions: model.eventDefinitions,
    pending_requirements: model.pendingRequirements,
    blocked_reasons: model.blockedReasons,
    future_actions: model.futureActions,
    cross_links: model.crossLinks,
  }
}
