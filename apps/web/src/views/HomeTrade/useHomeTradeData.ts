import { useMemo } from 'react'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { MelegaTickerItem } from 'design-system/melega'
import { buildIndexerActivityDiagnostic } from 'lib/runtime-integrity'
import { useProtocolActivityFeed } from 'lib/protocol-activity/useProtocolActivityFeed'
import { formatHomeActivityRows } from './formatHomeActivity'
import { getCanonicalIndexedAssets, getTradeSurfaceAssets } from 'lib/dex-asset-index'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { WBNB } from '@pancakeswap/sdk'
import { useCanonicalMarcoPrice } from 'lib/data-truth/useCanonicalMarcoPrice'
import { buildDexTokenIndex, dexIndexToEnrichedProjects } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import { Transaction, TransactionType } from 'state/info/types'
import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'
import { LIVE_ACTIVITY_WINDOW_SEC } from 'lib/data-truth/ontology'
import { LIVE_ECONOMY_METRIC_BUILDERS } from 'lib/data-truth/metricDefinitions'
import { derivePoolLifecycle, reconcilePoolLifecycle } from 'lib/data-truth/poolLifecycle'
import { useAmmPairRegistry } from 'lib/bsc-indexer/client/useAmmPairRegistry'
import { useCurrentBlock } from 'state/block/hooks'
import { usePriceCakeBusd, useFarms, usePollFarmsWithUserData } from 'state/farms/hooks'
import { usePoolsWithVault } from 'state/pools/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
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
  href?: string
}

export interface ActivityUnavailable {
  message: string
  timestamp: string
  reason: string
  source: string
  indexer: string
  lastAttempt: string
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
  ontologyId?: string
  source?: string
  owner?: string
  href?: string
  asOf?: string
}

export const isRecentIndexedEvent = (timestamp: string | number): boolean => {
  const ts = Number(timestamp)
  if (!ts || Number.isNaN(ts)) return false
  const ageSec = Math.floor(Date.now() / 1000 - ts)
  return ageSec >= 0 && ageSec <= LIVE_ACTIVITY_WINDOW_SEC
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

export const useHomeTradeData = () => {
  const {
    rows: protocolRows,
    totalCount,
    ammCount,
    masterchefCount,
    smartchefCount,
    newestTimestamp,
    oldestTimestamp,
    duplicatesRemoved,
    mergeStats,
    indexerState,
    isLoading: protocolActivityLoading,
    isError: protocolActivityError,
    protocolError,
  } = useProtocolActivityFeed()
  const canonicalMarco = useCanonicalMarcoPrice()
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const wbnbPrice = useBUSDPrice(WBNB[56])
  const { chainId } = useActiveChainId()
  usePollFarmsWithUserData()
  const { data: allFarms = [] } = useFarms()
  const { pools: allPools = [] } = usePoolsWithVault(chainId)
  const { topFarms, fetchStatus: farmsFetchStatus } = useGetTopFarmsByApr(true)
  const { topPools, fetchStatus: poolsFetchStatus } = useGetTopPoolsByApr(true)
  const { total: liquidPairCount, pairs: tradeablePairs } = useAmmPairRegistry({
    classification: 'tradeable',
    pageSize: 24,
  })
  const currentBlock = useCurrentBlock()

  const indexedTransactions = useMemo(
    () =>
      protocolRows
        .filter((r) => r.sourceType === 'amm' && r.eventType === 'Swap')
        .map((r) => {
          const symbols = (r.resolvedSymbols ?? []).filter(Boolean)
          const fromPair = (r.pairOrPoolIdentity ?? '').split('/').map((part) => part.trim())
          return {
            hash: r.transactionHash,
            timestamp: String(r.timestamp),
            sender: r.wallet ?? '',
            type: TransactionType.SWAP,
            token0Symbol: symbols[0] ?? fromPair[0] ?? '',
            token1Symbol: symbols[1] ?? fromPair[1] ?? '',
            amountUSD: 0,
          } as Transaction
        }),
    [protocolRows],
  )

  const recentTransactions = useMemo(
    () => indexedTransactions.filter((tx) => isRecentIndexedEvent(tx.timestamp)),
    [indexedTransactions],
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
  const tradeableAssetCount = useMemo(() => getCanonicalIndexedAssets().length, [])

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
        }
      }
      if (sym === 'WBNB') {
        return {
          price: formatTickerPrice(wbnbUsd),
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
    if (topFarm?.lpSymbol && topFarm.pid !== 0 && topFarm.multiplier !== '0X') {
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

    const rewardingPool = allPools
      .filter((p) => derivePoolLifecycle(p, currentBlock).rewarding)
      .sort((a, b) => (poolApr(b) ?? 0) - (poolApr(a) ?? 0))[0]

    if (rewardingPool?.stakingToken?.symbol && rewardingPool?.earningToken?.symbol) {
      const apr = poolApr(rewardingPool)
      cards.push({
        id: 'top-pool',
        label: 'Top Pool',
        value: `${rewardingPool.stakingToken.symbol} / ${rewardingPool.earningToken.symbol}`,
        meta: apr ? `APR ${apr.toFixed(2)}%` : undefined,
        change: poolTvl(rewardingPool),
        href: '/pools',
      })
    }

    const topLiquidityPair = [...tradeablePairs]
      .sort((a, b) => {
        const scoreA = BigInt(a.reserve0 ?? '0') + BigInt(a.reserve1 ?? '0')
        const scoreB = BigInt(b.reserve0 ?? '0') + BigInt(b.reserve1 ?? '0')
        return scoreB > scoreA ? 1 : scoreB < scoreA ? -1 : 0
      })[0]

    if (topLiquidityPair?.symbol0 && topLiquidityPair?.symbol1) {
      cards.push({
        id: 'highest-liquidity',
        label: 'Highest Liquidity Pair',
        value: `${topLiquidityPair.symbol0} / ${topLiquidityPair.symbol1}`,
        href: '/trade',
      })
    }

    return cards.slice(0, 3)
  }, [farms, allPools, currentBlock, tradeablePairs])

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

  const homeActivityRows = useMemo(() => formatHomeActivityRows(protocolRows), [protocolRows])

  const activityViewAllHref = useMemo(() => {
    if (protocolRows.length === 0) return '/trade'
    return protocolRows.some((row) => row.sourceType !== 'amm') ? '/farms' : '/trade'
  }, [protocolRows])

  const isActivityIndexing = protocolActivityLoading && protocolRows.length === 0

  const activityDiagnostic = useMemo(() => {
    const parts = [
      `Canonical total ${totalCount}`,
      `AMM ${ammCount}`,
      `MasterChef ${masterchefCount}`,
      `SmartChef ${smartchefCount}`,
      duplicatesRemoved > 0 ? `Duplicates removed ${duplicatesRemoved}` : undefined,
      newestTimestamp ? `Newest ${new Date(newestTimestamp * 1000).toISOString()}` : undefined,
      oldestTimestamp ? `Oldest ${new Date(oldestTimestamp * 1000).toISOString()}` : undefined,
      protocolActivityLoading ? 'Canonical feed loading' : undefined,
      protocolActivityError ? `Protocol error ${protocolError ?? 'request failed'}` : undefined,
      indexerState.status !== 'ready' ? `Indexer ${indexerState.status}` : undefined,
    ].filter(Boolean)
    return parts.join(' · ')
  }, [
    totalCount,
    ammCount,
    masterchefCount,
    smartchefCount,
    duplicatesRemoved,
    newestTimestamp,
    oldestTimestamp,
    protocolActivityLoading,
    protocolActivityError,
    protocolError,
    indexerState.status,
  ])

  const isTrendingIndexing = useMemo(() => {
    const farmsLoading =
      farmsFetchStatus === 'fetching' ||
      farmsFetchStatus === 'not-fetched'
    const poolsLoading =
      poolsFetchStatus === FetchStatus.Fetching || poolsFetchStatus === FetchStatus.Idle
    return farmsLoading || poolsLoading || indexerState.status === 'loading'
  }, [farmsFetchStatus, poolsFetchStatus, indexerState.status])

  const activityEmptySecondary = useMemo(() => {
    if (protocolRows.length > 0 || isActivityIndexing || protocolActivityError) return undefined
    return 'The indexed activity window is currently empty.'
  }, [protocolRows.length, isActivityIndexing, protocolActivityError])

  const activityUnavailable = useMemo((): ActivityUnavailable | undefined => {
    if (protocolRows.length > 0 || isActivityIndexing) return undefined
    if (!protocolActivityError) return undefined
    const reason = protocolError ?? indexerState.reason ?? 'Protocol activity request failed'
    const diagnostic = buildIndexerActivityDiagnostic({
      source: indexerState.source,
      indexer: indexerState.indexer,
      lastAttempt: indexerState.lastAttempt,
      reason,
    })
    return {
      message: 'Protocol activity is temporarily unavailable.',
      timestamp: diagnostic.lastAttempt,
      reason: diagnostic.reason,
      source: diagnostic.source,
      indexer: diagnostic.indexer,
      lastAttempt: diagnostic.lastAttempt,
    }
  }, [protocolRows.length, isActivityIndexing, protocolActivityError, protocolError, indexerState])

  const showEarn = farmRows.length > 0 || poolRows.length > 0
  const showEarnNote = farmRows.some((r) => r.apr) || poolRows.some((r) => r.apr)

  const marcoPriceLabel = useMemo(() => canonicalMarco.label, [canonicalMarco.label])

  const liveEconomyMetrics = useMemo((): LiveEconomyMetric[] => {
    const activeFarmCount = allFarms.filter((f) => f.pid !== 0 && f.multiplier !== '0X').length
    const poolReconciliation = reconcilePoolLifecycle(allPools, currentBlock)
    const rewardingPoolCount = poolReconciliation.rewarding
    const indexedAssetCount = tradeableAssetCount

    const pushMetric = (built: ReturnType<(typeof LIVE_ECONOMY_METRIC_BUILDERS)['activeFarms']>) => {
      return {
        id: built.id,
        label: built.label,
        value: built.value,
        live: true,
        ontologyId: built.ontologyId,
        source: built.source,
        owner: built.owner,
        href: built.href,
        asOf: built.asOf,
      }
    }

    return [
      pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.activeFarms(String(activeFarmCount))),
      pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.rewardingPools(String(rewardingPoolCount))),
      pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.liquidPairs(String(liquidPairCount))),
      pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.indexedAssets(String(indexedAssetCount))),
    ]
  }, [allFarms, allPools, currentBlock, tradeableAssetCount, dexProjects.length, liquidPairCount])

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
    homeActivityRows,
    activityViewAllHref,
    activityEmptySecondary,
    activityMergeStats: mergeStats,
    activityDuplicatesRemoved: duplicatesRemoved,
    activityTotalCount: totalCount,
    activityAmmCount: ammCount,
    activityMasterchefCount: masterchefCount,
    activitySmartchefCount: smartchefCount,
    activityNewestTimestamp: newestTimestamp,
    activityOldestTimestamp: oldestTimestamp,
    activityIsError: protocolActivityError,
    activityErrorDetail: protocolActivityError ? activityDiagnostic : undefined,
    activityDiagnostic,
    liveEconomyMetrics,
    showEarn,
    showEarnNote,
    marcoPriceLabel,
    isActivityIndexing,
    isTrendingIndexing,
    activityUnavailable,
    /** @deprecated LiveActivityFeed derives title from row timestamps. */
    activityScopeTitle: '',
    indexerState,
    showRibbon: ribbonItems.length > 0,
    showMarket: marketCards.length > 0,
    marketUnavailableReason,
    trendingUnavailableReason,
    poolAprUnavailableReason,
  }
}

export default useHomeTradeData
