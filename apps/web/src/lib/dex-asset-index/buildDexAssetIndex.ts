import { bscTokens } from '@pancakeswap/tokens'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getAllAssets } from 'registry/assets/getAllAssets'
import { getAllVenues } from 'registry/venues/getAllVenues'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import type { DexAssetIndexPayload, DexAssetRecord, DexAssetSource, DexAssetStatus } from './types'
import { assetKey, mergeAssetSurfaces, resolveAssetLogo } from './resolveAssetLogo'

const KNOWN_FARM_LP_SYMBOLS = ['MARCO-BNB', 'MARCO-BUSD', 'MXMX-BNB', 'MXMX-BUSD'] as const
const KNOWN_POOL_SYMBOLS = ['MARCO', 'MXMX', 'BabyMarco'] as const
const MELEGA_SYMBOLS = new Set(['MARCO', 'MXMX', 'BABYMARCO', 'CAKE', 'WBNB', 'BUSD'])

type TokenListEntry = {
  chainId: number
  address: string
  symbol: string
  name?: string
  logoURI?: string
}

function upsertAsset(
  map: Map<string, DexAssetRecord>,
  input: {
    symbol: string
    name?: string
    chainId: number
    address?: string
    logoURI?: string
    source: DexAssetSource
    status?: DexAssetStatus
    registrySlug?: string
    surfaces: Partial<DexAssetRecord['surfaces']>
  },
) {
  const key = assetKey(input.chainId, input.address, input.symbol)
  const { logo, logoFallback } = resolveAssetLogo(input.address, input.logoURI)
  const existing = map.get(key)

  if (existing) {
    if (!existing.sources.includes(input.source)) existing.sources.push(input.source)
    existing.surfaces = mergeAssetSurfaces(existing.surfaces, input.surfaces)
    if (input.registrySlug) existing.registrySlug = input.registrySlug
    if (input.name && !existing.name) existing.name = input.name
    if (logo && !existing.logo) existing.logo = logo
    return
  }

  map.set(key, {
    id: key,
    symbol: input.symbol,
    name: input.name,
    chainId: input.chainId,
    address: input.address,
    logo,
    logoFallback,
    sources: [input.source],
    status: input.status ?? 'observed',
    registrySlug: input.registrySlug,
    surfaces: {
      trade: Boolean(input.surfaces.trade),
      pool: Boolean(input.surfaces.pool),
      farm: Boolean(input.surfaces.farm),
      project: Boolean(input.surfaces.project),
      radar: Boolean(input.surfaces.radar),
      trending: Boolean(input.surfaces.trending),
    },
  })
}

function isMelegaListedSymbol(symbol: string): boolean {
  return MELEGA_SYMBOLS.has(symbol.toUpperCase()) || KNOWN_POOL_SYMBOLS.some((s) => s.toUpperCase() === symbol.toUpperCase())
}

/** Canonical union index across registry, token list, venues, farms, pools, and legacy assets. */
export function buildDexAssetIndex(): DexAssetRecord[] {
  const map = new Map<string, DexAssetRecord>()

  getAllProjects()
    .map(enrichProject)
    .forEach((project) => {
      project.resources.tokens.forEach((token) => {
        if (!token.address) return
        upsertAsset(map, {
          symbol: token.symbol,
          chainId: token.chainId,
          address: token.address,
          source: 'registry',
          status: project.isCanonical ? 'canonical' : 'listed',
          registrySlug: project.slug,
          surfaces: {
            trade: project.capabilities.tradable.status !== 'planned',
            pool: project.capabilities.pool.status !== 'planned',
            farm: project.capabilities.farm.status !== 'planned',
            project: true,
            radar: project.capabilities.radar?.status !== 'planned',
            trending: true,
          },
        })
      })
    })

  getAllAssets().forEach((asset) => {
    upsertAsset(map, {
      symbol: asset.symbol,
      name: asset.name,
      chainId: asset.chainId,
      address: asset.contractAddress,
      source: 'asset-registry',
      status: asset.trust.badges.includes('canonical') ? 'canonical' : 'listed',
      registrySlug: asset.projectBinding.projectSlug,
      surfaces: {
        trade: asset.capabilities.tradable.status === 'live',
        pool: asset.capabilities.pool.status === 'live',
        farm: asset.capabilities.farm.status === 'live',
        project: true,
        radar: true,
        trending: true,
      },
    })
  })

  upsertAsset(map, {
    symbol: 'MARCO',
    name: 'MARCO',
    chainId: 56,
    address: MARCO_BSC_ADDRESS,
    source: 'canonical',
    status: 'canonical',
    registrySlug: 'melega-dex',
    surfaces: { trade: true, pool: true, farm: true, project: true, radar: true, trending: true },
  })

  upsertAsset(map, {
    symbol: 'MARCO',
    name: 'MARCO',
    chainId: 97,
    address: BSC_TESTNET_ADDRESSES.marco,
    source: 'canonical',
    status: 'canonical',
    registrySlug: 'melega-dex-testnet',
    surfaces: { trade: true, pool: true, farm: true, project: true, radar: true, trending: true },
  })

  upsertAsset(map, {
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    chainId: 97,
    address: BSC_TESTNET_ADDRESSES.wbnb,
    source: 'liquidity',
    surfaces: { trade: true, pool: true, farm: true, radar: true, trending: true },
  })

  upsertAsset(map, {
    symbol: 'USDT',
    name: 'Tether USD',
    chainId: 97,
    address: BSC_TESTNET_ADDRESSES.usdt,
    source: 'liquidity',
    surfaces: { trade: true, pool: true, radar: true, trending: true },
  })

  if (bscTokens.mxmx?.address) {
    upsertAsset(map, {
      symbol: 'MXMX',
      name: bscTokens.mxmx.name,
      chainId: 56,
      address: bscTokens.mxmx.address,
      source: 'pool',
      surfaces: { trade: true, pool: true, farm: true, project: true, radar: true, trending: true },
    })
  }

  if (bscTokens.babymarco?.address) {
    upsertAsset(map, {
      symbol: 'BabyMarco',
      name: bscTokens.babymarco.name,
      chainId: 56,
      address: bscTokens.babymarco.address,
      source: 'pool',
      surfaces: { trade: true, pool: true, project: true, radar: true, trending: true },
    })
  }

  KNOWN_FARM_LP_SYMBOLS.forEach((sym) => {
    const base = sym.split('-')[0]
    const address =
      base === 'MARCO' ? MARCO_BSC_ADDRESS : base === 'MXMX' ? bscTokens.mxmx?.address : undefined
    upsertAsset(map, {
      symbol: sym,
      chainId: 56,
      address,
      source: 'farm',
      surfaces: { trade: true, farm: true, radar: true, trending: true },
    })
  })

  KNOWN_POOL_SYMBOLS.forEach((sym) => {
    const address =
      sym === 'MARCO'
        ? MARCO_BSC_ADDRESS
        : sym === 'MXMX'
          ? bscTokens.mxmx?.address
          : bscTokens.babymarco?.address
    upsertAsset(map, {
      symbol: sym,
      chainId: 56,
      address,
      source: 'pool',
      surfaces: { trade: true, pool: true, radar: true, trending: true, project: true },
    })
  })

  getAllVenues().forEach((venue) => {
    venue.assetBindings.forEach((binding) => {
      const asset = getAllAssets().find((a) => a.slug === binding.assetSlug)
      upsertAsset(map, {
        symbol: asset?.symbol ?? venue.displayName,
        name: venue.displayName,
        chainId: venue.chainId,
        address: asset?.contractAddress ?? venue.contractAddress,
        source: 'venue',
        surfaces: {
          trade: venue.capabilities.swap.status !== 'planned',
          pool: venue.venueType === 'stake_pool',
          farm: venue.venueType === 'farm',
          radar: true,
          trending: true,
        },
      })
    })
  })

  Object.values(bscTokens).forEach((token) => {
    if (!token?.address || !token.symbol || (token.chainId ?? 56) !== 56) return
    if (!isMelegaListedSymbol(token.symbol)) return
    upsertAsset(map, {
      symbol: token.symbol,
      name: token.name,
      chainId: 56,
      address: token.address,
      source: 'liquidity',
      surfaces: { trade: true, radar: true, trending: MELEGA_SYMBOLS.has(token.symbol.toUpperCase()) },
    })
  })

  const listTokens = (defaultTokenList.tokens ?? []) as TokenListEntry[]
  listTokens
    .filter((t) => (t.chainId === 56 || t.chainId === 97) && t.address && t.symbol)
    .forEach((token) => {
      const melega = isMelegaListedSymbol(token.symbol)
      upsertAsset(map, {
        symbol: token.symbol,
        name: token.name,
        chainId: 56,
        address: token.address,
        logoURI: token.logoURI,
        source: 'token-list',
        status: melega ? 'listed' : 'token-list',
        surfaces: {
          trade: true,
          radar: true,
          trending: melega,
          project: melega,
          pool: KNOWN_POOL_SYMBOLS.some((s) => s.toUpperCase() === token.symbol.toUpperCase()),
          farm: KNOWN_FARM_LP_SYMBOLS.some((s) => s.startsWith(token.symbol.toUpperCase())),
        },
      })
    })

  return [...map.values()].sort((a, b) => {
    const rank = (asset: DexAssetRecord) => {
      if (asset.status === 'canonical') return 0
      if (asset.surfaces.project) return 1
      if (asset.surfaces.trending) return 2
      return 3
    }
    const ra = rank(a)
    const rb = rank(b)
    if (ra !== rb) return ra - rb
    return a.symbol.localeCompare(b.symbol)
  })
}

export function buildDexAssetIndexPayload(): DexAssetIndexPayload {
  const assets = buildDexAssetIndex()
  return {
    schema: 'https://melega.finance/schemas/dex-asset-index/v1',
    generatedAt: new Date().toISOString(),
    assetCount: assets.length,
    projectSurfaceCount: assets.filter((a) => a.surfaces.project).length,
    trendingSurfaceCount: assets.filter((a) => a.surfaces.trending).length,
    assets,
  }
}

export function getProjectSurfaceAssets(): DexAssetRecord[] {
  return buildDexAssetIndex().filter((a) => a.surfaces.project)
}

export function getTrendingSurfaceAssets(): DexAssetRecord[] {
  return buildDexAssetIndex().filter((a) => a.surfaces.trending)
}
