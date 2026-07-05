export type EventIntakeValidationStatus = 'valid' | 'invalid' | 'pending' | 'unsafe' | 'not_indexed'

export type EventIntakeSafetyClassification =
  | 'observation_only'
  | 'human_review_required'
  | 'blocked'
  | 'future_execution'

export type EventIntakeFamily =
  | 'labs_narrative'
  | 'project_registry'
  | 'asset_metadata'
  | 'liquidity_readiness'
  | 'presence_update'
  | 'execution_readiness'
  | 'workspace_sync'
  | 'orchestrator_recommendation'

export type EventIntakeSampleKind = 'schema_example' | 'not_indexed'

export type EventIntakeRoutingTarget =
  | '/runtime/labs'
  | '/pipeline'
  | '/workspace'
  | '/launch'
  | '/presence'
  | '/execution'
  | '/orchestrator'
  | '/map'

export interface EventIntakePayloadField {
  key: string
  type: string
  required: boolean
  notes?: string
}

export interface EventIntakeRoutingRule {
  family: EventIntakeFamily
  eventTypes: string[]
  targets: EventIntakeRoutingTarget[]
  notes: string
}

export interface EventIntakeValidationRule {
  id: string
  family: EventIntakeFamily
  description: string
  requiredFields: string[]
  forbiddenFields: string[]
  onMissing: EventIntakeValidationStatus
  onUnsafePayload: EventIntakeValidationStatus
}

export interface EventIntakeSafetyGate {
  id: string
  classification: EventIntakeSafetyClassification
  description: string
  blocksExecution: boolean
  requiresHumanReview: boolean
}

export interface EventIntakeReadModelUpdate {
  surface: string
  field: string
  mode: 'observe' | 'recommend' | 'blocked'
  notes: string
}

export interface CanonicalEventIntakeRecord {
  eventId: string
  eventFamily: EventIntakeFamily
  eventType: string
  sourceSurface: string
  sourceSystem: string
  timestamp: string | 'not_indexed'
  sampleKind: EventIntakeSampleKind
  payload: Record<string, unknown>
  validationStatus: EventIntakeValidationStatus
  routingTargets: EventIntakeRoutingTarget[]
  safetyClassification: EventIntakeSafetyClassification
  resultingReadModelUpdates: EventIntakeReadModelUpdate[]
  blockedReason?: string
}

export interface EventFamilyDefinition {
  id: EventIntakeFamily
  label: string
  description: string
  sourceSystem: string
  allowedEventTypes: string[]
  defaultSafety: EventIntakeSafetyClassification
  primaryRouting: EventIntakeRoutingTarget[]
}

export interface RealEventIntakeReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  persistenceEnabled: false
  phase: string
  eventFamilies: EventFamilyDefinition[]
  validationRules: EventIntakeValidationRule[]
  routingRules: EventIntakeRoutingRule[]
  safetyGates: EventIntakeSafetyGate[]
  schemaExamples: CanonicalEventIntakeRecord[]
  liveEventsIndexed: number
  crossLinks: Array<{ label: string; route: string }>
}

export interface RealEventIntakeManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  persistence_enabled: false
  as_of: string
  disclaimer: string
  event_families: EventFamilyDefinition[]
  validation_rules: EventIntakeValidationRule[]
  routing_rules: EventIntakeRoutingRule[]
  safety_gates: EventIntakeSafetyGate[]
  schema_examples: CanonicalEventIntakeRecord[]
  live_events_indexed: number
  cross_links: RealEventIntakeReadModel['crossLinks']
}
