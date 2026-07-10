import type { RegistryStatus } from '../types'

export type RegistryResolutionSource =
  | 'treasury-runtime'
  | 'kerl'
  | 'env'
  | 'static-dev'

export interface RegistryResolutionMeta {
  source: RegistryResolutionSource
  registryVersion?: string
  collectorVersion?: string | null
  policyRef: string
  lastVerifiedAt: string
  unavailable?: boolean
}

export interface ResolvedTreasuryCollector {
  chainId: number
  collectorAddress?: string
  status: RegistryStatus
  resolution: RegistryResolutionMeta
}

export interface ResolvedMarcoToken {
  chainId: number
  chainName: string
  marcoTokenAddress?: string
  status: RegistryStatus
  resolution: RegistryResolutionMeta
}

export interface SmartRouterChainProfile {
  chainId: number
  chainName: string
  executionRouter?: string
  executionRouterLabel?: string
  wrapperAddress?: string
  wrapperStatus: RegistryStatus
  wrapperVersion?: number
  validationStatus?: string
  validationCertificate?: string
  treasuryCollector?: string
  supportedAssets?: string[]
  executableRouteTypes?: string[]
  collectorSource?: RegistryResolutionSource
  collectorAddress?: string
  marcoSource?: RegistryResolutionSource
  marcoAddress?: string
  registryVersion?: string
  lastVerification?: string
}
