import {
  DRY_RUN_AS_OF,
  DRY_RUN_DISCLAIMER,
  DRY_RUN_RECORD_FLAGS,
  MARCO_ECONOMY_NARRATIVE_DRY_RUN_ID,
} from './dry-run-scenario'
import { CIVILIZATION_DRY_RUN_FLOW, DRY_RUN_CROSS_LINKS } from './dry-run-flow'
import { DRY_RUN_VALIDATION_RULES, validateDryRunScenario } from './dry-run-validation'
import { CivilizationDryRunScenario } from './dry-run-types'

export const MARCO_ECONOMY_NARRATIVE_DRY_RUN: CivilizationDryRunScenario = {
  id: MARCO_ECONOMY_NARRATIVE_DRY_RUN_ID,
  label: 'MARCO Economy Narrative Dry Run',
  narrative: {
    scenarioId: MARCO_ECONOMY_NARRATIVE_DRY_RUN_ID,
    title: 'MARCO on BNB Chain — Civilization Economic Narrative',
    summary:
      'End-to-end dry run narrative tracing how a Labs-style project story enters the Economic OS through submission and review, without deployment, liquidity, or registry mutation.',
    constitutionalNote: 'MARCO on BNB Chain remains the canonical LIVE economy — this narrative is observation only.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  submission: {
    submissionId: 'schema://dry-run/submission/project_narrative@marco-economy',
    submissionCategory: 'project_narrative',
    targetSurface: '/new-project',
    requiredEvidence: ['narrative_title', 'narrative_summary', 'constitutional_fit'],
    flags: DRY_RUN_RECORD_FLAGS,
  },
  review: {
    reviewQueueItemId: 'schema://dry-run/review/project_narrative@marco-economy',
    reviewQueueGroup: 'waiting_review',
    reviewType: 'constitutional_narrative_review',
    reviewerType: 'human',
    status: 'queued',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  decisionEvent: {
    eventId: 'schema://dry-run/decision-event/review_deferred@marco-economy',
    decisionEventType: 'review_deferred',
    decisionReason:
      'Dry run defers review — no approval executed, no intake event emitted, governance timeline illustrative only.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  intake: {
    intakeEventFamily: 'labs_narrative',
    intakeEventType: 'narrative_created',
    routingTargets: ['/runtime/labs', '/pipeline', '/orchestrator', '/map'],
    flags: DRY_RUN_RECORD_FLAGS,
  },
  pipelineEffects: [
    {
      stageId: 'narrative',
      stageLabel: 'Narrative',
      observedStatus: 'planned',
      effect: 'Narrative stage remains planned — dry run observes Labs preview artifact without registry binding.',
      linkedSurface: '/pipeline',
      flags: DRY_RUN_RECORD_FLAGS,
    },
    {
      stageId: 'validation',
      stageLabel: 'Validation',
      observedStatus: 'not_indexed',
      effect: 'Validation inputs not indexed — honest missing evidence surfaces.',
      linkedSurface: '/pipeline',
      flags: DRY_RUN_RECORD_FLAGS,
    },
    {
      stageId: 'project',
      stageLabel: 'Project',
      observedStatus: 'waiting',
      effect: 'Project binding waits for real intake — dry run does not fake project registry entry.',
      linkedSurface: '/projects',
      flags: DRY_RUN_RECORD_FLAGS,
    },
  ],
  runtimeEffect: {
    eventType: 'narrative_observation_waiting',
    labsConnected: false,
    syncStatus: 'waiting',
    effect:
      'Labs runtime disconnected — narrative event mapping observable in spec, no fake Labs connection or validated narrative.',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  orchestratorEffect: {
    recommendationId: 'schema://dry-run/orchestrator/narrative_completion@marco-economy',
    priority: 'high',
    effect:
      'Orchestrator recommends completing constitutional narrative evidence on /submit — advisory only, no auto-execution.',
    linkedSurface: '/orchestrator',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  workspaceEffect: {
    sectionId: 'projects',
    visibility: 'schema_example_only',
    effect:
      'Workspace projects section remains indexed from registry only — dry run narrative does not add live project entry.',
    linkedSurface: '/workspace',
    flags: DRY_RUN_RECORD_FLAGS,
  },
  finalVerdict: 'partial',
  verdictSummary:
    'Dry run path observable through all nine stages — partial verdict reflects honest not_indexed live state, no execution, and no fake approval.',
  flags: DRY_RUN_RECORD_FLAGS,
}

export const CIVILIZATION_DRY_RUN_SCENARIOS: CivilizationDryRunScenario[] = [
  MARCO_ECONOMY_NARRATIVE_DRY_RUN,
]

export const resolveCivilizationDryRunReadModel = () => {
  CIVILIZATION_DRY_RUN_SCENARIOS.forEach((scenario) => {
    const result = validateDryRunScenario(scenario)
    if (!result.valid) {
      throw new Error(result.blockedReason ?? `Invalid dry run scenario: ${scenario.id}`)
    }
  })

  return {
    asOf: DRY_RUN_AS_OF,
    disclaimer: DRY_RUN_DISCLAIMER,
    readOnly: true as const,
    executionEnabled: false as const,
    persistenceEnabled: false as const,
    phase: 'civilization_services_dry_run',
    liveDryRuns: 0,
    flow: [...CIVILIZATION_DRY_RUN_FLOW],
    scenarios: CIVILIZATION_DRY_RUN_SCENARIOS.map((scenario) => ({
      ...scenario,
      pipelineEffects: scenario.pipelineEffects.map((effect) => ({ ...effect })),
      intake: {
        ...scenario.intake,
        routingTargets: [...scenario.intake.routingTargets],
      },
      submission: {
        ...scenario.submission,
        requiredEvidence: [...scenario.submission.requiredEvidence],
      },
    })),
    validationRules: [...DRY_RUN_VALIDATION_RULES],
    crossLinks: DRY_RUN_CROSS_LINKS.map((link) => ({ ...link })),
  }
}
