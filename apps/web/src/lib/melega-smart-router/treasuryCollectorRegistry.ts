import type { TreasuryCollectorEntry } from './types'
import { FSC_01_POLICY_REF } from './types'
import { resolveTreasuryCollector } from './registry/resolveTreasuryCollector'

export function getTreasuryCollectorEntry(chainId: number): TreasuryCollectorEntry {
  const resolved = resolveTreasuryCollector(chainId)
  return {
    chainId,
    collectorAddress: resolved.collectorAddress,
    status: resolved.status,
    source: resolved.resolution.source,
    policyRef: FSC_01_POLICY_REF,
    lastVerifiedAt: resolved.resolution.lastVerifiedAt,
    registryVersion: resolved.resolution.registryVersion,
    collectorVersion: resolved.resolution.collectorVersion,
  }
}
