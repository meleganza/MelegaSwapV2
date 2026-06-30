import { resolveReviewDecisionEventReadModel } from './decision-event-read-model'
import { ReviewDecisionEventManifest } from './decision-event-types'

export const REVIEW_DECISION_EVENT_MANIFEST_ID =
  'manifest://melega/platform/review-decision-events@0.1.0'

export const serializeReviewDecisionEventManifest = (): ReviewDecisionEventManifest => {
  const model = resolveReviewDecisionEventReadModel()

  return {
    manifest: REVIEW_DECISION_EVENT_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    persistence_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    live_decision_events: model.liveDecisionEvents,
    event_type_definitions: model.eventTypeDefinitions,
    allowed_downstream_effects: model.allowedDownstreamEffects,
    blocked_downstream_effects: model.blockedDownstreamEffects,
    validation_rules: model.validationRules,
    schema_examples: model.schemaExamples,
    cross_links: model.crossLinks,
  }
}
