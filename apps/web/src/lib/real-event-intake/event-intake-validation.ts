import { EventIntakeValidationRule } from './event-intake-types'

export const EVENT_INTAKE_VALIDATION_RULES: EventIntakeValidationRule[] = [
  {
    id: 'labs_narrative_required',
    family: 'labs_narrative',
    description: 'Narrative events must include narrative_id and lifecycle stage — no fake validated state.',
    requiredFields: ['narrative_id', 'lifecycle_stage', 'source_system'],
    forbiddenFields: ['deploy_tx', 'mint_tx', 'router_call'],
    onMissing: 'not_indexed',
    onUnsafePayload: 'unsafe',
  },
  {
    id: 'project_registry_required',
    family: 'project_registry',
    description: 'Project events require UPI slug and constitutional binding reference.',
    requiredFields: ['project_slug', 'upi', 'constitutional_fit'],
    forbiddenFields: ['auto_deploy', 'token_address'],
    onMissing: 'invalid',
    onUnsafePayload: 'unsafe',
  },
  {
    id: 'asset_metadata_required',
    family: 'asset_metadata',
    description: 'Asset metadata events require UAI and metadata_uri or explicit not_indexed marker.',
    requiredFields: ['asset_slug', 'uai'],
    forbiddenFields: ['fake_supply', 'fake_tvl'],
    onMissing: 'not_indexed',
    onUnsafePayload: 'invalid',
  },
  {
    id: 'liquidity_readiness_required',
    family: 'liquidity_readiness',
    description: 'Liquidity events signal readiness only — must not contain signed transactions.',
    requiredFields: ['wallet_connected', 'pair_intent'],
    forbiddenFields: ['signed_tx', 'raw_calldata', 'router_execute'],
    onMissing: 'pending',
    onUnsafePayload: 'unsafe',
  },
  {
    id: 'presence_update_required',
    family: 'presence_update',
    description: 'Presence events must distinguish canonical vs presence-only targets.',
    requiredFields: ['presence_slug', 'chain_role'],
    forbiddenFields: ['canonical_override'],
    onMissing: 'not_indexed',
    onUnsafePayload: 'unsafe',
  },
  {
    id: 'execution_readiness_required',
    family: 'execution_readiness',
    description: 'Execution events are illustrative — block any live trade routing from intake.',
    requiredFields: ['decision_context', 'illustrative_only'],
    forbiddenFields: ['swap_execute', 'router_path', 'slippage_execute'],
    onMissing: 'pending',
    onUnsafePayload: 'blocked',
  },
  {
    id: 'workspace_sync_required',
    family: 'workspace_sync',
    description: 'Workspace sync events aggregate indexed sections — no balance claims.',
    requiredFields: ['section_id', 'indexed_count'],
    forbiddenFields: ['wallet_balance', 'portfolio_value'],
    onMissing: 'not_indexed',
    onUnsafePayload: 'invalid',
  },
  {
    id: 'orchestrator_recommendation_required',
    family: 'orchestrator_recommendation',
    description: 'Orchestrator events recommend actions — never auto-trigger execution.',
    requiredFields: ['recommendation_id', 'priority', 'target_route'],
    forbiddenFields: ['auto_execute', 'chain_write'],
    onMissing: 'invalid',
    onUnsafePayload: 'unsafe',
  },
]

export const getValidationRuleForFamily = (family: string): EventIntakeValidationRule | undefined =>
  EVENT_INTAKE_VALIDATION_RULES.find((rule) => rule.family === family)
