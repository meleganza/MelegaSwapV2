import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { PipelineStageId } from 'lib/labs-economic-pipeline/pipeline-types'

export type RuntimeStatus = 'connected' | 'waiting' | 'planned' | 'blocked' | 'ready' | 'not_indexed'

export type RuntimeEventType =
  | 'narrative_created'
  | 'narrative_updated'
  | 'narrative_validated'
  | 'narrative_rejected'
  | 'narrative_ready'
  | 'project_created'
  | 'asset_planned'
  | 'metadata_missing'
  | 'liquidity_waiting'
  | 'presence_waiting'
  | 'execution_waiting'

export type RuntimeMappingTargetKind =
  | 'pipeline_stage'
  | 'workspace'
  | 'launch'
  | 'project_registry'
  | 'asset_registry'
  | 'presence'
  | 'execution'

export interface RuntimeMappingTarget {
  kind: RuntimeMappingTargetKind
  id: string
  label: string
  route: string
  manifestUri?: string
}

export interface RuntimeEventDefinition {
  id: RuntimeEventType
  label: string
  description: string
  mapsTo: RuntimeMappingTarget[]
}

export interface ObservedRuntimeEvent {
  eventType: RuntimeEventType
  observedAt: string
  narrativeId?: string
  syncStatus: RuntimeStatus
  notes?: string
}

export interface ObservedNarrative {
  id: string
  title: string
  status: RuntimeStatus
  lastUpdated?: string
  source: 'labs' | 'not_indexed'
}

export interface PipelineSyncState {
  stageId: PipelineStageId
  stageLabel: string
  pipelineStatus: RuntimeStatus
  syncStatus: RuntimeStatus
  lastEvent?: RuntimeEventType
  notes?: string
}

export interface RuntimeRequirement {
  id: string
  label: string
  status: RuntimeStatus
  notes?: string
}

export interface RuntimeAction {
  id: string
  label: string
  kind: 'pending' | 'blocked' | 'future'
  route?: string
  reason?: string
}

export interface LabsRuntimeSession {
  sessionId: string
  labsConnected: boolean
  connectionStatus: RuntimeStatus
  labsEndpoint: string
  lastObserved: string | null
  lastEvent: RuntimeEventType | null
  observedNarrativeCount: number
}

export interface LabsRuntimeReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  phase: string
  constitutional: ConstitutionalCanonicalEconomy
  session: LabsRuntimeSession
  labsConnected: boolean
  lastObserved: string | null
  lastEvent: RuntimeEventType | null
  pipelineState: PipelineSyncState[]
  observedNarratives: ObservedNarrative[]
  recentEvents: ObservedRuntimeEvent[]
  eventDefinitions: RuntimeEventDefinition[]
  pendingRequirements: RuntimeRequirement[]
  blockedReasons: string[]
  futureActions: RuntimeAction[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface LabsRuntimeManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  constitutional: ConstitutionalCanonicalEconomy
  session: LabsRuntimeSession
  labs_connected: boolean
  last_observed: string | null
  last_event: RuntimeEventType | null
  pipeline_state: PipelineSyncState[]
  observed_narratives: ObservedNarrative[]
  recent_events: ObservedRuntimeEvent[]
  event_definitions: RuntimeEventDefinition[]
  pending_requirements: RuntimeRequirement[]
  blocked_reasons: string[]
  future_actions: RuntimeAction[]
  cross_links: LabsRuntimeReadModel['crossLinks']
}
