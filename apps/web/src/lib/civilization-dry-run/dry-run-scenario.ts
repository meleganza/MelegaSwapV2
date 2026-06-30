import { DryRunRecordFlags } from './dry-run-types'

export const DRY_RUN_RECORD_FLAGS: DryRunRecordFlags = {
  schema_example: true,
  dry_run_only: true,
  no_execution: true,
  no_registry_mutation: true,
  no_persistence: true,
}

export const MARCO_ECONOMY_NARRATIVE_DRY_RUN_ID = 'marco-economy-narrative-dry-run'

export const DRY_RUN_MANIFEST_URI = '/registry/dry-runs/civilization-dry-run.json'

export const DRY_RUN_AS_OF = '2026-06-30'

export const DRY_RUN_DISCLAIMER =
  'Civilization Dry Run (Mission 31) — first end-to-end integration dry run proving a single economic narrative travels through Submission, Review, Decision Events, Intake, Pipeline, Runtime, Orchestrator, and Workspace as observable read-only state. No real submissions, reviews, approvals, registry writes, persistence, or blockchain execution.'
