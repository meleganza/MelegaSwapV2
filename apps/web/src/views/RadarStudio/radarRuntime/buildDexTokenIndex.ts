import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getAllVenues } from 'registry/venues/getAllVenues'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { CapabilityStatus, StaticProjectRecord } from 'registry/projects/types'
import { bscTokens } from '@pancakeswap/tokens'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'

export interface DexIndexedToken {
  symbol: string
  address: string
  chainId: number
  sources: Array<'registry' | 'farm' | 'pool' | 'liquidity' | 'canonical'>
  registryProject?: EnrichedProjectRecord
}

const KNOWN_FARM_LP_SYMBOLS = ['MARCO-BNB', 'MARCO-BUSD', 'MXMX-BNB', 'MXMX-BUSD'] as const

const KNOWN_POOL_SYMBOLS = ['MARCO', 'MXMX', 'BabyMarco'] as const

function marcoFirst(a: DexIndexedToken, b: DexIndexedToken): number {
  const aMarco =
    a.address.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase() ||
    a.symbol.toUpperCase() === 'MARCO'
  const bMarco =
    b.address.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase() ||
    b.symbol.toUpperCase() === 'MARCO'
  if (aMarco && !bMarco) return -1
  if (bMarco && !aMarco) return 1
  const sourceRank = (t: DexIndexedToken) =>
    t.sources.includes('registry') ? 0 : t.sources.includes('pool') ? 1 : t.sources.includes('farm') ? 2 : 3
  const sa = sourceRank(a)
  const sb = sourceRank(b)
  if (sa !== sb) return sa - sb
  return a.symbol.localeCompare(b.symbol)
}

/** Union registry + configured farm/pool/liquidity tokens for Radar/Trending discovery. */
export function buildDexTokenIndex(): DexIndexedToken[] {
  const byKey = new Map<string, DexIndexedToken>()

  const registryProjects = getAllProjects().map(enrichProject)
  registryProjects.forEach((project) => {
    project.resources.tokens.forEach((token) => {
      if (!token.address) return
      const key = `${token.chainId}:${token.address.toLowerCase()}`
      byKey.set(key, {
        symbol: token.symbol,
        address: token.address,
        chainId: token.chainId,
        sources: ['registry'],
        registryProject: project,
      })
    })
  })

  const addToken = (
    symbol: string,
    address: string | undefined,
    chainId: number,
    source: DexIndexedToken['sources'][number],
  ) => {
    if (!address) return
    const key = `${chainId}:${address.toLowerCase()}`
    const existing = byKey.get(key)
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source)
      return
    }
    byKey.set(key, { symbol, address, chainId, sources: [source] })
  }

  addToken('MARCO', MARCO_BSC_ADDRESS, 56, 'canonical')
  addToken('MXMX', bscTokens.mxmx?.address, 56, 'pool')
  addToken('BabyMarco', bscTokens.babymarco?.address, 56, 'pool')

  KNOWN_FARM_LP_SYMBOLS.forEach((sym) => {
    const base = sym.split('-')[0]
    if (base === 'MARCO') addToken(sym, MARCO_BSC_ADDRESS, 56, 'farm')
    if (base === 'MXMX') addToken(sym, bscTokens.mxmx?.address, 56, 'farm')
  })

  KNOWN_POOL_SYMBOLS.forEach((sym) => {
    if (sym === 'MARCO') addToken(sym, MARCO_BSC_ADDRESS, 56, 'pool')
    if (sym === 'MXMX') addToken(sym, bscTokens.mxmx?.address, 56, 'pool')
    if (sym === 'BabyMarco') addToken(sym, bscTokens.babymarco?.address, 56, 'pool')
  })

  getAllVenues().forEach((venue) => {
    if (venue.contractAddress) {
      addToken(venue.displayName, venue.contractAddress, 56, venue.venueType === 'farm' ? 'farm' : 'pool')
    }
  })

  Object.values(bscTokens).forEach((token) => {
    if (token?.address && token.symbol) {
      addToken(token.symbol, token.address, token.chainId ?? 56, 'liquidity')
    }
  })

  return [...byKey.values()].sort((a, b) => {
    const rank = marcoFirst(a, b)
    if (rank !== 0) return rank
    return a.symbol.localeCompare(b.symbol)
  })
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
    const slug = `dex-${entry.symbol.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    if (registrySlugs.has(slug)) return

    const hasFarm = entry.sources.includes('farm')
    const hasPool = entry.sources.includes('pool')
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
      description: `${entry.symbol} indexed from Melega farm, pool, or liquidity surfaces.`,
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
