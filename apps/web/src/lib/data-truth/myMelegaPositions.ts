/**
 * My Melega Positions — lightweight drawer adapter over existing wallet position VMs.
 * No independent indexer. Missing metrics → —.
 */
import type { PassportLiquidityPosition } from 'views/PassportStudio/passportLiquidityTypes'
import type { FarmsWalletPosition } from 'views/FarmsStudio/modules/farmsMyFarmsTypes'
import type { PoolsWalletPosition } from 'views/PoolsStudio/modules/poolsMyPositionsTypes'
import type { PortfolioClaimableRow } from 'views/PortfolioStudio/runtime/buildPortfolioViewModel'
import { parseUsdLoose } from 'views/PortfolioStudio/helpers'

export const MY_MELEGA_ROUTES = {
  liquidity: '/liquidity-studio?view=positions',
  farms: '/farms?view=my',
  pools: '/pools?view=positions',
  /** Closest valid LB inventory surface (no dedicated positions deep-link). */
  liquidityBuilder: '/liquidity-studio?view=building',
  portfolio: '/portfolio',
  addLiquidity: '/liquidity-studio?view=add',
  createFarm: '/farms?create=1',
  createPool: '/pools?create=1',
  swap: '/swap',
} as const

export const MY_MELEGA_CHAIN_FILTERS = [
  { id: 'all' as const, label: 'All Chains' },
  { id: 56 as const, label: 'BSC' },
  { id: 8453 as const, label: 'Base' },
  { id: 137 as const, label: 'Polygon' },
  { id: 1 as const, label: 'Ethereum' },
  { id: 42161 as const, label: 'Arbitrum' },
  { id: 43114 as const, label: 'Avalanche' },
]

export type MyMelegaChainFilter = (typeof MY_MELEGA_CHAIN_FILTERS)[number]['id']

export type MyMelegaDomain = 'liquidity' | 'farms' | 'pools' | 'builder'

export type MyMelegaPreviewRow = {
  id: string
  domain: MyMelegaDomain
  title: string
  subtitle: string
  chainId: number | null
  chainLabel: string
  valueDisplay: string
  aprDisplay: string
  hasClaimable: boolean
  href: string
  sortClaimUsd: number
  sortValueUsd: number
  token0Symbol?: string
  token1Symbol?: string
}

export type MyMelegaCounts = {
  liquidity: number
  farms: number
  pools: number
  builder: number
}

export type MyMelegaSnapshot = {
  counts: MyMelegaCounts
  previews: MyMelegaPreviewRow[]
  claimables: PortfolioClaimableRow[]
  claimableFarmCount: number
  claimableAggregateUsd: number | null
  claimableAggregateDisplay: string
  totalPortfolioUsd: number | null
  totalPortfolioDisplay: string | null
}

function chainShort(chainId: number | null | undefined, fallback?: string): string {
  if (chainId === 56) return 'BNB'
  if (chainId === 8453) return 'Base'
  if (chainId === 137) return 'POL'
  if (chainId === 1) return 'ETH'
  if (chainId === 42161) return 'ARB'
  if (chainId === 43114) return 'AVAX'
  return fallback || '—'
}

function truthDash(v?: string | null): string {
  if (!v || v === 'Unavailable' || /nan/i.test(v)) return '—'
  return v
}

function matchChainLabel(label: string, filter: MyMelegaChainFilter): boolean {
  if (filter === 'all') return true
  const map: Record<number, RegExp> = {
    56: /bnb|bsc/i,
    8453: /base/i,
    137: /polygon|pol/i,
    1: /ethereum|eth(?!er)/i,
    42161: /arbitrum|arb/i,
    43114: /avalanche|avax/i,
  }
  return map[filter]?.test(label) ?? true
}

export function filterLiquidityPositions(
  rows: PassportLiquidityPosition[],
  chainFilter: MyMelegaChainFilter,
): PassportLiquidityPosition[] {
  return rows.filter((r) => r.source === 'wallet-lp' && matchChainLabel(r.chainLabel, chainFilter))
}

export function filterFarms(
  rows: FarmsWalletPosition[],
  chainFilter: MyMelegaChainFilter,
): FarmsWalletPosition[] {
  if (chainFilter === 'all') return rows
  return rows.filter((r) => r.chainId === chainFilter)
}

export function filterPools(
  rows: PoolsWalletPosition[],
  chainFilter: MyMelegaChainFilter,
): PoolsWalletPosition[] {
  if (chainFilter === 'all') return rows
  return rows.filter((r) => r.chainId === chainFilter)
}

export function buildMyMelegaSnapshot(input: {
  liquidity: PassportLiquidityPosition[]
  farms: FarmsWalletPosition[]
  pools: PoolsWalletPosition[]
  claimables: PortfolioClaimableRow[]
  builderCount: number
  chainFilter: MyMelegaChainFilter
}): MyMelegaSnapshot {
  const liquidity = filterLiquidityPositions(input.liquidity, input.chainFilter)
  const farms = filterFarms(input.farms, input.chainFilter)
  const pools = filterPools(input.pools, input.chainFilter)
  const builderCount = input.chainFilter === 'all' ? input.builderCount : input.builderCount

  const previews: MyMelegaPreviewRow[] = []

  for (const farm of farms) {
    const claimUsd = parseUsdLoose(farm.pendingValue) ?? 0
    const valueUsd = parseUsdLoose(farm.stakedValue) ?? 0
    previews.push({
      id: `farm:${farm.positionId}`,
      domain: 'farms',
      title: farm.title || `${farm.token0.symbol} / ${farm.token1.symbol}`,
      subtitle: `Farm · ${chainShort(farm.chainId)}`,
      chainId: farm.chainId,
      chainLabel: chainShort(farm.chainId),
      valueDisplay: truthDash(farm.stakedValue),
      aprDisplay: truthDash(farm.apr),
      hasClaimable: claimUsd > 0 || Boolean(farm.pendingFormatted && farm.pendingFormatted !== '—'),
      href: MY_MELEGA_ROUTES.farms,
      sortClaimUsd: claimUsd,
      sortValueUsd: valueUsd,
      token0Symbol: farm.token0.symbol,
      token1Symbol: farm.token1.symbol,
    })
  }

  for (const pool of pools) {
    const claimUsd = parseUsdLoose(pool.claimableValue) ?? 0
    const valueUsd = parseUsdLoose(pool.stakedValue) ?? 0
    const apr =
      pool.sourceCard?.sustainableAprDisplay || pool.sourceCard?.apr || null
    previews.push({
      id: `pool:${pool.positionId}`,
      domain: 'pools',
      title: pool.title || `${pool.stakeToken.symbol} → ${pool.rewardToken.symbol}`,
      subtitle: `Pool · ${chainShort(pool.chainId)}`,
      chainId: pool.chainId,
      chainLabel: chainShort(pool.chainId),
      valueDisplay: truthDash(pool.stakedValue),
      aprDisplay: truthDash(apr),
      hasClaimable: claimUsd > 0 || Boolean(pool.claimableFormatted && pool.claimableFormatted !== '—'),
      href: MY_MELEGA_ROUTES.pools,
      sortClaimUsd: claimUsd,
      sortValueUsd: valueUsd,
      token0Symbol: pool.stakeToken.symbol,
      token1Symbol: pool.rewardToken.symbol,
    })
  }

  for (const liq of liquidity) {
    const valueUsd = parseUsdLoose(liq.estimatedValue) ?? 0
    previews.push({
      id: `liq:${liq.id}`,
      domain: 'liquidity',
      title: liq.pairLabel || `${liq.token0Symbol} / ${liq.token1Symbol}`,
      subtitle: `Liquidity · ${liq.chainLabel || '—'}`,
      chainId: null,
      chainLabel: liq.chainLabel || '—',
      valueDisplay: truthDash(liq.estimatedValue),
      aprDisplay: '—',
      hasClaimable: false,
      href: liq.actionHref || MY_MELEGA_ROUTES.liquidity,
      sortClaimUsd: 0,
      sortValueUsd: valueUsd,
      token0Symbol: liq.token0Symbol,
      token1Symbol: liq.token1Symbol,
    })
  }

  previews.sort((a, b) => {
    if (b.sortClaimUsd !== a.sortClaimUsd) return b.sortClaimUsd - a.sortClaimUsd
    if (b.sortValueUsd !== a.sortValueUsd) return b.sortValueUsd - a.sortValueUsd
    return a.title.localeCompare(b.title)
  })

  const claimables = input.claimables.slice().sort((a, b) => {
    const av = parseUsdLoose(a.estimatedUsd) ?? 0
    const bv = parseUsdLoose(b.estimatedUsd) ?? 0
    return bv - av
  })

  let claimUsd = 0
  let claimKnown = false
  for (const c of claimables) {
    const n = parseUsdLoose(c.estimatedUsd)
    if (n != null) {
      claimUsd += n
      claimKnown = true
    }
  }

  let totalUsd = 0
  let totalKnown = false
  for (const p of previews) {
    if (p.sortValueUsd > 0) {
      totalUsd += p.sortValueUsd
      totalKnown = true
    }
  }

  const farmClaimCount = claimables.filter((c) => c.group === 'Farms').length

  return {
    counts: {
      liquidity: liquidity.length,
      farms: farms.length,
      pools: pools.length,
      builder: builderCount,
    },
    previews: previews.slice(0, 4),
    claimables,
    claimableFarmCount: farmClaimCount,
    claimableAggregateUsd: claimKnown ? claimUsd : null,
    claimableAggregateDisplay: claimKnown
      ? claimUsd >= 1000
        ? `$${(claimUsd / 1000).toFixed(1)}K`
        : `$${claimUsd.toFixed(2)}`
      : '—',
    totalPortfolioUsd: totalKnown ? totalUsd : null,
    totalPortfolioDisplay: totalKnown
      ? totalUsd >= 1000
        ? `$${(totalUsd / 1000).toFixed(1)}K`
        : `$${totalUsd.toFixed(2)}`
      : null,
  }
}
