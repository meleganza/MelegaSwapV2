import { describe, expect, it } from 'vitest'
import { getAllAssets } from '../../assets/getAllAssets'
import { getAllEvents } from '../../events/getAllEvents'
import { getAllProjects } from '../../projects/getAllProjects'
import { getAllVenues } from '../../venues/getAllVenues'
import { stripUndefinedDeep } from '../../venues/manifest'
import { serializeGraphManifest } from '../manifest'
import { resolveEconomicGraph, resolveGraphNeighborhood } from '../resolveGraph'

const hasUndefined = (value: unknown): boolean => {
  if (value === undefined) return true
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(hasUndefined)
  }
  return false
}

describe('resolveEconomicGraph', () => {
  it('resolves all current registry nodes', () => {
    const graph = resolveEconomicGraph()
    expect(graph.summary.projectCount).toBe(getAllProjects().length)
    expect(graph.summary.assetCount).toBe(getAllAssets().length)
    expect(graph.summary.venueCount).toBe(getAllVenues().length)
    expect(graph.summary.eventCount).toBe(getAllEvents().length)
    expect(graph.nodes.length).toBe(
      graph.summary.projectCount + graph.summary.assetCount + graph.summary.venueCount + graph.summary.eventCount,
    )
  })

  it('links melega-dex project to assets, venues, and events', () => {
    const graph = resolveEconomicGraph()
    const chain = graph.chains.find((c) => c.projectSlug === 'melega-dex')
    expect(chain?.assetSlugs.length).toBeGreaterThan(0)
    expect(chain?.venueSlugs.length).toBe(4)
    expect(chain?.eventSlugs.length).toBe(5)
  })

  it('creates reversible edges where data exists', () => {
    const graph = resolveEconomicGraph()
    const assetProject = graph.edges.find(
      (e) => e.relation === 'asset_to_project' && e.from.slug === 'marco' && e.to.slug === 'melega-dex',
    )
    const projectAsset = graph.edges.find(
      (e) => e.relation === 'project_to_asset' && e.from.slug === 'melega-dex' && e.to.slug === 'marco',
    )
    expect(assetProject?.status).toBe('linked')
    expect(projectAsset?.status).toBe('linked')
  })

  it('resolves neighborhood for marco asset', () => {
    const neighborhood = resolveGraphNeighborhood('asset', 'marco')
    expect(neighborhood?.focus.slug).toBe('marco')
    expect(neighborhood?.projects.length).toBeGreaterThan(0)
    expect(neighborhood?.venues.length).toBeGreaterThan(0)
    expect(neighborhood?.events.length).toBeGreaterThan(0)
  })
})

describe('serializeGraphManifest', () => {
  it('serializes graph without undefined values', () => {
    const manifest = serializeGraphManifest()
    expect(() => JSON.stringify(manifest)).not.toThrow()
    expect(hasUndefined(manifest)).toBe(false)
    expect(hasUndefined(stripUndefinedDeep(manifest))).toBe(false)
    expect(manifest.data_source).toBe('registry-graph-static')
    expect((manifest.treasury as { status: string }).status).toBe('not_indexed')
  })
})
