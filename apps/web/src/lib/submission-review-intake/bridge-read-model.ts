import { BRIDGE_MAPPINGS, assertBridgeCategoryCoverage } from './bridge-mapping'
import { BRIDGE_VALIDATION_RULES, assertBridgeValidationCoverage } from './bridge-validation'
import { BridgeFlowExample, SubmissionReviewIntakeReadModel } from './bridge-types'

export const BRIDGE_AS_OF = '2026-06-30'

export const BRIDGE_DISCLAIMER =
  'Submission Review Intake Bridge (Mission 29) — read-only observable mapping from submission categories through review to event intake and orchestrator recommendations. No persistence, approval execution, registry mutation, or blockchain interaction. Schema examples only.'

export const BRIDGE_FLOW = ['submission', 'review', 'intake', 'orchestrator'] as const

export const BRIDGE_CROSS_LINKS = [
  { label: 'Submission', route: '/submit' },
  { label: 'Review Queue', route: '/review' },
  { label: 'Event Intake Spec', route: '/registry/intake/real-event-intake.json' },
  { label: 'Orchestrator', route: '/orchestrator' },
  { label: 'Surface Map', route: '/map' },
  { label: 'Bridge Manifest', route: '/registry/bridges/submission-review-intake.json' },
]

const FLOW_EXAMPLES: BridgeFlowExample[] = [
  {
    id: 'schema://bridge/flow/token_metadata',
    submissionCategory: 'token_metadata',
    flow: ['submission', 'review', 'intake', 'orchestrator'],
    description:
      'Token metadata submission → human metadata review → asset_metadata intake → orchestrator Launch gap recommendation.',
    sampleKind: 'schema_example',
    liveIndexed: false,
  },
  {
    id: 'schema://bridge/flow/project_narrative',
    submissionCategory: 'project_narrative',
    flow: ['submission', 'review', 'intake', 'orchestrator'],
    description:
      'Project narrative → constitutional review → labs_narrative intake → orchestrator Labs handoff observation.',
    sampleKind: 'schema_example',
    liveIndexed: false,
  },
  {
    id: 'schema://bridge/flow/economic_presence_blocked',
    submissionCategory: 'economic_presence_request',
    flow: ['submission', 'review', 'intake', 'orchestrator'],
    description:
      'Presence request with canonical override risk → blocked review → intake halted → orchestrator safety observation only.',
    sampleKind: 'schema_example',
    liveIndexed: false,
  },
  {
    id: 'schema://bridge/flow/future_ai_review',
    submissionCategory: 'future_ai_review',
    flow: ['submission', 'review', 'intake', 'orchestrator'],
    description:
      'Future AI review placeholder → future_review queue → orchestrator_recommendation intake schema example only.',
    sampleKind: 'schema_example',
    liveIndexed: false,
  },
]

export const resolveSubmissionReviewIntakeReadModel = (): SubmissionReviewIntakeReadModel => {
  assertBridgeCategoryCoverage()
  assertBridgeValidationCoverage()

  return {
    asOf: BRIDGE_AS_OF,
    disclaimer: BRIDGE_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    persistenceEnabled: false,
    phase: 'civilization_services_submission_review_intake_bridge',
    liveBridgeEvents: 0,
    flow: [...BRIDGE_FLOW],
    mappings: BRIDGE_MAPPINGS.map((mapping) => ({
      ...mapping,
      requiredEvidence: [...mapping.requiredEvidence],
      allowedReviewDecisions: [...mapping.allowedReviewDecisions],
      targetSurfaces: [...mapping.targetSurfaces],
      intakeRoutingTargets: [...mapping.intakeRoutingTargets],
    })),
    flowExamples: FLOW_EXAMPLES.map((example) => ({ ...example })),
    validationRules: [...BRIDGE_VALIDATION_RULES],
    crossLinks: BRIDGE_CROSS_LINKS.map((link) => ({ ...link })),
  }
}
