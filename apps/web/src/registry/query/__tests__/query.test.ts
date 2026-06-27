import { describe, expect, it } from 'vitest'
import { stripUndefinedDeep } from '../../venues/manifest'
import { QUERY_PRESETS } from '../constants'
import { serializeQueryManifest } from '../manifest'
import {
  findEventsByAsset,
  findMachineReadyNodes,
  findNotIndexedRelationships,
  findProjectsByAsset,
  findVenuesByAsset,
  runAllQueryPresets,
  runQueryPreset,
} from '../queries'

const hasUndefined = (value: unknown): boolean => {
  if (value === undefined) return true
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(hasUndefined)
  }
  return false
}

describe('query presets', () => {
  it('runs every preset with deterministic output', () => {
    const results = runAllQueryPresets()
    expect(results.length).toBe(QUERY_PRESETS.length)
    results.forEach((result) => {
      expect(result.dataSource).toBe('registry-query-static')
      expect(result.resultCount).toBe(result.items.length)
    })
  })

  it('finds projects with marco assets', () => {
    const result = runQueryPreset('projects-with-marco-assets')
    expect(result.items.length).toBe(1)
    expect(result.items[0].slug).toBe('melega-dex')
    expect(result.items[0].href).toBe('/projects/melega-dex')
  })

  it('finds venues and events connected to marco', () => {
    expect(findVenuesByAsset('marco').length).toBe(4)
    expect(findEventsByAsset('marco').length).toBe(5)
    expect(findProjectsByAsset('marco').length).toBe(1)
  })

  it('returns machine-ready surfaces with valid hrefs', () => {
    const items = findMachineReadyNodes()
    expect(items.length).toBeGreaterThan(0)
    items.forEach((item) => {
      expect(item.href.startsWith('/')).toBe(true)
    })
  })

  it('returns not-indexed relationships', () => {
    const items = findNotIndexedRelationships()
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((item) => item.status === 'not_indexed')).toBe(true)
  })
})

describe('serializeQueryManifest', () => {
  it('serializes without undefined values', () => {
    const manifest = serializeQueryManifest()
    expect(() => JSON.stringify(manifest)).not.toThrow()
    expect(hasUndefined(manifest)).toBe(false)
    expect(hasUndefined(stripUndefinedDeep(manifest))).toBe(false)
    expect(manifest.data_source).toBe('registry-query-static')
  })
})
