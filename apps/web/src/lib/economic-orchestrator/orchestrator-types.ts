import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { PipelineStageId } from 'lib/labs-economic-pipeline/pipeline-types'

export type OrchestratorStatus = 'ready' | 'waiting' | 'planned' | 'blocked' | 'not_indexed'

export type RecommendationPriority = 'critical' | 'high' | 'normal' | 'low'

export type OrchestratorInputId =
  | 'pipeline'
  | 'workspace'
  | 'launch'
  | 'projects'
  | 'assets'
  | 'presence'
  | 'execution'
  | 'identity'
  | 'labs_runtime'

export interface OrchestratorInputSnapshot {
  id: OrchestratorInputId
  label: string
  status: OrchestratorStatus
  route: string
  manifestUri?: string
  notes?: string
}

export interface PipelineStageSnapshot {
  stageId: PipelineStageId
  label: string
  status: OrchestratorStatus
}

export interface EconomicStateSnapshot {
  summary: string
  labsConnected: boolean
  pipelineStages: PipelineStageSnapshot[]
  projectsIndexed: number
  assetsIndexed: number
  presenceIndexed: number
  launchCapabilitiesLive: number
}

export interface OrchestratorRecommendation {
  id: string
  currentState: string
  missingRequirement: string
  reason: string
  priority: RecommendationPriority
  status: OrchestratorStatus
  targetSurface: string
  targetRoute: string
  humanAction: string
  aiAction: string
  blockingDependencies: string[]
  futureDependency?: string
}

export interface DependencyGraphNode {
  id: string
  label: string
  status: OrchestratorStatus
  route: string
  dependsOn: string[]
}

export interface OrchestratorSession {
  sessionId: string
  asOf: string
  readOnly: true
  executionEnabled: false
}

export interface EconomicOrchestratorReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  phase: string
  constitutional: ConstitutionalCanonicalEconomy
  session: OrchestratorSession
  inputs: OrchestratorInputSnapshot[]
  currentState: EconomicStateSnapshot
  recommendations: OrchestratorRecommendation[]
  nextActions: OrchestratorRecommendation[]
  dependencyGraph: DependencyGraphNode[]
  blockedReasons: string[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface EconomicOrchestratorManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  constitutional: ConstitutionalCanonicalEconomy
  session: OrchestratorSession
  inputs: OrchestratorInputSnapshot[]
  current_state: EconomicStateSnapshot
  recommendations: OrchestratorRecommendation[]
  next_actions: OrchestratorRecommendation[]
  dependency_graph: DependencyGraphNode[]
  blocked_reasons: string[]
  cross_links: EconomicOrchestratorReadModel['crossLinks']
}
