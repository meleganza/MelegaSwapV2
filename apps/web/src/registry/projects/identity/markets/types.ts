import type {
  CANONICAL_SWAP_ROUTE,
  MARKET_RESOLVER_REVISION,
  PROJECT_MARKETS_SCHEMA_VERSION,
  PROJECT_PAGE_MARKETS_SUMMARY_EXTENSION,
  MarketAvailability,
  MarketReasonCode,
  MarketSourceClass,
  MarketStatus,
  MarketType,
  MarketVerificationLevel,
} from './schema'

export interface ProjectMarketRecord {
  marketId: string
  projectId: string
  marketType: MarketType
  chainId: number
  caip2: string
  venue: string
  venueSlug: string | null
  baseAssetId: string
  quoteAssetId: string
  baseSymbol: string
  quoteSymbol: string
  pairOrPoolContractId: string
  factoryContractId: string | null
  routerContractId: string | null
  status: MarketStatus
  availability: MarketAvailability
  source: MarketSourceClass
  verification: MarketVerificationLevel
  observedAt: string
  updatedAt: string
  dataRevision: string
  swapDestinationId: string | null
  displayLabel: string
  limitations: string[]
  reasonCode: MarketReasonCode | null
}

export interface SwapDestinationDescriptor {
  destinationId: string
  projectId: string
  marketId: string | null
  chainId: number
  inputAssetId: string
  outputAssetId: string
  inputCurrencyParam: string
  outputCurrencyParam: string
  route: typeof CANONICAL_SWAP_ROUTE
  href: string
  queryParameters: Record<string, string>
  walletRequired: boolean
  chainSwitchMayBeRequired: boolean
  availability: MarketAvailability
  status: 'READY' | 'UNAVAILABLE' | 'PAUSED' | 'CONFLICTED'
  reasonCode: MarketReasonCode | null
  label: string
  limitations: string[]
}

export interface ProjectMarketAssetSummary {
  assetId: string
  chainId: number
  symbol: string
  contractAddress: string | null
  projectRole: string
  marketEnabled: boolean
}

export interface ProjectMarketsSummary {
  marketSupport: MarketAvailability
  activeMarketCount: number
  registeredMarketCount: number
  supportedMarketChains: number[]
  canonicalProjectAssetId: string | null
  preferredMarketIds: string[]
  marketsEndpoint: string
  schemaVersion: typeof PROJECT_MARKETS_SCHEMA_VERSION
  lastObservationAt: string | null
  partial: boolean
  conflicted: boolean
}

export interface ProjectMarketsWarning {
  reasonCode: MarketReasonCode
  message: string
  marketId: string | null
  chainId: number | null
}

export interface ProjectMarketsDocument {
  schemaVersion: typeof PROJECT_MARKETS_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  marketRevision: string
  resolverRevision: typeof MARKET_RESOLVER_REVISION
  generatedAt: string
  summary: ProjectMarketsSummary
  assets: ProjectMarketAssetSummary[]
  markets: ProjectMarketRecord[]
  preferredMarkets: ProjectMarketRecord[]
  swapDestinations: SwapDestinationDescriptor[]
  dataSources: string[]
  availability: MarketAvailability
  warnings: ProjectMarketsWarning[]
  limitations: readonly string[]
  capabilities: {
    VIEW_MARKETS: MarketAvailability
    SWAP: MarketAvailability
    BUY_PROJECT_ASSET: MarketAvailability
    SELL_PROJECT_ASSET: MarketAvailability
  }
}

export interface MarketsSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_MARKETS_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_MARKETS_SCHEMA_VERSION
  marketSupport: MarketAvailability
  activeMarketCount: number
  supportedMarketChains: number[]
  canonicalProjectAssetId: string | null
  preferredMarketIds: string[]
  marketsEndpoint: string
  lastObservationAt: string | null
  partial: boolean
  conflicted: boolean
}

/** Optional wallet chain context — never serialized into public market docs as wallet identity. */
export interface MarketResolutionContext {
  connectedChainId?: number | null
  generatedAt?: string
}
