import { STATIC_VENUES } from './venues.data'
import { StaticVenueRecord } from './types'

export const getVenueBySlug = (slug: string): StaticVenueRecord | undefined =>
  STATIC_VENUES.find((venue) => venue.slug === slug)

export const getAllVenueSlugs = (): string[] => STATIC_VENUES.map((venue) => venue.slug)

export const getVenuesByProjectSlug = (projectSlug: string): StaticVenueRecord[] =>
  STATIC_VENUES.filter((venue) => venue.projectBinding.projectSlug === projectSlug)

export const getVenuesByAssetSlug = (assetSlug: string): StaticVenueRecord[] =>
  STATIC_VENUES.filter((venue) => venue.assetBindings.some((binding) => binding.assetSlug === assetSlug))
