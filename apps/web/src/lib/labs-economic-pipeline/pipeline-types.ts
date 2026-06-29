import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'

export type PipelineStageStatus = 'ready' | 'waiting' | 'blocked' | 'planned' | 'not_indexed'

export type PipelineStageId =
  | 'narrative'
  | 'validation'
  | 'project'
  | 'asset'
  | 'metadata'
  | 'liquidity'
  | 'registry'
  | 'presence'
  | 'execution'
  | 'workspace'

export interface PipelineRequiredInput {
  id: string
  label: string
  required: boolean
  indexed: boolean
  notes?: string
}

export interface PipelineDependency {
  stageId: PipelineStageId
  label: string
  required: boolean
}

export interface PipelineStage {
  id: PipelineStageId
  label: string
  status: PipelineStageStatus
  purpose: string
  humanAction: string
  agentAction: string
  requiredInputs: PipelineRequiredInput[]
  dependencies: PipelineDependency[]
  outputArtifact: string
  linkedSurface: string
  manifestUri?: string
  blockedReason?: string
  plannedReason?: string
}

export interface LabsEconomicPipeline {
  id: string
  label: string
  description: string
  seedType: 'reference' | 'preview'
  constitutional: ConstitutionalCanonicalEconomy
  stages: PipelineStage[]
  readiness: {
    total: number
    ready: number
    waiting: number
    blocked: number
    planned: number
    notIndexed: number
  }
}

export interface LabsEconomicPipelineReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  phase: string
  constitutional: ConstitutionalCanonicalEconomy
  pipelines: LabsEconomicPipeline[]
  linkedSurfaces: string[]
  crossLinks: Array<{ label: string; route: string }>
}

export interface LabsEconomicPipelineManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  constitutional: ConstitutionalCanonicalEconomy
  pipelines: Array<{
    pipeline_id: string
    label: string
    description: string
    seed_type: LabsEconomicPipeline['seedType']
    readiness: LabsEconomicPipeline['readiness']
    stages: Array<{
      stage_id: PipelineStageId
      label: string
      status: PipelineStageStatus
      linked_surface: string
      manifest_uri?: string
      output_artifact: string
      blocked_reason?: string
      planned_reason?: string
    }>
  }>
  linked_surfaces: string[]
  cross_links: LabsEconomicPipelineReadModel['crossLinks']
}
