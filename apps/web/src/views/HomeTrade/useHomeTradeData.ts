import { useMemo } from 'react'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { MelegaTickerItem } from 'design-system/melega'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { Transaction, TransactionType } from 'state/info/types'
import { useProtocolTransactionsSWR } from 'state/info/hooks'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { FetchStatus } from 'config/constants/types'
import { buildRuntimeDiagnostic } from 'lib/runtime-integrity'
import useGetTopFarmsByApr from 'views/Home/hooks/useGetTopFarmsByApr'
import useGetTopPoolsByApr from 'views/Home/hooks/useGetTopPoolsByApr'
import { getAprData } from 'views/Pools/helpers'
import {
  formatFarmTrendingLabel,
  formatPoolTickerAccent,
  formatPoolTrendingLabel,
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
  const transactions = useProtocolTransactionsSWR()
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const { topFarms, fetchStatus: farmsFetchStatus } = useGetTopFarmsByApr(true)
  const { topPools, fetchStatus: poolsFetchStatus } = useGetTopPoolsByApr(true)

  const farms = useMemo(
    () => (topFarms ?? []).filter((f): f is FarmWithStakedValue => Boolean(f?.lpSymbol)),
    [topFarms],
  )

  const pools = useMemo(
    () => (topPools ?? []).filter((p): p is Pool.DeserializedPool<Token> => Boolean(p?.stakingToken)),
    [topPools],
  )

  const latestSwap = useMemo(() => {
    if (!transactions?.length) return undefined
    return transactions.find((tx) => tx.type === TransactionType.SWAP)
  }, [transactions])

  const latestProject = useMemo(() => {
    const projects = getAllProjects().filter((p) => p.slug !== 'melega-dex')
    return projects[0]
  }, [])

  const topVolumeSwap = useMemo(() => {
    if (!transactions?.length) return undefined
    const swaps = transactions.filter((tx) => tx.type === TransactionType.SWAP && tx.amountUSD > 0)
    if (!swaps.length) return undefined
    return swaps.reduce((best, tx) => (tx.amountUSD > best.amountUSD ? tx : best), swaps[0])
  }, [transactions])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    const items: MelegaTickerItem[] = []
    const topFarm = farms.find((f) => farmApr(f))
    const topPool =
      pools.find((p) => {
        const apr = poolApr(p)
        return apr !== undefined && apr > 0
      }) ?? pools[0]

    if (topFarm) {
      const apr = farmApr(topFarm)
      const farmLabel = formatFarmTrendingLabel(topFarm, apr)
      items.push({
        id: 'top-farm',
        primary: farmLabel.primary,
        secondary: farmLabel.secondary,
        accent: farmLabel.accent ? `${farmLabel.accent} APR` : undefined,
        href: '/farms',
      })
    }

    if (topPool) {
      const apr = poolApr(topPool)
      const poolLabel = formatPoolTrendingLabel(topPool, apr)
      items.push({
        id: 'top-pool',
        primary: poolLabel.primary,
        secondary: poolLabel.secondary,
        accent: formatPoolTickerAccent(poolLabel.accent),
        href: '/pools',
      })
    }

    if (topVolumeSwap) {
      items.push({
        id: 'top-volume-pair',
        primary: 'Top volume',
        secondary: `${topVolumeSwap.token0Symbol} / ${topVolumeSwap.token1Symbol}`,
        accent: formatUsd(topVolumeSwap.amountUSD),
        href: '/trade',
      })
    }

    if (latestProject) {
      const projectName = sanitizeRibbonText(latestProject.displayName ?? latestProject.slug)
      if (projectName) {
        items.push({
          id: 'latest-listing',
          primary: 'Latest listing',
          secondary: projectName,
          href: `/projects/${latestProject.slug}`,
        })
      }
    }

    if (latestSwap) {
      items.push({
        id: 'latest-swap',
        primary: 'Latest swap',
        secondary: `${latestSwap.token0Symbol} → ${latestSwap.token1Symbol}`,
        accent: formatTimeAgo(latestSwap.timestamp),
        href: '/trade',
      })
    }

    return items
  }, [farms, latestSwap, latestProject, pools, topVolumeSwap])

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
      const tickerAccent = formatPoolTickerAccent(poolLabel.accent)
      cards.push({
        id: 'top-pool',
        label: 'Top Pool',
        value: poolLabel.secondary,
        meta: tickerAccent.includes('%') ? `APR ${poolLabel.accent}` : tickerAccent,
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

    const latestLpAdd = transactions?.find((tx) => tx.type === TransactionType.MINT)
    if (latestLpAdd && latestLpAdd.hash !== latestSwap?.hash) {
      slots.push({ id: 'lp-add', label: 'Latest LP add', row: txToRow(latestLpAdd) })
    } else if (latestLpAdd) {
      slots.push({ id: 'lp-add', label: 'Latest LP add', row: txToRow(latestLpAdd) })
    }

    const latestLpRemove = transactions?.find((tx) => tx.type === TransactionType.BURN)
    if (latestLpRemove) {
      slots.push({ id: 'lp-remove', label: 'Latest LP remove', row: txToRow(latestLpRemove) })
    }

    const recentSwaps = transactions?.filter((tx) => tx.type === TransactionType.SWAP).slice(1, 3) ?? []
    recentSwaps.forEach((tx, i) => {
      slots.push({
        id: `swap-${i}`,
        label: 'Recent swap',
        row: txToRow(tx),
      })
    })

    return slots.slice(0, 6)
  }, [latestSwap, transactions])

  const isActivityIndexing = transactions === undefined

  const isTrendingIndexing = useMemo(() => {
    const farmsLoading =
      farmsFetchStatus === 'fetching' ||
      farmsFetchStatus === 'not-fetched'
    const poolsLoading =
      poolsFetchStatus === FetchStatus.Fetching || poolsFetchStatus === FetchStatus.Idle
    const subgraphLoading = transactions === undefined
    return farmsLoading || poolsLoading || subgraphLoading
  }, [farmsFetchStatus, poolsFetchStatus, transactions])

  const activityRows = useMemo(
    (): ActivityRow[] => activitySlots.filter((s) => s.row).map((s) => s.row!),
    [activitySlots],
  )

  const activityUnavailable = useMemo((): ActivityUnavailable | undefined => {
    if (isActivityIndexing) return undefined
    if (activityRows.length > 0) return undefined
    const diagnostic = buildRuntimeDiagnostic({
      surface: 'home-live-activity',
      status: 'empty',
      source: 'subgraph',
      indexer: 'melega-subgraph',
      reason: 'No swaps or liquidity events indexed in the current subgraph window',
    })
    return {
      message: 'Last indexed activity unavailable',
      timestamp: diagnostic.timestamp,
      reason: diagnostic.reason,
      source: diagnostic.source,
    }
  }, [isActivityIndexing, activityRows.length])

  const showEarn = farmRows.length > 0 || poolRows.length > 0
  const showEarnNote = farmRows.some((r) => r.apr) || poolRows.some((r) => r.apr)

  const marcoPriceLabel = useMemo(() => {
    const price = marcoPrice?.toNumber()
    if (!price || price <= 0) return undefined
    return `$${price.toFixed(4)}`
  }, [marcoPrice])

  const liveEconomyMetrics = useMemo((): LiveEconomyMetric[] => {
    const metrics: LiveEconomyMetric[] = []
    const dayAgo = Math.floor(Date.now() / 1000) - 86_400
    const todaySwaps = transactions?.filter(
      (tx) => tx.type === TransactionType.SWAP && Number(tx.timestamp) >= dayAgo,
    ).length

    if (todaySwaps && todaySwaps > 0) {
      metrics.push({ id: 'swaps', label: "Today's swaps", value: String(todaySwaps), live: true })
    }
    if (farms.length > 0) {
      metrics.push({ id: 'farms', label: 'Live farms', value: String(farms.length), live: true })
    }
    const projectCount = getAllProjects().length
    if (projectCount > 0) {
      metrics.push({ id: 'projects', label: 'Projects', value: String(projectCount), live: true })
    }
    if (pools.length > 0) {
      metrics.push({ id: 'pools', label: 'Pools', value: String(pools.length), live: true })
    }
    return metrics
  }, [transactions, farms.length, pools.length])

  return {
    ribbonItems,
    trendingTickerItems,
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
    showRibbon: ribbonItems.length > 0,
    showMarket: marketCards.length > 0,
  }
}

export default useHomeTradeData
