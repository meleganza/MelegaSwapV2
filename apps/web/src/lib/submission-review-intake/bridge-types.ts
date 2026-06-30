import { EventIntakeFamily, EventIntakeRoutingTarget } from 'lib/real-event-intake/event-intake-types'
import { ReviewDecisionType, ReviewQueueGroupId } from 'lib/economic-review/review-types'
import { SubmissionCategoryId, SubmissionSafetyClassification } from 'lib/economic-submission/submission-types'

export type BridgeSampleKind = 'schema_example' | 'not_indexed'

export interface SubmissionReviewIntakeBridgeMapping {
  submissionCategory: SubmissionCategoryId
  submissionCategoryLabel: string
  requiredReviewType: string
  requiredEvidence: string[]
  reviewQueueGroup: ReviewQueueGroupId
  allowedReviewDecisions: ReviewDecisionType[]
  resultingIntakeFamily: EventIntakeFamily
  resultingIntakeEventType: string
  safetyClassification: SubmissionSafetyClassification
  orchestratorImpact: string
  orchestratorRecommendationSurface: '/orchestrator'
  targetSurfaces: string[]
  intakeRoutingTargets: EventIntakeRoutingTarget[]
  blockedReason?: string
  machineManifestUri: string
  linkedSubmissionManifest: string
  linkedReviewManifest: string
  linkedIntakeManifest: string
  sampleKind: BridgeSampleKind
}

export interface BridgeFlowExample {
  id: string
  submissionCategory: SubmissionCategoryId
  flow: ['submission', 'review', 'intake', 'orchestrator']
  description: string
  sampleKind: BridgeSampleKind
  liveIndexed: false
}

export interface SubmissionReviewIntakeReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  persistenceEnabled: false
  phase: string
  liveBridgeEvents: number
  flow: string[]
  mappings: SubmissionReviewIntakeBridgeMapping[]
  flowExamples: BridgeFlowExample[]
  validationRules: string[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface SubmissionReviewIntakeManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  persistence_enabled: false
  as_of: string
  disclaimer: string
  live_bridge_events: number
  flow: string[]
  mappings: SubmissionReviewIntakeBridgeMapping[]
  flow_examples: BridgeFlowExample[]
  validation_rules: string[]
  cross_links: SubmissionReviewIntakeReadModel['crossLinks']
}
