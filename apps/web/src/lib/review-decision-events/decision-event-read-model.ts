import { DECISION_EVENT_TYPES } from './decision-event-schema'
import {
  ALLOWED_DOWNSTREAM_EFFECTS,
  BLOCKED_DOWNSTREAM_EFFECTS,
} from './decision-event-safety'
import {
  DECISION_EVENT_CROSS_LINKS,
  DECISION_EVENT_ROUTING,
} from './decision-event-routing'
import { DECISION_EVENT_VALIDATION_RULES } from './decision-event-validation'
import { ReviewDecisionEventRecord } from './decision-event-types'

export const DECISION_EVENTS_AS_OF = '2026-06-30'

export const DECISION_EVENTS_DISCLAIMER =
  'Review Decision Event Spec (Mission 30) — canonical observable event specification for review decisions entering the Economic OS. No approval execution, persistence, registry mutation, or blockchain interaction. Schema examples only.'

const example = (
  partial: Omit<ReviewDecisionEventRecord, 'sampleKind' | 'blockedDownstreamEffects'>,
): ReviewDecisionEventRecord => ({
  ...partial,
  sampleKind: 'schema_example',
  blockedDownstreamEffects: [...BLOCKED_DOWNSTREAM_EFFECTS],
})

export const SCHEMA_EXAMPLE_DECISION_EVENTS: ReviewDecisionEventRecord[] = [
  example({
    eventId: 'schema://decision-event/review_requested@token_metadata',
    decisionEventType: 'review_requested',
    decisionType: 'lifecycle',
    submissionId: 'schema://submission/token_metadata@example',
    reviewQueueItemId: 'schema://review/queue/token_metadata@waiting',
    reviewerType: 'human',
    decisionStatus: 'schema_example',
    requiredEvidence: ['token_name', 'token_symbol', 'decimals', 'asset_slug'],
    decisionReason: 'Submission queued for human metadata review.',
    safetyClassification: 'human_review_required',
    allowedDownstreamEffects: ['notify_orchestrator', 'update_read_model'],
    routingTargets: DECISION_EVENT_ROUTING.review_requested.targets,
    resultingIntakeEventFamily: 'none',
    resultingOrchestratorImpact:
      'Orchestrator observes pending review workload — recommends evidence completion.',
  }),
  example({
    eventId: 'schema://decision-event/review_started@project_narrative',
    decisionEventType: 'review_started',
    decisionType: 'lifecycle',
    submissionId: 'schema://submission/project_narrative@example',
    reviewQueueItemId: 'schema://review/queue/project_narrative@under_review',
    reviewerType: 'human',
    decisionStatus: 'schema_example',
    requiredEvidence: ['narrative_title', 'narrative_summary', 'constitutional_fit'],
    decisionReason: 'Constitutional narrative review session opened.',
    safetyClassification: 'human_review_required',
    allowedDownstreamEffects: ['notify_orchestrator', 'update_read_model'],
    routingTargets: DECISION_EVENT_ROUTING.review_started.targets,
    resultingIntakeEventFamily: 'none',
    resultingOrchestratorImpact:
      'Orchestrator syncs pipeline observation — Labs narrative handoff pending outcome.',
  }),
  example({
    eventId: 'schema://decision-event/information_requested@audit',
    decisionEventType: 'information_requested',
    decisionType: 'request_information',
    submissionId: 'schema://submission/audit_report@example',
    reviewQueueItemId: 'schema://review/queue/audit_report@needs_info',
    reviewerType: 'human',
    decisionStatus: 'schema_example',
    requiredEvidence: ['audit_uri', 'auditor_name', 'audit_scope'],
    decisionReason: 'audit_uri not supplied — return to submission surface.',
    safetyClassification: 'human_review_required',
    allowedDownstreamEffects: ['notify_orchestrator', 'request_information', 'update_read_model'],
    routingTargets: DECISION_EVENT_ROUTING.information_requested.targets,
    resultingIntakeEventFamily: 'none',
    resultingOrchestratorImpact:
      'Orchestrator recommends evidence completion on /submit — no intake emission.',
  }),
  example({
    eventId: 'schema://decision-event/review_approved@classification',
    decisionEventType: 'review_approved',
    decisionType: 'approve',
    submissionId: 'schema://submission/classification@example',
    reviewQueueItemId: 'schema://review/queue/classification@completed_example',
    reviewerType: 'human',
    decisionStatus: 'schema_example',
    requiredEvidence: ['classification_tier', 'constitutional_fit'],
    decisionReason: 'Schema example approval — intake handoff shape only, not live indexed.',
    safetyClassification: 'observation_only',
    allowedDownstreamEffects: [
      'notify_orchestrator',
      'update_read_model',
      'mark_as_reviewed_schema_only',
    ],
    routingTargets: DECISION_EVENT_ROUTING.review_approved.targets,
    resultingIntakeEventFamily: 'asset_metadata',
    resultingOrchestratorImpact:
      'Orchestrator observes asset_metadata intake readiness — Launch gap recommendation only.',
  }),
  example({
    eventId: 'schema://decision-event/review_rejected@social',
    decisionEventType: 'review_rejected',
    decisionType: 'reject',
    submissionId: 'schema://submission/social@example',
    reviewQueueItemId: 'schema://review/queue/social@completed_rejected_example',
    reviewerType: 'human',
    decisionStatus: 'schema_example',
    requiredEvidence: ['social_platform', 'social_handle'],
    decisionReason: 'Schema example rejection — unverifiable social handle.',
    safetyClassification: 'observation_only',
    allowedDownstreamEffects: [
      'notify_orchestrator',
      'update_read_model',
      'mark_as_reviewed_schema_only',
    ],
    routingTargets: DECISION_EVENT_ROUTING.review_rejected.targets,
    resultingIntakeEventFamily: 'none',
    resultingOrchestratorImpact:
      'Orchestrator records rejection observation — intake propagation halted.',
  }),
  example({
    eventId: 'schema://decision-event/review_blocked@presence',
    decisionEventType: 'review_blocked',
    decisionType: 'blocked',
    submissionId: 'schema://submission/economic_presence_request@example',
    reviewQueueItemId: 'schema://review/queue/economic_presence@blocked',
    reviewerType: 'human',
    decisionStatus: 'halted',
    requiredEvidence: ['presence_slug', 'chain_role', 'target_chain'],
    decisionReason: 'Canonical economy override attempt — MARCO on BNB Chain remains LIVE.',
    safetyClassification: 'blocked',
    allowedDownstreamEffects: [
      'notify_orchestrator',
      'update_read_model',
      'mark_as_reviewed_schema_only',
    ],
    routingTargets: DECISION_EVENT_ROUTING.review_blocked.targets,
    resultingIntakeEventFamily: 'none',
    resultingOrchestratorImpact:
      'Orchestrator safety observation — presence activation blocked.',
  }),
  example({
    eventId: 'schema://decision-event/review_deferred@launch',
    decisionEventType: 'review_deferred',
    decisionType: 'defer',
    submissionId: 'schema://submission/launch_request@example',
    reviewQueueItemId: 'schema://review/queue/launch_request@blocked',
    reviewerType: 'governance',
    decisionStatus: 'schema_example',
    requiredEvidence: ['capability_type', 'project_slug'],
    decisionReason: 'Deferred pending governance timeline — no fake approval.',
    safetyClassification: 'future_execution',
    allowedDownstreamEffects: ['notify_orchestrator', 'update_read_model'],
    routingTargets: DECISION_EVENT_ROUTING.review_deferred.targets,
    resultingIntakeEventFamily: 'none',
    resultingOrchestratorImpact:
      'Orchestrator defers Launch capability recommendation — item remains queued.',
  }),
]

export const resolveReviewDecisionEventReadModel = () => ({
  asOf: DECISION_EVENTS_AS_OF,
  disclaimer: DECISION_EVENTS_DISCLAIMER,
  readOnly: true as const,
  executionEnabled: false as const,
  persistenceEnabled: false as const,
  phase: 'civilization_services_review_decision_events',
  liveDecisionEvents: 0,
  eventTypeDefinitions: DECISION_EVENT_TYPES.map((definition) => ({ ...definition })),
  allowedDownstreamEffects: [...ALLOWED_DOWNSTREAM_EFFECTS],
  blockedDownstreamEffects: [...BLOCKED_DOWNSTREAM_EFFECTS],
  validationRules: [...DECISION_EVENT_VALIDATION_RULES],
  schemaExamples: SCHEMA_EXAMPLE_DECISION_EVENTS.map((event) => ({
    ...event,
    requiredEvidence: [...event.requiredEvidence],
    allowedDownstreamEffects: [...event.allowedDownstreamEffects],
    blockedDownstreamEffects: [...event.blockedDownstreamEffects],
    routingTargets: [...event.routingTargets],
  })),
  crossLinks: DECISION_EVENT_CROSS_LINKS.map((link) => ({ ...link })),
})

export const assertDecisionEventTypeCoverage = (): void => {
  if (SCHEMA_EXAMPLE_DECISION_EVENTS.length !== DECISION_EVENT_TYPES.length) {
    throw new Error('Schema examples must cover all decision event types')
  }
  DECISION_EVENT_TYPES.forEach((definition) => {
    if (
      !SCHEMA_EXAMPLE_DECISION_EVENTS.find(
        (event) => event.decisionEventType === definition.type,
      )
    ) {
      throw new Error(`Missing schema example for decision event type: ${definition.type}`)
    }
  })
}
