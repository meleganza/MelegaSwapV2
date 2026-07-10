import smartRouterRegistry from '../../../../public/registry/smart-router/index.json'
import type { SmartRouterChainProfile } from './types'
import type { RegistryStatus } from '../types'

type SmartRouterIndex = {
  registryVersion: string
  chains: Record<
    string,
    {
      chainId: number
      chainName: string
      status: string
      wrapperAddress?: string | null
      wrapperVersion?: number
      validationStatus?: string
      validationCertificate?: string
      treasuryCollector?: string | null
      supportedAssets?: string[]
      executableRouteTypes?: string[]
      executionRouter?: { address?: string | null; label?: string; status?: string }
      wrapper?: { address?: string | null; status?: string; version?: number }
      marco?: { assetRef?: string; status?: string }
      lastVerification?: string
      registryVersion?: string
    }
  >
}

const index = smartRouterRegistry as SmartRouterIndex

export function getSmartRouterRegistryVersion(): string {
  return index.registryVersion
}

export function readSmartRouterChainProfile(chainId: number): SmartRouterChainProfile | null {
  const record = index.chains[String(chainId)]
  if (!record) return null

  return {
    chainId: record.chainId,
    chainName: record.chainName,
    executionRouter: record.executionRouter?.address ?? undefined,
    executionRouterLabel: record.executionRouter?.label,
    wrapperAddress: record.wrapperAddress ?? record.wrapper?.address ?? undefined,
    wrapperStatus: (record.wrapper?.status as RegistryStatus) ?? 'planned',
    wrapperVersion: record.wrapperVersion ?? record.wrapper?.version,
    validationStatus: record.validationStatus,
    validationCertificate: record.validationCertificate,
    treasuryCollector: record.treasuryCollector ?? undefined,
    supportedAssets: record.supportedAssets,
    executableRouteTypes: record.executableRouteTypes,
    registryVersion: record.registryVersion ?? index.registryVersion,
    lastVerification: record.lastVerification,
  }
}
