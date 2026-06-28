import { stripUndefinedDeep } from 'registry/venues/manifest'
import { SURFACE_MAP_VERSION } from './surface-groups'
import { resolveSurfaceMapReadModel } from './surface-map'
import { SurfaceMapManifest } from './surface-types'

export const serializeSurfaceMapManifest = (): SurfaceMapManifest => {
  const model = resolveSurfaceMapReadModel()

  const manifest: SurfaceMapManifest = {
    manifest: 'manifest://melega/platform/surface-map@0.1.0',
    api_version: SURFACE_MAP_VERSION,
    phase: 'surface_map_read_model',
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    groups: model.groups,
    surfaces: model.surfaces,
    summary: model.summary,
  }

  return stripUndefinedDeep(manifest) as SurfaceMapManifest
}
