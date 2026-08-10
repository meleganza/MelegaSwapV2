/**
 * Canonical Project Page routing — claimed `/@slug` vs unclaimed `/token/{chain}/{address}`.
 * Discovery surfaces must use this SSOT. `/swap?outputCurrency=` remains execution-only.
 */
import { normalizeEvmAddress } from 'registry/projects/identity/caip'
import {
  resolveProjectByContractAddress,
  resolveProjectBySlug,
  normalizeProjectSlugInput,
} from 'registry/projects/identity/resolveProject'
import { canonicalProjectPath } from 'registry/projects/identity/normalizeProject'

/** Public chain path segment for `/token/{chain}/{address}`. */
export const CHAIN_PATH_BY_ID: Record<number, string> = {
  1: 'eth',
  56: 'bsc',
  137: 'polygon',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avalanche',
}

export const CHAIN_ID_BY_PATH: Record<string, number> = {
  eth: 1,
  ethereum: 1,
  bsc: 56,
  bnb: 56,
  polygon: 137,
  matic: 137,
  base: 8453,
  arbitrum: 42161,
  arb: 42161,
  avalanche: 43114,
  avax: 43114,
}

export function chainPathForId(chainId: number): string {
  return CHAIN_PATH_BY_ID[chainId] ?? String(chainId)
}

export function chainIdFromPath(chain: string | undefined | null): number | null {
  if (!chain || typeof chain !== 'string') return null
  const key = chain.trim().toLowerCase()
  if (CHAIN_ID_BY_PATH[key] != null) return CHAIN_ID_BY_PATH[key]
  const asNum = Number(key)
  if (Number.isFinite(asNum) && asNum > 0) return asNum
  return null
}

export function canonicalTokenPath(chainId: number, address: string): string {
  const normalized = normalizeEvmAddress(address)
  if (!normalized) return '/projects'
  return `/token/${chainPathForId(chainId)}/${normalized}`
}

export type CanonicalProjectHrefInput = {
  chainId?: number | null
  address?: string | null
  slug?: string | null
}

/**
 * Resolve the public Project Page destination for a token/project.
 * Prefer registry slug when known; otherwise anonymous `/token/{chain}/{address}`.
 * Never invents a fake `/@slug`.
 */
export function resolveCanonicalProjectHref(input: CanonicalProjectHrefInput): string {
  const slugNorm = input.slug ? normalizeProjectSlugInput(input.slug) : null
  if (slugNorm) {
    const bySlug = resolveProjectBySlug(slugNorm)
    if (bySlug.ok) return canonicalProjectPath(bySlug.slug)
  }

  const address = input.address ? normalizeEvmAddress(input.address) : null
  if (address) {
    const byAddr = resolveProjectByContractAddress(address)
    if (byAddr) return canonicalProjectPath(byAddr.slug)
    const chainId = input.chainId && Number.isFinite(input.chainId) ? Number(input.chainId) : 56
    return canonicalTokenPath(chainId, address)
  }

  if (slugNorm) {
    // Slug provided but not in registry — do not invent a project page.
    return '/projects'
  }

  return '/projects'
}

export function resolveClaimedSlugForToken(chainId: number, address: string): string | null {
  const normalized = normalizeEvmAddress(address)
  if (!normalized) return null
  const project = resolveProjectByContractAddress(normalized)
  if (!project) return null
  const match = project.resources.tokens.some(
    (t) => t.chainId === chainId && normalizeEvmAddress(t.address) === normalized,
  )
  // Address may exist on another chain under the same project — still claim→slug.
  if (!match && !project.resources.tokens.some((t) => normalizeEvmAddress(t.address) === normalized)) {
    return null
  }
  return project.slug
}
