import { STATIC_ASSETS } from './assets.data'
import { StaticAssetRecord } from './types'

export const getAssetBySlug = (slug: string): StaticAssetRecord | undefined =>
  STATIC_ASSETS.find((asset) => asset.slug === slug)

export const getAllAssetSlugs = (): string[] => STATIC_ASSETS.map((asset) => asset.slug)

export const getAssetsByProjectSlug = (projectSlug: string): StaticAssetRecord[] =>
  STATIC_ASSETS.filter((asset) => asset.projectBinding.projectSlug === projectSlug)
