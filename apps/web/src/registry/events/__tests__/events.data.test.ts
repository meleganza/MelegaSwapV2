import { describe, expect, it } from 'vitest'
import { getAssetBySlug } from '../../assets/getAssetBySlug'
import { getProjectBySlug } from '../../projects/getProjectBySlug'
import { getVenueBySlug } from '../../venues/getVenueBySlug'
import { STATIC_EVENTS } from '../events.data'
import { getAllEvents } from '../getAllEvents'
import {
  getEventBySlug,
  getEventsByAssetSlug,
  getEventsByProjectSlug,
  getEventsByVenueSlug,
} from '../getEventBySlug'
import { serializeEventManifest, serializeEventRegistryIndex } from '../manifest'
import { stripUndefinedDeep } from '../../venues/manifest'

describe('events.data', () => {
  it('derives events from upstream registries', () => {
    const project = getProjectBySlug('melega-dex')
    const marco = getAssetBySlug('marco')
    STATIC_EVENTS.forEach((event) => {
      expect(event.relationships.projectUpi).toBe(project?.upi)
      expect(event.relationships.assetSlug).toBe(marco?.slug)
      expect(['observed', 'registry_derived']).toContain(event.status)
    })
  })

  it('includes marco asset registered event', () => {
    const event = getEventBySlug('marco-asset-registered')
    expect(event?.eventType).toBe('asset_registered')
    expect(event?.status).toBe('registry_derived')
  })

  it('includes venue observed events', () => {
    expect(getEventBySlug('marco-bnb-lp-venue-observed')?.eventType).toBe('venue_registered')
    expect(getEventBySlug('melega-ilo-venue-observed')?.eventType).toBe('venue_registered')
  })

  it('has unique slugs and UEIs', () => {
    const slugs = STATIC_EVENTS.map((e) => e.slug)
    const ueis = STATIC_EVENTS.map((e) => e.uei)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(ueis).size).toBe(ueis.length)
  })

  it('does not include fake tx or treasury amounts', () => {
    STATIC_EVENTS.forEach((event) => {
      expect(event.relationships.treasury.status).toBe('not_indexed')
      const serialized = JSON.stringify(event)
      expect(serialized).not.toMatch(/tx_hash|transaction_hash|0x[a-fA-F0-9]{64}/)
    })
  })
})

describe('manifest', () => {
  it('serializes event manifest with provenance', () => {
    const event = getEventBySlug('marco-asset-registered')!
    const manifest = serializeEventManifest(event)
    expect(manifest.$schema).toBe('https://melega.finance/schemas/event/v1')
    expect(manifest.data_source).toBe('event-registry-static')
    expect(manifest.disclaimer).toContain('tx hashes')
  })

  it('serializes registry index', () => {
    const index = serializeEventRegistryIndex()
    expect((index.events as unknown[]).length).toBe(getAllEvents().length)
  })

  it('serializes event manifests without undefined values', () => {
    getAllEvents().forEach((event) => {
      const manifest = serializeEventManifest(event)
      expect(() => JSON.stringify(manifest)).not.toThrow()
      const hasUndefined = (value: unknown): boolean => {
        if (value === undefined) return true
        if (value && typeof value === 'object') {
          return Object.values(value as Record<string, unknown>).some(hasUndefined)
        }
        return false
      }
      expect(hasUndefined(manifest)).toBe(false)
      expect(hasUndefined(stripUndefinedDeep(event))).toBe(false)
    })
  })
})

describe('event queries', () => {
  it('returns events for melega-dex project', () => {
    expect(getEventsByProjectSlug('melega-dex').length).toBe(5)
  })

  it('returns events linked to marco asset', () => {
    expect(getEventsByAssetSlug('marco').length).toBe(5)
  })

  it('returns events linked to marco-bnb-lp venue', () => {
    const venue = getVenueBySlug('marco-bnb-lp')
    expect(getEventsByVenueSlug('marco-bnb-lp').length).toBe(1)
    expect(getEventsByVenueSlug('marco-bnb-lp')[0].relationships.venueUvi).toBe(venue?.uvi)
  })
})
