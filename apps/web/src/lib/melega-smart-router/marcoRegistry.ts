import contracts from 'config/constants/contracts'
import { MARCO_WAVE1_NETWORKS } from 'lib/marco-bridge/wave1Registry'
import type { MarcoRegistryEntry } from './types'
import { normalizeTokenAddress } from './registry/normalize'
import { resolveMarcoToken } from './registry/resolveMarcoToken'

export { normalizeTokenAddress }

/** Polygon chain whose public MARCO identity is the canonical OFT, not the archived ERC-20. */
export const POLYGON_CHAIN_ID = 137

/** Canonical Polygon OFT. Same address as the bridge wave-1 registry. */
export const POLYGON_CANONICAL_MARCO_ADDRESS = MARCO_WAVE1_NETWORKS.polygon.marcoIdentity

/**
 * Archived Polygon ERC-20. This remains `contracts.marco[137]` for farms, pools, and withdrawals.
 * It is not the public official MARCO.
 */
export const POLYGON_LEGACY_MARCO_ADDRESS = contracts.marco[POLYGON_CHAIN_ID]

export function isPolygonCanonicalMarco(chainId: number, address?: string | null): boolean {
  if (chainId !== POLYGON_CHAIN_ID || !address) return false
  const normalized = normalizeTokenAddress(address)
  return Boolean(normalized && normalized === normalizeTokenAddress(POLYGON_CANONICAL_MARCO_ADDRESS))
}

export function isPolygonLegacyMarco(chainId: number, address?: string | null): boolean {
  if (chainId !== POLYGON_CHAIN_ID || !address) return false
  const normalized = normalizeTokenAddress(address)
  return Boolean(normalized && normalized === normalizeTokenAddress(POLYGON_LEGACY_MARCO_ADDRESS))
}

/** Address lookup, or a query that names the archived token. Plain "MARCO" is not explicit. */
export function isExplicitLegacyMarcoLookup(query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return false
  if (trimmed.includes('legacy')) return true
  const normalized = normalizeTokenAddress(trimmed)
  return Boolean(normalized && normalized === normalizeTokenAddress(POLYGON_LEGACY_MARCO_ADDRESS))
}

export function getMarcoRegistryEntry(chainId: number): MarcoRegistryEntry {
  const resolved = resolveMarcoToken(chainId)
  return {
    chainId: resolved.chainId,
    chainName: resolved.chainName,
    marcoTokenAddress: resolved.marcoTokenAddress,
    status: resolved.status,
    source: resolved.resolution.source,
    lastVerifiedAt: resolved.resolution.lastVerifiedAt,
    registryVersion: resolved.resolution.registryVersion,
  }
}

export function isBuyMarcoByAddress(chainId: number, outputAddress?: string | null): boolean {
  if (!outputAddress) return false
  if (chainId === POLYGON_CHAIN_ID) return isPolygonCanonicalMarco(chainId, outputAddress)
  const entry = getMarcoRegistryEntry(chainId)
  if (!entry.marcoTokenAddress) return false
  return normalizeTokenAddress(outputAddress) === normalizeTokenAddress(entry.marcoTokenAddress)
}

export function isSellMarcoByAddress(
  chainId: number,
  inputAddress?: string | null,
  outputAddress?: string | null,
): boolean {
  const entry = getMarcoRegistryEntry(chainId)
  if (!entry.marcoTokenAddress || !inputAddress) return false
  const inputIsMarco =
    normalizeTokenAddress(inputAddress) === normalizeTokenAddress(entry.marcoTokenAddress)
  if (!inputIsMarco) return false
  return !isBuyMarcoByAddress(chainId, outputAddress)
}

export function isChainMarcoToken(chainId: number, tokenAddress?: string | null): boolean {
  const entry = getMarcoRegistryEntry(chainId)
  if (!entry.marcoTokenAddress || !tokenAddress) return false
  return normalizeTokenAddress(tokenAddress) === normalizeTokenAddress(entry.marcoTokenAddress)
}
