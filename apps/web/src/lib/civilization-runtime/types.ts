export const CIVILIZATION_FABRIC_SCHEMA = 'melega.civilization.fabric.v1' as const
/** @deprecated Use CIVILIZATION_FABRIC_SCHEMA */
export const CIVILIZATION_RUNTIME_SCHEMA = CIVILIZATION_FABRIC_SCHEMA

export const FABRIC_EVENT_SCHEMA_VERSION = '1.0.0' as const
export const FABRIC_RUNTIME_VERSION = '1.0.0' as const

export type CivilizationModuleId =
  | 'import'
  | 'registry'
  | 'radar'
  | 'projects'
  | 'trending'
  | 'trade'
  | 'liquidity'
  | 'pools'
  | 'farms'
  | 'identity'
  | 'command_center'
  | 'treasury'
  | 'build_studio'

export type FutureCivilizationModuleId =
  | 'signal'
  | 'labs'
  | 'space'
  | 'smartdrop'
  | 'kerl'
  | 'master_core'
  | 'runtime_services'
  | 'ai_agents'
  | 'portfolio'

export type CivilizationFabricModuleId = CivilizationModuleId | FutureCivilizationModuleId

export type CanonicalEventType =
  | 'PROJECT_IMPORTED'
  | 'PROJECT_VERIFIED'
  | 'PROJECT_UPDATED'
  | 'RADAR_DISCOVERED'
  | 'TRENDING_SCORE_CHANGED'
  | 'TRADE_EXECUTED'
  | 'SWAP_COMPLETED'
  | 'TREASURY_HANDOFF_CREATED'
  | 'TREASURY_SETTLED'
  | 'LIQUIDITY_ADDED'
  | 'LIQUIDITY_REMOVED'
  | 'POOL_JOINED'
  | 'POOL_LEFT'
  | 'POOL_CLAIMED'
  | 'FARM_STAKED'
  | 'FARM_WITHDRAWN'
  | 'FARM_CLAIMED'
  | 'IDENTITY_VERIFIED'
  | 'IDENTITY_UNLOCKED'
  | 'COLLECTION_MINTED'
  | 'COMMAND_NOTIFICATION_CREATED'
  | 'SIGNAL_DETECTED'
  | 'LABS_EXPERIMENT_STARTED'
  | 'SPACE_SESSION_OPENED'
  | 'SMARTDROP_DISPATCHED'
  | 'KERL_NODE_REGISTERED'
  | 'MASTER_CORE_SYNCED'
  | 'AI_AGENT_ACTION'

/** Legacy emission keys preserved for wired producers — mapped to canonical catalog types. */
export type LegacyFabricEventType =
  | 'import_analyzed'
  | 'registry_indexed'
  | 'radar_signals_refreshed'
  | 'projects_intelligence_refreshed'
  | 'trending_refreshed'
  | 'trade_executed'
  | 'treasury_settlement'
  | 'liquidity_position_changed'
  | 'pool_staked'
  | 'pool_unstaked'
  | 'pool_claimed'
  | 'farm_staked'
  | 'farm_withdrawn'
  | 'farm_claimed'
  | 'identity_resolved'
  | 'command_center_synced'

/** @deprecated Use LegacyFabricEventType or CanonicalEventType */
export type CivilizationEventType = LegacyFabricEventType

export type FabricNodeRole = 'producer' | 'consumer' | 'bidirectional' | 'passive' | 'active'

export type FabricNodeStatus = 'wired' | 'planned' | 'future'

export interface CivilizationFabricEvent {
  readonly event_id: string
  readonly event_type: CanonicalEventType
  readonly timestamp: string
  readonly producer: string
  readonly producer_module: CivilizationModuleId
  readonly payload: Readonly<Record<string, unknown>>
  readonly schema_version: typeof FABRIC_EVENT_SCHEMA_VERSION
  readonly runtime_version: typeof FABRIC_RUNTIME_VERSION
  readonly identity: string | null
  readonly wallet: string | null
  readonly correlation_id: string
  readonly trace_id: string
}

/** @deprecated Use CivilizationFabricEvent */
export interface CivilizationRuntimeEvent {
  id: string
  type: LegacyFabricEventType
  source: CivilizationModuleId
  emittedAt: string
  payload?: Record<string, unknown>
}

export interface EventCatalogEntry {
  event_type: CanonicalEventType
  producer: CivilizationFabricModuleId
  payload: string
  consumers: CivilizationFabricModuleId[]
  status: 'active' | 'planned' | 'future'
  legacy_key?: LegacyFabricEventType
}

export interface FabricGraphNode {
  module: CivilizationFabricModuleId
  label: string
  roles: FabricNodeRole[]
  status: FabricNodeStatus
  produces: CanonicalEventType[]
  consumes: CanonicalEventType[]
}

export interface FabricGraphEdge {
  from: CivilizationFabricModuleId
  to: CivilizationFabricModuleId
  event_type: CanonicalEventType
  producer: CivilizationFabricModuleId
  consumers: CivilizationFabricModuleId[]
  flowOrder: number
  coupling: 'fabric_only'
}

/** @deprecated Use FabricGraphEdge */
export interface RuntimeGraphEdge {
  from: CivilizationModuleId
  to: CivilizationModuleId
  event: LegacyFabricEventType
  producer: CivilizationModuleId
  consumers: CivilizationModuleId[]
  flowOrder: number
}

export interface FabricValidation {
  modulesConnected: CivilizationModuleId[]
  brokenPaths: Array<{ edge: string; reason: string }>
  deadProducers: CivilizationModuleId[]
  deadConsumers: CivilizationFabricModuleId[]
  deadModules: CivilizationModuleId[]
  unusedEvents: CanonicalEventType[]
  circularDependencies: string[]
  fabricFeedbackLoops: string[]
  schemaViolations: string[]
  coveragePercentage: number
  totalEdges: number
  connectedEdges: number
}

/** @deprecated Use FabricValidation */
export type RuntimeGraphValidation = FabricValidation

export interface CivilizationFabricProfile {
  schema: typeof CIVILIZATION_FABRIC_SCHEMA
  generatedAt: string
  fabric: {
    name: 'Civilization Event Fabric'
    owner: 'civilization'
    reactRole: 'consumer_only'
    appendOnlyHistory: true
  }
  versions: {
    runtime: typeof FABRIC_RUNTIME_VERSION
    schema: typeof FABRIC_EVENT_SCHEMA_VERSION
  }
  nodes: FabricGraphNode[]
  edges: FabricGraphEdge[]
  eventCatalog: EventCatalogEntry[]
  producerMap: Record<CanonicalEventType, CivilizationFabricModuleId>
  consumerMap: Partial<Record<CanonicalEventType, CivilizationFabricModuleId[]>>
  schemas: {
    event: typeof FABRIC_EVENT_SCHEMA_VERSION
    fabric: typeof CIVILIZATION_FABRIC_SCHEMA
  }
  history: readonly CivilizationFabricEvent[]
  identity: {
    label: string
    constitutional: true
    collections: string[]
  }
  treasury: {
    handoffPath: string
    status: 'partial' | 'live' | 'planned'
  }
  coverage: FabricValidation
  futureCompatibility: {
    readyModules: FutureCivilizationModuleId[]
    extensionPoints: string[]
    architecturalChangesRequired: false
  }
  /** Command Center and other React consumers read history through this mirror. */
  events: {
    definitions: CanonicalEventType[]
    journal: CivilizationRuntimeEvent[]
    producers: Record<LegacyFabricEventType, CivilizationModuleId>
    consumers: Partial<Record<LegacyFabricEventType, CivilizationModuleId[]>>
  }
  dependencies: FabricGraphEdge[]
  runtimeGraph: FabricValidation
}

/** @deprecated Use CivilizationFabricProfile */
export type CivilizationRuntimeProfile = CivilizationFabricProfile

export interface EmitFabricEventOptions {
  payload?: Record<string, unknown>
  identity?: string | null
  wallet?: string | null
  correlation_id?: string
  trace_id?: string
  producer?: string
}
