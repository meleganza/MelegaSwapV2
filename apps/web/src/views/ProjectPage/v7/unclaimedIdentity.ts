/**
 * Anonymous / unclaimed Project Page identity — factual token metadata only.
 */
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import {
  MARKET_RESOLVER_REVISION,
  PROJECT_MARKETS_SCHEMA_VERSION,
} from 'registry/projects/identity/markets/schema'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import { buildDexAssetIndex } from 'lib/dex-asset-index'
import { chainIdFromPath, canonicalTokenPath } from 'lib/projects/canonicalProjectHref'

export type UnclaimedTokenIdentity = {
  chainId: number
  address: string
  symbol: string
  name: string
  logoUrl?: string
  decimals: number
  /** Synthetic slug for chart/market hooks — never a public /@ route. */
  syntheticSlug: string
}

export function resolveUnclaimedTokenIdentity(
  chainPath: string,
  addressRaw: string,
): UnclaimedTokenIdentity | null {
  const chainId = chainIdFromPath(chainPath)
  const address = normalizeEvmAddress(addressRaw)
  if (chainId == null || !address) return null

  const asset = buildDexAssetIndex().find(
    (a) => a.chainId === chainId && a.address && normalizeEvmAddress(a.address) === address,
  )

  const symbol = asset?.symbol || `${address.slice(0, 6)}…${address.slice(-4)}`
  const name = asset?.name || symbol
  return {
    chainId,
    address,
    symbol,
    name,
    logoUrl: asset?.logo,
    decimals: 18,
    syntheticSlug: `token-${chainId}-${address.slice(2, 10).toLowerCase()}`,
  }
}

/** Minimal markets document so chart/swap embeds can mount without a registry project. */
export function buildUnclaimedMarketsDocument(identity: UnclaimedTokenIdentity): ProjectMarketsDocument {
  const generatedAt = new Date().toISOString()
  const canonicalUrl = `https://www.melega.finance${canonicalTokenPath(identity.chainId, identity.address)}`
  return {
    schemaVersion: PROJECT_MARKETS_SCHEMA_VERSION,
    projectId: `unclaimed:${identity.chainId}:${identity.address.toLowerCase()}`,
    slug: identity.syntheticSlug,
    canonicalUrl,
    projectRevision: 'unclaimed',
    marketRevision: 'unclaimed',
    resolverRevision: MARKET_RESOLVER_REVISION,
    generatedAt,
    summary: {
      marketSupport: 'UNAVAILABLE',
      activeMarketCount: 0,
      registeredMarketCount: 0,
      supportedMarketChains: [identity.chainId],
      canonicalProjectAssetId: null,
      preferredMarketIds: [],
      marketsEndpoint: '',
      schemaVersion: PROJECT_MARKETS_SCHEMA_VERSION,
      lastObservationAt: null,
      partial: true,
      conflicted: false,
    },
    assets: [
      {
        assetId: `asset:${identity.chainId}:${identity.address.toLowerCase()}`,
        chainId: identity.chainId,
        symbol: identity.symbol,
        contractAddress: identity.address,
        projectRole: 'PRIMARY',
        marketEnabled: true,
      },
    ],
    markets: [],
    preferredMarkets: [],
    swapDestinations: [],
    dataSources: ['dex-asset-index'],
    availability: 'UNAVAILABLE',
    warnings: [],
    limitations: ['Unclaimed token — no registry markets document.'],
    capabilities: {
      VIEW_MARKETS: 'UNAVAILABLE',
      SWAP: 'AVAILABLE',
      BUY_PROJECT_ASSET: 'AVAILABLE',
      SELL_PROJECT_ASSET: 'AVAILABLE',
    },
  }
}

export function buildRelatedPreviewCard(p: {
  slug: string
  displayName: string
  symbol: string
  address?: string
  chainId: number
  logoUrl?: string
  href: string
}): import('views/ProjectsStudio/projectsStudioData').ProjectPreviewCard {
  return {
    id: p.slug,
    rank: 0,
    name: p.displayName,
    slug: p.slug,
    symbol: p.symbol,
    category: 'DeFi',
    chains: [p.chainId === 56 ? 'BSC' : String(p.chainId)],
    chainId: p.chainId,
    status: 'verified',
    verified: true,
    featured: true,
    rating: 0,
    ratingTier: 'unknown',
    aiSummary: '',
    metrics: [],
    aiConfidence: '—',
    melegaRating: '—',
    risk: '—',
    riskTone: 'gray',
    website: '',
    contract: p.address ?? '',
    contractAddress: p.address,
    logoURI: p.logoUrl,
    projectHref: p.href,
    tradeHref: p.address
      ? `/swap?outputCurrency=${p.address}&chain=${p.chainId}&source=project-page-related`
      : '/swap',
  }
}
