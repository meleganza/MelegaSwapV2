import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { buildDexAssetIndex } from './buildDexAssetIndex'
import type { DexAssetRecord } from './types'

export interface DexIndexedToken {
  symbol: string
  address: string
  chainId: number
  sources: Array<'registry' | 'farm' | 'pool' | 'liquidity' | 'canonical' | 'token-list' | 'venue' | 'asset-registry'>
  registryProject?: EnrichedProjectRecord
  logo?: string
  logoFallback?: 'initials' | 'generic'
  status?: string
  surfaces?: DexAssetRecord['surfaces']
}

function toDexIndexedToken(asset: DexAssetRecord): DexIndexedToken | null {
  if (!asset.address) return null
  const sources = asset.sources.filter(
    (source): source is DexIndexedToken['sources'][number] =>
      source === 'registry' ||
      source === 'farm' ||
      source === 'pool' ||
      source === 'liquidity' ||
      source === 'canonical' ||
      source === 'token-list' ||
      source === 'venue' ||
      source === 'asset-registry',
  )
  const registryProject = asset.registrySlug
    ? getAllProjects()
        .map(enrichProject)
        .find((project) => project.slug === asset.registrySlug)
    : undefined

  return {
    symbol: asset.symbol,
    address: asset.address,
    chainId: asset.chainId,
    sources: sources.length ? sources : ['liquidity'],
    registryProject,
    logo: asset.logo,
    logoFallback: asset.logoFallback,
    status: asset.status,
    surfaces: asset.surfaces,
  }
}

/** Shared DEX asset projection consumed by search, projects, trending and Home. */
export function buildDexTokenIndex(): DexIndexedToken[] {
  return buildDexAssetIndex()
    .map(toDexIndexedToken)
    .filter((entry): entry is DexIndexedToken => Boolean(entry))
}

export function dexIndexToEnrichedProjects(index: DexIndexedToken[]): EnrichedProjectRecord[] {
  const registry = getAllProjects().map(enrichProject)
  const registryAddresses = new Set(
    registry.flatMap((project) =>
      project.resources.tokens.map((token) => `${token.chainId}:${token.address?.toLowerCase()}`),
    ),
  )

  // Attach indexed tokens only to existing registry projects; never create synthetic clones.
  index.forEach((entry) => {
    if (entry.registryProject) return
    const key = `${entry.chainId}:${entry.address.toLowerCase()}`
    if (!registryAddresses.has(key)) return
  })

  return registry.sort((left, right) => {
    const leftMarco = left.slug === 'melega-dex'
    const rightMarco = right.slug === 'melega-dex'
    if (leftMarco && !rightMarco) return -1
    if (rightMarco && !leftMarco) return 1
    return left.displayName.localeCompare(right.displayName)
  })
}
