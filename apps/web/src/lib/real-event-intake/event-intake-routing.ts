import { EventIntakeRoutingRule } from './event-intake-types'

export const EVENT_INTAKE_ROUTING_RULES: EventIntakeRoutingRule[] = [
  {
    family: 'labs_narrative',
    eventTypes: ['narrative_created', 'narrative_updated', 'narrative_validated', 'narrative_rejected', 'narrative_ready'],
    targets: ['/runtime/labs', '/pipeline', '/orchestrator', '/map'],
    notes: 'Labs runtime observes first; pipeline and orchestrator synchronize on validation outcomes.',
  },
  {
    family: 'project_registry',
    eventTypes: ['project_created', 'project_updated', 'project_indexed'],
    targets: ['/pipeline', '/command-center', '/build-studio#build-import', '/map'],
    notes: 'Project binding updates registry strip and workspace project section.',
  },
  {
    family: 'asset_metadata',
    eventTypes: ['asset_planned', 'metadata_submitted', 'metadata_missing'],
    targets: ['/pipeline', '/build-studio#build-import', '/command-center', '/orchestrator'],
    notes: 'Metadata missing surfaces as not_indexed — Launch capability index only.',
  },
  {
    family: 'liquidity_readiness',
    eventTypes: ['liquidity_waiting', 'liquidity_ready', 'pair_selected'],
    targets: ['/build-studio#build-import', '/command-center', '/orchestrator'],
    notes: 'Live liquidity execution routes to legacy /add — never from intake directly.',
  },
  {
    family: 'presence_update',
    eventTypes: ['presence_waiting', 'presence_staged', 'presence_indexed'],
    targets: ['/presence', '/pipeline', '/command-center', '/map'],
    notes: 'Presence is NOT canonical economy — constitutional MARCO on BNB remains immutable.',
  },
  {
    family: 'execution_readiness',
    eventTypes: ['execution_waiting', 'execution_review_required', 'execution_illustrative_ready'],
    targets: ['/execution', '/orchestrator', '/map'],
    notes: 'Execution intake is observation_only/blocked — route live swaps to /swap externally.',
  },
  {
    family: 'workspace_sync',
    eventTypes: ['workspace_stale', 'workspace_refreshed', 'section_indexed'],
    targets: ['/command-center', '/orchestrator'],
    notes: 'Workspace refresh recommendations only — no fake aggregate balances.',
  },
  {
    family: 'orchestrator_recommendation',
    eventTypes: ['recommendation_issued', 'recommendation_acknowledged', 'recommendation_blocked'],
    targets: ['/orchestrator', '/map'],
    notes: 'Orchestrator emits recommendations for human/agent follow-up — never auto-executes.',
  },
]

export const getRoutingRuleForFamily = (family: string): EventIntakeRoutingRule | undefined =>
  EVENT_INTAKE_ROUTING_RULES.find((rule) => rule.family === family)
