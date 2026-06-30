import { EventIntakeFamily } from 'lib/real-event-intake/event-intake-types'
import { ReviewDecisionType, ReviewerType } from 'lib/economic-review/review-types'
import { SubmissionSafetyClassification } from 'lib/economic-submission/submission-types'

export type DecisionEventType =
  | 'review_requested'
  | 'review_started'
  | 'information_requested'
  | 'review_approved'
  | 'review_rejected'
  | 'review_blocked'
  | 'review_deferred'

export type DecisionEventStatus =
  | 'schema_example'
  | 'not_indexed'
  | 'observed'
  | 'halted'

export type AllowedDownstreamEffect =
  | 'notify_orchestrator'
  | 'update_read_model'
  | 'request_information'
  | 'mark_as_reviewed_schema_only'

export type BlockedDownstreamEffect =
  | 'registry_mutation'
  | 'contract_write'
  | 'auto_listing'
  | 'auto_liquidity'
  | 'auto_presence_activation'

export type DecisionEventRoutingTarget =
  | '/submit'
  | '/review'
  | '/orchestrator'
  | '/pipeline'
  | '/registry/intake/real-event-intake.json'
  | '/registry/bridges/submission-review-intake.json'

export type DecisionEventSampleKind = 'schema_example' | 'not_indexed'

export interface ReviewDecisionEventRecord {
  eventId: string
  decisionEventType: DecisionEventType
  decisionType: ReviewDecisionType | 'lifecycle'
  submissionId: string
  reviewQueueItemId: string
  reviewerType: ReviewerType
  decisionStatus: DecisionEventStatus
  requiredEvidence: string[]
  decisionReason: string
  safetyClassification: SubmissionSafetyClassification
  allowedDownstreamEffects: AllowedDownstreamEffect[]
  blockedDownstreamEffects: BlockedDownstreamEffect[]
  routingTargets: DecisionEventRoutingTarget[]
  resultingIntakeEventFamily: EventIntakeFamily | 'none'
  resultingOrchestratorImpact: string
  sampleKind: DecisionEventSampleKind
}

export interface DecisionEventTypeDefinition {
  type: DecisionEventType
  label: string
  description: string
  mapsToDecisionType: ReviewDecisionType | 'lifecycle'
  defaultReviewerType: ReviewerType
  defaultSafety: SubmissionSafetyClassification
}

export interface ReviewDecisionEventReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  persistenceEnabled: false
  phase: string
  liveDecisionEvents: number
  eventTypeDefinitions: DecisionEventTypeDefinition[]
  allowedDownstreamEffects: AllowedDownstreamEffect[]
  blockedDownstreamEffects: BlockedDownstreamEffect[]
  validationRules: string[]
  schemaExamples: ReviewDecisionEventRecord[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface ReviewDecisionEventManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  persistence_enabled: false
  as_of: string
  disclaimer: string
  live_decision_events: number
  event_type_definitions: DecisionEventTypeDefinition[]
  allowed_downstream_effects: AllowedDownstreamEffect[]
  blocked_downstream_effects: BlockedDownstreamEffect[]
  validation_rules: string[]
  schema_examples: ReviewDecisionEventRecord[]
  cross_links: ReviewDecisionEventReadModel['crossLinks']
}
