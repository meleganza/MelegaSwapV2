import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { enrichProject } from 'registry/projects/discovery'
import { buildDexAssetIndex, type DexAssetRecord } from 'lib/dex-asset-index'

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
    (s): s is DexIndexedToken['sources'][number] =>
      s === 'registry' ||
      s === 'farm' ||
      s === 'pool' ||
      s === 'liquidity' ||
      s === 'canonical' ||
      s === 'token-list' ||
      s === 'venue' ||
      s === 'asset-registry',
  )
  const registryProject = asset.registrySlug
    ? getAllProjects()
        .map(enrichProject)
        .find((p) => p.slug === asset.registrySlug)
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

/** Union registry + configured farm/pool/liquidity tokens for Radar/Trending discovery. */
export function buildDexTokenIndex(): DexIndexedToken[] {
  return buildDexAssetIndex()
    .map(toDexIndexedToken)
    .filter((entry): entry is DexIndexedToken => Boolean(entry))
}

export function dexIndexToEnrichedProjects(index: DexIndexedToken[]): EnrichedProjectRecord[] {
  const registry = getAllProjects().map(enrichProject)
  const registryAddresses = new Set(
    registry.flatMap((p) => p.resources.tokens.map((t) => `${t.chainId}:${t.address?.toLowerCase()}`)),
  )

  // R781 — attach indexed tokens to existing registry projects only; no synthetic dex-{symbol} clones.
  index.forEach((entry) => {
    if (entry.registryProject) return
    const key = `${entry.chainId}:${entry.address.toLowerCase()}`
    if (!registryAddresses.has(key)) return
  })

  return registry.sort((a, b) => {
    const aMarco = a.slug === 'melega-dex'
    const bMarco = b.slug === 'melega-dex'
    if (aMarco && !bMarco) return -1
    if (bMarco && !aMarco) return 1
    return a.displayName.localeCompare(b.displayName)
  })
}
