import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { CapabilityStatus, StaticProjectRecord } from 'registry/projects/types'
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

const capabilityFromSource = (active: boolean): CapabilityStatus => (active ? 'live' : 'planned')

export function dexIndexToEnrichedProjects(index: DexIndexedToken[]): EnrichedProjectRecord[] {
  const staticRegistry = getAllProjects()
  const registry = staticRegistry.map(enrichProject)
  const registrySlugs = new Set(registry.map((p) => p.slug))
  const template = staticRegistry[0]
  if (!template) return registry

  const synthetic: EnrichedProjectRecord[] = []
  index.forEach((entry) => {
    if (entry.registryProject) return
    if (entry.surfaces && !entry.surfaces.project && !entry.surfaces.trending) return
    const slug = `dex-${entry.symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    if (registrySlugs.has(slug)) return

    const hasFarm = entry.sources.includes('farm') || entry.surfaces?.farm
    const hasPool = entry.sources.includes('pool') || entry.surfaces?.pool
    const hasLiquidity = entry.sources.includes('liquidity') || hasFarm || hasPool
    const tokenRef = {
      symbol: entry.symbol,
      address: entry.address,
      chainId: entry.chainId,
      ref: `token://${entry.chainId}/${entry.address}`,
    }

    const staticRecord: StaticProjectRecord = {
      ...template,
      upi: `upi://melega/project/${slug}@1`,
      slug,
      displayName: entry.symbol,
      tagline: `${entry.symbol} on Melega DEX`,
      description: `${entry.symbol} indexed from Melega farm, pool, token list, or liquidity surfaces.`,
      registryStatus: 'listed',
      phase: 'registered',
      verificationStatus: entry.sources.includes('canonical') ? 'observed' : 'unverified',
      trustBadges: entry.sources.includes('canonical') ? ['canonical', 'observed'] : ['observed'],
      isCanonical: entry.sources.includes('canonical'),
      sectorTags: ['DeFi'],
      supportedChains: [entry.chainId],
      resources: {
        tokens: [tokenRef],
        liquidityPools: [],
        farms: hasFarm ? [`farm://${entry.chainId}/${entry.symbol}`] : [],
        stakingPools: hasPool ? [`pool://${entry.chainId}/${entry.symbol}`] : [],
      },
      capabilities: {
        ...template.capabilities,
        tradable: { status: capabilityFromSource(hasLiquidity || entry.sources.includes('canonical')) },
        liquidity: { status: capabilityFromSource(hasLiquidity) },
        farm: { status: capabilityFromSource(hasFarm) },
        pool: { status: capabilityFromSource(hasPool) },
        radar: { status: 'live', notes: 'Indexed via Melega Radar runtime' },
      },
      primaryTokenRefs: [tokenRef.ref],
      deepLinks: {
        swap: '/swap',
        farms: hasFarm ? '/farms' : undefined,
        pools: hasPool ? '/pools' : undefined,
      },
      asOf: template.asOf,
    }

    synthetic.push(enrichProject(staticRecord))
    registrySlugs.add(slug)
  })

  return [...registry, ...synthetic].sort((a, b) => {
    const aMarco = a.slug === 'melega-dex'
    const bMarco = b.slug === 'melega-dex'
    if (aMarco && !bMarco) return -1
    if (bMarco && !aMarco) return 1
    return a.displayName.localeCompare(b.displayName)
  })
}
