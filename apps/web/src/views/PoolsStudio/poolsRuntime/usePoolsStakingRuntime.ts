import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
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
  listRewardingPools,
  mapPoolToPreviewCard,
  selectFeaturedPool,
  sortPoolsDefault,
} from './formatPoolsRuntime'
import { deduplicatePoolPreviewCards } from './poolCardInventoryDedup'
import { buildPoolMachineV2 } from './formatPoolPresentation'
import { runtimeErrorFromPhase, type PoolsRuntimeError } from './poolsRuntimeErrors'
import usePoolsTerminalData from './usePoolsTerminalData'
import { getAprData } from 'views/Pools/helpers'
import { buildPoolGateReport, POOL_GATE_POLICY_NOTE } from './buildPoolGateReport'
import { classificationToReconciliation, resolveLifecycleCounts } from './poolClassificationSummary'
import { usePoolClassificationSummary } from './usePoolClassificationSummary'
import { getPoolsUxFixtureCards, isPoolsUxFixtureEnabled } from './poolsUxFixture'
import { useMelegaFactoryPools, type MelegaFactoryPoolsResult } from './useMelegaFactoryPools'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import type { WalletPortfolio } from 'lib/wallet-portfolio/contracts'
import { buildPoolsWalletPortfolio, type PoolsPortfolioViewMode } from './buildPoolsWalletPortfolio'

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
  /** Real producer inventory for wallet portfolio — never UX fixtures, never tab-filtered. */
  portfolioPools: PoolPreviewCard[]
  /** WalletPortfolio from portfolioPools — no second pool scan. */
  poolsWalletPortfolio: WalletPortfolio
  portfolioViewMode: PoolsPortfolioViewMode
  setPortfolioViewMode: (mode: PoolsPortfolioViewMode) => void
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
  rewardingCount: number
  poolReconciliation: ReturnType<typeof import('lib/data-truth/poolLifecycle').reconcilePoolLifecycle>
  poolClassificationSummary: ReturnType<typeof usePoolClassificationSummary>
  /** Factual Melega Factory AMM discovery (indexer pairs API). */
  factoryPools: MelegaFactoryPoolsResult
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
  const router = useRouter()
  const currentBlock = useCurrentBlock()
  const initialPoolView = typeof router.query.view === 'string' ? router.query.view : undefined
  const [filter, setFilter] = useState<PoolFilterChip>('All')
  const [portfolioViewMode, setPortfolioViewModeState] = useState<PoolsPortfolioViewMode>(
    initialPoolView === 'explore' ? 'ALL' : 'MY_POOLS',
  )
  const [viewMode, setViewMode] = useState<PoolsViewMode>('grid')
  const [poolTab, setPoolTab] = useState<PoolTab>(initialPoolView === 'explore' ? 'all' : 'positions')
  const [sortMode, setSortMode] = useState<PoolsSortMode>('apr')
  const [modalRequest, setModalRequest] = useState<{
    pool: PoolPreviewCard
    action: Exclude<PoolsModalAction, null>
  } | null>(null)

  useEffect(() => {
    const view = typeof router.query.view === 'string' ? router.query.view : undefined
    if (view === 'explore') {
      setPortfolioViewModeState('ALL')
      setPoolTab('all')
      setFilter('All')
    } else if (view === 'positions') {
      setPortfolioViewModeState('MY_POOLS')
      setPoolTab('positions')
    }
  }, [router.query.view])

  const setPortfolioViewMode = useCallback(
    (mode: PoolsPortfolioViewMode) => {
      setPortfolioViewModeState(mode)
      if (mode === 'MY_POOLS') {
        setPoolTab('positions')
      } else {
        setPoolTab('all')
        setFilter('All')
      }
      const nextQuery = { ...router.query, view: mode === 'MY_POOLS' ? 'positions' : 'explore' }
      void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
    },
    [router],
  )

  const setPoolTabSynced = useCallback(
    (tab: PoolTab) => {
      setPoolTab(tab)
      setPortfolioViewModeState(tab === 'positions' ? 'MY_POOLS' : 'ALL')
      const nextQuery = { ...router.query, view: tab === 'positions' ? 'positions' : 'explore' }
      void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
    },
    [router],
  )

  usePoolsPageFetch()
  const initialBlock = useInitialBlock()
  const { pools: rawPools, userDataLoaded } = usePoolsWithVault(chainId)
  const terminal = usePoolsTerminalData()
  const poolClassificationSummary = usePoolClassificationSummary()
  const factoryPools = useMelegaFactoryPools(chainId)

  const performanceFee = 0

  /** Canonical pool cards from live producers — never fixture data. */
  const realPreviewCards = useMemo(() => {
    if (!rawPools?.length) return []
    const cards = rawPools
      .filter((p) => p.vaultKey !== VaultKey.IfoPool)
      .map((p) => mapPoolToPreviewCard(p, currentBlock, performanceFee))
      .filter((c): c is PoolPreviewCard => c !== null)
    return deduplicatePoolPreviewCards(cards, chainId ?? 56)
  }, [rawPools, currentBlock, chainId])

  const previewCards = useMemo(() => {
    if (isPoolsUxFixtureEnabled()) {
      return getPoolsUxFixtureCards()
    }
    // Prefer factual Melega Factory AMM pairs for discovery; keep staking cards after.
    if (factoryPools.previewCards.length > 0) {
      const byId = new Map<string, PoolPreviewCard>()
      for (const card of [...factoryPools.previewCards, ...realPreviewCards]) {
        byId.set(card.id, card)
      }
      return [...byId.values()]
    }
    return realPreviewCards
  }, [realPreviewCards, factoryPools.previewCards])

  const chainName = chainId === 56 ? 'BNB Chain' : chainId === 97 ? 'BNB Testnet' : 'Unknown'
  const positionsLoading = Boolean(account) && !userDataLoaded
  const poolsWalletPortfolio = useMemo(
    () =>
      buildPoolsWalletPortfolio({
        wallet: account ?? null,
        chainId: chainId ?? null,
        chainName,
        generatedAt: '1970-01-01T00:00:00.000Z',
        poolCards: realPreviewCards,
        positionsLoading,
      }),
    [account, chainId, chainName, positionsLoading, realPreviewCards],
  )

  const filteredPools = useMemo(() => {
    const tabbed = filterByTab(previewCards, poolTab, account)
    const filtered = filterPools(tabbed, filter)
    const visible = poolTab === 'finished' ? filtered : listUsablePools(filtered)
    return sortPools(visible, sortMode)
  }, [previewCards, filter, poolTab, sortMode, account])

  const hiddenPoolReasons = useMemo(() => {
    const reasons = new Set<string>()
    previewCards.forEach((p) => {
      if (p.hiddenReasonLabel) reasons.add(p.hiddenReasonLabel)
      else if (p.hiddenReason) reasons.add(p.hiddenReason)
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

  const kpis = useMemo(() => {
    const base = aggregateKpis(rawPools ?? [], featuredCard, currentBlock, previewCards, poolClassificationSummary)
    return base.map((kpi) => {
      if (kpi.id === 'active') {
        return {
          ...kpi,
          value: factoryPools.discoveredKpiValue,
          secondary: factoryPools.discoveredKpiSecondary,
        }
      }
      // AMM USD valuation is not certified here — never show a fabricated TVL.
      if (kpi.id === 'tvl' && factoryPools.discoveryState === 'ready' && realPreviewCards.length === 0) {
        return {
          ...kpi,
          value: RUNTIME_UNAVAILABLE_LABEL,
          secondary: 'Valuation unavailable',
        }
      }
      return kpi
    })
  }, [
    rawPools,
    featuredCard,
    currentBlock,
    previewCards,
    poolClassificationSummary,
    factoryPools.discoveredKpiValue,
    factoryPools.discoveredKpiSecondary,
    factoryPools.discoveryState,
    realPreviewCards.length,
  ])
  const canonicalLifecycleCounts = resolveLifecycleCounts(poolClassificationSummary)
  const poolReconciliation = useMemo(() => {
    if (canonicalLifecycleCounts) {
      return classificationToReconciliation(canonicalLifecycleCounts)
    }
    return {
      discovered: 0,
      validContracts: 0,
      future: 0,
      active: 0,
      funded: 0,
      rewarding: 0,
      finished: 0,
      invalid: 0,
      unresolved: 0,
    }
  }, [canonicalLifecycleCounts])
  const rewardingCount = useMemo(
    () => canonicalLifecycleCounts?.rewarding ?? 0,
    [canonicalLifecycleCounts],
  )
  const donutSegments = useMemo(() => buildDonutSegments(rawPools ?? []), [rawPools])

  const advisorItems = useMemo(() => {
    const eligible = listRewardingPools(previewCards)
    if (!eligible.length) {
      return [
        {
          label: 'No eligible rewarding pools.',
          value: '',
          tone: 'muted' as const,
          icon: '—',
          reason: 'No funded SmartChef pool with sustainable APR in the current window.',
        },
      ]
    }
    const bySustain = [...eligible].sort((a, b) => (b.sustainabilityScore ?? 0) - (a.sustainabilityScore ?? 0))
    const top = bySustain[0]
    return [
      {
        label: 'Top pick',
        value: `${top.stakeToken} → ${top.rewardToken}`,
        tone: 'green' as const,
        icon: '◎',
        reason: top.apr ? `APR ${top.apr} · ${top.remainingRewards ?? '—'} remaining` : undefined,
      },
      {
        label: 'APR',
        value: top.sustainableAprDisplay ?? top.apr ?? RUNTIME_UNAVAILABLE_LABEL,
        tone: 'green' as const,
        icon: '↗',
      },
      {
        label: 'TVL',
        value: top.tvl ?? RUNTIME_UNAVAILABLE_LABEL,
        tone: 'default' as const,
        icon: '◇',
      },
      {
        label: 'Contract',
        value: top.contractLabel ?? 'View pool',
        tone: 'default' as const,
        icon: '★',
      },
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
    setPoolTab: setPoolTabSynced,
    sortMode,
    setSortMode,
    positionsCount,
    hiddenPoolReasons,
    poolsIndexingDiagnostic,
    pools: filteredPools,
    portfolioPools: realPreviewCards,
    poolsWalletPortfolio,
    portfolioViewMode,
    setPortfolioViewMode,
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
    rewardingCount,
    poolReconciliation,
    poolClassificationSummary,
    factoryPools,
  }
}
