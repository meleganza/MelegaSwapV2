import { resolveRealEventIntakeReadModel } from './event-intake-read-model'
import { RealEventIntakeManifest } from './event-intake-types'

export const REAL_EVENT_INTAKE_MANIFEST_ID = 'manifest://melega/platform/real-event-intake@0.1.0'

export const serializeRealEventIntakeManifest = (): RealEventIntakeManifest => {
  const model = resolveRealEventIntakeReadModel()

  return {
    manifest: REAL_EVENT_INTAKE_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    persistence_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    event_families: model.eventFamilies,
    validation_rules: model.validationRules,
    routing_rules: model.routingRules,
    safety_gates: model.safetyGates,
    schema_examples: model.schemaExamples,
    live_events_indexed: model.liveEventsIndexed,
    cross_links: model.crossLinks,
  }
}
