/**
 * RC Sprint 1 — commercial package catalogs (Featured + Trend Boost).
 * Infrastructure freeze: no protocol changes; treasury direct settlement only.
 */
import { MELEGA_TREASURY_WALLET_ADDRESS } from 'config/dexEconomicAuthority'
import { FEATURED_FEE_FROM_SCHEDULE } from 'config/constants/feeSchedule'

export const MONETIZATION_TREASURY = MELEGA_TREASURY_WALLET_ADDRESS
export const MONETIZATION_CHAIN_ID = 56 as const
export const MONETIZATION_ASSETS = ['BNB', 'USDT', 'USDC', 'MARCO'] as const
export type MonetizationAsset = (typeof MONETIZATION_ASSETS)[number]

export type FeaturedPackageId = 'featured_24h' | 'featured_72h' | 'featured_1w' | 'featured_1m'
export type TrendBoostPackageId = 'trend_1h' | 'trend_3h' | 'trend_6h' | 'trend_12h' | 'trend_24h'
export type SponsoredResearchPackageId =
  | 'research_6h'
  | 'research_12h'
  | 'research_24h'
  | 'research_72h'
  | 'research_1w'
  | 'research_1m'
export type FeaturedFarmPackageId = `featured_farm_${'24h' | '72h' | '1w' | '1m'}`
export type FeaturedPoolPackageId = `featured_pool_${'24h' | '72h' | '1w' | '1m'}`

export type PlacementPackage = {
  id:
    | FeaturedPackageId
    | TrendBoostPackageId
    | SponsoredResearchPackageId
    | FeaturedFarmPackageId
    | FeaturedPoolPackageId
  product: 'featured_project' | 'trend_boost' | 'sponsored_research' | 'featured_farm' | 'featured_pool'
  label: string
  shortLabel: string
  durationLabel: string
  durationMs: number
  usdPrice: number
  /** Canonical default package for the product family */
  isDefault?: boolean
  acceptedAssets: readonly MonetizationAsset[]
}

/** Featured Project packages — Home Featured rail placement. */
export const FEATURED_PACKAGES: readonly PlacementPackage[] = [
  {
    id: 'featured_24h',
    product: 'featured_project',
    label: 'Featured · 24 hours',
    shortLabel: '24h',
    durationLabel: '24 hours',
    durationMs: 24 * 60 * 60 * 1000,
    usdPrice: 29,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'featured_72h',
    product: 'featured_project',
    label: 'Featured · 72 hours',
    shortLabel: '72h',
    durationLabel: '72 hours',
    durationMs: 72 * 60 * 60 * 1000,
    usdPrice: 59,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'featured_1w',
    product: 'featured_project',
    label: 'Featured · 1 week',
    shortLabel: '1 week',
    durationLabel: '7 days',
    durationMs: FEATURED_FEE_FROM_SCHEDULE.durationDays * 24 * 60 * 60 * 1000,
    usdPrice: FEATURED_FEE_FROM_SCHEDULE.usd,
    isDefault: true,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'featured_1m',
    product: 'featured_project',
    label: 'Featured · 1 month',
    shortLabel: '1 month',
    durationLabel: '30 days',
    durationMs: 30 * 24 * 60 * 60 * 1000,
    usdPrice: 249,
    acceptedAssets: MONETIZATION_ASSETS,
  },
] as const

/** Trend Boost packages — Trending surface premium placement. */
export const TREND_BOOST_PACKAGES: readonly PlacementPackage[] = [
  {
    id: 'trend_1h',
    product: 'trend_boost',
    label: 'Trend Boost · 1 hour',
    shortLabel: '1h',
    durationLabel: '1 hour',
    durationMs: 1 * 60 * 60 * 1000,
    usdPrice: 9,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'trend_3h',
    product: 'trend_boost',
    label: 'Trend Boost · 3 hours',
    shortLabel: '3h',
    durationLabel: '3 hours',
    durationMs: 3 * 60 * 60 * 1000,
    usdPrice: 19,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'trend_6h',
    product: 'trend_boost',
    label: 'Trend Boost · 6 hours',
    shortLabel: '6h',
    durationLabel: '6 hours',
    durationMs: 6 * 60 * 60 * 1000,
    usdPrice: 29,
    isDefault: true,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'trend_12h',
    product: 'trend_boost',
    label: 'Trend Boost · 12 hours',
    shortLabel: '12h',
    durationLabel: '12 hours',
    durationMs: 12 * 60 * 60 * 1000,
    usdPrice: 49,
    acceptedAssets: MONETIZATION_ASSETS,
  },
  {
    id: 'trend_24h',
    product: 'trend_boost',
    label: 'Trend Boost · 24 hours',
    shortLabel: '24h',
    durationLabel: '24 hours',
    durationMs: 24 * 60 * 60 * 1000,
    usdPrice: 79,
    acceptedAssets: MONETIZATION_ASSETS,
  },
] as const

/** Sponsored Search packages — pricing approved by the founder. */
export const SPONSORED_RESEARCH_PACKAGES: readonly PlacementPackage[] = [
  ['research_6h', '6h', '6 hours', 6, 19],
  ['research_12h', '12h', '12 hours', 12, 29],
  ['research_24h', '24h', '24 hours', 24, 49],
  ['research_72h', '72h', '72 hours', 72, 99],
  ['research_1w', '1 week', '7 days', 168, 199],
  ['research_1m', '1 month', '30 days', 720, 599],
].map(([id, shortLabel, durationLabel, hours, usdPrice]) => ({
  id: id as SponsoredResearchPackageId,
  product: 'sponsored_research' as const,
  label: `Sponsored Search · ${durationLabel}`,
  shortLabel: String(shortLabel),
  durationLabel: String(durationLabel),
  durationMs: Number(hours) * 60 * 60 * 1000,
  usdPrice: Number(usdPrice),
  isDefault: id === 'research_24h',
  acceptedAssets: MONETIZATION_ASSETS,
}))

function cloneFeaturedCatalog(product: 'featured_farm' | 'featured_pool'): readonly PlacementPackage[] {
  const noun = product === 'featured_farm' ? 'Farm' : 'Pool'
  return FEATURED_PACKAGES.map((pkg) => ({
    ...pkg,
    id: `${product}_${String(pkg.id).replace('featured_', '')}` as FeaturedFarmPackageId | FeaturedPoolPackageId,
    product,
    label: `Featured ${noun} · ${pkg.durationLabel}`,
  }))
}

/** Same base price catalog as Featured Project; bundle discounts are calculated at checkout. */
export const FEATURED_FARM_PACKAGES = cloneFeaturedCatalog('featured_farm')
export const FEATURED_POOL_PACKAGES = cloneFeaturedCatalog('featured_pool')

export function getFeaturedPackage(id?: string | null): PlacementPackage {
  const found = FEATURED_PACKAGES.find((p) => p.id === id)
  return found ?? FEATURED_PACKAGES.find((p) => p.isDefault)!
}

export function getTrendBoostPackage(id?: string | null): PlacementPackage {
  const found = TREND_BOOST_PACKAGES.find((p) => p.id === id)
  return found ?? TREND_BOOST_PACKAGES.find((p) => p.isDefault)!
}

export function listFeaturedPackageIds(): FeaturedPackageId[] {
  return FEATURED_PACKAGES.map((p) => p.id as FeaturedPackageId)
}

export function listTrendBoostPackageIds(): TrendBoostPackageId[] {
  return TREND_BOOST_PACKAGES.map((p) => p.id as TrendBoostPackageId)
}

export function schedulePlacementWindow(durationMs: number, from = new Date()): { start: string; end: string } {
  const start = new Date(from)
  const end = new Date(from.getTime() + durationMs)
  return { start: start.toISOString(), end: end.toISOString() }
}
