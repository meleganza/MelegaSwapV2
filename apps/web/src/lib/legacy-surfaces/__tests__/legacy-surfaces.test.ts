import { describe, expect, it } from 'vitest'
import {
  resolveLegacyIloRetirement,
  serializeLegacyIloRetirementManifest,
  LEGACY_ILO_SURFACE,
} from '../index'

describe('legacy ILO retirement', () => {
  it('marks legacy ILO as retired with preserved route', () => {
    const surface = resolveLegacyIloRetirement()
    expect(surface.legacyRoute).toBe('/ilo')
    expect(surface.status).toBe('retired')
    expect(surface.contractLogicUntouched).toBe(true)
  })

  it('supersedes with launch activation and workspace routes', () => {
    const routes = LEGACY_ILO_SURFACE.supersededBy.map((entry) => entry.route)
    expect(routes).toEqual(['/launch', '/new-project', '/workspace'])
  })

  it('does not remove historical module reference', () => {
    expect(LEGACY_ILO_SURFACE.historicalModule).toBe('views/Ilos')
  })

  it('serializes retirement manifest as read-only', () => {
    const manifest = serializeLegacyIloRetirementManifest()
    expect(manifest.manifest).toContain('legacy-ilo-retirement')
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
    expect(manifest.legacy_route).toBe('/ilo')
  })
})
