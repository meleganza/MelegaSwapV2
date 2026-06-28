import { stripUndefinedDeep } from 'registry/venues/manifest'
import { ACTIVATION_PIPELINE_VERSION } from './activation-pipeline'
import { ActivationManifest, ActivationPipelineReadModel } from './activation-types'

export const serializeActivationManifest = (model: ActivationPipelineReadModel): ActivationManifest => {
  const manifest: ActivationManifest = {
    manifest: 'manifest://melega/platform/economic-activation@0.1.0',
    api_version: ACTIVATION_PIPELINE_VERSION,
    phase: 'labs_dex_read_model',
    constitution: 'MELEGA_DEX_CONSTITUTION_V1',
    schema: 'https://melega.finance/schemas/economic-activation/v1',
    canonical_economy: model.constitutional,
    presence_targets: model.presenceTargets,
    pipeline: model.stages.map((stage) => ({
      stage_id: stage.id,
      label: stage.label,
      status: stage.status,
      summary: stage.summary,
      notes: stage.notes,
      href: stage.href,
      machine_surface: stage.machineSurface,
    })),
    labs_connected: model.labsConnected,
    narrative_indexed: model.narrativeIndexed,
    project_slug: model.projectSlug,
    disclaimer: model.disclaimer,
    data_source: 'economic-activation-read-model',
    as_of: model.asOf,
  }

  return stripUndefinedDeep(manifest) as ActivationManifest
}
