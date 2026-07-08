import type { ResolvedTreasuryCollector } from './types'
import { readKerlTreasuryCollector } from './kerlRegistry'
import {
  getTreasuryRuntimeRegistryVersion,
  isTreasuryRuntimeRegistryUnavailable,
  readTreasuryRuntimeCollector,
} from './runtimeRegistry'
import { FSC_01_POLICY_REF } from '../types'

const ENV_KEYS: Record<number, string> = {
  56: 'NEXT_PUBLIC_TREASURY_COLLECTOR_BSC',
  97: 'NEXT_PUBLIC_TREASURY_COLLECTOR_BSC_TESTNET',
  1: 'NEXT_PUBLIC_TREASURY_COLLECTOR_ETH',
  137: 'NEXT_PUBLIC_TREASURY_COLLECTOR_POLYGON',
  8453: 'NEXT_PUBLIC_TREASURY_COLLECTOR_BASE',
}

function readCollectorFromEnv(chainId: number): string | undefined {
  const key = ENV_KEYS[chainId]
  if (!key) return undefined
  const value = process.env[key]?.trim()
  return value && value.startsWith('0x') ? value : undefined
}

/**
 * Canonical resolution order:
 * 1. Treasury Runtime Registry
 * 2. KERL Registry
 * 3. Environment fallback
 */
export function resolveTreasuryCollector(chainId: number): ResolvedTreasuryCollector {
  if (!isTreasuryRuntimeRegistryUnavailable()) {
    const runtime = readTreasuryRuntimeCollector(chainId)
    if (runtime.available && runtime.collectorAddress) {
      return {
        chainId,
        collectorAddress: runtime.collectorAddress,
        status: 'active',
        resolution: {
          source: 'treasury-runtime',
          registryVersion: getTreasuryRuntimeRegistryVersion(),
          collectorVersion: runtime.collectorVersion,
          policyRef: runtime.policyRef,
          lastVerifiedAt: runtime.lastVerifiedAt,
        },
      }
    }
  }

  const kerl = readKerlTreasuryCollector(chainId)
  if (kerl.available && kerl.collectorAddress) {
    return {
      chainId,
      collectorAddress: kerl.collectorAddress,
      status: 'active',
      resolution: {
        source: 'kerl',
        collectorVersion: kerl.collectorVersion,
        policyRef: FSC_01_POLICY_REF,
        lastVerifiedAt: kerl.lastVerifiedAt,
      },
    }
  }

  const envAddress = readCollectorFromEnv(chainId)
  if (envAddress) {
    return {
      chainId,
      collectorAddress: envAddress,
      status: 'active',
      resolution: {
        source: 'env',
        policyRef: FSC_01_POLICY_REF,
        lastVerifiedAt: new Date().toISOString().slice(0, 10),
      },
    }
  }

  const runtime = readTreasuryRuntimeCollector(chainId)
  return {
    chainId,
    status: runtime.status === 'planned' ? 'planned' : 'missing',
    resolution: {
      source: 'treasury-runtime',
      registryVersion: getTreasuryRuntimeRegistryVersion(),
      policyRef: FSC_01_POLICY_REF,
      lastVerifiedAt: runtime.lastVerifiedAt,
      unavailable: true,
    },
  }
}
