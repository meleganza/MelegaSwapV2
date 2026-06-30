import {
  SUBMISSION_CATEGORIES,
  assertSubmissionCategoryCoverage,
} from './submission-categories'
import { SUBMISSION_REVIEW_GATES, SUBMISSION_REVIEW_RULES } from './submission-review'
import {
  GLOBAL_SUBMISSION_VALIDATION_NOTES,
  SUBMISSION_VALIDATION_RULES,
} from './submission-validation'
import { EconomicSubmissionReadModel, EconomicSubmissionRecord } from './submission-types'

export const SUBMISSION_AS_OF = '2026-06-29'

export const SUBMISSION_DISCLAIMER =
  'Economic Submission Service (Mission 27) — canonical submission read model for review before registry entry. No contract execution, token deployment, liquidity deployment, database persistence, file upload, or fake approval in this build. Schema examples only.'

export const SUBMISSION_CROSS_LINKS = [
  { label: 'Review Queue', route: '/review' },
  { label: 'Launch', route: '/launch' },
  { label: 'Labs Pipeline', route: '/pipeline' },
  { label: 'Orchestrator', route: '/orchestrator' },
  { label: 'Surface Map', route: '/map' },
  { label: 'Workspace', route: '/workspace' },
  { label: 'Event Intake Spec', route: '/registry/intake/real-event-intake.json' },
]

const example = (
  partial: Omit<EconomicSubmissionRecord, 'sampleKind' | 'validationStatus' | 'reviewStatus' | 'missingFields'> & {
    missingFields?: string[]
  },
): EconomicSubmissionRecord => ({
  ...partial,
  sampleKind: 'schema_example',
  validationStatus: 'not_indexed',
  reviewStatus: 'not_indexed',
  missingFields: partial.missingFields ?? partial.requiredFields,
})

export const SCHEMA_EXAMPLE_SUBMISSIONS: EconomicSubmissionRecord[] = [
  example({
    submissionId: 'schema://submission/token_metadata@example',
    category: 'token_metadata',
    source: 'schema_example',
    targetSurface: '/assets',
    targetRegistry: 'asset-registry',
    requiredFields: ['token_name', 'token_symbol', 'decimals', 'asset_slug'],
    optionalFields: ['description'],
    safetyClassification: 'human_review_required',
    nextAction: 'Complete required fields and submit for human review when persistence exists.',
    humanReviewerAction: 'Verify metadata fields against constitutional asset policy before indexing.',
    aiReviewerAction: 'Validate UAI shape and flag missing fields — never auto-approve.',
    resultingEventIntakeFamily: 'asset_metadata',
    resultingRegistryTarget: '/assets',
  }),
  example({
    submissionId: 'schema://submission/project_narrative@example',
    category: 'project_narrative',
    source: 'schema_example',
    targetSurface: '/new-project',
    targetRegistry: 'activation-runtime',
    requiredFields: ['narrative_title', 'narrative_summary', 'constitutional_fit'],
    optionalFields: ['creator_contact'],
    safetyClassification: 'human_review_required',
    nextAction: 'Route to Labs narrative handoff after constitutional review.',
    humanReviewerAction: 'Constitutional review — MARCO on BNB Chain remains canonical.',
    aiReviewerAction: 'Route to event intake family labs_narrative — no fake validated state.',
    resultingEventIntakeFamily: 'labs_narrative',
    resultingRegistryTarget: '/projects',
  }),
  example({
    submissionId: 'schema://submission/economic_presence_request@example',
    category: 'economic_presence_request',
    source: 'schema_example',
    targetSurface: '/presence',
    targetRegistry: 'presence-registry',
    requiredFields: ['presence_slug', 'chain_role', 'target_chain'],
    optionalFields: ['bridge_notes'],
    safetyClassification: 'human_review_required',
    nextAction: 'Confirm presence is not canonical economy replacement.',
    humanReviewerAction: 'Confirm presence target is not canonical MARCO override.',
    aiReviewerAction: 'Route to presence_update intake — chain_role required.',
    resultingEventIntakeFamily: 'presence_update',
    resultingRegistryTarget: '/presence',
  }),
  example({
    submissionId: 'schema://submission/launch_request@example',
    category: 'launch_request',
    source: 'schema_example',
    targetSurface: '/launch',
    targetRegistry: 'launch-index',
    requiredFields: ['capability_type', 'project_slug'],
    optionalFields: ['wallet_address'],
    safetyClassification: 'future_execution',
    nextAction: 'Review Launch capability index — never route to /ilo.',
    humanReviewerAction: 'Review capability request against honest Launch statuses.',
    aiReviewerAction: 'Never mark PLANNED capabilities as LIVE — route to /launch only.',
    resultingEventIntakeFamily: 'liquidity_readiness',
    resultingRegistryTarget: '/launch',
  }),
]

export const resolveEconomicSubmissionReadModel = (): EconomicSubmissionReadModel => {
  assertSubmissionCategoryCoverage()

  return {
    asOf: SUBMISSION_AS_OF,
    disclaimer: SUBMISSION_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    persistenceEnabled: false,
    phase: 'civilization_services_economic_submission',
    categories: SUBMISSION_CATEGORIES.map((category) => ({
      ...category,
      requiredFields: category.requiredFields.map((field) => ({ ...field })),
      optionalFields: category.optionalFields.map((field) => ({ ...field })),
    })),
    validationRules: SUBMISSION_VALIDATION_RULES.map((rule) => ({
      ...rule,
      requiredFieldIds: [...rule.requiredFieldIds],
      forbiddenPayloadKeys: [...rule.forbiddenPayloadKeys],
    })),
    reviewGates: SUBMISSION_REVIEW_GATES.map((gate) => ({ ...gate })),
    schemaExamples: SCHEMA_EXAMPLE_SUBMISSIONS.map((submission) => ({
      ...submission,
      requiredFields: [...submission.requiredFields],
      optionalFields: [...submission.optionalFields],
      missingFields: [...submission.missingFields],
    })),
    liveSubmissionsIndexed: 0,
    crossLinks: SUBMISSION_CROSS_LINKS.map((link) => ({ ...link })),
  }
}

export { GLOBAL_SUBMISSION_VALIDATION_NOTES, SUBMISSION_REVIEW_RULES }
