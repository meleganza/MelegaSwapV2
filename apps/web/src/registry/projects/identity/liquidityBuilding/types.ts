import type {
  LIQUIDITY_BUILDING_RESOLVER_REVISION,
  PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION,
  PROJECT_PAGE_LIQUIDITY_BUILDING_SUMMARY_EXTENSION,
  LbActivationState,
  LbAvailability,
  LbCapabilityStatus,
  LbReasonCode,
  LbSourceClass,
} from './schema'

export interface LiquidityBuildingDestination {
  href: string
  label: string
  availability: LbAvailability
  reasonCode: LbReasonCode | null
  limitations: string[]
}

export interface LiquidityBuildingCapability {
  capabilityId: 'LIQUIDITY_BUILDING'
  projectId: string
  chainId: number | null
  availability: LbAvailability
  status: LbCapabilityStatus
  source: LbSourceClass | null
  destination: LiquidityBuildingDestination | null
  runtimeVersion: string | null
  activationState: LbActivationState
  limitations: string[]
}

export interface LiquidityBuildingWarning {
  reasonCode: LbReasonCode
  message: string
  chainId: number | null
}

export interface ProjectLiquidityBuildingDocument {
  schemaVersion: typeof PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  liquidityBuildingRevision: string
  resolverRevision: typeof LIQUIDITY_BUILDING_RESOLVER_REVISION
  generatedAt: string
  capability: LiquidityBuildingCapability
  supportedChains: number[]
  destination: LiquidityBuildingDestination | null
  activationState: LbActivationState
  availability: LbAvailability
  warnings: LiquidityBuildingWarning[]
  limitations: readonly string[]
  /** Hero may surface LB only when true — melega-dex keeps Swap as primary. */
  heroActionAllowed: boolean
}

export interface LiquidityBuildingSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_LIQUIDITY_BUILDING_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION
  supported: boolean
  activationState: LbActivationState
  endpoint: string
  revision: string
}
