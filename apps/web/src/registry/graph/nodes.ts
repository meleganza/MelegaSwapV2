import { StaticAssetRecord } from 'registry/assets/types'
import { StaticEventRecord } from 'registry/events/types'
import { StaticProjectRecord } from 'registry/projects/types'
import { StaticVenueRecord } from 'registry/venues/types'
import { GraphNodeRef } from './types'

export const projectToNode = (project: StaticProjectRecord): GraphNodeRef => ({
  type: 'project',
  slug: project.slug,
  identity: project.upi,
  displayName: project.displayName,
  href: `/@${project.slug}/`,
})

export const assetToNode = (asset: StaticAssetRecord): GraphNodeRef => ({
  type: 'asset',
  slug: asset.slug,
  identity: asset.uai,
  displayName: asset.name,
  href: `/assets/${asset.slug}`,
})

export const venueToNode = (venue: StaticVenueRecord): GraphNodeRef => ({
  type: 'venue',
  slug: venue.slug,
  identity: venue.uvi,
  displayName: venue.displayName,
  href: `/venues/${venue.slug}`,
})

export const eventToNode = (event: StaticEventRecord): GraphNodeRef => ({
  type: 'event',
  slug: event.slug,
  identity: event.uei,
  displayName: event.displayName,
  href: `/events/${event.slug}`,
})
