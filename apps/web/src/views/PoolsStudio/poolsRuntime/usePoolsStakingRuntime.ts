import { useCallback, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePoolsPageFetch, usePoolsWithVault } from 'state/pools/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCurrentBlock } from 'state/block/hooks'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolFilterChip, PoolPreviewCard } from '../poolsStudioData'
import {
  aggregateKpis,
  buildDonutSegments,
  formatUsd,
  listActivePools,
  mapPoolToPreviewCard,
  sortPoolsDefault,
} from './formatPoolsRuntime'
import { runtimeErrorFromPhase, type PoolsRuntimeError } from './poolsRuntimeErrors'
import usePoolsTerminalData from './usePoolsTerminalData'
import { getAprData } from 'views/Pools/helpers'

export type PoolsRuntimePhase =
  | 'idle'
  | 'loading_pools'
  | 'reading_wallet'
  | 'calculating_rewards'
  | 'wallet_required'
  | 'approval_required'
  | 'error'

export type PoolsModalAction = 'stake' | 'unstake' | 'claim' | null

export interface PoolsMachinePayload {
  status: PoolsRuntimePhase
  chainId?: number
  wallet?: string
  filter: string
  activePools: number
  endedPools?: number
  activePoolNames?: string[]
  endedPoolNames?: string[]
  displayedPools?: string[]
  poolSourceMethod?: string
  featuredPool?: string
  error?: PoolsRuntimeError | null
  timestamp: string
}

export interface PoolsFeaturedMetrics {
  name: string
  symbol: string
  apr: string
  rewardToken: string
  totalStaked: string
  lockLabel: string
  participants: string
  rewardsDistributed: string
  poolType: string
  card?: PoolPreviewCard
}

export interface PoolsAnalyticsData {
  rewardBars: number[]
  topRewardToken: { symbol: string; pct: string }
  topStakedPool: { name: string; tvl: string; sparkline: number[] }
}

export interface PoolsStakingRuntime {
  phase: PoolsRuntimePhase
  loadingLabel?: string
  error: PoolsRuntimeError | null
  filter: PoolFilterChip
  setFilter: (chip: PoolFilterChip) => void
  pools: PoolPreviewCard[]
  featured: PoolsFeaturedMetrics
  kpis: ReturnType<typeof aggregateKpis>
  donutSegments: ReturnType<typeof buildDonutSegments>
  advisorItems: Array<{ label: string; value: string; tone: 'green' | 'gold' | 'blue'; icon: string }>
  sustainability: { label: string; score: number; level: string }
  analytics: PoolsAnalyticsData
  terminal: ReturnType<typeof usePoolsTerminalData>
  machine: PoolsMachinePayload
  account?: string
  userDataLoaded: boolean
  requestModal: (pool: PoolPreviewCard, action: Exclude<PoolsModalAction, null>) => void
  modalRequest: { pool: PoolPreviewCard; action: Exclude<PoolsModalAction, null> } | null
  clearModal: () => void
}

function filterPools(cards: PoolPreviewCard[], filter: PoolFilterChip): PoolPreviewCard[] {
  let list = [...cards]
  switch (filter) {
    case 'Official':
      list = list.filter((p) => p.rawPool?.poolCategory === PoolCategory.CORE || p.sousId === 0)
      break
    case 'MARCO':
      list = list.filter(
        (p) => p.tokens.includes('MARCO') || p.rewardToken === 'MARCO' || p.name.includes('MARCO'),
      )
      break
    case 'Community':
      list = list.filter((p) => p.poolTypeLabel === 'Community Pool')
      break
    case 'Locked':
      list = list.filter((p) => p.vaultKey === VaultKey.CakeVault)
      break
    case 'Flexible':
      list = list.filter(
        (p) => p.vaultKey === VaultKey.CakeFlexibleSideVault || (!p.vaultKey && p.sousId === 0),
      )
      break
    case 'Highest APR':
      list = list.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))
      break
    case 'Newest':
      list = list.sort((a, b) => (b.sousId ?? 0) - (a.sousId ?? 0))
      break
    case 'Featured Farm':
      list = list.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0')).slice(0, 3)
      break
    default:
      list = sortPoolsDefault(list)
      break
  }
  return list
}

export function usePoolsStakingRuntime(): PoolsStakingRuntime {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const currentBlock = useCurrentBlock()
  const [filter, setFilter] = useState<PoolFilterChip>('All')
  const [modalRequest, setModalRequest] = useState<{
    pool: PoolPreviewCard
    action: Exclude<PoolsModalAction, null>
  } | null>(null)

  usePoolsPageFetch()
  const { pools: rawPools, userDataLoaded } = usePoolsWithVault(chainId)
  const terminal = usePoolsTerminalData()

  const performanceFee = 0

  const previewCards = useMemo(() => {
    if (!rawPools?.length) return []
    return rawPools
      .filter((p) => p.vaultKey !== VaultKey.IfoPool)
      .map((p) => mapPoolToPreviewCard(p, currentBlock, performanceFee))
      .filter((c): c is PoolPreviewCard => c !== null)
  }, [rawPools, currentBlock])

  const filteredPools = useMemo(() => filterPools(previewCards, filter), [previewCards, filter])

  const featuredCard = useMemo(() => {
    const live = previewCards.filter((p) => p.status === 'live')
    return live.sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0] ?? previewCards[0]
  }, [previewCards])

  const featured = useMemo((): PoolsFeaturedMetrics => {
    const card = featuredCard
    const pool = card?.rawPool
    const stakedUsd =
      pool?.totalStaked && pool.stakingToken?.decimals
        ? getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals) * (pool.stakingTokenPrice || 0)
        : 0
  return {
      name: card?.name ?? '—',
      symbol: card?.tokens[0] ?? 'MARCO',
      apr: card?.apr ?? '—',
      rewardToken: card?.rewardToken ?? '—',
      totalStaked: formatUsd(stakedUsd),
      lockLabel: card?.vaultKey === VaultKey.CakeVault ? 'Locked' : 'Flexible',
      participants: card?.participants ?? '—',
      rewardsDistributed: card?.dailyRewards !== '—' ? `${card?.dailyRewards ?? '—'} / day` : '—',
      poolType: card?.poolTypeLabel ?? '—',
      card,
    }
  }, [featuredCard])

  const kpis = useMemo(() => aggregateKpis(rawPools ?? [], featured.name), [rawPools, featured.name])
  const donutSegments = useMemo(() => buildDonutSegments(rawPools ?? []), [rawPools])

  const advisorItems = useMemo(() => {
    const flexible = previewCards.find((p) => p.poolTypeLabel === 'Flexible Pool')
    const locked = previewCards.find((p) => p.poolTypeLabel === 'Locked Pool')
    const highest = [...previewCards].sort((a, b) => parseFloat(b.apr || '0') - parseFloat(a.apr || '0'))[0]
    const partner = previewCards.find((p) => p.poolTypeLabel === 'Reward MARCO Holders')
    return [
      { label: "Today's Recommendation", value: flexible?.name ?? highest?.name ?? '—', tone: 'green' as const, icon: '★' },
      { label: 'Highest Yield', value: highest?.name ?? '—', tone: 'green' as const, icon: '↗' },
      { label: 'Lowest Risk', value: flexible?.name ?? '—', tone: 'gold' as const, icon: '◎' },
      { label: 'Partner Pool', value: partner?.name ?? locked?.name ?? '—', tone: 'blue' as const, icon: '◇' },
    ]
  }, [previewCards])

  const sustainability = useMemo(() => {
    const active = previewCards.filter((p) => p.status === 'live').length
    const score = Math.min(100, Math.max(20, active * 25 + (userDataLoaded ? 15 : 0)))
    const level = score >= 80 ? 'Very High' : score >= 50 ? 'Moderate' : 'Indexing'
    return { label: 'Reward Sustainability', score, level }
  }, [previewCards, userDataLoaded])

  const analytics = useMemo((): PoolsAnalyticsData => {
    const bars = (rawPools ?? []).slice(0, 12).map((pool) => {
      const { apr } = getAprData(pool, performanceFee)
      return Math.min(100, Math.max(8, apr * 2))
    })
    while (bars.length < 12) bars.push(8)

    const earningCounts: Record<string, number> = {}
    ;(rawPools ?? []).forEach((p) => {
      if (!p?.earningToken?.symbol) return
      const sym = p.earningToken.symbol
      earningCounts[sym] = (earningCounts[sym] || 0) + 1
    })
    const topSym = Object.entries(earningCounts).sort((a, b) => b[1] - a[1])[0]
    const topPct = topSym && rawPools?.length ? `${((topSym[1] / rawPools.length) * 100).toFixed(1)}%` : '—'

    const topPool = [...previewCards].sort((a, b) => {
      const aUsd = parseFloat(a.tvl.replace(/[^0-9.]/g, '')) || 0
      const bUsd = parseFloat(b.tvl.replace(/[^0-9.]/g, '')) || 0
      return bUsd - aUsd
    })[0]

    const sparkline = bars.slice(0, 12)

    return {
      rewardBars: bars,
      topRewardToken: { symbol: topSym?.[0] ?? 'MARCO', pct: topPct },
      topStakedPool: { name: topPool?.name ?? '—', tvl: topPool?.tvl ?? '—', sparkline },
    }
  }, [rawPools, previewCards])

  const phase: PoolsRuntimePhase = useMemo(() => {
    if (!rawPools) return 'loading_pools'
    if (account && !userDataLoaded) return 'reading_wallet'
    return 'idle'
  }, [rawPools, account, userDataLoaded])

  const error = useMemo(() => runtimeErrorFromPhase(phase), [phase])

  const machine: PoolsMachinePayload = useMemo(() => {
    const { activePools: activePoolNames, sourceMethod } = listActivePools(previewCards)
    const ended = previewCards.filter((p) => p.status === 'ended')
    return {
      status: phase,
      chainId,
      wallet: account,
      filter,
      activePools: activePoolNames.length,
      endedPools: ended.length,
      activePoolNames,
      endedPoolNames: ended.map((p) => p.name),
      displayedPools: filteredPools.slice(0, 10).map((p) => p.name),
      poolSourceMethod: sourceMethod,
      featuredPool: featured.name,
      error,
      timestamp: new Date().toISOString(),
    }
  }, [phase, chainId, account, filter, previewCards, filteredPools, featured.name, error])

  const loadingLabel =
    phase === 'loading_pools'
      ? 'Loading pools…'
      : phase === 'reading_wallet'
        ? 'Reading wallet…'
        : phase === 'calculating_rewards'
          ? 'Calculating rewards…'
          : undefined

  const requestModal = useCallback((pool: PoolPreviewCard, action: Exclude<PoolsModalAction, null>) => {
    setModalRequest({ pool, action })
  }, [])

  const clearModal = useCallback(() => setModalRequest(null), [])

  return {
    phase,
    loadingLabel,
    error,
    filter,
    setFilter,
    pools: filteredPools,
    featured,
    kpis,
    donutSegments,
    advisorItems,
    sustainability,
    analytics,
    terminal,
    machine,
    account,
    userDataLoaded,
    requestModal,
    modalRequest,
    clearModal,
  }
}
