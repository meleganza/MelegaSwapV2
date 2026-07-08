import contracts from 'config/constants/contracts'
import type { ResolvedMarcoToken } from './types'
import { readKerlMarcoToken, getKerlRegistryVersion } from './kerlRegistry'
import { readSmartRouterChainProfile, getSmartRouterRegistryVersion } from './smartRouterRegistry'
import smartRouterRegistry from '../../../../public/registry/smart-router/index.json'
import { D87_PRICING_REF } from '../types'

type SmartRouterIndex = {
  chains: Record<string, { marco?: { status?: string } }>
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  56: 'BNB Chain',
  97: 'BNB Testnet',
  137: 'Polygon',
  8453: 'Base',
}

const ENV_KEYS: Record<number, string> = {
  56: 'NEXT_PUBLIC_MARCO_TOKEN_BSC',
  97: 'NEXT_PUBLIC_MARCO_TOKEN_BSC_TESTNET',
  1: 'NEXT_PUBLIC_MARCO_TOKEN_ETH',
  137: 'NEXT_PUBLIC_MARCO_TOKEN_POLYGON',
  8453: 'NEXT_PUBLIC_MARCO_TOKEN_BASE',
}

function readMarcoFromEnv(chainId: number): string | undefined {
  const key = ENV_KEYS[chainId]
  if (!key) return undefined
  const value = process.env[key]?.trim()
  return value && value.startsWith('0x') ? value : undefined
}

function readStaticDevFallback(chainId: number): string | undefined {
  if (process.env.NODE_ENV === 'production') return undefined
  const address = contracts.marco?.[chainId as keyof typeof contracts.marco]
  return typeof address === 'string' && address.startsWith('0x') ? address : undefined
}

/**
 * Canonical resolution order:
 * 1. Treasury Runtime Registry (via smart-router chain profile asset ref — same addresses as KERL assets today)
 * 2. KERL Registry (asset registry)
 * 3. Environment
 * 4. Static dev fallback (non-production only)
 */
export function resolveMarcoToken(chainId: number): ResolvedMarcoToken {
  const chainName = CHAIN_NAMES[chainId] ?? `Chain ${chainId}`
  const profile = readSmartRouterChainProfile(chainId)
  const runtimeMarcoActive =
    (smartRouterRegistry as SmartRouterIndex).chains[String(chainId)]?.marco?.status === 'active'

  if (runtimeMarcoActive) {
    const kerl = readKerlMarcoToken(chainId)
    if (kerl.available && kerl.marcoTokenAddress) {
      return {
        chainId,
        chainName,
        marcoTokenAddress: kerl.marcoTokenAddress,
        status: 'active',
        resolution: {
          source: 'treasury-runtime',
          registryVersion: profile?.registryVersion ?? getSmartRouterRegistryVersion(),
          policyRef: D87_PRICING_REF,
          lastVerifiedAt: kerl.lastVerifiedAt,
        },
      }
    }
  }

  const kerl = readKerlMarcoToken(chainId)
  if (kerl.available && kerl.marcoTokenAddress) {
    return {
      chainId,
      chainName,
      marcoTokenAddress: kerl.marcoTokenAddress,
      status: 'active',
      resolution: {
        source: 'kerl',
        registryVersion: getKerlRegistryVersion(),
        policyRef: D87_PRICING_REF,
        lastVerifiedAt: kerl.lastVerifiedAt,
      },
    }
  }

  const envAddress = readMarcoFromEnv(chainId)
  if (envAddress) {
    return {
      chainId,
      chainName,
      marcoTokenAddress: envAddress,
      status: 'active',
      resolution: {
        source: 'env',
        policyRef: D87_PRICING_REF,
        lastVerifiedAt: new Date().toISOString().slice(0, 10),
      },
    }
  }

  const staticAddress = readStaticDevFallback(chainId)
  if (staticAddress) {
    return {
      chainId,
      chainName,
      marcoTokenAddress: staticAddress,
      status: 'active',
      resolution: {
        source: 'static-dev',
        policyRef: D87_PRICING_REF,
        lastVerifiedAt: '2026-06-26',
      },
    }
  }

  return {
    chainId,
    chainName,
    status: 'missing',
    resolution: {
      source: 'kerl',
      policyRef: D87_PRICING_REF,
      lastVerifiedAt: getKerlRegistryVersion(),
      unavailable: true,
    },
  }
}
