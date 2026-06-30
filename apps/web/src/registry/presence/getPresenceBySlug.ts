import { STATIC_PRESENCE_RECORDS } from './presence.data'
import { StaticPresenceRecord } from './presence-types'

export const getPresenceBySlug = (slug: string): StaticPresenceRecord | undefined =>
  STATIC_PRESENCE_RECORDS.find((record) => record.slug === slug)

export const getAllPresenceSlugs = (): string[] => STATIC_PRESENCE_RECORDS.map((record) => record.slug)

export const getPresenceByAssetSlug = (assetSlug: string): StaticPresenceRecord[] =>
  STATIC_PRESENCE_RECORDS.filter((record) => record.assetSlug === assetSlug)

export const getPresenceByProjectSlug = (projectSlug: string): StaticPresenceRecord[] =>
  STATIC_PRESENCE_RECORDS.filter((record) => record.projectSlug === projectSlug)

export const getCanonicalPresence = (): StaticPresenceRecord | undefined =>
  STATIC_PRESENCE_RECORDS.find((record) => record.isCanonical)
