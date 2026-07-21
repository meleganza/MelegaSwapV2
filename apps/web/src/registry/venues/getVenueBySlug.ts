import { STATIC_VENUES } from './venues.data'
import { StaticVenueRecord } from './types'

export const getVenueBySlug = (slug: string): StaticVenueRecord | undefined =>
  STATIC_VENUES.find((venue) => venue.slug === slug)

export const getAllVenueSlugs = (): string[] => STATIC_VENUES.map((venue) => venue.slug)

/**
 * Venues bound directly to a project, plus token-project venues linked by primary asset slug.
 * Melega DEX keeps venue ownership; MARCO also resolves MARCO-base venues for markets/earn.
 */
export const getVenuesByProjectSlug = (projectSlug: string): StaticVenueRecord[] => {
  const byBinding = STATIC_VENUES.filter((venue) => venue.projectBinding.projectSlug === projectSlug)
  const byAsset = STATIC_VENUES.filter((venue) =>
    venue.assetBindings.some((binding) => binding.assetSlug === projectSlug),
  )
  const map = new Map<string, StaticVenueRecord>()
  for (const venue of [...byBinding, ...byAsset]) {
    map.set(venue.slug, venue)
  }
  return Array.from(map.values())
}

export const getVenuesByAssetSlug = (assetSlug: string): StaticVenueRecord[] =>
  STATIC_VENUES.filter((venue) => venue.assetBindings.some((binding) => binding.assetSlug === assetSlug))
