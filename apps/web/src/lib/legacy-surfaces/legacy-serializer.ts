import { stripUndefinedDeep } from 'registry/venues/manifest'
import { LEGACY_ILO_SURFACE, LEGACY_ILO_DISCLAIMER, LEGACY_SURFACES_VERSION } from './legacy-surfaces'
import { LegacyIloRetirementManifest } from './legacy-types'

export const serializeLegacyIloRetirementManifest = (): LegacyIloRetirementManifest => {
  const manifest: LegacyIloRetirementManifest = {
    manifest: 'manifest://melega/platform/legacy-ilo-retirement@0.1.0',
    api_version: LEGACY_SURFACES_VERSION,
    phase: 'legacy_surface_retirement',
    read_only: true,
    execution_enabled: false,
    as_of: LEGACY_ILO_SURFACE.retiredAsOf,
    disclaimer: LEGACY_ILO_DISCLAIMER,
    legacy_route: LEGACY_ILO_SURFACE.legacyRoute,
    status: LEGACY_ILO_SURFACE.status,
    surface: LEGACY_ILO_SURFACE,
  }

  return stripUndefinedDeep(manifest) as LegacyIloRetirementManifest
}

export const resolveLegacyIloRetirement = () => LEGACY_ILO_SURFACE
