import { useMemo } from 'react'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { MelegaTickerItem } from 'design-system/melega'
import { buildIndexerActivityDiagnostic } from 'lib/runtime-integrity'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { getTradeSurfaceAssets } from 'lib/dex-asset-index'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { WBNB } from '@pancakeswap/sdk'
import { buildDexTokenIndex, dexIndexToEnrichedProjects } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import { Transaction, TransactionType } from 'state/info/types'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { FetchStatus } from 'config/constants/types'
import useGetTopFarmsByApr from 'views/Home/hooks/useGetTopFarmsByApr'
import useGetTopPoolsByApr from 'views/Home/hooks/useGetTopPoolsByApr'
import { getAprData } from 'views/Pools/helpers'
import {
  formatFarmTrendingLabel,
  formatPoolMetaLabel,
  formatPoolTickerAccent,
  formatPoolTrendingLabel,
  POOL_APR_UNAVAILABLE_REASON,
} from './formatTrendingLabels'

export interface RibbonItem {
  id: string
  title: string
  subtitle: string
  meta?: string
  href: string
  icon: 'trend' | 'swap' | 'pool' | 'project' | 'view'
}

export interface MarketCard {
  id: string
  label: string
  value: string
  meta?: string
  change?: string
  href: string
}

export interface EarnRow {
  id: string
  name: string
  apr?: string
  tvl?: string
  href: string
}

export interface ActivityRow {
  id: string
  type: string
  context: string
  value?: string
  time?: string
}

export interface ActivitySlot {
  id: string
  label: string
  row?: ActivityRow
}

export interface IndexedRibbonAsset {
  slug: string
  symbol: string
  address?: string
  chainId?: number
  displayName: string
}


export interface LiveEconomyMetric {
  id: string
  label: string
  value: string
  live?: boolean
}

export interface ActivityUnavailable {
  message: string
  timestamp: string
  reason: string
  source: string
  indexer: string
  lastAttempt: string
}

const LIVE_ACTIVITY_MAX_AGE_SEC = 86_400

export const isRecentIndexedEvent = (timestamp: string | number): boolean => {
  const ts = Number(timestamp)
  if (!ts || Number.isNaN(ts)) return false
  const ageSec = Math.floor(Date.now() / 1000 - ts)
  return ageSec >= 0 && ageSec <= LIVE_ACTIVITY_MAX_AGE_SEC
}

const formatTickerPrice = (price?: number): string | undefined => {
  if (!price || price <= 0 || !Number.isFinite(price)) return undefined
  if (price >= 1) return `$${price.toFixed(2)}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

const formatTickerChange = (change?: number): { text: string; positive: boolean } | undefined => {
  if (change == null || !Number.isFinite(change)) return undefined
  const positive = change >= 0
  const arrow = positive ? '▲' : '▼'
  return { text: `${arrow} ${Math.abs(change).toFixed(2)}%`, positive }
}

const formatTimeAgo = (timestamp: string): string | undefined => {
  const ts = Number(timestamp)
  if (!ts || Number.isNaN(ts)) return undefined
  const seconds = Math.floor(Date.now() / 1000 - ts)
  if (seconds < 0) return undefined
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const formatUsd = (value: number): string | undefined => {
  if (!value || value <= 0) return undefined
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

const sanitizeRibbonText = (value?: string): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === '()' || trimmed === 'undefined') return undefined
  if (/sousId|sous\s*id|sld\s*\d/i.test(trimmed)) return undefined
  if (/^\(\s*\)$/.test(trimmed)) return undefined
  return trimmed
}

const farmApr = (farm: FarmWithStakedValue): number | undefined => {
  const apr = (farm.apr ?? 0) + (farm.lpRewardsApr ?? 0)
  return apr > 0 ? apr : undefined
}

const farmTvl = (farm: FarmWithStakedValue): string | undefined => {
  if (!farm.liquidity?.gt(0)) return undefined
  return formatUsd(farm.liquidity.toNumber())
}

const poolTvl = (pool: Pool.DeserializedPool<Token>): string | undefined => {
  if (!pool.totalStaked?.gt(0) || !pool.stakingToken) return undefined
  const bal = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
  return bal > 0 ? formatUsd(bal * (pool.stakingTokenPrice ?? 0)) : undefined
}

const poolApr = (pool: Pool.DeserializedPool<Token>): number | undefined => {
  if (pool.apr && pool.apr > 0) return pool.apr
  const { apr } = getAprData(pool, 0)
  return apr > 0 ? apr : undefined
}

const txToRow = (tx: Transaction): ActivityRow => {
  if (tx.type === TransactionType.SWAP) {
    return {
      id: tx.hash,
      type: 'Swap',
      context: `${tx.token0Symbol} → ${tx.token1Symbol}`,
      value: tx.amountUSD > 0 ? formatUsd(tx.amountUSD) : undefined,
      time: formatTimeAgo(tx.timestamp),
    }
  }
  if (tx.type === TransactionType.MINT) {
    return {
      id: tx.hash,
      type: 'Liquidity Added',
      context: `${tx.token0Symbol} / ${tx.token1Symbol}`,
      value: tx.amountUSD > 0 ? formatUsd(tx.amountUSD) : undefined,
      time: formatTimeAgo(tx.timestamp),
    }
  }
  return {
    id: tx.hash,
    type: 'Liquidity Removed',
    context: `${tx.token0Symbol} / ${tx.token1Symbol}`,
    value: tx.amountUSD > 0 ? formatUsd(tx.amountUSD) : undefined,
    time: formatTimeAgo(tx.timestamp),
  }
}

export const useHomeTradeData = () => {
  const { transactions, indexerState, isActivityIndexing } = useProtocolTransactionsIndexer()
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const wbnbPrice = useBUSDPrice(WBNB[56])
  const { topFarms, fetchStatus: farmsFetchStatus } = useGetTopFarmsByApr(true)
  const { topPools, fetchStatus: poolsFetchStatus } = useGetTopPoolsByApr(true)

  const recentTransactions = useMemo(
    () => (transactions ?? []).filter((tx) => isRecentIndexedEvent(tx.timestamp)),
    [transactions],
  )

  const farms = useMemo(
    () => (topFarms ?? []).filter((f): f is FarmWithStakedValue => Boolean(f?.lpSymbol)),
    [topFarms],
  )

  const pools = useMemo(
    () => (topPools ?? []).filter((p): p is Pool.DeserializedPool<Token> => Boolean(p?.stakingToken)),
    [topPools],
  )

  const latestSwap = useMemo(() => {
    if (!recentTransactions.length) return undefined
    return recentTransactions.find((tx) => tx.type === TransactionType.SWAP)
  }, [recentTransactions])

  const dexProjects = useMemo(() => dexIndexToEnrichedProjects(buildDexTokenIndex()), [])
  const tradeableAssetCount = useMemo(() => getTradeSurfaceAssets().length, [])

  const latestProject = useMemo(() => {
    return dexProjects.find((p) => p.slug !== 'melega-dex') ?? dexProjects[0]
  }, [dexProjects])

  const topVolumeSwap = useMemo(() => {
    if (!recentTransactions.length) return undefined
    const swaps = recentTransactions.filter((tx) => tx.type === TransactionType.SWAP && tx.amountUSD > 0)
    if (!swaps.length) return undefined
    return swaps.reduce((best, tx) => (tx.amountUSD > best.amountUSD ? tx : best), swaps[0])
  }, [recentTransactions])

  const indexedRibbonAssets = useMemo((): IndexedRibbonAsset[] => {
    return getTradeSurfaceAssets()
      .map((asset) => ({
        slug: asset.registrySlug ?? asset.id,
        symbol: asset.symbol,
        address: asset.address,
        chainId: asset.chainId,
        displayName: sanitizeRibbonText(asset.name ?? asset.symbol) ?? asset.symbol,
      }))
      .filter((asset) => asset.displayName && asset.address)
  }, [])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    const marcoUsd = marcoPrice?.toNumber()
    const wbnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined

    const resolveQuote = (symbol: string): { price?: string; change?: { text: string; positive: boolean } } => {
      const sym = symbol.toUpperCase()
      if (sym === 'MARCO') {
        return {
          price: formatTickerPrice(marcoUsd),
          change: formatTickerChange(0),
        }
      }
      if (sym === 'WBNB') {
        return {
          price: formatTickerPrice(wbnbUsd),
          change: formatTickerChange(0),
        }
      }
      return {}
    }

    return indexedRibbonAssets
      .map((asset) => {
        const quote = resolveQuote(asset.symbol)
        if (!quote.price) return undefined
        return {
          id: `trade-asset-${asset.slug}`,
          primary: asset.symbol,
          secondary: quote.price,
          accent: quote.change?.text,
          accentPositive: quote.change?.positive,
        } satisfies MelegaTickerItem
      })
      .filter((item): item is MelegaTickerItem => Boolean(item))
  }, [indexedRibbonAssets, marcoPrice, wbnbPrice])

  const ribbonItems = useMemo((): RibbonItem[] => {
    const items: RibbonItem[] = []
    const topFarm = farms[0]

    if (topFarm?.lpSymbol) {
      items.push({
        id: 'trending-farm',
        title: 'Top farm',
        subtitle: topFarm.lpSymbol.replace('-', ' / '),
        href: '/farms',
        icon: 'trend',
      })
    }

    if (latestSwap) {
      const time = formatTimeAgo(latestSwap.timestamp)
      items.push({
        id: 'latest-swap',
        title: 'Latest swap',
        subtitle: `${latestSwap.token0Symbol} → ${latestSwap.token1Symbol}`,
        meta: time,
        href: '/trade',
        icon: 'swap',
      })
    }

    const topPool = pools[0]
    if (topPool) {
      const apr = poolApr(topPool)
      const poolLabel = formatPoolTrendingLabel(topPool, apr)
      items.push({
        id: 'top-pool',
        title: poolLabel.primary,
        subtitle: poolLabel.secondary,
        meta: formatPoolTickerAccent(poolLabel.accent),
        href: '/pools',
        icon: 'pool',
      })
    }

    if (latestProject) {
      const projectName = sanitizeRibbonText(latestProject.displayName ?? latestProject.slug)
      if (projectName) {
        items.push({
          id: 'project-listed',
          title: 'Latest listing',
          subtitle: projectName,
          href: `/projects/${latestProject.slug}`,
          icon: 'project',
        })
      }
    }

    if (items.length > 0) {
      items.push({
        id: 'view-all',
        title: 'View all',
        subtitle: '→',
        href: '/projects',
        icon: 'view',
      })
    }

    return items
  }, [farms, latestSwap, latestProject, pools])

  const marketCards = useMemo((): MarketCard[] => {
    const cards: MarketCard[] = []

    const topFarm = farms[0]
    if (topFarm?.lpSymbol) {
      const apr = farmApr(topFarm)
      cards.push({
        id: 'top-farm',
        label: 'Top Farm',
        value: topFarm.lpSymbol.replace('-', ' / '),
        meta: apr ? `APR ${apr.toFixed(2)}%` : undefined,
        change: farmTvl(topFarm),
        href: '/farms',
      })
    }

    const topPool = pools[0]
    if (topPool) {
      const apr = poolApr(topPool)
      const poolLabel = formatPoolTrendingLabel(topPool, apr)
      cards.push({
        id: 'top-pool',
        label: 'Top Pool',
        value: poolLabel.secondary,
        meta: formatPoolMetaLabel(poolLabel.accent),
        change: poolTvl(topPool),
        href: '/pools',
      })
    }

    if (topVolumeSwap) {
      cards.push({
        id: 'top-volume',
        label: 'Top Volume',
        value: `${topVolumeSwap.token0Symbol} / ${topVolumeSwap.token1Symbol}`,
        meta: formatUsd(topVolumeSwap.amountUSD),
        href: '/trade',
      })
    }

    if (latestProject) {
      cards.push({
        id: 'latest-listing',
        label: 'Latest Listing',
        value: latestProject.displayName ?? latestProject.slug,
        meta: latestProject.status,
        href: `/projects/${latestProject.slug}`,
      })
    }

    return cards
  }, [farms, pools, latestProject, topVolumeSwap])

  const farmRows = useMemo((): EarnRow[] => {
    return farms
      .slice(0, 3)
      .map((farm) => {
        const apr = farmApr(farm)
        const tvl = farmTvl(farm)
        return {
          id: `farm-${farm.pid}`,
          name: farm.lpSymbol ?? 'Farm',
          apr: apr ? `${apr.toFixed(2)}%` : undefined,
          tvl,
          href: '/farms',
        }
      })
      .filter((row) => row.apr || row.tvl)
  }, [farms])

  const poolRows = useMemo((): EarnRow[] => {
    return pools
      .slice(0, 3)
      .map((pool) => {
        const aprValue = poolApr(pool)
        const apr = aprValue ? `${aprValue.toFixed(2)}%` : undefined
        const tvl = poolTvl(pool)
        return {
          id: `pool-${pool.sousId}`,
          name: pool.stakingToken?.symbol ? `${pool.stakingToken.symbol} Staking` : 'Pool',
          apr,
          tvl,
          href: '/pools',
        }
      })
      .filter((row) => row.apr || row.tvl)
  }, [pools])

  const activitySlots = useMemo((): ActivitySlot[] => {
    const slots: ActivitySlot[] = []

    if (latestSwap) {
      slots.push({ id: 'swap', label: 'Latest swap', row: txToRow(latestSwap) })
    }

    const latestLpAdd = recentTransactions.find((tx) => tx.type === TransactionType.MINT)
    if (latestLpAdd && latestLpAdd.hash !== latestSwap?.hash) {
      slots.push({ id: 'lp-add', label: 'Latest LP add', row: txToRow(latestLpAdd) })
    } else if (latestLpAdd) {
      slots.push({ id: 'lp-add', label: 'Latest LP add', row: txToRow(latestLpAdd) })
    }

    const latestLpRemove = recentTransactions.find((tx) => tx.type === TransactionType.BURN)
    if (latestLpRemove) {
      slots.push({ id: 'lp-remove', label: 'Latest LP remove', row: txToRow(latestLpRemove) })
    }

    const recentSwaps = recentTransactions.filter((tx) => tx.type === TransactionType.SWAP).slice(1, 3)
    recentSwaps.forEach((tx, i) => {
      slots.push({
        id: `swap-${i}`,
        label: 'Recent swap',
        row: txToRow(tx),
      })
    })

    return slots.slice(0, 6)
  }, [latestSwap, recentTransactions])

  const isTrendingIndexing = useMemo(() => {
    const farmsLoading =
      farmsFetchStatus === 'fetching' ||
      farmsFetchStatus === 'not-fetched'
    const poolsLoading =
      poolsFetchStatus === FetchStatus.Fetching || poolsFetchStatus === FetchStatus.Idle
    return farmsLoading || poolsLoading || indexerState.status === 'loading'
  }, [farmsFetchStatus, poolsFetchStatus, indexerState.status])

  const activityRows = useMemo(
    (): ActivityRow[] => activitySlots.filter((s) => s.row).map((s) => s.row!),
    [activitySlots],
  )

  const activityUnavailable = useMemo((): ActivityUnavailable | undefined => {
    if (isActivityIndexing) return undefined
    if (activityRows.length > 0) return undefined
    const hasStaleEvents = (transactions?.length ?? 0) > 0 && recentTransactions.length === 0
    const diagnostic = buildIndexerActivityDiagnostic({
      source: indexerState.source,
      indexer: indexerState.indexer,
      lastAttempt: indexerState.lastAttempt,
      reason:
        hasStaleEvents
          ? 'No indexed swaps or liquidity events in the last 24 hours'
          : indexerState.status === 'error' || indexerState.status === 'unavailable'
            ? indexerState.reason ?? 'Subgraph indexer unavailable'
            : 'No swaps or liquidity events indexed in the current subgraph window',
    })
    return {
      message: diagnostic.title,
      timestamp: diagnostic.lastAttempt,
      reason: diagnostic.reason,
      source: diagnostic.source,
      indexer: diagnostic.indexer,
      lastAttempt: diagnostic.lastAttempt,
    }
  }, [isActivityIndexing, activityRows.length, indexerState, transactions?.length, recentTransactions.length])

  const showEarn = farmRows.length > 0 || poolRows.length > 0
  const showEarnNote = farmRows.some((r) => r.apr) || poolRows.some((r) => r.apr)

  const marcoPriceLabel = useMemo(() => {
    const price = marcoPrice?.toNumber()
    if (!price || price <= 0) return undefined
    return `$${price.toFixed(4)}`
  }, [marcoPrice])

  const liveEconomyMetrics = useMemo((): LiveEconomyMetric[] => {
    const metrics: LiveEconomyMetric[] = []
    const todaySwaps = recentTransactions.filter((tx) => tx.type === TransactionType.SWAP).length

    if (todaySwaps > 0) {
      metrics.push({ id: 'swaps', label: "Today's swaps", value: String(todaySwaps), live: true })
    }
    if (farms.length > 0) {
      metrics.push({ id: 'farms', label: 'Live farms', value: String(farms.length), live: true })
    }
    const projectCount = tradeableAssetCount || dexProjects.length
    if (projectCount > 0) {
      metrics.push({ id: 'projects', label: 'Indexed assets', value: String(projectCount), live: true })
    }
    if (pools.length > 0) {
      metrics.push({ id: 'pools', label: 'Pools', value: String(pools.length), live: true })
    }
    return metrics
  }, [recentTransactions, farms.length, pools.length, dexProjects.length, tradeableAssetCount])

  const marketUnavailableReason = useMemo(() => {
    if (marketCards.length > 0) return undefined
    if (indexerState.status === 'loading') {
      return indexerState.reason ?? 'Subgraph metrics loading'
    }
    if (indexerState.status === 'error' || indexerState.status === 'unavailable') {
      return indexerState.reason ?? 'Subgraph indexer unavailable'
    }
    return 'No indexed farm APR, pool TVL, swap volume, or listing in current window'
  }, [marketCards.length, indexerState])

  const trendingUnavailableReason = useMemo(() => {
    if (trendingTickerItems.length > 0) return undefined
    if (indexerState.status === 'loading') {
      return indexerState.reason ?? 'Market quotes loading'
    }
    if (!marcoPriceLabel) {
      return 'Waiting for live tradeable asset quotes'
    }
    return 'No tradeable assets with live quotes'
  }, [trendingTickerItems.length, indexerState, marcoPriceLabel])

  const poolAprUnavailableReason = POOL_APR_UNAVAILABLE_REASON

  return {
    ribbonItems,
    trendingTickerItems,
    indexedRibbonAssets,
    marketCards,
    farmRows,
    poolRows,
    activityRows,
    activitySlots,
    liveEconomyMetrics,
    showEarn,
    showEarnNote,
    marcoPriceLabel,
    isActivityIndexing,
    isTrendingIndexing,
    activityUnavailable,
    indexerState,
    showRibbon: ribbonItems.length > 0,
    showMarket: marketCards.length > 0,
    marketUnavailableReason,
    trendingUnavailableReason,
    poolAprUnavailableReason,
  }
}

export default useHomeTradeData
