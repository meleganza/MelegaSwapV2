import { EVENT_FAMILY_DEFINITIONS, assertEventFamilyCoverage, EVENT_INTAKE_AS_OF, EVENT_INTAKE_DISCLAIMER } from './event-intake-schema'
import { EVENT_INTAKE_ROUTING_RULES } from './event-intake-routing'
import { EVENT_INTAKE_SAFETY_GATES, GLOBAL_INTAKE_SAFETY_RULES } from './event-intake-safety'
import { EVENT_INTAKE_VALIDATION_RULES } from './event-intake-validation'
import { CanonicalEventIntakeRecord, RealEventIntakeReadModel } from './event-intake-types'

export const EVENT_INTAKE_CROSS_LINKS = [
  { label: 'Labs Runtime', route: '/runtime/labs' },
  { label: 'Labs Pipeline', route: '/pipeline' },
  { label: 'Orchestrator', route: '/orchestrator' },
  { label: 'Surface Map', route: '/map' },
]

const example = (
  record: Omit<CanonicalEventIntakeRecord, 'sampleKind' | 'timestamp' | 'validationStatus'> & {
    validationStatus?: CanonicalEventIntakeRecord['validationStatus']
  },
): CanonicalEventIntakeRecord => ({
  ...record,
  sampleKind: 'schema_example',
  timestamp: 'not_indexed',
  validationStatus: record.validationStatus ?? 'not_indexed',
})

export const SCHEMA_EXAMPLE_EVENTS: CanonicalEventIntakeRecord[] = [
  example({
    eventId: 'schema://intake/labs_narrative/narrative_created@example',
    eventFamily: 'labs_narrative',
    eventType: 'narrative_created',
    sourceSurface: '/runtime/labs',
    sourceSystem: 'labs://runtime/narrative',
    payload: {
      narrative_id: 'example-narrative-slug',
      lifecycle_stage: 'draft',
      source_system: 'labs://runtime/narrative',
      constitutional_fit: 'pending_review',
    },
    routingTargets: ['/runtime/labs', '/pipeline', '/orchestrator', '/map'],
    safetyClassification: 'observation_only',
    resultingReadModelUpdates: [
      { surface: 'labs_runtime', field: 'observedNarratives', mode: 'observe', notes: 'Append narrative stub when Labs indexed.' },
      { surface: 'pipeline', field: 'narrative', mode: 'observe', notes: 'Set narrative stage to waiting/planned.' },
    ],
  }),
  example({
    eventId: 'schema://intake/project_registry/project_created@example',
    eventFamily: 'project_registry',
    eventType: 'project_created',
    sourceSurface: '/projects',
    sourceSystem: 'manifest://melega/platform/project-registry@0.1.0',
    payload: {
      project_slug: 'example-project',
      upi: 'upi://melega/example-project',
      constitutional_fit: 'approved',
    },
    routingTargets: ['/pipeline', '/command-center', '/build-studio#build-import', '/map'],
    safetyClassification: 'observation_only',
    resultingReadModelUpdates: [
      { surface: 'workspace', field: 'projects', mode: 'observe', notes: 'Indexed project section update.' },
    ],
  }),
  example({
    eventId: 'schema://intake/asset_metadata/metadata_missing@example',
    eventFamily: 'asset_metadata',
    eventType: 'metadata_missing',
    sourceSurface: '/assets',
    sourceSystem: 'manifest://melega/platform/asset-registry@0.1.0',
    payload: {
      asset_slug: 'example-asset',
      uai: 'uai://melega/example-asset',
      metadata_uri: 'not_indexed',
    },
    routingTargets: ['/pipeline', '/build-studio#build-import', '/command-center', '/orchestrator'],
    safetyClassification: 'human_review_required',
    resultingReadModelUpdates: [
      { surface: 'pipeline', field: 'metadata', mode: 'observe', notes: 'Stage status not_indexed.' },
      { surface: 'orchestrator', field: 'recommendations', mode: 'recommend', notes: 'Emit metadata_not_indexed recommendation.' },
    ],
  }),
  example({
    eventId: 'schema://intake/liquidity_readiness/liquidity_waiting@example',
    eventFamily: 'liquidity_readiness',
    eventType: 'liquidity_waiting',
    sourceSurface: '/build-studio#build-import',
    sourceSystem: 'legacy://add-liquidity',
    payload: {
      wallet_connected: false,
      pair_intent: 'MARCO/BNB',
      on_chain_execute: 'forbidden_from_intake',
    },
    routingTargets: ['/build-studio#build-import', '/command-center', '/orchestrator'],
    safetyClassification: 'future_execution',
    resultingReadModelUpdates: [
      { surface: 'pipeline', field: 'liquidity', mode: 'observe', notes: 'Stage waiting until wallet action via /add.' },
    ],
  }),
  example({
    eventId: 'schema://intake/presence_update/presence_staged@example',
    eventFamily: 'presence_update',
    eventType: 'presence_staged',
    sourceSurface: '/presence',
    sourceSystem: 'manifest://melega/platform/presence-registry@0.1.0',
    payload: {
      presence_slug: 'example-presence',
      chain_role: 'presence',
      canonical_override: false,
    },
    routingTargets: ['/presence', '/pipeline', '/command-center', '/map'],
    safetyClassification: 'observation_only',
    resultingReadModelUpdates: [
      { surface: 'presence', field: 'targets', mode: 'observe', notes: 'Staged presence target — not canonical economy.' },
    ],
  }),
  example({
    eventId: 'schema://intake/execution_readiness/execution_review_required@example',
    eventFamily: 'execution_readiness',
    eventType: 'execution_review_required',
    sourceSurface: '/execution',
    sourceSystem: 'manifest://melega/platform/execution@0.2.0',
    payload: {
      decision_context: 'pre_swap_sample',
      illustrative_only: true,
    },
    validationStatus: 'pending',
    routingTargets: ['/execution', '/orchestrator', '/map'],
    safetyClassification: 'blocked',
    resultingReadModelUpdates: [
      { surface: 'execution', field: 'samples', mode: 'observe', notes: 'Illustrative only — live swaps at /swap.' },
    ],
    blockedReason: 'Execution intake cannot trigger trades — observation and review only.',
  }),
  example({
    eventId: 'schema://intake/workspace_sync/workspace_stale@example',
    eventFamily: 'workspace_sync',
    eventType: 'workspace_stale',
    sourceSurface: '/command-center',
    sourceSystem: 'manifest://melega/platform/user-workspace@0.1.0',
    payload: {
      section_id: 'projects',
      indexed_count: 1,
      stale_reason: 'downstream_registry_updated',
    },
    routingTargets: ['/command-center', '/orchestrator'],
    safetyClassification: 'observation_only',
    resultingReadModelUpdates: [
      { surface: 'workspace', field: 'sections', mode: 'observe', notes: 'Recommend refresh without fake balances.' },
    ],
  }),
  example({
    eventId: 'schema://intake/orchestrator_recommendation/recommendation_issued@example',
    eventFamily: 'orchestrator_recommendation',
    eventType: 'recommendation_issued',
    sourceSurface: '/orchestrator',
    sourceSystem: 'manifest://melega/platform/economic-orchestrator@0.1.0',
    payload: {
      recommendation_id: 'asset_ready_liquidity_missing',
      priority: 'high',
      target_route: '/build-studio#build-import',
    },
    validationStatus: 'pending',
    routingTargets: ['/orchestrator', '/map'],
    safetyClassification: 'human_review_required',
    resultingReadModelUpdates: [
      { surface: 'orchestrator', field: 'recommendations', mode: 'recommend', notes: 'Queue recommendation for human/agent.' },
    ],
  }),
]

export const resolveRealEventIntakeReadModel = (): RealEventIntakeReadModel => {
  assertEventFamilyCoverage()

  return {
    asOf: EVENT_INTAKE_AS_OF,
    disclaimer: EVENT_INTAKE_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    persistenceEnabled: false,
    phase: 'civilization_services_real_event_intake_spec',
    eventFamilies: EVENT_FAMILY_DEFINITIONS.map((family) => ({ ...family, allowedEventTypes: [...family.allowedEventTypes], primaryRouting: [...family.primaryRouting] })),
    validationRules: EVENT_INTAKE_VALIDATION_RULES.map((rule) => ({
      ...rule,
      requiredFields: [...rule.requiredFields],
      forbiddenFields: [...rule.forbiddenFields],
    })),
    routingRules: EVENT_INTAKE_ROUTING_RULES.map((rule) => ({
      ...rule,
      eventTypes: [...rule.eventTypes],
      targets: [...rule.targets],
    })),
    safetyGates: EVENT_INTAKE_SAFETY_GATES.map((gate) => ({ ...gate })),
    schemaExamples: SCHEMA_EXAMPLE_EVENTS.map((event) => ({
      ...event,
      payload: { ...event.payload },
      routingTargets: [...event.routingTargets],
      resultingReadModelUpdates: event.resultingReadModelUpdates.map((update) => ({ ...update })),
    })),
    liveEventsIndexed: 0,
    crossLinks: EVENT_INTAKE_CROSS_LINKS.map((link) => ({ ...link })),
  }
}

export { GLOBAL_INTAKE_SAFETY_RULES }
