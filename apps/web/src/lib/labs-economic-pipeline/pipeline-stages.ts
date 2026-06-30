import { PipelineStage, PipelineStageId } from './pipeline-types'

export const PIPELINE_STAGE_ORDER: PipelineStageId[] = [
  'narrative',
  'validation',
  'project',
  'asset',
  'metadata',
  'liquidity',
  'registry',
  'presence',
  'execution',
  'workspace',
]

export const PIPELINE_STAGE_LABELS: Record<PipelineStageId, string> = {
  narrative: 'Narrative',
  validation: 'Validation',
  project: 'Project',
  asset: 'Asset',
  metadata: 'Metadata',
  liquidity: 'Liquidity',
  registry: 'Registry',
  presence: 'Presence',
  execution: 'Execution',
  workspace: 'Workspace',
}

export const getPipelineStageLabel = (id: PipelineStageId): string => PIPELINE_STAGE_LABELS[id]

export const assertPipelineStageOrder = (stages: PipelineStage[]): void => {
  const ids = stages.map((stage) => stage.id)
  PIPELINE_STAGE_ORDER.forEach((id, index) => {
    if (ids[index] !== id) {
      throw new Error(`Pipeline stage order mismatch at index ${index}: expected ${id}, got ${ids[index]}`)
    }
  })
}
