import type { ResolvedTreasuryCollector } from './types'
import { readKerlTreasuryCollector } from './kerlRegistry'
import {
  getTreasuryRuntimeRegistryVersion,
  readTreasuryRuntimeCollector,
} from './runtimeRegistry'
import { FSC_01_POLICY_REF } from '../types'
import {
  MELEGA_TREASURY_WALLET_ADDRESS,
  resolveCanonicalFeeBeneficiary,
} from 'config/dexEconomicAuthority'

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
 * Canonical resolution order (Treasury Runtime decommissioned):
 * 1. DEX economic authority (mainnet MELEGA TREASURY WALLET)
 * 2. Environment (testnet-only alternates permitted; mainnet must match canonical)
 * 3. KERL Registry (legacy read — never preferred over canonical)
 *
 * Treasury Runtime registry is not an active authority source.
 */
export function resolveTreasuryCollector(chainId: number): ResolvedTreasuryCollector {
  const canonical = resolveCanonicalFeeBeneficiary(chainId)
  if (canonical) {
    return {
      chainId,
      collectorAddress: canonical.address,
      status: 'active',
      resolution: {
        source: 'dex-economic-authority',
        policyRef: FSC_01_POLICY_REF,
        lastVerifiedAt: new Date().toISOString().slice(0, 10),
      },
    }
  }

  const envAddress = readCollectorFromEnv(chainId)
  if (envAddress) {
    // Mainnet must never diverge from the canonical wallet via env override.
    if (chainId === 56 && envAddress.toLowerCase() !== MELEGA_TREASURY_WALLET_ADDRESS.toLowerCase()) {
      return {
        chainId,
        collectorAddress: MELEGA_TREASURY_WALLET_ADDRESS,
        status: 'active',
        resolution: {
          source: 'dex-economic-authority',
          policyRef: FSC_01_POLICY_REF,
          lastVerifiedAt: new Date().toISOString().slice(0, 10),
        },
      }
    }
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

  // Historical Treasury Runtime registry — decommissioned; do not treat as active authority.
  const runtime = readTreasuryRuntimeCollector(chainId)
  if (runtime.available && runtime.collectorAddress && chainId !== 56) {
    return {
      chainId,
      collectorAddress: runtime.collectorAddress,
      status: 'active',
      resolution: {
        source: 'env',
        registryVersion: getTreasuryRuntimeRegistryVersion(),
        collectorVersion: runtime.collectorVersion,
        policyRef: runtime.policyRef,
        lastVerifiedAt: runtime.lastVerifiedAt,
      },
    }
  }

  return {
    chainId,
    status: 'missing',
    resolution: {
      source: 'dex-economic-authority',
      registryVersion: getTreasuryRuntimeRegistryVersion(),
      policyRef: FSC_01_POLICY_REF,
      lastVerifiedAt: runtime.lastVerifiedAt,
      unavailable: true,
    },
  }
}
