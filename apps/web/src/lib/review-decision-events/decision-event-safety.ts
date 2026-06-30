import {
  AllowedDownstreamEffect,
  BlockedDownstreamEffect,
} from './decision-event-types'

export const ALLOWED_DOWNSTREAM_EFFECTS: AllowedDownstreamEffect[] = [
  'notify_orchestrator',
  'update_read_model',
  'request_information',
  'mark_as_reviewed_schema_only',
]

export const BLOCKED_DOWNSTREAM_EFFECTS: BlockedDownstreamEffect[] = [
  'registry_mutation',
  'contract_write',
  'auto_listing',
  'auto_liquidity',
  'auto_presence_activation',
]

export const DOWNSTREAM_EFFECT_DESCRIPTIONS: Record<
  AllowedDownstreamEffect | BlockedDownstreamEffect,
  string
> = {
  notify_orchestrator: 'Orchestrator receives advisory observation — no auto-execution.',
  update_read_model: 'Read model may reflect schema_example state only — not live registry.',
  request_information: 'Return to /submit for missing evidence — no persistence in this build.',
  mark_as_reviewed_schema_only: 'Terminal review shape for schema discovery — not indexed live.',
  registry_mutation: 'Registry writes are always manual — never triggered by decision events.',
  contract_write: 'No on-chain interaction from review decision events.',
  auto_listing: 'No automatic token listing or market activation.',
  auto_liquidity: 'No automatic liquidity deployment or pair creation.',
  auto_presence_activation: 'No automatic presence activation — MARCO on BNB remains canonical.',
}

export const FORBIDDEN_DECISION_EVENT_PAYLOAD_KEYS = [
  'signed_tx',
  'router_execute',
  'deploy_contract',
  'private_key',
  'swap_route',
  'masterchef_deposit',
  'registry_write',
  'auto_approve',
]
