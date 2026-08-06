import { useMemo } from 'react'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { Pool } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import type { MelegaTickerItem } from 'design-system/melega'
import { buildIndexerActivityDiagnostic } from 'lib/runtime-integrity'
import { useProtocolActivityFeed } from 'lib/protocol-activity/useProtocolActivityFeed'
import { formatHomeActivityRows } from './formatHomeActivity'
import { getCanonicalIndexedAssets, getTradeSurfaceAssets } from 'lib/canonical-token-registry'
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
import { evaluateTopPoolsAprEligibility } from 'views/PoolsStudio/poolsRuntime/poolsAprRules'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import {
  formatFarmTrendingLabel,
  formatPoolMetaLabel,
  formatPoolTickerAccent,
  formatPoolTrendingLabel,
  POOL_APR_UNAVAILABLE_REASON,
} from './formatTrendingLabels'
import { useTopMoversSnapshot } from './TopMoversSnapshotContext'
import {
  countLiveActiveFarmConfigs,
  countLivePoolConfigs,
  listLiveFarmInventoryPreview,
  listLivePoolInventoryPreview,
  liveInventoryProvenance,
} from 'lib/data-truth/liveInventoryCounts'
import { compareYieldTruthDesc } from 'lib/data-truth/yieldTruthRanking'
import {
  farmPairLabel,
  formatFarmTvlDisplay,
  formatYieldUsd,
  poolPairLabel,
  resolveFarmAprPercent,
  resolveFarmChainId,
  resolveFarmLiquidityUsd,
  resolveFarmRewardToken,
  resolvePoolAprPercent,
  resolvePoolChainId,
  resolvePoolFeesDisplay,
  resolvePoolRewardToken,
  resolvePoolTvlUsd,
  resolvePoolVolumeDisplay,
} from 'lib/data-truth/yieldMetricHelpers'

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
  rewards?: string
  /** Pool volume when indexed — Unavailable for SmartChef when not certified. */
  volume?: string
  /** Pool fees when known (e.g. 0% deposit). */
  fees?: string
  href: string
  chainId?: number
  /** Token symbols for logos (pair / stake→earn). */
  tokenSymbols?: string[]
  tokenAddresses?: string[]
  /** True when APR cannot be certified — UI shows APR unavailable. */
  aprUnavailable?: boolean
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
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes('://')) return undefined
  if (/sousId|sous\s*id|sld\s*\d/i.test(trimmed)) return undefined
  if (/^\(\s*\)$/.test(trimmed)) return undefined
  return trimmed
}

const farmApr = (farm: FarmWithStakedValue): number | undefined => resolveFarmAprPercent(farm)

const farmTvl = (farm: FarmWithStakedValue): string | undefined => formatFarmTvlDisplay(farm)

const farmTvlUsd = (farm: FarmWithStakedValue): number => resolveFarmLiquidityUsd(farm)

/** Factual farm reward label — dual earnLabel when present, else MARCO (MasterChef). */
const farmRewards = (farm: FarmWithStakedValue): string => resolveFarmRewardToken(farm)

const poolRewardFromName = (name: string): string | undefined => {
  const parts = name.split('→')
  if (parts.length < 2) return undefined
  const reward = parts[parts.length - 1]?.trim()
  return reward || undefined
}

const poolTvl = (
  pool: Pool.DeserializedPool<Token>,
  hints?: { marcoUsd?: number },
): string | undefined => formatYieldUsd(resolvePoolTvlUsd(pool, hints))

const poolApr = (pool: Pool.DeserializedPool<Token>): number | undefined => resolvePoolAprPercent(pool)

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
  /** Certified protocol volume — do not independently re-sum tier-metrics on Home. */
  const marketSnapshot = useCanonicalMarketSnapshot()

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

  // Shared Top Movers snapshot (same instance as global ticker).
  const dexTrending = useTopMoversSnapshot()

  const catalogRibbonAssets = useMemo((): IndexedRibbonAsset[] => {
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

  /** Prefer Factory/Router activity-ranked assets; fall back to catalog only when empty. */
  const indexedRibbonAssets = useMemo((): IndexedRibbonAsset[] => {
    if (dexTrending.indexedRibbonAssets.length > 0) {
      return dexTrending.indexedRibbonAssets.map((asset) => ({
        slug: asset.slug,
        symbol: asset.symbol,
        address: asset.address,
        chainId: asset.chainId,
        displayName: sanitizeRibbonText(asset.displayName ?? asset.symbol) ?? asset.symbol,
      }))
    }
    return catalogRibbonAssets
  }, [dexTrending.indexedRibbonAssets, catalogRibbonAssets])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    // Exact shared snapshot entries — Home card must prefix-slice these.
    return dexTrending.tickerItems
  }, [dexTrending.tickerItems])

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
          href: `/@${latestProject.slug}/`,
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

    // Partial factual TVL from live farm liquidity (USD when farm runtime prices it).
    const farmTvlUsd = allFarms.reduce((sum, farm) => {
      if (farm.pid === 0 || farm.multiplier === '0X') return sum
      const withLiq = farm as FarmWithStakedValue
      const liq = withLiq.liquidity?.toNumber?.()
      if (Number.isFinite(liq) && (liq as number) > 0) return sum + (liq as number)
      const lpQuote = withLiq.lpTotalInQuoteToken?.toNumber?.()
      const quotePrice = Number(withLiq.quoteTokenPriceBusd ?? 0)
      if (Number.isFinite(lpQuote) && quotePrice > 0) return sum + (lpQuote as number) * quotePrice
      return sum
    }, 0)
    const tvlLabel = formatUsd(farmTvlUsd)
    if (tvlLabel) {
      cards.push({
        id: 'tvl',
        label: 'TVL',
        value: tvlLabel,
        meta: 'Partial · farm liquidity',
        href: '/farms',
      })
    }

    // Volume: certified canonical market snapshot (WBNB-side · rolling 24H).
    const tierUsd =
      marketSnapshot.volume24hUsd != null && marketSnapshot.volume24hUsd > 0
        ? marketSnapshot.volume24hUsd
        : 0
    const swapUsd = recentTransactions
      .filter((tx) => tx.type === TransactionType.SWAP)
      .reduce((sum, tx) => sum + (Number.isFinite(tx.amountUSD) ? tx.amountUSD : 0), 0)
    const volLabel = formatUsd(Math.max(tierUsd, swapUsd))
    if (volLabel) {
      cards.push({
        id: 'volume-24h',
        label: '24H Volume',
        value: volLabel,
        meta:
          tierUsd > 0
            ? `Certified market snapshot · ${marketSnapshot.status ?? 'LIVE'}`
            : 'Partial · USD-valued indexed swaps',
        href: '/trade',
      })
    }

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

    return cards.slice(0, 5)
  }, [
    farms,
    allFarms,
    allPools,
    currentBlock,
    tradeablePairs,
    recentTransactions,
    marketSnapshot.volume24hUsd,
    marketSnapshot.status,
  ])

  const farmRows = useMemo((): EarnRow[] => {
    // Prefer active-chain farms (same runtime as Farms page), then pad with multichain inventory.
    // Ranking: TVL → APR → volume (LP fee APR proxy) → activity (multiplier weight).
    // Metrics via shared yieldMetricHelpers (same formulas as FarmsStudio enrichment).
    const ranked = farms
      .filter((f) => f.pid !== 0)
      .map((farm) => {
        const apr = farmApr(farm)
        const tvl = farmTvl(farm)
        const tvlUsd = farmTvlUsd(farm)
        const volumeProxy = farm.lpRewardsApr && farm.lpRewardsApr > 0 ? farm.lpRewardsApr : 0
        const mult = Number.parseFloat(String(farm.multiplier ?? '0').replace(/x/i, ''))
        const activity = Number.isFinite(mult) ? mult : 0
        const farmChain = resolveFarmChainId(farm, chainId)
        const token0 = farm.token?.symbol
        const token1 = farm.quoteToken?.symbol
        return {
          id: `farm-${farmChain}-${farm.pid}`,
          name: farmPairLabel(farm),
          apr: apr && apr > 0 ? `${apr.toFixed(2)}%` : undefined,
          aprUnavailable: !(apr && apr > 0),
          tvl: tvl || undefined,
          rewards: farmRewards(farm),
          href: '/farms',
          chainId: farmChain,
          tokenSymbols: [token0, token1].filter(Boolean) as string[],
          tokenAddresses: [farm.token?.address, farm.quoteToken?.address].filter(Boolean) as string[],
          sortTvl: tvlUsd,
          sortApr: apr ?? -1,
          sortVolume: volumeProxy,
          sortActivity: activity,
        }
      })
      .sort((a, b) =>
        compareYieldTruthDesc(
          { sortTvl: a.sortTvl, sortApr: a.sortApr, sortVolume: a.sortVolume, sortActivity: a.sortActivity },
          { sortTvl: b.sortTvl, sortApr: b.sortApr, sortVolume: b.sortVolume, sortActivity: b.sortActivity },
        ),
      )
      .slice(0, 5)
      .map(({ sortTvl: _t, sortApr: _a, sortVolume: _v, sortActivity: _act, ...row }) => row)

    if (ranked.length >= 5) return ranked

    const seen = new Set(ranked.map((r) => r.name.toLowerCase()))
    const preview = listLiveFarmInventoryPreview(12)
    const padded = [...ranked]
    for (const row of preview) {
      if (padded.length >= 5) break
      if (seen.has(row.name.toLowerCase())) continue
      seen.add(row.name.toLowerCase())
      const runtimeMatch =
        row.chainId === chainId
          ? farms.find((f) => f.pid === Number(String(row.id).split('-').pop()))
          : undefined
      const apr = runtimeMatch ? farmApr(runtimeMatch) : undefined
      const tvl = runtimeMatch ? farmTvl(runtimeMatch) : undefined
      padded.push({
        id: row.id,
        name: row.name,
        apr: apr && apr > 0 ? `${apr.toFixed(2)}%` : undefined,
        aprUnavailable: !(apr && apr > 0),
        tvl: tvl || undefined,
        rewards: runtimeMatch ? farmRewards(runtimeMatch) : 'MARCO',
        href: '/farms',
        chainId: row.chainId,
        tokenSymbols: row.name.includes('-')
          ? row.name.split('-').map((s) => s.trim()).filter(Boolean)
          : undefined,
      })
    }

    if (padded.length > 0) return padded

    return allFarms
      .filter((f) => f.pid !== 0 && String(f.multiplier ?? '1X').toUpperCase() !== '0X')
      .slice(0, 5)
      .map((farm) => ({
        id: `farm-inv-${farm.pid}`,
        name: farmPairLabel(farm),
        apr: undefined,
        aprUnavailable: true,
        tvl: farmTvl(farm),
        rewards: farmRewards(farm),
        href: '/farms',
        chainId: resolveFarmChainId(farm, chainId),
        tokenSymbols: [farm.token?.symbol, farm.quoteToken?.symbol].filter(Boolean) as string[],
      }))
  }, [farms, allFarms, chainId])

  const poolRows = useMemo((): EarnRow[] => {
    // Prefer factual TVL/rewards even when APR cannot be certified. Rank: TVL → volume → fees → APR.
    // Shared resolvePoolTvlUsd (stake × trusted price) — same helper as useGetTopPoolsByApr.
    const marcoUsd = marcoPrice?.toNumber?.()
    const hints = { marcoUsd: marcoUsd && marcoUsd > 0 ? marcoUsd : undefined }
    const source = (pools.length > 0 ? pools : allPools).filter(Boolean)
    const ranked = source
      .map((pool) => {
        const aprValue = poolApr(pool)
        const tvlUsd = resolvePoolTvlUsd(pool, hints)
        const life = derivePoolLifecycle(pool, currentBlock)
        const eligibility = evaluateTopPoolsAprEligibility({
          rewarding: life.rewarding,
          emissionActive: life.rewarding,
          apr: aprValue,
          tvlUsd,
          rewardPriceUsd: pool.earningTokenPrice ?? null,
          stakePriceUsd: pool.stakingTokenPrice ?? hints.marcoUsd ?? null,
        })
        const volumeUsd = 0
        const feesUsd = 0
        return { pool, aprValue, tvlUsd, eligibility, life, volumeUsd, feesUsd }
      })
      .filter(
        (row) =>
          row.tvlUsd > 0 ||
          row.aprValue != null ||
          row.life.rewarding ||
          row.life.active ||
          Boolean(row.pool.earningToken?.symbol),
      )
      .sort((a, b) =>
        compareYieldTruthDesc(
          { sortTvl: a.tvlUsd, sortApr: a.aprValue ?? -1, sortVolume: a.volumeUsd, sortActivity: a.feesUsd },
          { sortTvl: b.tvlUsd, sortApr: b.aprValue ?? -1, sortVolume: b.volumeUsd, sortActivity: b.feesUsd },
        ) ||
        (a.pool.contractAddress || a.pool.sousId || '')
          .toString()
          .toLowerCase()
          .localeCompare((b.pool.contractAddress || b.pool.sousId || '').toString().toLowerCase()),
      )
      .slice(0, 5)

    const toEarnRow = (pool: Pool.DeserializedPool<Token>, tvlUsd: number, aprValue?: number): EarnRow => {
      const stake = pool.stakingToken?.symbol
      const earn = resolvePoolRewardToken(pool)
      const poolChain = resolvePoolChainId(pool, chainId)
      const showApr = aprValue != null && aprValue > 0
      return {
        id: `pool-${poolChain}-${pool.sousId}`,
        name: poolPairLabel(pool),
        apr: showApr ? `${aprValue.toFixed(2)}%` : undefined,
        aprUnavailable: !showApr,
        tvl: tvlUsd > 0 ? formatUsd(tvlUsd) : poolTvl(pool, hints),
        volume: resolvePoolVolumeDisplay(pool),
        fees: resolvePoolFeesDisplay(pool),
        rewards: earn || undefined,
        href: '/pools',
        chainId: poolChain,
        tokenSymbols: [stake, earn].filter(Boolean) as string[],
        tokenAddresses: [pool.stakingToken?.address, pool.earningToken?.address].filter(
          Boolean,
        ) as string[],
      }
    }

    const fromRuntime: EarnRow[] =
      ranked.length > 0
        ? ranked.map(({ pool, aprValue, tvlUsd }) => toEarnRow(pool, tvlUsd, aprValue))
        : []

    if (fromRuntime.length >= 5) return fromRuntime

    // Prefer same-chain runtime pools before multichain config inventory (inventory has no TVL).
    const seen = new Set(fromRuntime.map((r) => r.name.toLowerCase()))
    const padded = [...fromRuntime]
    const sameChainExtras = source
      .filter((pool) => resolvePoolChainId(pool, chainId) === chainId && pool.sousId !== 0)
      .map((pool) => {
        const aprValue = poolApr(pool)
        const tvlUsd = resolvePoolTvlUsd(pool, hints)
        const life = derivePoolLifecycle(pool, currentBlock)
        return { pool, aprValue, tvlUsd, life }
      })
      .filter(
        (row) =>
          !seen.has(poolPairLabel(row.pool).toLowerCase()) &&
          (row.tvlUsd > 0 ||
            row.aprValue != null ||
            row.life.rewarding ||
            row.life.active ||
            Boolean(row.pool.earningToken?.symbol)),
      )
      .sort((a, b) => b.tvlUsd - a.tvlUsd || (b.aprValue ?? -1) - (a.aprValue ?? -1))

    for (const row of sameChainExtras) {
      if (padded.length >= 5) break
      const name = poolPairLabel(row.pool).toLowerCase()
      if (seen.has(name)) continue
      seen.add(name)
      padded.push(toEarnRow(row.pool, row.tvlUsd, row.aprValue))
    }

    if (padded.length >= 5) return padded

    const preview = listLivePoolInventoryPreview(12)
    for (const row of preview) {
      if (padded.length >= 5) break
      if (seen.has(row.name.toLowerCase())) continue
      seen.add(row.name.toLowerCase())
      const addr = String(row.id).includes(':') ? String(row.id).split(':')[1] : undefined
      const sousId = Number(String(row.id).split('-').pop())
      const pool =
        row.chainId === chainId
          ? source.find((p) =>
              addr
                ? String(p.contractAddress ?? '').toLowerCase() === addr.toLowerCase()
                : Number(p.sousId) === sousId,
            )
          : undefined
      if (!pool) {
        // Inventory-only pad: names + logos/chain — never invent TVL/APR.
        padded.push({
          id: row.id,
          name: row.name,
          apr: undefined,
          aprUnavailable: true,
          tvl: undefined,
          volume: undefined,
          fees: undefined,
          rewards: poolRewardFromName(row.name),
          href: '/pools',
          chainId: row.chainId,
          tokenSymbols: row.name.includes('→')
            ? row.name.split('→').map((s) => s.trim()).filter(Boolean)
            : undefined,
        })
        continue
      }
      const aprValue = poolApr(pool)
      const tvlUsd = resolvePoolTvlUsd(pool, hints)
      padded.push({
        ...toEarnRow(pool, tvlUsd, aprValue),
        id: row.id,
        chainId: row.chainId,
        rewards: resolvePoolRewardToken(pool) || poolRewardFromName(row.name),
      })
    }

    if (padded.length > 0) return padded

    return source
      .filter((pool) => {
        const life = derivePoolLifecycle(pool, currentBlock)
        return life.rewarding || life.active
      })
      .slice(0, 5)
      .map((pool) => {
        const tvlUsd = resolvePoolTvlUsd(pool, hints)
        return toEarnRow(pool, tvlUsd, poolApr(pool))
      })
  }, [pools, allPools, currentBlock, chainId, marcoPrice])

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
    const runtimeFarmCount = allFarms.filter(
      (f) => f.pid !== 0 && String(f.multiplier ?? '1X').toUpperCase() !== '0X',
    ).length
    const configFarmCount = countLiveActiveFarmConfigs()
    // Prefer runtime when loaded; otherwise factual LIVE config inventory (never false zero).
    const activeFarmCount = runtimeFarmCount > 0 ? runtimeFarmCount : configFarmCount

    const poolReconciliation = reconcilePoolLifecycle(allPools, currentBlock)
    const runtimePoolCount =
      poolReconciliation.active > 0
        ? poolReconciliation.active
        : poolReconciliation.rewarding > 0
          ? poolReconciliation.rewarding
          : 0
    const configPoolCount = countLivePoolConfigs()
    const activePoolCount = runtimePoolCount > 0 ? runtimePoolCount : configPoolCount
    const provenance = liveInventoryProvenance()

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
      {
        ...pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.activeFarms(String(activeFarmCount))),
        source: runtimeFarmCount > 0 ? 'runtime-farms' : provenance.farmsSource,
        asOf: provenance.asOf,
      },
      {
        ...pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.rewardingPools(String(activePoolCount))),
        id: 'activePools',
        label: 'Active Pools',
        source: runtimePoolCount > 0 ? 'runtime-pools' : provenance.poolsSource,
        asOf: provenance.asOf,
      },
      {
        ...pushMetric(LIVE_ECONOMY_METRIC_BUILDERS.liquidPairs(String(liquidPairCount))),
        id: 'markets',
        label: 'MARKETS',
      },
    ]
  }, [allFarms, allPools, currentBlock, liquidPairCount])

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
    if (trendingTickerItems.length > 0 || !dexTrending.trendingEmpty) return undefined
    if (dexTrending.isLoading || indexerState.status === 'loading') {
      return indexerState.reason ?? 'Indexing recent swaps'
    }
    return 'No indexed Factory/Router swap activity in ranking window'
  }, [
    trendingTickerItems.length,
    dexTrending.trendingEmpty,
    dexTrending.isLoading,
    indexerState,
  ])

  const poolAprUnavailableReason = POOL_APR_UNAVAILABLE_REASON

  return {
    ribbonItems,
    trendingTickerItems,
    homeTopMoversEntries: dexTrending.homeEntries,
    topMoversSnapshotId: dexTrending.snapshot.snapshotId,
    topMoversPrefixResult: dexTrending.prefixResult,
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
