import { useCallback, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePoolsPageFetch, usePoolsWithVault } from 'state/pools/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCurrentBlock, useInitialBlock } from 'state/block/hooks'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolFilterChip, PoolPreviewCard, PoolTab, PoolsSortMode } from '../poolsStudioData'
import {
  aggregateKpis,
  buildDonutSegments,
  formatUsd,
  listActivePools,
  listUsablePools,
  mapPoolToPreviewCard,
  selectFeaturedPool,
  sortPoolsDefault,
} from './formatPoolsRuntime'
import { buildPoolMachineV2 } from './formatPoolPresentation'
import { runtimeErrorFromPhase, type PoolsRuntimeError } from './poolsRuntimeErrors'
import usePoolsTerminalData from './usePoolsTerminalData'
import { getAprData } from 'views/Pools/helpers'
import { buildPoolGateReport, POOL_GATE_POLICY_NOTE } from './buildPoolGateReport'
import { getPoolsUxFixtureCards, isPoolsUxFixtureEnabled } from './poolsUxFixture'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'

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
  integrity?: {
    discovered: number
    indexed: number
    live: number
    ended: number
    hidden: number
    displayable: number
  }
  gateAudit?: ReturnType<typeof buildPoolGateReport>['gateAudit']
  gateSummary?: ReturnType<typeof buildPoolGateReport>['gateSummary']
  gatePolicyNote?: string
}

export interface PoolsFeaturedMetrics {
  name: string
  symbol: string
  apr?: string
  rewardToken: string
  stakeToken: string
  totalStaked: string
  tvl: string
  lockLabel: string
  lockPeriod: string
  cooldown: string
  participants: string
  rewardsDistributed: string
  estimatedDailyReward: string
  remainingRewards: string
  remainingRewardsPct: number
  remainingRewardsTone: 'green' | 'yellow' | 'red'
  rewardSustainability: string
  sustainabilityScore: number
  poolType: string
  visualType: string
  contractAddress: string
  contractLabel: string
  explorerUrl: string
  card?: PoolPreviewCard
}

export interface PoolsAnalyticsData {
  rewardBars: number[]
  topRewardToken: { symbol: string; pct: string }
  topStakedPool: { name: string; tvl: string; sparkline: number[] }
}

export type PoolsViewMode = 'grid' | 'list'

export interface PoolsStakingRuntime {
  phase: PoolsRuntimePhase
  loadingLabel?: string
  error: PoolsRuntimeError | null
  filter: PoolFilterChip
  setFilter: (chip: PoolFilterChip) => void
  viewMode: PoolsViewMode
  setViewMode: (mode: PoolsViewMode) => void
  poolTab: PoolTab
  setPoolTab: (tab: PoolTab) => void
  sortMode: PoolsSortMode
  setSortMode: (mode: PoolsSortMode) => void
  positionsCount: number
  hiddenPoolReasons: string[]
  poolsIndexingDiagnostic?: {
    source: string
    indexer: string
    lastAttempt: string
    reason: string
    integrity: PoolsMachinePayload['integrity']
  }
  pools: PoolPreviewCard[]
  featured: PoolsFeaturedMetrics
  kpis: ReturnType<typeof aggregateKpis>
  donutSegments: ReturnType<typeof buildDonutSegments>
  advisorItems: Array<{ label: string; value: string; tone: 'green' | 'gold' | 'blue'; icon: string; reason?: string }>
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

function matchesDurationFilter(visualType?: string, filter?: string): boolean {
  if (!visualType || !filter) return false
  if (filter === '30–90 Days') {
    return visualType === '30 Days' || visualType === 'Fixed 30d' || visualType === '90 Days' || visualType === 'Fixed 90d'
  }
  if (filter === '90–180 Days') {
    return visualType === '90 Days' || visualType === 'Fixed 90d' || visualType === '180 Days' || visualType === 'Fixed 180d'
  }
  if (filter === '180–365 Days') {
    return visualType === '180 Days' || visualType === 'Fixed 180d' || visualType === '365 Days' || visualType === 'Fixed 365d'
  }
  if (filter === '365+ Days') return visualType === '365 Days' || visualType === 'Fixed 365d'
  return false
}

function filterPools(cards: PoolPreviewCard[], filter: PoolFilterChip): PoolPreviewCard[] {
  let list = [...cards]
  const byVisual = (type: string) => list.filter((p) => p.visualType === type)

  switch (filter) {
    case 'Official':
      list = list.filter((p) => p.rewardBadge === 'Official' || p.sousId === 0)
      break
    case 'Partner':
      list = list.filter((p) => p.rewardBadge === 'Partner')
      break
    case 'Community':
      list = list.filter((p) => p.rewardBadge === 'Community')
      break
    case 'Flexible':
      list = byVisual('Flexible')
      break
    case '30–90 Days':
    case '90–180 Days':
    case '180–365 Days':
    case '365+ Days':
      list = list.filter((p) => matchesDurationFilter(p.visualType, filter))
      break
    case 'Auto Compound':
      list = byVisual('Auto Compound')
      break
    default:
      list = sortPoolsDefault(list)
      break
  }
  return list
}

function sortPools(cards: PoolPreviewCard[], sortMode: PoolsSortMode): PoolPreviewCard[] {
  const list = [...cards]
  if (sortMode === 'apr') {
    return list.sort((a, b) => (b.aprExact ?? 0) - (a.aprExact ?? 0))
  }
  if (sortMode === 'tvl') {
    return list.sort((a, b) => parseFloat(b.tvl.replace(/[^0-9.]/g, '') || '0') - parseFloat(a.tvl.replace(/[^0-9.]/g, '') || '0'))
  }
  if (sortMode === 'budget') {
    return list.sort(
      (a, b) =>
        parseFloat(b.rewardBudgetUsd?.replace(/[^0-9.]/g, '') || '0') -
        parseFloat(a.rewardBudgetUsd?.replace(/[^0-9.]/g, '') || '0'),
    )
  }
  return list.sort((a, b) => (b.sousId ?? 0) - (a.sousId ?? 0))
}

function filterByTab(cards: PoolPreviewCard[], tab: PoolTab, account?: string): PoolPreviewCard[] {
  if (tab === 'finished') return cards.filter((p) => p.status === 'ended')
  if (tab === 'positions') {
    return cards.filter((p) => Boolean(p.userStaked?.gt(0)) || Boolean(p.pendingReward?.gt(0)))
  }
  return cards.filter((p) => p.status !== 'ended')
}

export function usePoolsStakingRuntime(): PoolsStakingRuntime {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const currentBlock = useCurrentBlock()
  const [filter, setFilter] = useState<PoolFilterChip>('All')
  const [viewMode, setViewMode] = useState<PoolsViewMode>('grid')
  const [poolTab, setPoolTab] = useState<PoolTab>('all')
  const [sortMode, setSortMode] = useState<PoolsSortMode>('apr')
  const [modalRequest, setModalRequest] = useState<{
    pool: PoolPreviewCard
    action: Exclude<PoolsModalAction, null>
  } | null>(null)

  usePoolsPageFetch()
  const initialBlock = useInitialBlock()
  const { pools: rawPools, userDataLoaded } = usePoolsWithVault(chainId)
  const terminal = usePoolsTerminalData()

  const performanceFee = 0

  const previewCards = useMemo(() => {
    if (isPoolsUxFixtureEnabled()) {
      return getPoolsUxFixtureCards()
    }
    if (!rawPools?.length) return []
    return rawPools
      .filter((p) => p.vaultKey !== VaultKey.IfoPool)
      .map((p) => mapPoolToPreviewCard(p, currentBlock, performanceFee))
      .filter((c): c is PoolPreviewCard => c !== null)
  }, [rawPools, currentBlock])

  const filteredPools = useMemo(() => {
    const tabbed = filterByTab(previewCards, poolTab, account)
    const filtered = filterPools(tabbed, filter)
    const visible = poolTab === 'finished' ? filtered : listUsablePools(filtered)
    return sortPools(visible, sortMode)
  }, [previewCards, filter, poolTab, sortMode, account])

  const hiddenPoolReasons = useMemo(() => {
    const reasons = new Set<string>()
    previewCards.forEach((p) => {
      if (p.hiddenReason) reasons.add(p.hiddenReason)
    })
    return [...reasons]
  }, [previewCards])

  const positionsCount = useMemo(
    () => previewCards.filter((p) => Boolean(p.userStaked?.gt(0)) || Boolean(p.pendingReward?.gt(0))).length,
    [previewCards],
  )

  const featuredCard = useMemo(() => selectFeaturedPool(previewCards), [previewCards])

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
      apr: card?.apr ?? undefined,
      rewardToken: card?.rewardToken ?? '—',
      stakeToken: card?.stakeToken ?? card?.tokens[0] ?? '—',
      totalStaked: formatUsd(stakedUsd),
      tvl: card?.tvl ?? '—',
      lockLabel: card?.lockPeriod ?? 'Flexible',
      lockPeriod: card?.lockPeriod ?? 'Flexible',
      cooldown: card?.cooldown ?? 'None',
      participants: card?.participants ?? '—',
      rewardsDistributed: card?.dailyRewards !== '—' ? `${card?.dailyRewards ?? '—'} / day` : '—',
      estimatedDailyReward: card?.estimatedDailyReward ?? '—',
      remainingRewards: card?.remainingRewards ?? '—',
      remainingRewardsPct: card?.remainingRewardsPct ?? 0,
      remainingRewardsTone: card?.remainingRewardsTone ?? 'yellow',
      rewardSustainability: card?.rewardSustainability ?? 'Medium',
      sustainabilityScore: card?.sustainabilityScore ?? 0,
      poolType: card?.poolTypeLabel ?? '—',
      visualType: card?.visualType ?? 'Flexible',
      contractAddress: card?.contractAddress ?? '',
      contractLabel: card?.contractLabel ?? '—',
      explorerUrl: card?.explorerUrl ?? 'https://bscscan.com',
      card,
    }
  }, [featuredCard])

  const kpis = useMemo(
    () => aggregateKpis(rawPools ?? [], featuredCard, currentBlock, previewCards),
    [rawPools, featuredCard, currentBlock, previewCards],
  )
  const donutSegments = useMemo(() => buildDonutSegments(rawPools ?? []), [rawPools])

  const advisorItems = useMemo(() => {
    const usable = listUsablePools(previewCards)
    const bySustain = [...usable].sort((a, b) => (b.sustainabilityScore ?? 0) - (a.sustainabilityScore ?? 0))
    const byApr = [...usable].sort((a, b) => (b.aprExact ?? 0) - (a.aprExact ?? 0))
    const byRisk = [...usable].sort((a, b) => {
      const riskOrder = { 'Very Low': 0, Low: 1, Medium: 2, High: 3 }
      const aR = riskOrder[a.poolSafetyRisk as keyof typeof riskOrder] ?? 2
      const bR = riskOrder[b.poolSafetyRisk as keyof typeof riskOrder] ?? 2
      return aR - bR
    })
    const byLock = [...usable].sort((a, b) => {
      const lockScore = (p: PoolPreviewCard) => (p.lockPeriod?.includes('365') ? 4 : p.lockPeriod?.includes('180') ? 3 : 1)
      return lockScore(b) - lockScore(a)
    })
    const advisorUnavailable = 'No live pools with sustainable APR indexed'
    return [
      { label: 'Best Sustainability', value: bySustain[0]?.name ?? RUNTIME_UNAVAILABLE_LABEL, tone: 'green' as const, icon: '◎', reason: bySustain[0] ? undefined : advisorUnavailable },
      { label: 'Highest APR Sustainable', value: byApr[0]?.apr ?? byApr[0]?.name ?? RUNTIME_UNAVAILABLE_LABEL, tone: 'green' as const, icon: '↗', reason: byApr[0] ? undefined : advisorUnavailable },
      { label: 'Lowest Risk', value: byRisk[0]?.name ?? RUNTIME_UNAVAILABLE_LABEL, tone: 'gold' as const, icon: '◇', reason: byRisk[0] ? undefined : advisorUnavailable },
      { label: 'Best Long Term', value: byLock[0]?.name ?? RUNTIME_UNAVAILABLE_LABEL, tone: 'gold' as const, icon: '★', reason: byLock[0] ? undefined : advisorUnavailable },
    ]
  }, [previewCards])

  const sustainability = useMemo(() => {
    const active = previewCards.filter((p) => p.status === 'live').length
    const score = Math.min(100, Math.max(20, active * 25 + (userDataLoaded ? 15 : 0)))
    const level = score >= 80 ? 'Very High' : score >= 50 ? 'Moderate' : RUNTIME_UNAVAILABLE_LABEL
    return { label: 'Reward Sustainability', score, level }
  }, [previewCards, userDataLoaded])

  const analytics = useMemo((): PoolsAnalyticsData => {
    const bars = (rawPools ?? []).slice(0, 12).map((pool) => {
      const { apr } = getAprData(pool, performanceFee)
      const safe = Number.isFinite(apr) && apr > 0 ? Math.min(100, Math.max(8, apr * 2)) : 8
      return safe
    })
    while (bars.length < 12) bars.push(8)

    const earningCounts: Record<string, number> = {}
    ;(rawPools ?? []).forEach((p) => {
      if (!p?.earningToken?.symbol) return
      const sym = p.earningToken.symbol
      earningCounts[sym] = (earningCounts[sym] || 0) + 1
    })
    const topSym = Object.entries(earningCounts).sort((a, b) => b[1] - a[1])[0]
    const topPct = topSym && rawPools?.length ? `${((topSym[1] / rawPools.length) * 100).toFixed(1)}%` : RUNTIME_UNAVAILABLE_LABEL

    const topPool = [...previewCards].sort((a, b) => {
      const aUsd = parseFloat(a.tvl.replace(/[^0-9.]/g, '')) || 0
      const bUsd = parseFloat(b.tvl.replace(/[^0-9.]/g, '')) || 0
      return bUsd - aUsd
    })[0]

    const sparkline = bars.slice(0, 12)

    return {
      rewardBars: bars,
      topRewardToken: { symbol: topSym?.[0] ?? 'MARCO', pct: topPct },
      topStakedPool: { name: topPool?.name ?? RUNTIME_UNAVAILABLE_LABEL, tvl: topPool?.tvl ?? RUNTIME_UNAVAILABLE_LABEL, sparkline },
    }
  }, [rawPools, previewCards])

  const phase: PoolsRuntimePhase = useMemo(() => {
    if (isPoolsUxFixtureEnabled()) return 'idle'
    const poolsHydrated = rawPools.some((p) => Boolean(p?.stakingToken?.symbol || p?.vaultKey))
    if (chainId && initialBlock > 0 && !poolsHydrated) return 'loading_pools'
    if (account && !userDataLoaded) return 'reading_wallet'
    return 'idle'
  }, [rawPools, account, userDataLoaded, chainId, initialBlock])

  const error = useMemo(() => runtimeErrorFromPhase(phase), [phase])

  const poolGateReport = useMemo(
    () => buildPoolGateReport(previewCards, initialBlock > 0 ? initialBlock : undefined),
    [previewCards, initialBlock],
  )

  const poolsIndexingDiagnostic = useMemo(() => {
    const displayable = listUsablePools(previewCards)
    const ended = previewCards.filter((p) => p.status === 'ended')
    const live = previewCards.filter((p) => p.status === 'live')
    const hidden = previewCards.filter((p) => p.hiddenReason)
    const integrity = {
      discovered: previewCards.length,
      indexed: rawPools.length,
      live: live.length,
      ended: ended.length,
      hidden: hidden.length,
      displayable: displayable.length,
    }
    const lastAttempt = new Date().toISOString()
    if (phase === 'loading_pools') {
      return {
        source: 'on-chain',
        indexer: `pools-page-fetch-${chainId ?? 'unknown'}`,
        lastAttempt,
        reason: 'On-chain pool registry loading',
        integrity,
      }
    }
    if (displayable.length > 0) return undefined
    const hiddenSummary = hiddenPoolReasons.length ? hiddenPoolReasons.join(', ') : poolGateReport.gateSummary.emptyStateReason
    return {
      source: 'on-chain',
      indexer: `pools-runtime-${chainId ?? 'unknown'}`,
      lastAttempt,
      reason: `Discovered ${integrity.discovered}, indexed ${integrity.indexed}, live ${integrity.live}, ended ${integrity.ended}, hidden ${integrity.hidden}, displayable ${integrity.displayable}. Blockers: ${hiddenSummary}`,
      integrity,
    }
  }, [previewCards, rawPools.length, phase, chainId, hiddenPoolReasons, poolGateReport.gateSummary.emptyStateReason])

  const machine: PoolsMachinePayload = useMemo(() => {
    const { activePools: activePoolNames, sourceMethod } = listActivePools(previewCards)
    const ended = previewCards.filter((p) => p.status === 'ended')
    const live = previewCards.filter((p) => p.status === 'live')
    const hidden = previewCards.filter((p) => p.hiddenReason)
    const displayable = listUsablePools(previewCards)
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
      integrity: {
        discovered: previewCards.length,
        indexed: rawPools.length,
        live: live.length,
        ended: ended.length,
        hidden: hidden.length,
        displayable: displayable.length,
      },
      gateAudit: poolGateReport.gateAudit,
      gateSummary: poolGateReport.gateSummary,
      gatePolicyNote: POOL_GATE_POLICY_NOTE,
      pools: filteredPools.map((p) => buildPoolMachineV2(p, chainId)),
    } as PoolsMachinePayload & { pools?: ReturnType<typeof buildPoolMachineV2>[] }
  }, [phase, chainId, account, filter, previewCards, filteredPools, featured.name, error, rawPools.length, poolGateReport])

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
    viewMode,
    setViewMode,
    poolTab,
    setPoolTab,
    sortMode,
    setSortMode,
    positionsCount,
    hiddenPoolReasons,
    poolsIndexingDiagnostic,
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
