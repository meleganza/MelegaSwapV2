import { EventFamilyDefinition, EventIntakeFamily } from './event-intake-types'

export const EVENT_INTAKE_VERSION = '0.1.0'

export const EVENT_INTAKE_AS_OF = '2026-06-29'

export const EVENT_INTAKE_DISCLAIMER =
  'Real Event Intake specification (Mission 26) — canonical schema, validation, routing, and safety gates only. No blockchain execution, Labs API integration, database persistence, or live event ingestion in this build. Schema examples are illustrative and marked not_indexed.'

export const EVENT_INTAKE_ROUTING_TARGETS = [
  '/runtime/labs',
  '/pipeline',
  '/workspace',
  '/launch',
  '/presence',
  '/execution',
  '/orchestrator',
  '/map',
] as const

export const EVENT_FAMILY_DEFINITIONS: EventFamilyDefinition[] = [
  {
    id: 'labs_narrative',
    label: 'Labs Narrative Event',
    description: 'Narrative lifecycle events from Labs runtime — created, updated, validated, rejected, ready.',
    sourceSystem: 'labs://runtime/narrative',
    allowedEventTypes: [
      'narrative_created',
      'narrative_updated',
      'narrative_validated',
      'narrative_rejected',
      'narrative_ready',
    ],
    defaultSafety: 'observation_only',
    primaryRouting: ['/runtime/labs', '/pipeline', '/orchestrator'],
  },
  {
    id: 'project_registry',
    label: 'Project Registry Event',
    description: 'Project identity binding events after constitutional validation.',
    sourceSystem: 'manifest://melega/platform/project-registry@0.1.0',
    allowedEventTypes: ['project_created', 'project_updated', 'project_indexed'],
    defaultSafety: 'observation_only',
    primaryRouting: ['/pipeline', '/workspace', '/launch', '/map'],
  },
  {
    id: 'asset_metadata',
    label: 'Asset Metadata Event',
    description: 'Asset UAI binding and metadata submission events — never auto-mint or deploy.',
    sourceSystem: 'manifest://melega/platform/asset-registry@0.1.0',
    allowedEventTypes: ['asset_planned', 'metadata_submitted', 'metadata_missing'],
    defaultSafety: 'human_review_required',
    primaryRouting: ['/pipeline', '/launch', '/workspace'],
  },
  {
    id: 'liquidity_readiness',
    label: 'Liquidity Readiness Event',
    description: 'Signals wallet liquidity readiness — does not execute addLiquidity or pool creation.',
    sourceSystem: 'legacy://add-liquidity',
    allowedEventTypes: ['liquidity_waiting', 'liquidity_ready', 'pair_selected'],
    defaultSafety: 'future_execution',
    primaryRouting: ['/launch', '/workspace', '/orchestrator'],
  },
  {
    id: 'presence_update',
    label: 'Presence Update Event',
    description: 'Economic presence target staging — explicitly not canonical economy replacement.',
    sourceSystem: 'manifest://melega/platform/presence-registry@0.1.0',
    allowedEventTypes: ['presence_waiting', 'presence_staged', 'presence_indexed'],
    defaultSafety: 'observation_only',
    primaryRouting: ['/presence', '/pipeline', '/workspace'],
  },
  {
    id: 'execution_readiness',
    label: 'Execution Readiness Event',
    description: 'Pre-swap execution decision signals — illustrative surface only; live swaps route to /swap.',
    sourceSystem: 'manifest://melega/platform/execution@0.2.0',
    allowedEventTypes: ['execution_waiting', 'execution_review_required', 'execution_illustrative_ready'],
    defaultSafety: 'blocked',
    primaryRouting: ['/execution', '/orchestrator', '/map'],
  },
  {
    id: 'workspace_sync',
    label: 'Workspace Sync Event',
    description: 'Operator hub aggregate refresh signals — read model only, no fake balances.',
    sourceSystem: 'manifest://melega/platform/user-workspace@0.1.0',
    allowedEventTypes: ['workspace_stale', 'workspace_refreshed', 'section_indexed'],
    defaultSafety: 'observation_only',
    primaryRouting: ['/workspace', '/orchestrator'],
  },
  {
    id: 'orchestrator_recommendation',
    label: 'Orchestrator Recommendation Event',
    description: 'Decision service recommendation emitted for human or agent follow-up — never auto-executes.',
    sourceSystem: 'manifest://melega/platform/economic-orchestrator@0.1.0',
    allowedEventTypes: ['recommendation_issued', 'recommendation_acknowledged', 'recommendation_blocked'],
    defaultSafety: 'human_review_required',
    primaryRouting: ['/orchestrator', '/map'],
  },
]

export const getEventFamilyDefinition = (id: EventIntakeFamily): EventFamilyDefinition | undefined =>
  EVENT_FAMILY_DEFINITIONS.find((family) => family.id === id)

export const assertEventFamilyCoverage = (): void => {
  const required: EventIntakeFamily[] = [
    'labs_narrative',
    'project_registry',
    'asset_metadata',
    'liquidity_readiness',
    'presence_update',
    'execution_readiness',
    'workspace_sync',
    'orchestrator_recommendation',
  ]
  required.forEach((id) => {
    if (!getEventFamilyDefinition(id)) {
      throw new Error(`Missing event family definition: ${id}`)
    }
  })
}
