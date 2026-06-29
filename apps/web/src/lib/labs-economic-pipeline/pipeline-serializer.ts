import { resolveLabsEconomicPipelineReadModel } from './pipeline-read-model'
import { LabsEconomicPipelineManifest } from './pipeline-types'

export const LABS_PIPELINE_MANIFEST_ID = 'manifest://melega/platform/labs-economic-pipeline@0.1.0'

export const serializeLabsEconomicPipelineManifest = (): LabsEconomicPipelineManifest => {
  const model = resolveLabsEconomicPipelineReadModel()

  return {
    manifest: LABS_PIPELINE_MANIFEST_ID,
    api_version: '0.1.0',
    phase: model.phase,
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    constitutional: model.constitutional,
    pipelines: model.pipelines.map((pipeline) => ({
      pipeline_id: pipeline.id,
      label: pipeline.label,
      description: pipeline.description,
      seed_type: pipeline.seedType,
      readiness: pipeline.readiness,
      stages: pipeline.stages.map((stage) => ({
        stage_id: stage.id,
        label: stage.label,
        status: stage.status,
        linked_surface: stage.linkedSurface,
        manifest_uri: stage.manifestUri,
        output_artifact: stage.outputArtifact,
        blocked_reason: stage.blockedReason,
        planned_reason: stage.plannedReason,
      })),
    })),
    linked_surfaces: model.linkedSurfaces,
    cross_links: model.crossLinks,
  }
}
