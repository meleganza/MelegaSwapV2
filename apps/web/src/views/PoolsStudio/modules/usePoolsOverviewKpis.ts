/**
 * POOLS_MODULE_002 — compose Overview KPIs from shared Pools runtime.
 * Does not invent zeros. Does not use Factory pair counts for staking discovery.
 */
import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { useCurrentBlock } from 'state/block/hooks'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { listRewardingPools } from '../poolsRuntime/formatPoolsRuntime'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import { resolveLifecycleCounts } from '../poolsRuntime/poolClassificationSummary'
import { buildPools24hRewards } from './buildPools24hRewards'
import {
  POOLS_OVERVIEW_KPI_LABELS,
  POOLS_OVERVIEW_KPI_ORDER,
  type PoolsOverviewKpiId,
} from './poolsOverviewKpisTokens'
import type {
  KpiFreshness,
  KpiMetricState,
  PoolsOverviewKpiCardModel,
  PoolsOverviewKpisViewModel,
} from './poolsOverviewKpisTypes'

function formatUsdValue(value: number, allowZero: boolean): string {
  if (!Number.isFinite(value)) return '—'
  if (value < 0) return '—'
  if (value === 0) return allowZero ? '$0.00' : '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: value < 1 ? 2 : 0 })}`
}

function card(
  id: PoolsOverviewKpiId,
  value: string,
  supporting: string,
  state: KpiMetricState,
  freshness: KpiFreshness,
  a11yDetail?: string,
): PoolsOverviewKpiCardModel {
  return {
    id,
    label: POOLS_OVERVIEW_KPI_LABELS[id],
    value,
    supporting,
    state,
    freshness,
    a11yDetail,
  }
}

export function usePoolsOverviewKpis(): PoolsOverviewKpisViewModel {
  const runtime = usePoolsRuntime()
  const currentBlock = useCurrentBlock()

  return useMemo(() => {
    const fetchedAt = new Date().toISOString()
    const classification = runtime.poolClassificationSummary
    const counts = resolveLifecycleCounts(classification)

    // Producer inventory (unfiltered) — never Factory pairs; never UX fixtures when portfolioPools is set.
    const previewCards = runtime.portfolioPools?.length ? runtime.portfolioPools : runtime.pools
    const poolRows = previewCards
      .map((c) => c.rawPool)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))

    // —— TVL (staking domain only) ——
    let tvlUsd = 0
    let valuedPoolCount = 0
    let unvaluedWithStake = 0
    let universe = 0
    poolRows.forEach((pool) => {
      if (!pool.stakingToken?.decimals) return
      universe += 1
      const staked = getBalanceNumber(pool.totalStaked ?? new BigNumber(0), pool.stakingToken.decimals)
      const price = pool.stakingTokenPrice || 0
      if (price > 0) {
        tvlUsd += staked * price
        valuedPoolCount += 1
      } else if (staked > 0) {
        unvaluedWithStake += 1
      }
    })

    const poolsLoading = runtime.phase === 'loading_pools'
    let tvlCard: PoolsOverviewKpiCardModel
    if (poolsLoading && universe === 0) {
      tvlCard = card('tvl', '—', 'Loading valuation…', 'loading', 'loading')
    } else if (universe === 0) {
      tvlCard = card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
    } else if (valuedPoolCount === 0 && unvaluedWithStake > 0) {
      tvlCard = card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
    } else if (valuedPoolCount > 0 && (unvaluedWithStake > 0 || valuedPoolCount < universe)) {
      tvlCard = card(
        'tvl',
        formatUsdValue(tvlUsd, tvlUsd === 0 && unvaluedWithStake === 0),
        `Partial · ${valuedPoolCount} of ${universe} valued`,
        tvlUsd === 0 && unvaluedWithStake === 0 ? 'zero' : 'partial',
        'partial',
        `Staking-pool TVL from totalStaked × price · ${fetchedAt}`,
      )
    } else if (valuedPoolCount > 0) {
      const provenZero = tvlUsd === 0
      tvlCard = card(
        'tvl',
        formatUsdValue(tvlUsd, provenZero),
        provenZero ? 'No stake locked' : 'Staking pools',
        provenZero ? 'zero' : 'available',
        'live',
        `Staking-pool TVL · ${fetchedAt}`,
      )
    } else {
      tvlCard = card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
    }

    // —— Discovered (classification SmartChef — never Factory pairs) ——
    let discoveredCard: PoolsOverviewKpiCardModel
    if (classification.status === 'loading') {
      discoveredCard = card('discovered', '—', 'Loading pool index…', 'loading', 'loading')
    } else if (classification.status === 'ready' && counts) {
      const inactive = Math.max(0, counts.discovered - counts.active - counts.ended - counts.invalid)
      discoveredCard = card(
        'discovered',
        String(counts.discovered),
        `${counts.active} Active · ${counts.ended} Finished · ${inactive} Inactive · ${counts.invalid} Unavailable`,
        counts.discovered === 0 ? 'zero' : 'available',
        'live',
        `Total = Active + Finished + Inactive + Unavailable · SmartChef classification · ${classification.generatedAt ?? fetchedAt}`,
      )
    } else {
      discoveredCard = card('discovered', '—', 'Pool index unavailable', 'unavailable', 'unavailable')
    }

    // —— Rewarding (prefer max of classification + live SmartChef card lifecycle; never invent) ——
    const stakingCards = previewCards.filter((p) => p.rawPool && !p.id.startsWith('amm-'))
    const liveRewardingCards = listRewardingPools(stakingCards)
    const liveActiveCount = stakingCards.filter(
      (p) =>
        Boolean(p.lifecycle?.active) ||
        Boolean(p.lifecycle?.rewarding) ||
        p.status === 'live' ||
        p.displayStatus === 'LIVE',
    ).length
    let rewardingCard: PoolsOverviewKpiCardModel
    if (classification.status === 'loading' && liveRewardingCards.length === 0 && liveActiveCount === 0) {
      rewardingCard = card('rewarding', '—', 'Loading reward state…', 'loading', 'loading')
    } else {
      const classified = counts?.rewarding ?? 0
      const liveCount = liveRewardingCards.length
      // When classification undercounts open-ended/active emission pools, prefer live card truth.
      const rewardingCount = Math.max(classified, liveCount)
      const source =
        liveCount >= classified && liveCount > 0
          ? 'Live SmartChef lifecycle'
          : classification.status === 'ready'
            ? 'On-chain classification'
            : 'Live SmartChef lifecycle'
      const supportParts = [
        liveActiveCount > 0 ? `${liveActiveCount} active indexed` : null,
        classification.status === 'ready' && counts
          ? `${counts.rewarding} classified rewarding`
          : null,
      ].filter(Boolean)
      rewardingCard = card(
        'rewarding',
        String(rewardingCount),
        supportParts.length ? supportParts.join(' · ') : 'On-chain emission active',
        rewardingCount === 0 ? 'zero' : liveCount !== classified && classification.status === 'ready' ? 'partial' : 'available',
        liveCount !== classified && classification.status === 'ready' ? 'partial' : 'live',
        `${source} · ${fetchedAt}`,
      )
    }

    // —— 24H rewards — reward rate × active blocks in rolling 24H (not claim events) ——
    const rewards24h = buildPools24hRewards({
      pools: poolRows,
      currentBlock: currentBlock || null,
      loading: poolsLoading && poolRows.length === 0,
      updatedAt: fetchedAt,
    })
    const rewards24hCard = card(
      'rewards24h',
      rewards24h.displayValue,
      rewards24h.supporting,
      rewards24h.status === 'available'
        ? 'available'
        : rewards24h.status === 'partial'
          ? 'partial'
          : rewards24h.status === 'indexing'
            ? 'loading'
            : rewards24h.status === 'zero'
              ? 'zero'
              : 'unavailable',
      rewards24h.status === 'available'
        ? 'live'
        : rewards24h.status === 'partial'
          ? 'partial'
          : rewards24h.status === 'indexing'
            ? 'loading'
            : 'unavailable',
      rewards24h.provenance,
    )

    // —— Highest sustainable APR among active SmartChef pools (not AMM) ——
    const aprUniverse = stakingCards.filter(
      (p) =>
        p.status !== 'ended' &&
        p.displayStatus !== 'ENDED' &&
        (Boolean(p.lifecycle?.active) ||
          Boolean(p.lifecycle?.rewarding) ||
          p.status === 'live' ||
          p.displayStatus === 'LIVE' ||
          listRewardingPools([p]).length > 0),
    )
    let best: { display: string; name: string; exact: number } | null = null
    aprUniverse.forEach((p) => {
      const label = p.sustainableAprDisplay ?? p.apr
      if (!label || isForbiddenAprDisplay(label)) return
      const exact = parseFloat(label.replace('%', '')) || p.aprExact || 0
      if (!Number.isFinite(exact) || exact <= 0) return
      if (!best || exact > best.exact) {
        best = { display: label, name: p.name, exact }
      }
    })
    let aprCard: PoolsOverviewKpiCardModel
    if (poolsLoading && stakingCards.length === 0) {
      aprCard = card('sustainableApr', '—', 'Loading APR…', 'loading', 'loading')
    } else if (best) {
      aprCard = card('sustainableApr', best.display, best.name, 'available', 'live', 'poolsAprRules sustainable display')
    } else if (liveActiveCount > 0) {
      aprCard = card(
        'sustainableApr',
        '—',
        `${liveActiveCount} active · APR not yet priced`,
        'partial',
        'partial',
      )
    } else {
      aprCard = card('sustainableApr', '—', 'Sustainable APR unavailable', 'unavailable', 'unavailable')
    }

    // —— My Claimable ——
    let claimableCard: PoolsOverviewKpiCardModel
    const account = runtime.account
    if (!account) {
      claimableCard = card('claimable', '—', 'Connect wallet to view', 'unavailable', 'unavailable')
    } else if (!runtime.userDataLoaded) {
      claimableCard = card('claimable', '—', 'Loading claimable…', 'loading', 'loading')
    } else {
      let claimableUsd = 0
      let claimablePoolCount = 0
      let unvalued = 0
      poolRows.forEach((pool) => {
        const pending = pool.userData?.pendingReward
        if (!pending || !pending.gt(0) || !pool.earningToken?.decimals) return
        claimablePoolCount += 1
        const amount = getBalanceNumber(pending, pool.earningToken.decimals)
        const price = pool.earningTokenPrice || 0
        if (price > 0) claimableUsd += amount * price
        else unvalued += 1
      })
      if (claimablePoolCount === 0) {
        claimableCard = card('claimable', '$0.00', 'No claimable rewards', 'zero', 'live')
      } else if (unvalued > 0 && claimableUsd === 0) {
        claimableCard = card(
          'claimable',
          '—',
          `${claimablePoolCount} claimable pool${claimablePoolCount === 1 ? '' : 's'}`,
          'partial',
          'partial',
          'Reward amounts present · USD unavailable for one or more assets',
        )
      } else if (unvalued > 0) {
        claimableCard = card(
          'claimable',
          formatUsdValue(claimableUsd, false),
          `Partial · ${claimablePoolCount} pools`,
          'partial',
          'partial',
        )
      } else {
        claimableCard = card(
          'claimable',
          formatUsdValue(claimableUsd, true),
          `${claimablePoolCount} claimable pool${claimablePoolCount === 1 ? '' : 's'}`,
          claimableUsd === 0 ? 'zero' : 'available',
          'live',
        )
      }
    }

    const byId: Record<PoolsOverviewKpiId, PoolsOverviewKpiCardModel> = {
      tvl: tvlCard,
      discovered: discoveredCard,
      rewarding: rewardingCard,
      rewards24h: rewards24hCard,
      sustainableApr: aprCard,
      claimable: claimableCard,
    }
    const cards = POOLS_OVERVIEW_KPI_ORDER.map((id) => byId[id])

    const anyLoading = cards.some((c) => c.state === 'loading')
    const anyPartial = cards.some((c) => c.state === 'partial' || c.state === 'unavailable')
    const phase = anyLoading ? 'loading' : anyPartial ? 'partial' : 'ready'

    return {
      cards,
      phase,
      diagnostics: {
        tvlUsd: valuedPoolCount > 0 ? tvlUsd : null,
        valuedPoolCount,
        poolUniverseCount: universe,
        discoveredPoolCount: counts?.discovered ?? null,
        rewardingPoolCount: counts?.rewarding ?? null,
        rewards24hUsd: rewards24h.pricedUsd,
        rewards24hState: rewards24h.status,
        rewards24hBreakdown: rewards24h,
        sustainableApr: best?.display ?? null,
        sustainableAprPool: best?.name ?? null,
        claimableUsd:
          account && runtime.userDataLoaded
            ? byId.claimable.state === 'unavailable' || byId.claimable.state === 'loading'
              ? null
              : Number(byId.claimable.value.replace(/[^0-9.]/g, '')) || (byId.claimable.value === '$0.00' ? 0 : null)
            : null,
        claimablePoolCount: byId.claimable.supporting.match(/^(\d+)/)
          ? Number(byId.claimable.supporting.match(/^(\d+)/)?.[1])
          : 0,
        claimableUnvaluedCount: 0,
        walletState: !account ? 'disconnected' : runtime.userDataLoaded ? 'ready' : 'loading',
        classificationStatus: classification.status,
        factoryPairsNotUsed: true,
        rewards24hSource: rewards24h.methodology,
        provenance: {
          tvl: 'rawPool.totalStaked × stakingTokenPrice (SmartChef/SousChef)',
          discovered: 'GET /api/pools/classification SmartChef counts.discovered',
          rewarding: 'classification counts.rewarding',
          rewards24h: rewards24h.provenance,
          sustainableApr: 'poolsAprRules via previewCard.sustainableAprDisplay',
          claimable: 'userData.pendingReward × earningTokenPrice',
        },
        fetchedAt,
      },
    }
  }, [runtime, currentBlock])
}

/** Pure builder for unit tests (no React). */
export function buildPoolsOverviewKpisFromParts(input: {
  poolRows: Array<{
    totalStaked?: BigNumber
    stakingToken?: { decimals: number }
    stakingTokenPrice?: number
    earningToken?: { decimals: number }
    earningTokenPrice?: number
    userData?: { pendingReward?: BigNumber }
    isFinished?: boolean
  }>
  classification: { status: 'loading' | 'ready' | 'unavailable'; counts?: { discovered: number; active: number; ended: number; rewarding: number; funded: number; verified: number; invalid: number }; generatedAt?: string }
  previewCards: Array<{
    name: string
    status: string
    apr?: string
    sustainableAprDisplay?: string
    aprExact?: number
    lifecycle?: { rewarding?: boolean }
    rawPool?: unknown
  }>
  account?: string
  userDataLoaded: boolean
  poolsLoading: boolean
}): PoolsOverviewKpisViewModel {
  // Thin re-test surface: exercise formatting rules via a minimal synthetic path
  const { classification, account, userDataLoaded, poolsLoading, previewCards, poolRows } = input
  const counts = classification.status === 'ready' ? classification.counts : undefined
  const fetchedAt = 'test'

  let tvlUsd = 0
  let valued = 0
  let unvalued = 0
  let universe = 0
  poolRows.forEach((pool) => {
    if (!pool.stakingToken?.decimals) return
    universe += 1
    const staked = getBalanceNumber(pool.totalStaked ?? new BigNumber(0), pool.stakingToken.decimals)
    const price = pool.stakingTokenPrice || 0
    if (price > 0) {
      tvlUsd += staked * price
      valued += 1
    } else if (staked > 0) unvalued += 1
  })

  const tvlCard =
    poolsLoading && universe === 0
      ? card('tvl', '—', 'Loading valuation…', 'loading', 'loading')
      : valued === 0 && unvalued > 0
        ? card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
        : valued > 0 && (unvalued > 0 || valued < universe)
          ? card('tvl', formatUsdValue(tvlUsd, tvlUsd === 0 && unvalued === 0), `Partial · ${valued} of ${universe} valued`, 'partial', 'partial')
          : valued > 0
            ? card('tvl', formatUsdValue(tvlUsd, tvlUsd === 0), tvlUsd === 0 ? 'No stake locked' : 'Staking pools', tvlUsd === 0 ? 'zero' : 'available', 'live')
            : card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')

  const discoveredCard =
    classification.status === 'loading'
      ? card('discovered', '—', 'Loading pool index…', 'loading', 'loading')
      : counts
        ? card(
            'discovered',
            String(counts.discovered),
            `${counts.active} Active · ${counts.ended} Finished · ${Math.max(0, counts.discovered - counts.active - counts.ended - counts.invalid)} Inactive · ${counts.invalid} Unavailable`,
            counts.discovered === 0 ? 'zero' : 'available',
            'live',
          )
        : card('discovered', '—', 'Pool index unavailable', 'unavailable', 'unavailable')

  const rewardingCard =
    classification.status === 'loading'
      ? card('rewarding', '—', 'Loading reward state…', 'loading', 'loading')
      : counts
        ? card(
            'rewarding',
            String(counts.rewarding),
            counts.discovered > 0
              ? `${((counts.rewarding / counts.discovered) * 100).toFixed(1)}% of discovered pools`
              : 'On-chain emission active',
            counts.rewarding === 0 ? 'zero' : 'available',
            'live',
          )
        : card('rewarding', '—', 'Reward state unavailable', 'unavailable', 'unavailable')

  const rewards24h = buildPools24hRewards({
    pools: poolRows as any,
    currentBlock: null,
    loading: poolsLoading && poolRows.length === 0,
    updatedAt: fetchedAt,
  })
  const rewards24hCard = card(
    'rewards24h',
    rewards24h.displayValue,
    rewards24h.supporting,
    rewards24h.status === 'available'
      ? 'available'
      : rewards24h.status === 'partial'
        ? 'partial'
        : rewards24h.status === 'indexing'
          ? 'loading'
          : rewards24h.status === 'zero'
            ? 'zero'
            : 'unavailable',
    rewards24h.status === 'available' ? 'live' : rewards24h.status === 'partial' ? 'partial' : 'unavailable',
    rewards24h.provenance,
  )

  const rewardingCards = previewCards.filter((p) => p.lifecycle?.rewarding)
  let best: { display: string; name: string; exact: number } | null = null
  rewardingCards.forEach((p) => {
    const label = p.sustainableAprDisplay ?? p.apr
    if (!label || isForbiddenAprDisplay(label) || p.status === 'ended') return
    const exact = parseFloat(label.replace('%', '')) || p.aprExact || 0
    if (exact > 0 && (!best || exact > best.exact)) best = { display: label, name: p.name, exact }
  })
  const aprCard = best
    ? card('sustainableApr', best.display, best.name, 'available', 'live')
    : card('sustainableApr', '—', 'Sustainable APR unavailable', 'unavailable', 'unavailable')

  let claimableCard: PoolsOverviewKpiCardModel
  if (!account) claimableCard = card('claimable', '—', 'Connect wallet to view', 'unavailable', 'unavailable')
  else if (!userDataLoaded) claimableCard = card('claimable', '—', 'Loading claimable…', 'loading', 'loading')
  else {
    let usd = 0
    let n = 0
    let uv = 0
    poolRows.forEach((pool) => {
      const pending = pool.userData?.pendingReward
      if (!pending?.gt(0) || !pool.earningToken?.decimals) return
      n += 1
      const amount = getBalanceNumber(pending, pool.earningToken.decimals)
      const price = pool.earningTokenPrice || 0
      if (price > 0) usd += amount * price
      else uv += 1
    })
    if (n === 0) claimableCard = card('claimable', '$0.00', 'No claimable rewards', 'zero', 'live')
    else if (uv > 0 && usd === 0)
      claimableCard = card('claimable', '—', `${n} claimable pool${n === 1 ? '' : 's'}`, 'partial', 'partial')
    else claimableCard = card('claimable', formatUsdValue(usd, true), `${n} claimable pool${n === 1 ? '' : 's'}`, 'available', 'live')
  }

  const byId = {
    tvl: tvlCard,
    discovered: discoveredCard,
    rewarding: rewardingCard,
    rewards24h: rewards24hCard,
    sustainableApr: aprCard,
    claimable: claimableCard,
  }
  return {
    cards: POOLS_OVERVIEW_KPI_ORDER.map((id) => byId[id]),
    phase: 'ready',
    diagnostics: {
      tvlUsd: valued > 0 ? tvlUsd : null,
      valuedPoolCount: valued,
      poolUniverseCount: universe,
      discoveredPoolCount: counts?.discovered ?? null,
      rewardingPoolCount: counts?.rewarding ?? null,
      rewards24hUsd: rewards24h.pricedUsd,
      rewards24hState: rewards24h.status,
      rewards24hBreakdown: rewards24h,
      sustainableApr: best?.display ?? null,
      sustainableAprPool: best?.name ?? null,
      claimableUsd: null,
      claimablePoolCount: 0,
      claimableUnvaluedCount: 0,
      walletState: !account ? 'disconnected' : userDataLoaded ? 'ready' : 'loading',
      classificationStatus: classification.status,
      factoryPairsNotUsed: true,
      rewards24hSource: rewards24h.methodology,
      provenance: { test: fetchedAt, rewards24h: rewards24h.provenance },
      fetchedAt,
    },
  }
}
