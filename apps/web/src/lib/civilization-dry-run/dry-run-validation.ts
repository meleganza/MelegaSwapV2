import { CivilizationDryRunScenario } from './dry-run-types'

export const DRY_RUN_VALIDATION_RULES = [
  'Dry run is read-only — no real submissions, reviews, or approvals.',
  'All records carry schema_example, dry_run_only, no_execution, no_registry_mutation, no_persistence flags.',
  'No fake approval — decision event is review_deferred, not review_approved.',
  'No registry writes, on-chain actions, API calls, or database persistence.',
  'liveDryRuns remains 0 — scenario is observable spec only.',
  'Final verdict partial reflects honest not_indexed live state across Economic OS.',
  'MARCO on BNB Chain remains canonical LIVE economy throughout dry run.',
]

export const FORBIDDEN_DRY_RUN_ACTIONS = [
  'registry_write',
  'contract_execute',
  'auto_approve',
  'persist_submission',
  'emit_live_intake_event',
  'deploy_liquidity',
]

export interface DryRunValidationResult {
  valid: boolean
  blockedReason?: string
}

export const validateDryRunScenario = (scenario: CivilizationDryRunScenario): DryRunValidationResult => {
  if (!scenario.flags.dry_run_only || !scenario.flags.no_execution) {
    return { valid: false, blockedReason: 'Scenario missing required dry run safety flags.' }
  }

  if (scenario.decisionEvent.decisionEventType === 'review_approved') {
    return { valid: false, blockedReason: 'Dry run must not use review_approved — no fake approvals.' }
  }

  if (scenario.runtimeEffect.labsConnected !== false) {
    return { valid: false, blockedReason: 'Dry run requires labsConnected: false — no fake Labs connection.' }
  }

  return { valid: true }
}
