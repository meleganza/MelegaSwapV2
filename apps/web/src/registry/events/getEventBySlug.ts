import { STATIC_EVENTS } from './events.data'
import { StaticEventRecord } from './types'

export const getEventBySlug = (slug: string): StaticEventRecord | undefined =>
  STATIC_EVENTS.find((event) => event.slug === slug)

export const getAllEventSlugs = (): string[] => STATIC_EVENTS.map((event) => event.slug)

export const getEventsByProjectSlug = (projectSlug: string): StaticEventRecord[] =>
  STATIC_EVENTS.filter((event) => event.relationships.projectSlug === projectSlug)

export const getEventsByAssetSlug = (assetSlug: string): StaticEventRecord[] =>
  STATIC_EVENTS.filter((event) => event.relationships.assetSlug === assetSlug)

export const getEventsByVenueSlug = (venueSlug: string): StaticEventRecord[] =>
  STATIC_EVENTS.filter((event) => event.relationships.venueSlug === venueSlug)
