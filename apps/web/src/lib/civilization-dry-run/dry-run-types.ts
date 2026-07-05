import { EventIntakeFamily } from 'lib/real-event-intake/event-intake-types'
import { PipelineStageId } from 'lib/labs-economic-pipeline/pipeline-types'
import { DecisionEventType } from 'lib/review-decision-events/decision-event-types'
import { ReviewQueueGroupId } from 'lib/economic-review/review-types'
import { SubmissionCategoryId } from 'lib/economic-submission/submission-types'

export type DryRunVerdict = 'pass' | 'partial' | 'blocked' | 'not_indexed'

export type DryRunFlowStepId =
  | 'narrative'
  | 'submission'
  | 'review_queue'
  | 'decision_event'
  | 'intake'
  | 'pipeline'
  | 'runtime'
  | 'orchestrator'
  | 'workspace'

export interface DryRunRecordFlags {
  schema_example: true
  dry_run_only: true
  no_execution: true
  no_registry_mutation: true
  no_persistence: true
}

export interface DryRunNarrative {
  scenarioId: string
  title: string
  summary: string
  constitutionalNote: string
  flags: DryRunRecordFlags
}

export interface DryRunSubmissionMapping {
  submissionId: string
  submissionCategory: SubmissionCategoryId
  targetSurface: string
  requiredEvidence: string[]
  flags: DryRunRecordFlags
}

export interface DryRunReviewMapping {
  reviewQueueItemId: string
  reviewQueueGroup: ReviewQueueGroupId
  reviewType: string
  reviewerType: 'human'
  status: 'queued'
  flags: DryRunRecordFlags
}

export interface DryRunDecisionEventMapping {
  eventId: string
  decisionEventType: DecisionEventType
  decisionReason: string
  flags: DryRunRecordFlags
}

export interface DryRunIntakeMapping {
  intakeEventFamily: EventIntakeFamily
  intakeEventType: string
  routingTargets: string[]
  flags: DryRunRecordFlags
}

export interface DryRunPipelineEffect {
  stageId: PipelineStageId
  stageLabel: string
  observedStatus: 'planned' | 'waiting' | 'not_indexed'
  effect: string
  linkedSurface: string
  flags: DryRunRecordFlags
}

export interface DryRunRuntimeEffect {
  eventType: string
  labsConnected: false
  syncStatus: 'waiting'
  effect: string
  flags: DryRunRecordFlags
}

export interface DryRunOrchestratorEffect {
  recommendationId: string
  priority: 'high'
  effect: string
  linkedSurface: '/orchestrator'
  flags: DryRunRecordFlags
}

export interface DryRunWorkspaceEffect {
  sectionId: 'projects'
  visibility: 'schema_example_only'
  effect: string
  linkedSurface: '/workspace'
  flags: DryRunRecordFlags
}

export interface DryRunFlowStep {
  id: DryRunFlowStepId
  label: string
  surface: string
  description: string
  flags: DryRunRecordFlags
}

export interface CivilizationDryRunScenario {
  id: string
  label: string
  narrative: DryRunNarrative
  submission: DryRunSubmissionMapping
  review: DryRunReviewMapping
  decisionEvent: DryRunDecisionEventMapping
  intake: DryRunIntakeMapping
  pipelineEffects: DryRunPipelineEffect[]
  runtimeEffect: DryRunRuntimeEffect
  orchestratorEffect: DryRunOrchestratorEffect
  workspaceEffect: DryRunWorkspaceEffect
  finalVerdict: DryRunVerdict
  verdictSummary: string
  flags: DryRunRecordFlags
}

export interface CivilizationDryRunReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  persistenceEnabled: false
  phase: string
  liveDryRuns: number
  flow: DryRunFlowStepId[]
  scenarios: CivilizationDryRunScenario[]
  validationRules: string[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface CivilizationDryRunManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  persistence_enabled: false
  as_of: string
  disclaimer: string
  live_dry_runs: number
  flow: DryRunFlowStepId[]
  scenarios: CivilizationDryRunScenario[]
  validation_rules: string[]
  cross_links: CivilizationDryRunReadModel['crossLinks']
}
