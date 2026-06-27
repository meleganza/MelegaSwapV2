import { describe, expect, it } from 'vitest'
import { getAssetBySlug } from '../../assets/getAssetBySlug'
import { getProjectBySlug } from '../../projects/getProjectBySlug'
import { STATIC_VENUES } from '../venues.data'
import { getAllVenues } from '../getAllVenues'
import { getVenueBySlug, getVenuesByAssetSlug, getVenuesByProjectSlug } from '../getVenueBySlug'
import { serializeVenueManifest, serializeVenueRegistryIndex } from '../manifest'

describe('venues.data', () => {
  it('binds venues to melega-dex project', () => {
    const project = getProjectBySlug('melega-dex')
    STATIC_VENUES.forEach((venue) => {
      expect(venue.projectBinding.projectUpi).toBe(project?.upi)
      expect(venue.lifecycle).toBe('observed')
      expect(venue.trust.verificationStatus).toBe('observed')
      expect(venue.trust.badges).not.toContain('verified')
    })
  })

  it('includes marco-bnb-lp spot_lp venue', () => {
    const venue = getVenueBySlug('marco-bnb-lp')
    expect(venue?.venueType).toBe('spot_lp')
    expect(venue?.assetBindings[0].assetSlug).toBe('marco')
  })

  it('has unique slugs and UVIs', () => {
    const slugs = STATIC_VENUES.map((v) => v.slug)
    const uvis = STATIC_VENUES.map((v) => v.uvi)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(uvis).size).toBe(uvis.length)
  })

  it('does not index fake metrics', () => {
    STATIC_VENUES.forEach((venue) => {
      expect(venue.metrics.status).toBe('not_indexed')
    })
  })
})

describe('manifest', () => {
  it('serializes venue manifest with provenance', () => {
    const venue = getVenueBySlug('marco-bnb-lp')!
    const manifest = serializeVenueManifest(venue)
    expect(manifest.$schema).toBe('https://melega.finance/schemas/venue/v1')
    expect(manifest.data_source).toBe('venue-registry-static')
    expect(manifest.disclaimer).toContain('TVL')
  })

  it('serializes registry index', () => {
    const index = serializeVenueRegistryIndex()
    expect((index.venues as unknown[]).length).toBe(getAllVenues().length)
  })
})

describe('getVenuesByAssetSlug', () => {
  it('returns venues linked to marco asset', () => {
    expect(getVenuesByAssetSlug('marco').length).toBeGreaterThan(0)
  })

  it('returns all venues for melega-dex project', () => {
    expect(getVenuesByProjectSlug('melega-dex').length).toBe(4)
  })
})
