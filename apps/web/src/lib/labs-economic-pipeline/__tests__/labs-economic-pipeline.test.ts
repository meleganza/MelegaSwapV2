import { describe, expect, it } from 'vitest'
import { PIPELINE_STAGE_ORDER } from '../pipeline-stages'
import {
  DEFAULT_PIPELINE_ID,
  buildDefaultPipeline,
  resolveLabsEconomicPipelineReadModel,
} from '../pipeline-read-model'
import { serializeLabsEconomicPipelineManifest } from '../pipeline-serializer'

describe('labs economic pipeline', () => {
  it('defines the full Labs to economic stage order', () => {
    expect(PIPELINE_STAGE_ORDER).toEqual([
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
    ])
  })

  it('seeds labs-preview-to-marco-economy default pipeline', () => {
    const pipeline = buildDefaultPipeline()
    expect(pipeline.id).toBe(DEFAULT_PIPELINE_ID)
    expect(pipeline.stages).toHaveLength(10)
    expect(pipeline.constitutional.canonicalAsset).toBe('MARCO')
  })

  it('never marks liquidity or validation as fake ready', () => {
    const pipeline = buildDefaultPipeline()
    const narrative = pipeline.stages.find((stage) => stage.id === 'narrative')!
    const validation = pipeline.stages.find((stage) => stage.id === 'validation')!
    const liquidity = pipeline.stages.find((stage) => stage.id === 'liquidity')!
    const metadata = pipeline.stages.find((stage) => stage.id === 'metadata')!

    expect(narrative.status).toBe('planned')
    expect(validation.status).toBe('planned')
    expect(liquidity.status).toBe('waiting')
    expect(metadata.status).toBe('not_indexed')
  })

  it('marks indexed registry surfaces as ready', () => {
    const pipeline = buildDefaultPipeline()
    const readyIds = pipeline.stages.filter((stage) => stage.status === 'ready').map((stage) => stage.id)
    expect(readyIds).toContain('project')
    expect(readyIds).toContain('asset')
    expect(readyIds).toContain('registry')
    expect(readyIds).toContain('presence')
    expect(readyIds).toContain('workspace')
  })

  it('exposes required inputs and linked surfaces per stage', () => {
    const pipeline = buildDefaultPipeline()
    pipeline.stages.forEach((stage) => {
      expect(stage.requiredInputs.length).toBeGreaterThan(0)
      expect(stage.linkedSurface.startsWith('/')).toBe(true)
      expect(stage.humanAction).toBeTruthy()
      expect(stage.agentAction).toBeTruthy()
      expect(stage.outputArtifact).toBeTruthy()
    })
  })

  it('is read-only with execution disabled', () => {
    const model = resolveLabsEconomicPipelineReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
    expect(model.linkedSurfaces).toContain('/build-studio#build-import')
    expect(model.linkedSurfaces).toContain('/command-center')
    expect(model.linkedSurfaces).toContain('/map')
  })

  it('serializes public pipeline manifest', () => {
    const manifest = serializeLabsEconomicPipelineManifest()
    expect(manifest.manifest).toContain('labs-economic-pipeline')
    expect(manifest.pipelines[0].pipeline_id).toBe(DEFAULT_PIPELINE_ID)
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
  })
})
