import type { MarcoRegistryEntry } from './types'
import { normalizeTokenAddress } from './registry/normalize'
import { resolveMarcoToken } from './registry/resolveMarcoToken'

export { normalizeTokenAddress }

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
  const entry = getMarcoRegistryEntry(chainId)
  if (!entry.marcoTokenAddress || !outputAddress) return false
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
