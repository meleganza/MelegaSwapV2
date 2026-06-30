import { SubmissionCategoryId } from 'lib/economic-submission/submission-types'

export type ReviewQueueStatus =
  | 'draft'
  | 'submitted'
  | 'queued'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'blocked'
  | 'not_indexed'

export type ReviewPriority = 'critical' | 'high' | 'normal' | 'low'

export type ReviewerType = 'human' | 'ai' | 'governance' | 'future'

export type ReviewDecisionType = 'approve' | 'reject' | 'request_information' | 'defer' | 'blocked'

export type ReviewQueueGroupId =
  | 'waiting_review'
  | 'needs_information'
  | 'blocked'
  | 'future_review'
  | 'completed'

export type ReviewSampleKind = 'schema_example' | 'not_indexed'

export interface ReviewQueueItem {
  queueItemId: string
  submissionId: string
  submissionCategory: SubmissionCategoryId
  created: string | 'not_indexed'
  status: ReviewQueueStatus
  priority: ReviewPriority
  reviewType: string
  requiredReviewer: ReviewerType
  requiredEvidence: string[]
  blockingReason?: string
  targetRegistry: string
  targetSurface: string
  linkedSubmission: string
  linkedPipeline: string
  linkedOrchestratorRecommendation?: string
  sampleKind: ReviewSampleKind
  queueGroup: ReviewQueueGroupId
}

export interface ReviewDecisionExample {
  id: string
  decision: ReviewDecisionType
  description: string
  executesRegistryMutation: false
  executesOnChain: false
  reviewerType: ReviewerType
  notes: string
}

export interface ReviewQueueGroup {
  id: ReviewQueueGroupId
  label: string
  description: string
  items: ReviewQueueItem[]
}

export interface EconomicReviewReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  persistenceEnabled: false
  phase: string
  liveReviewQueue: number
  queueSummary: {
    total: number
    waitingReview: number
    needsInformation: number
    blocked: number
    futureReview: number
    completedExamples: number
  }
  groups: ReviewQueueGroup[]
  decisionExamples: ReviewDecisionExample[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface EconomicReviewManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  persistence_enabled: false
  as_of: string
  disclaimer: string
  live_review_queue: number
  queue_summary: EconomicReviewReadModel['queueSummary']
  groups: ReviewQueueGroup[]
  decision_examples: ReviewDecisionExample[]
  cross_links: EconomicReviewReadModel['crossLinks']
}
