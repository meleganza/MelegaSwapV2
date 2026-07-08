import treasuryRegistry from '../../../../public/registry/treasury/index.json'
import type { RegistryStatus } from '../types'

export interface TreasuryRuntimeChainRecord {
  chainId: number
  chainName?: string
  status: RegistryStatus | 'planned'
  collector: string | null
  collectorVersion: string | null
  policyRef: string
  lastVerification: string
  notes?: string
}

type TreasuryRegistryIndex = {
  registryVersion: string
  policyRef: string
  chains: Record<string, TreasuryRuntimeChainRecord>
}

const index = treasuryRegistry as TreasuryRegistryIndex

export function getTreasuryRuntimeRegistryVersion(): string {
  return index.registryVersion
}

export function readTreasuryRuntimeCollector(chainId: number): {
  available: boolean
  collectorAddress?: string
  collectorVersion?: string | null
  policyRef: string
  status: RegistryStatus
  lastVerifiedAt: string
} {
  const record = index.chains[String(chainId)]
  if (!record) {
    return {
      available: false,
      policyRef: index.policyRef,
      status: 'missing',
      lastVerifiedAt: index.registryVersion,
    }
  }

  const address = record.collector?.trim()
  const hasAddress = Boolean(address && address.startsWith('0x'))

  return {
    available: hasAddress,
    collectorAddress: hasAddress ? address! : undefined,
    collectorVersion: record.collectorVersion,
    policyRef: record.policyRef,
    status: hasAddress ? 'active' : record.status === 'planned' ? 'planned' : 'missing',
    lastVerifiedAt: record.lastVerification,
  }
}

export function isTreasuryRuntimeRegistryUnavailable(): boolean {
  return !index.chains || Object.keys(index.chains).length === 0
}
