import { SCHEMA_EXAMPLE_SUBMISSIONS } from 'lib/economic-submission/submission-read-model'
import { REVIEW_CROSS_LINKS } from './review-routing'
import { REVIEW_DECISION_EXAMPLES } from './review-decision'
import {
  EconomicReviewReadModel,
  ReviewQueueGroup,
  ReviewQueueGroupId,
  ReviewQueueItem,
} from './review-types'

export const REVIEW_AS_OF = '2026-06-29'

export const REVIEW_DISCLAIMER =
  'Economic Submission Review Queue (Mission 28) — canonical review surface for submissions entering the Civilization. No persistence, no approval execution, no registry mutation, no database writes. Schema examples only.'

const QUEUE_GROUP_META: Record<
  ReviewQueueGroupId,
  { label: string; description: string }
> = {
  waiting_review: {
    label: 'Waiting Review',
    description: 'Submissions queued for human reviewer assignment when persistence exists.',
  },
  needs_information: {
    label: 'Needs Information',
    description: 'Reviewer requested additional evidence — return to submission surface.',
  },
  blocked: {
    label: 'Blocked',
    description: 'Safety gate or constitutional block — no downstream routing.',
  },
  future_review: {
    label: 'Future Review',
    description: 'AI or governance review paths planned — not active in this build.',
  },
  completed: {
    label: 'Completed',
    description: 'Schema examples illustrating terminal review shapes — not live indexed outcomes.',
  },
}

const example = (
  partial: Omit<ReviewQueueItem, 'sampleKind'>,
): ReviewQueueItem => ({
  ...partial,
  sampleKind: 'schema_example',
})

export const SCHEMA_EXAMPLE_QUEUE_ITEMS: ReviewQueueItem[] = [
  example({
    queueItemId: 'schema://review/queue/token_metadata@waiting',
    submissionId: 'schema://submission/token_metadata@example',
    submissionCategory: 'token_metadata',
    created: 'not_indexed',
    status: 'queued',
    priority: 'normal',
    reviewType: 'human_metadata_review',
    requiredReviewer: 'human',
    requiredEvidence: ['token_name', 'token_symbol', 'decimals', 'asset_slug'],
    targetRegistry: 'asset-registry',
    targetSurface: '/assets',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    linkedOrchestratorRecommendation: '/orchestrator',
    queueGroup: 'waiting_review',
  }),
  example({
    queueItemId: 'schema://review/queue/project_narrative@under_review',
    submissionId: 'schema://submission/project_narrative@example',
    submissionCategory: 'project_narrative',
    created: 'not_indexed',
    status: 'under_review',
    priority: 'high',
    reviewType: 'constitutional_narrative_review',
    requiredReviewer: 'human',
    requiredEvidence: ['narrative_title', 'narrative_summary', 'constitutional_fit'],
    targetRegistry: 'activation-runtime',
    targetSurface: '/new-project',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    linkedOrchestratorRecommendation: '/orchestrator',
    queueGroup: 'waiting_review',
  }),
  example({
    queueItemId: 'schema://review/queue/token_logo@needs_info',
    submissionId: 'schema://submission/token_logo@example',
    submissionCategory: 'token_logo',
    created: 'not_indexed',
    status: 'submitted',
    priority: 'normal',
    reviewType: 'asset_branding_review',
    requiredReviewer: 'human',
    requiredEvidence: ['logo_uri', 'logo_format', 'asset_slug'],
    blockingReason: 'Missing logo_uri and asset_slug linkage to canonical asset registry.',
    targetRegistry: 'asset-registry',
    targetSurface: '/assets',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    queueGroup: 'needs_information',
  }),
  example({
    queueItemId: 'schema://review/queue/audit_report@needs_info',
    submissionId: 'schema://submission/audit_report@example',
    submissionCategory: 'audit_report',
    created: 'not_indexed',
    status: 'under_review',
    priority: 'high',
    reviewType: 'audit_evidence_review',
    requiredReviewer: 'human',
    requiredEvidence: ['audit_uri', 'auditor_name', 'audit_scope'],
    blockingReason: 'audit_uri not supplied — request_information decision applies when persistence exists.',
    targetRegistry: 'asset-registry',
    targetSurface: '/assets',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    queueGroup: 'needs_information',
  }),
  example({
    queueItemId: 'schema://review/queue/economic_presence@blocked',
    submissionId: 'schema://submission/economic_presence_request@example',
    submissionCategory: 'economic_presence_request',
    created: 'not_indexed',
    status: 'blocked',
    priority: 'critical',
    reviewType: 'canonical_safety_review',
    requiredReviewer: 'human',
    requiredEvidence: ['presence_slug', 'chain_role', 'target_chain'],
    blockingReason: 'Attempted canonical economy override — MARCO on BNB Chain remains LIVE.',
    targetRegistry: 'presence-registry',
    targetSurface: '/presence',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    linkedOrchestratorRecommendation: '/orchestrator',
    queueGroup: 'blocked',
  }),
  example({
    queueItemId: 'schema://review/queue/launch_request@blocked',
    submissionId: 'schema://submission/launch_request@example',
    submissionCategory: 'launch_request',
    created: 'not_indexed',
    status: 'blocked',
    priority: 'high',
    reviewType: 'launch_capability_review',
    requiredReviewer: 'governance',
    requiredEvidence: ['capability_type', 'project_slug'],
    blockingReason: 'Forbidden route to /ilo or execution payload detected in schema validation.',
    targetRegistry: 'launch-index',
    targetSurface: '/build-studio#build-import',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    queueGroup: 'blocked',
  }),
  example({
    queueItemId: 'schema://review/queue/future_ai@future',
    submissionId: 'schema://submission/future_ai_review@example',
    submissionCategory: 'future_ai_review',
    created: 'not_indexed',
    status: 'not_indexed',
    priority: 'low',
    reviewType: 'future_ai_assist_review',
    requiredReviewer: 'future',
    requiredEvidence: ['submission_category', 'constitutional_fit'],
    blockingReason: 'AI reviewer path not active — human governance required for approve.',
    targetRegistry: 'review-queue',
    targetSurface: '/review',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    linkedOrchestratorRecommendation: '/orchestrator',
    queueGroup: 'future_review',
  }),
  example({
    queueItemId: 'schema://review/queue/website@future',
    submissionId: 'schema://submission/website@example',
    submissionCategory: 'website',
    created: 'not_indexed',
    status: 'draft',
    priority: 'low',
    reviewType: 'presence_link_review',
    requiredReviewer: 'ai',
    requiredEvidence: ['website_url', 'project_slug'],
    targetRegistry: 'presence-registry',
    targetSurface: '/presence',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    queueGroup: 'future_review',
  }),
  example({
    queueItemId: 'schema://review/queue/classification@completed_example',
    submissionId: 'schema://submission/classification@example',
    submissionCategory: 'classification',
    created: 'not_indexed',
    status: 'approved',
    priority: 'normal',
    reviewType: 'economic_classification_review',
    requiredReviewer: 'human',
    requiredEvidence: ['classification_tier', 'constitutional_fit'],
    targetRegistry: 'asset-registry',
    targetSurface: '/assets',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    linkedOrchestratorRecommendation: '/orchestrator',
    queueGroup: 'completed',
  }),
  example({
    queueItemId: 'schema://review/queue/social@completed_rejected_example',
    submissionId: 'schema://submission/social@example',
    submissionCategory: 'social',
    created: 'not_indexed',
    status: 'rejected',
    priority: 'normal',
    reviewType: 'presence_social_review',
    requiredReviewer: 'human',
    requiredEvidence: ['social_platform', 'social_handle'],
    blockingReason: 'Schema example rejection — unverifiable social handle.',
    targetRegistry: 'presence-registry',
    targetSurface: '/presence',
    linkedSubmission: '/submit',
    linkedPipeline: '/pipeline',
    queueGroup: 'completed',
  }),
]

const buildGroups = (): ReviewQueueGroup[] =>
  (Object.keys(QUEUE_GROUP_META) as ReviewQueueGroupId[]).map((id) => ({
    id,
    ...QUEUE_GROUP_META[id],
    items: SCHEMA_EXAMPLE_QUEUE_ITEMS.filter((item) => item.queueGroup === id),
  }))

export const resolveEconomicReviewReadModel = (): EconomicReviewReadModel => {
  const groups = buildGroups()

  const queueSummary = {
    total: SCHEMA_EXAMPLE_QUEUE_ITEMS.length,
    waitingReview: groups.find((g) => g.id === 'waiting_review')?.items.length ?? 0,
    needsInformation: groups.find((g) => g.id === 'needs_information')?.items.length ?? 0,
    blocked: groups.find((g) => g.id === 'blocked')?.items.length ?? 0,
    futureReview: groups.find((g) => g.id === 'future_review')?.items.length ?? 0,
    completedExamples: groups.find((g) => g.id === 'completed')?.items.length ?? 0,
  }

  return {
    asOf: REVIEW_AS_OF,
    disclaimer: REVIEW_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    persistenceEnabled: false,
    phase: 'civilization_services_economic_review',
    liveReviewQueue: 0,
    queueSummary,
    groups,
    decisionExamples: REVIEW_DECISION_EXAMPLES.map((decision) => ({ ...decision })),
    crossLinks: REVIEW_CROSS_LINKS.map((link) => ({ ...link })),
  }
}

export const assertReviewSubmissionLinkage = (): void => {
  const submissionIds = new Set(SCHEMA_EXAMPLE_SUBMISSIONS.map((s) => s.submissionId))
  SCHEMA_EXAMPLE_QUEUE_ITEMS.forEach((item) => {
    if (!submissionIds.has(item.submissionId) && !item.submissionId.startsWith('schema://submission/')) {
      throw new Error(`Queue item ${item.queueItemId} references unknown submission ${item.submissionId}`)
    }
  })
}
