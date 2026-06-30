import { getRoutingRuleForFamily } from 'lib/real-event-intake/event-intake-routing'
import { ReviewDecisionType, ReviewQueueGroupId } from 'lib/economic-review/review-types'
import {
  SUBMISSION_CATEGORIES,
  SUBMISSION_CATEGORY_IDS,
  getSubmissionCategory,
} from 'lib/economic-submission/submission-categories'
import {
  SubmissionCategoryId,
  SubmissionSafetyClassification,
} from 'lib/economic-submission/submission-types'
import { SubmissionReviewIntakeBridgeMapping } from './bridge-types'

export const BRIDGE_MANIFEST_URI = '/registry/bridges/submission-review-intake.json'
export const LINKED_SUBMISSION_MANIFEST = '/registry/submission/economic-submission.json'
export const LINKED_REVIEW_MANIFEST = '/registry/review/economic-review.json'
export const LINKED_INTAKE_MANIFEST = '/registry/intake/real-event-intake.json'

const REVIEW_TYPE_BY_CATEGORY: Record<SubmissionCategoryId, string> = {
  token_metadata: 'human_metadata_review',
  token_logo: 'asset_branding_review',
  website: 'presence_link_review',
  social_links: 'presence_social_review',
  project_narrative: 'constitutional_narrative_review',
  whitepaper: 'documentation_review',
  audit_reference: 'audit_evidence_review',
  category_classification: 'economic_classification_review',
  economic_presence_request: 'canonical_safety_review',
  launch_request: 'launch_capability_review',
  future_ai_review: 'future_ai_assist_review',
}

const INTAKE_EVENT_TYPE_BY_CATEGORY: Record<SubmissionCategoryId, string> = {
  token_metadata: 'metadata_submitted',
  token_logo: 'metadata_submitted',
  website: 'project_updated',
  social_links: 'project_updated',
  project_narrative: 'narrative_created',
  whitepaper: 'narrative_updated',
  audit_reference: 'metadata_submitted',
  category_classification: 'asset_planned',
  economic_presence_request: 'presence_staged',
  launch_request: 'liquidity_waiting',
  future_ai_review: 'recommendation_issued',
}

const ORCHESTRATOR_IMPACT_BY_FAMILY: Record<string, string> = {
  asset_metadata:
    'Orchestrator observes metadata gaps and recommends Launch capability review — no auto-index.',
  project_registry:
    'Orchestrator syncs project registry strip and workspace project section recommendations.',
  labs_narrative:
    'Orchestrator coordinates Labs narrative handoff with pipeline and runtime observations.',
  liquidity_readiness:
    'Orchestrator recommends Launch index review — never marks PLANNED as LIVE.',
  presence_update:
    'Orchestrator confirms presence is not canonical economy override — MARCO on BNB remains LIVE.',
  orchestrator_recommendation:
    'Orchestrator emits advisory recommendation only — human governance required.',
  execution_readiness:
    'Orchestrator blocks execution routing — live swaps remain on legacy /swap externally.',
  workspace_sync:
    'Orchestrator recommends workspace refresh — no fake aggregate balances.',
}

const defaultQueueGroup = (
  safety: SubmissionSafetyClassification,
  category: SubmissionCategoryId,
): ReviewQueueGroupId => {
  if (safety === 'blocked' || category === 'future_ai_review') return 'future_review'
  if (safety === 'future_execution') return 'waiting_review'
  return 'waiting_review'
}

const allowedDecisions = (safety: SubmissionSafetyClassification): ReviewDecisionType[] => {
  const all: ReviewDecisionType[] = [
    'approve',
    'reject',
    'request_information',
    'defer',
    'blocked',
  ]
  if (safety === 'blocked') return ['reject', 'blocked', 'defer']
  return all
}

const blockedReasonForCategory = (
  category: SubmissionCategoryId,
  safety: SubmissionSafetyClassification,
): string | undefined => {
  if (category === 'future_ai_review') {
    return 'AI reviewer path not active — human governance required before intake handoff.'
  }
  if (category === 'economic_presence_request') {
    return 'Canonical economy override attempts are blocked — chain_role must not replace MARCO on BNB Chain.'
  }
  if (category === 'launch_request' && safety === 'future_execution') {
    return 'Launch requests must not route to /ilo or carry execution payloads.'
  }
  if (safety === 'blocked') {
    return 'Safety classification blocked — no intake propagation.'
  }
  return undefined
}

export const buildBridgeMapping = (
  categoryId: SubmissionCategoryId,
): SubmissionReviewIntakeBridgeMapping => {
  const category = getSubmissionCategory(categoryId)
  if (!category) {
    throw new Error(`Missing submission category for bridge mapping: ${categoryId}`)
  }

  const routing = getRoutingRuleForFamily(category.resultingEventIntakeFamily)
  const intakeRoutingTargets = routing?.targets ?? ['/orchestrator', '/map']
  const orchestratorImpact =
    ORCHESTRATOR_IMPACT_BY_FAMILY[category.resultingEventIntakeFamily] ??
    'Orchestrator observes intake family — recommendations only, no execution.'

  const targetSurfaces = [
    category.targetSurface,
    '/submit',
    '/review',
    ...intakeRoutingTargets,
  ].filter((surface, index, arr) => arr.indexOf(surface) === index)

  return {
    submissionCategory: category.id,
    submissionCategoryLabel: category.label,
    requiredReviewType: REVIEW_TYPE_BY_CATEGORY[category.id],
    requiredEvidence: category.requiredFields.map((field) => field.id),
    reviewQueueGroup: defaultQueueGroup(category.defaultSafety, category.id),
    allowedReviewDecisions: allowedDecisions(category.defaultSafety),
    resultingIntakeFamily: category.resultingEventIntakeFamily,
    resultingIntakeEventType: INTAKE_EVENT_TYPE_BY_CATEGORY[category.id],
    safetyClassification: category.defaultSafety,
    orchestratorImpact,
    orchestratorRecommendationSurface: '/orchestrator',
    targetSurfaces,
    intakeRoutingTargets,
    blockedReason: blockedReasonForCategory(category.id, category.defaultSafety),
    machineManifestUri: BRIDGE_MANIFEST_URI,
    linkedSubmissionManifest: LINKED_SUBMISSION_MANIFEST,
    linkedReviewManifest: LINKED_REVIEW_MANIFEST,
    linkedIntakeManifest: LINKED_INTAKE_MANIFEST,
    sampleKind: 'schema_example',
  }
}

export const BRIDGE_MAPPINGS: SubmissionReviewIntakeBridgeMapping[] = SUBMISSION_CATEGORY_IDS.map(
  (id) => buildBridgeMapping(id),
)

export const assertBridgeCategoryCoverage = (): void => {
  SUBMISSION_CATEGORY_IDS.forEach((id) => {
    if (!BRIDGE_MAPPINGS.find((mapping) => mapping.submissionCategory === id)) {
      throw new Error(`Missing bridge mapping for category: ${id}`)
    }
  })
  if (BRIDGE_MAPPINGS.length !== SUBMISSION_CATEGORIES.length) {
    throw new Error('Bridge mapping count does not match submission categories')
  }
}
