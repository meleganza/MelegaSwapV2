import { useMemo } from 'react'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { resolveHomepageLiveSections } from 'lib/homepage-live'
import { Transaction, TransactionType } from 'state/info/types'
import { useProtocolTransactionsSWR } from 'state/info/hooks'
import { usePriceCakeBusd } from 'state/farms/hooks'
import useGetTopFarmsByApr from 'views/Home/hooks/useGetTopFarmsByApr'
import useGetTopPoolsByApr from 'views/Home/hooks/useGetTopPoolsByApr'

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

export interface LiveEconomyMetric {
  id: string
  label: string
  value: string
  live?: boolean
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

const formatPairLabel = (symbol?: string): string | undefined => {
  if (!symbol) return undefined
  const cleaned = symbol.replace(/-/g, ' / ').replace(/\s+/g, ' ').trim()
  return sanitizeRibbonText(cleaned)
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

const txLabel = (tx: Transaction): { type: string; context: string; value?: string } => {
  if (tx.type === TransactionType.SWAP) {
    return {
      type: 'Swap',
      context: `${tx.token0Symbol} → ${tx.token1Symbol}`,
      value: tx.amountUSD > 0 ? formatUsd(tx.amountUSD) : undefined,
    }
  }
  if (tx.type === TransactionType.MINT) {
    return {
      type: 'Liquidity Added',
      context: `${tx.token0Symbol} / ${tx.token1Symbol}`,
      value: tx.amountUSD > 0 ? formatUsd(tx.amountUSD) : undefined,
    }
  }
  return {
    type: 'Liquidity Removed',
    context: `${tx.token0Symbol} / ${tx.token1Symbol}`,
    value: tx.amountUSD > 0 ? formatUsd(tx.amountUSD) : undefined,
  }
}

export const useHomeTradeData = () => {
  const transactions = useProtocolTransactionsSWR()
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const { topFarms } = useGetTopFarmsByApr(true)
  const { topPools } = useGetTopPoolsByApr(true)
  const registry = useMemo(() => resolveHomepageLiveSections(), [])

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
    const projects = getAllProjects()
    return projects[0]
  }, [])

  const ribbonItems = useMemo((): RibbonItem[] => {
    const items: RibbonItem[] = []

    const topFarm = farms[0]
    if (topFarm?.lpSymbol) {
      const pairLabel = formatPairLabel(topFarm.lpSymbol)
      items.push({
        id: 'trending-pair',
        title: 'Top farm',
        subtitle: pairLabel ?? 'MARCO / BNB',
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
        href: '/swap',
        icon: 'swap',
      })
    }

    const topPoolVenue = registry.topPools[0]
    if (topPoolVenue) {
      const poolLabel = sanitizeRibbonText(topPoolVenue.label)
      items.push({
        id: 'new-pool',
        title: 'New pool',
        subtitle: poolLabel ?? 'MARCO / BNB',
        href: topPoolVenue.href,
        icon: 'pool',
      })
    } else {
      const topPool = pools[0]
      if (topPool?.stakingToken?.symbol && topPool?.earningToken?.symbol) {
        items.push({
          id: 'new-pool',
          title: 'New pool',
          subtitle: `${topPool.stakingToken.symbol} / ${topPool.earningToken.symbol}`,
          href: '/pools',
          icon: 'pool',
        })
      }
    }

    if (latestProject) {
      const projectName = sanitizeRibbonText(latestProject.displayName ?? latestProject.slug)
      if (projectName) {
        items.push({
          id: 'project-listed',
          title: 'Project listed',
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
  }, [farms, latestSwap, latestProject, pools, registry.topPools])

  const marketCards = useMemo((): MarketCard[] => {
    const cards: MarketCard[] = []

    const topFarm = farms[0]
    if (topFarm?.lpSymbol) {
      cards.push({
        id: 'top-pair',
        label: 'Top Pair',
        value: topFarm.lpSymbol.replace('-', ' / '),
        href: '/swap',
      })
    }

    if (topFarm) {
      const apr = farmApr(topFarm)
      const tvl = farmTvl(topFarm)
      if (apr || tvl) {
        cards.push({
          id: 'top-farm',
          label: 'Top Farm',
          value: topFarm.lpSymbol ?? 'Farm',
          meta: apr ? `APR ${apr.toFixed(2)}%` : undefined,
          change: tvl,
          href: '/farms',
        })
      }
    }

    const topPool = pools[0]
    if (topPool?.stakingToken) {
      const apr = topPool.apr && topPool.apr > 0 ? topPool.apr : undefined
      const tvl = poolTvl(topPool)
      if (apr || tvl) {
        cards.push({
          id: 'top-pool',
          label: 'Top Staking Pool',
          value: `${topPool.stakingToken.symbol} Staking`,
          meta: apr ? `APR ${apr.toFixed(2)}%` : undefined,
          change: tvl,
          href: '/pools',
        })
      }
    }

    if (latestProject) {
      cards.push({
        id: 'latest-project',
        label: 'Latest Project',
        value: latestProject.displayName ?? latestProject.slug,
        meta: latestProject.status,
        href: `/projects/${latestProject.slug}`,
      })
    }

    return cards
  }, [farms, pools, latestProject])

  const farmRows = useMemo((): EarnRow[] => {
    return farms.slice(0, 3).map((farm) => {
      const apr = farmApr(farm)
      const tvl = farmTvl(farm)
      return {
        id: `farm-${farm.pid}`,
        name: farm.lpSymbol ?? 'Farm',
        apr: apr ? `${apr.toFixed(2)}%` : undefined,
        tvl,
        href: '/farms',
      }
    }).filter((row) => row.apr || row.tvl)
  }, [farms])

  const poolRows = useMemo((): EarnRow[] => {
    return pools.slice(0, 3).map((pool) => {
      const apr = pool.apr && pool.apr > 0 ? `${pool.apr.toFixed(2)}%` : undefined
      const tvl = poolTvl(pool)
      return {
        id: `pool-${pool.sousId}`,
        name: pool.stakingToken?.symbol ? `${pool.stakingToken.symbol} Staking` : 'Pool',
        apr,
        tvl,
        href: '/pools',
      }
    }).filter((row) => row.apr || row.tvl)
  }, [pools])

  const activityRows = useMemo((): ActivityRow[] => {
    if (!transactions?.length) return []
    return transactions.slice(0, 5).map((tx) => {
      const { type, context, value } = txLabel(tx)
      return {
        id: tx.hash,
        type,
        context,
        value,
        time: formatTimeAgo(tx.timestamp),
      }
    })
  }, [transactions])

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
    marketCards,
    farmRows,
    poolRows,
    activityRows,
    liveEconomyMetrics,
    showEarn,
    showEarnNote,
    marcoPriceLabel,
    showRibbon: ribbonItems.length > 0,
    showMarket: marketCards.length > 0,
  }
}

export default useHomeTradeData
