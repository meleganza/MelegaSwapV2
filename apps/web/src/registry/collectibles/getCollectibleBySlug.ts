import { STATIC_COLLECTIBLE_RECORDS } from './collectibles.data'
import { StaticCollectibleRecord } from './collectible-types'

export const getCollectibleBySlug = (slug: string): StaticCollectibleRecord | undefined =>
  STATIC_COLLECTIBLE_RECORDS.find((record) => record.slug === slug)

export const getAllCollectibleSlugs = (): string[] =>
  STATIC_COLLECTIBLE_RECORDS.map((record) => record.slug)

export const getLiveCollectibles = (): StaticCollectibleRecord[] =>
  STATIC_COLLECTIBLE_RECORDS.filter((record) => record.status === 'live_or_legacy_existing')
