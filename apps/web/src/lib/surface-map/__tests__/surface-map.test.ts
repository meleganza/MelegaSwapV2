import { describe, expect, it } from 'vitest'
import { SURFACE_GROUP_ORDER, SURFACE_GROUPS } from '../surface-groups'
import {
  assertSurfaceMapCoverage,
  getAllSurfaces,
  getGroupedVisibleSurfaces,
  getSurfaceById,
  resolveSurfaceMapReadModel,
} from '../surface-map'
import { serializeSurfaceMapManifest } from '../surface-serializer'

describe('surface map', () => {
  it('covers all four surface groups', () => {
    assertSurfaceMapCoverage()
    expect(SURFACE_GROUPS).toHaveLength(4)
    expect(SURFACE_GROUP_ORDER).toEqual(['execute', 'create', 'understand', 'manage'])
  })

  it('indexes required execute surfaces', () => {
    const ids = getAllSurfaces().map((surface) => surface.id)
    expect(ids).toContain('swap')
    expect(ids).toContain('liquidity')
    expect(ids).toContain('farms')
    expect(ids).toContain('pools')
    expect(ids).toContain('execution')
  })

  it('marks legacy ILO as retired with replacement route', () => {
    const ilo = getSurfaceById('legacy_ilo')!
    expect(ilo.status).toBe('retired')
    expect(ilo.replacementRoute).toBe('/launch')
    expect(ilo.manifestUri).toBe('/registry/legacy/ilo-retirement.json')
    expect(ilo.visibility).toBe('legacy')
  })

  it('includes create and manage surfaces from recent missions', () => {
    expect(getSurfaceById('launch')?.route).toBe('/launch')
    expect(getSurfaceById('collectibles')?.route).toBe('/collectibles')
    expect(getSurfaceById('workspace')?.route).toBe('/workspace')
    expect(getSurfaceById('identity')?.route).toBe('/identity')
  })

  it('includes legacy NFT wallet and market without removing routes', () => {
    expect(getSurfaceById('nft_wallet')?.route).toBe('/viewNFTs')
    expect(getSurfaceById('nft_market')?.route).toBe('/nftmarket')
    expect(getSurfaceById('nft_wallet')?.status).toBe('legacy')
  })

  it('exposes human and agent purpose on every surface', () => {
    getAllSurfaces().forEach((surface) => {
      expect(surface.humanPurpose.length).toBeGreaterThan(0)
      expect(surface.agentPurpose.length).toBeGreaterThan(0)
      expect(surface.dataSource.length).toBeGreaterThan(0)
      expect(['none', 'low', 'medium', 'high', 'on_chain']).toContain(surface.executionRisk)
    })
  })

  it('groups visible surfaces for UI without hidden meta entry in groups', () => {
    const grouped = getGroupedVisibleSurfaces()
    expect(grouped).toHaveLength(4)
    grouped.forEach(({ surfaces }) => {
      expect(surfaces.every((surface) => surface.visibility !== 'hidden')).toBe(true)
    })
    const allVisibleIds = grouped.flatMap(({ surfaces }) => surfaces.map((surface) => surface.id))
    expect(allVisibleIds).not.toContain('surface_map')
  })

  it('resolves read model summary counts', () => {
    const model = resolveSurfaceMapReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
    expect(model.summary.total).toBeGreaterThanOrEqual(20)
    expect(model.summary.retired).toBeGreaterThanOrEqual(1)
    expect(model.summary.withManifest).toBeGreaterThanOrEqual(10)
  })
})

describe('surface map manifest', () => {
  it('serializes machine manifest as read-only', () => {
    const manifest = serializeSurfaceMapManifest()
    expect(manifest.manifest).toContain('surface-map')
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
    expect(manifest.surfaces.length).toBeGreaterThanOrEqual(20)
    expect(manifest.groups).toHaveLength(4)
  })
})
