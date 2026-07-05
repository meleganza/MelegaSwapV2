import { describe, expect, it } from 'vitest'
import { CORE_SURFACES, REMOVE_FROM_HOMEPAGE } from 'lib/homepage-blueprint'
import { resolveHomepageEntryManifest } from '../homepage-entry-data'
import { serializeHomepageEntryManifest } from '../homepage-entry-serializer'

describe('homepage entry manifest', () => {
  it('declares live civilization entry point implementation', () => {
    const manifest = resolveHomepageEntryManifest()
    expect(manifest.implementation).toBe('live')
    expect(manifest.phase).toBe('civilization_entry_point')
    expect(manifest.mission).toContain('Mission 22')
  })

  it('exposes CORE four routes', () => {
    const manifest = resolveHomepageEntryManifest()
    expect(manifest.core_routes).toEqual(CORE_SURFACES.map((surface) => surface.route))
    expect(manifest.core_routes).toContain('/launch')
    expect(manifest.core_routes).not.toContain('/ilo')
  })

  it('lists removed pancake-era homepage elements', () => {
    const manifest = resolveHomepageEntryManifest()
    expect(manifest.removed_from_homepage).toEqual(REMOVE_FROM_HOMEPAGE)
  })

  it('includes machine discovery manifests', () => {
    const manifest = serializeHomepageEntryManifest()
    const uris = manifest.machine_discovery.map((entry) => entry.uri)
    expect(uris).toContain('/registry/readiness/mainnet-gate.json')
    expect(uris).toContain('/registry/blueprints/homepage-entry-point.json')
    expect(uris).toContain('/map')
  })
})
