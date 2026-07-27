/**
 * FARMS_MODULE_002 — pure Overview KPI composition (no React / no Redux).
 * 24H Rewards = MasterChef emission schedule (perBlock × blocks/day) when factual.
 * Active Farmers = unique MasterChef wallets from indexed activity when available.
 * Does not invent zeros. Does not include Pools TVL or wallet LP outside farms.
 */
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { formatApr, listRewardingFarms } from '../farmsRuntime/formatFarmsRuntime'
import { isUnavailableFarmMetric } from '../farmsStudioDisplay'
import type { FarmPreviewCard } from '../farmsStudioData'
import {
  FARMS_OVERVIEW_KPI_LABELS,
  FARMS_OVERVIEW_KPI_ORDER,
  type FarmsOverviewKpiId,
} from './farmsOverviewKpisTokens'
import type {
  FarmsOverviewKpiCardModel,
  FarmsOverviewKpisViewModel,
  KpiFreshness,
  KpiMetricState,
} from './farmsOverviewKpisTypes'

function formatUsdValue(value: number, allowZero: boolean): string {
  if (!Number.isFinite(value)) return '—'
  if (value < 0) return '—'
  if (value === 0) return allowZero ? '$0.00' : '—'
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: value < 1 ? 2 : 0 })}`
}

function card(
  id: FarmsOverviewKpiId,
  value: string,
  supporting: string,
  state: KpiMetricState,
  freshness: KpiFreshness,
  a11yDetail?: string,
): FarmsOverviewKpiCardModel {
  return {
    id,
    label: FARMS_OVERVIEW_KPI_LABELS[id],
    value,
    supporting,
    state,
    freshness,
    a11yDetail,
  }
}

/** LP farming inventory only — exclude MasterChef pid 0 (non-LP) and ended multipliers. */
function isLpFarmCard(card: FarmPreviewCard): boolean {
  const pid = card.pid ?? card.rawFarm?.pid
  if (pid === 0) return false
  return true
}

function isActiveFarmable(card: FarmPreviewCard): boolean {
  if (!isLpFarmCard(card)) return false
  if (card.status === 'finished') return false
  if (card.rawFarm?.multiplier === '0X') return false
  return card.status === 'live' || card.status === 'indexing'
}

function hasPositiveLiquidity(card: FarmPreviewCard): boolean {
  const liq = card.rawFarm?.liquidity?.toNumber?.() ?? 0
  return Number.isFinite(liq) && liq > 0
}

export function buildFarmsOverviewKpisFromParts(input: {
  previewCards: FarmPreviewCard[]
  farmsLoading: boolean
  account?: string
  userDataLoaded: boolean
  cakePriceUsd: number
  /** MasterChef MARCO per day (perBlock × blocksPerDay × multiplier). */
  emissionPerDayMarco?: number | null
  emissionStatus?: 'ready' | 'unavailable' | 'loading'
  emissionReason?: string
  /** Unique wallets with farm positions from indexed MasterChef activity. */
  activeFarmersCount?: number | null
  activeFarmersStatus?: 'ready' | 'partial' | 'unavailable' | 'loading'
  activeFarmersReason?: string
}): FarmsOverviewKpisViewModel {
  const fetchedAt = new Date().toISOString()
  const {
    previewCards,
    farmsLoading,
    account,
    userDataLoaded,
    cakePriceUsd,
    emissionPerDayMarco,
    emissionStatus = 'unavailable',
    emissionReason,
    activeFarmersCount,
    activeFarmersStatus = 'unavailable',
    activeFarmersReason,
  } = input
  const lpCards = previewCards.filter(isLpFarmCard)

  // —— Total Farm TVL (LP farming only; never Pools; never wallet LP) ——
  let tvlUsd = 0
  let valuedFarmCount = 0
  let unvaluedWithLiquiditySignal = 0
  let universe = 0
  lpCards.forEach((c) => {
    if (c.rawFarm?.multiplier === '0X') return
    universe += 1
    const liq = c.rawFarm?.liquidity?.toNumber?.()
    if (liq != null && Number.isFinite(liq) && liq > 0) {
      tvlUsd += liq
      valuedFarmCount += 1
    } else if (c.rawFarm?.lpTotalInQuoteToken && !c.rawFarm?.quoteTokenPriceBusd) {
      unvaluedWithLiquiditySignal += 1
    }
  })

  let tvlCard: FarmsOverviewKpiCardModel
  if (farmsLoading && lpCards.length === 0) {
    tvlCard = card('tvl', '—', 'Loading valuation…', 'loading', 'loading')
  } else if (universe === 0 && !farmsLoading) {
    tvlCard = card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
  } else if (valuedFarmCount === 0 && unvaluedWithLiquiditySignal > 0) {
    tvlCard = card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
  } else if (valuedFarmCount > 0 && (unvaluedWithLiquiditySignal > 0 || valuedFarmCount < universe)) {
    tvlCard = card(
      'tvl',
      formatUsdValue(tvlUsd, false),
      `Partial · ${valuedFarmCount} of ${universe} valued`,
      'partial',
      'partial',
      `LP farm TVL from farm.liquidity · ${fetchedAt}`,
    )
  } else if (valuedFarmCount > 0) {
    const provenZero = tvlUsd === 0
    tvlCard = card(
      'tvl',
      formatUsdValue(tvlUsd, provenZero),
      provenZero ? 'No LP farmed' : 'LP farming only',
      provenZero ? 'zero' : 'available',
      'live',
      `LP farm TVL · ${fetchedAt}`,
    )
  } else if (farmsLoading) {
    tvlCard = card('tvl', '—', 'Loading valuation…', 'loading', 'loading')
  } else {
    tvlCard = card('tvl', '—', 'Valuation unavailable', 'unavailable', 'unavailable')
  }

  // —— Active Farms (currently farmable LP farms only) ——
  const activeCards = lpCards.filter(isActiveFarmable)
  let activeFarmsCard: FarmsOverviewKpiCardModel
  if (farmsLoading && lpCards.length === 0) {
    activeFarmsCard = card('activeFarms', '—', 'Loading farms…', 'loading', 'loading')
  } else if (lpCards.length === 0) {
    activeFarmsCard = card('activeFarms', '—', 'Farm inventory unavailable', 'unavailable', 'unavailable')
  } else {
    activeFarmsCard = card(
      'activeFarms',
      String(activeCards.length),
      'Currently farmable LP farms',
      activeCards.length === 0 ? 'zero' : 'available',
      'live',
    )
  }

  // —— Active Farmers — unique MasterChef wallets from indexed Deposit/Withdraw ——
  let activeFarmersCard: FarmsOverviewKpiCardModel
  if (activeFarmersStatus === 'loading') {
    activeFarmersCard = card('activeFarmers', '—', 'Loading farmers…', 'loading', 'loading')
  } else if (
    (activeFarmersStatus === 'ready' || activeFarmersStatus === 'partial') &&
    activeFarmersCount != null &&
    Number.isFinite(activeFarmersCount)
  ) {
    activeFarmersCard = card(
      'activeFarmers',
      String(Math.max(0, Math.floor(activeFarmersCount))),
      activeFarmersStatus === 'partial'
        ? 'Indexed MasterChef wallets (partial window)'
        : 'Unique MasterChef position wallets',
      activeFarmersCount === 0 ? 'zero' : activeFarmersStatus === 'partial' ? 'partial' : 'available',
      activeFarmersStatus === 'partial' ? 'partial' : 'live',
      activeFarmersReason,
    )
  } else {
    activeFarmersCard = card(
      'activeFarmers',
      '—',
      activeFarmersReason || 'Unique wallet data unavailable',
      'unavailable',
      'unavailable',
      'Never uses LP total supply as farmers',
    )
  }

  // —— 24H Rewards — MasterChef emission schedule (perBlock × blocks elapsed / day) ——
  let rewards24hCard: FarmsOverviewKpiCardModel
  let rewards24hMarco: number | null = null
  let rewards24hUsd: number | null = null
  let rewards24hSource: FarmsOverviewKpisViewModel['diagnostics']['rewards24hSource'] =
    'unavailable_no_emission'
  if (emissionStatus === 'loading') {
    rewards24hCard = card('rewards24h', '—', 'Loading emission…', 'loading', 'loading')
  } else if (
    emissionStatus === 'ready' &&
    emissionPerDayMarco != null &&
    Number.isFinite(emissionPerDayMarco) &&
    emissionPerDayMarco > 0
  ) {
    rewards24hMarco = emissionPerDayMarco
    const marcoLabel =
      emissionPerDayMarco >= 1000
        ? `${(emissionPerDayMarco / 1000).toFixed(1)}K MARCO`
        : `${emissionPerDayMarco.toFixed(2)} MARCO`
    if (cakePriceUsd > 0) {
      rewards24hUsd = emissionPerDayMarco * cakePriceUsd
      rewards24hCard = card(
        'rewards24h',
        formatUsdValue(rewards24hUsd, false),
        `${marcoLabel} / 24H emission`,
        'available',
        'live',
        'MasterChef dexTokenPerBlock × blocks/day',
      )
    } else {
      rewards24hCard = card(
        'rewards24h',
        marcoLabel,
        'MasterChef emission schedule',
        'partial',
        'partial',
        'USD price unavailable · MARCO emission shown',
      )
    }
    rewards24hSource = 'masterchef_emission_per_block'
  } else {
    rewards24hCard = card(
      'rewards24h',
      '—',
      emissionReason || 'MasterChef emission unavailable',
      'unavailable',
      'unavailable',
      'Cannot display 24H Rewards without factual per-block emission',
    )
  }

  // —— Highest Sustainable APR ——
  const rewarding = listRewardingFarms(lpCards).filter(
    (f) =>
      f.status === 'live' &&
      hasPositiveLiquidity(f) &&
      f.apr &&
      !isUnavailableFarmMetric(f.apr) &&
      f.rawFarm?.multiplier !== '0X',
  )
  let best: { display: string; name: string; exact: number } | null = null
  rewarding.forEach((f) => {
    const label = f.displayApr ?? f.apr
    if (!label || isUnavailableFarmMetric(label)) return
    const exact = parseFloat(label.replace('%', '')) || 0
    if (!Number.isFinite(exact) || exact <= 0) return
    if (!best || exact > best.exact) {
      best = { display: formatApr(exact) === '—' ? label : formatApr(exact), name: f.pair, exact }
    }
  })
  let aprCard: FarmsOverviewKpiCardModel
  if (farmsLoading && lpCards.length === 0) {
    aprCard = card('sustainableApr', '—', 'Loading APR…', 'loading', 'loading')
  } else if (best) {
    aprCard = card('sustainableApr', best.display, best.name, 'available', 'live', 'Live rewarding LP farm APR')
  } else {
    aprCard = card('sustainableApr', '—', 'Sustainable APR unavailable', 'unavailable', 'unavailable')
  }

  // —— My Harvestable (wallet-scoped pending × MARCO price) ——
  let harvestableCard: FarmsOverviewKpiCardModel
  let harvestableUsdDiag: number | null = null
  let harvestableFarmCountDiag = 0
  if (!account) {
    harvestableCard = card('harvestable', '—', 'Connect wallet', 'unavailable', 'unavailable')
  } else if (!userDataLoaded) {
    harvestableCard = card('harvestable', '—', 'Loading harvestable…', 'loading', 'loading')
  } else {
    let harvestableUsd = 0
    let harvestableFarmCount = 0
    let unvalued = 0
    let pendingAmount = 0
    lpCards.forEach((f) => {
      const pending = f.pendingReward ?? f.rawFarm?.userData?.earnings
      if (!pending || !pending.gt(0)) return
      harvestableFarmCount += 1
      const amount = getBalanceNumber(pending, f.rawFarm?.earningToken?.decimals ?? 18)
      pendingAmount += amount
      if (cakePriceUsd > 0) harvestableUsd += amount * cakePriceUsd
      else unvalued += 1
    })
    harvestableFarmCountDiag = harvestableFarmCount

    if (harvestableFarmCount === 0) {
      harvestableUsdDiag = 0
      harvestableCard = card('harvestable', '$0.00', 'No harvest', 'zero', 'live')
    } else if (unvalued > 0 && harvestableUsd === 0) {
      harvestableCard = card(
        'harvestable',
        '—',
        `${harvestableFarmCount} farm${harvestableFarmCount === 1 ? '' : 's'} with rewards`,
        'partial',
        'partial',
        'Pending rewards present · USD valuation unavailable',
      )
    } else if (unvalued > 0) {
      harvestableUsdDiag = harvestableUsd
      harvestableCard = card(
        'harvestable',
        formatUsdValue(harvestableUsd, false),
        `Partial · ${harvestableFarmCount} farms`,
        'partial',
        'partial',
      )
    } else {
      harvestableUsdDiag = harvestableUsd
      harvestableCard = card(
        'harvestable',
        formatUsdValue(harvestableUsd, true),
        `${harvestableFarmCount} farm${harvestableFarmCount === 1 ? '' : 's'} · ${pendingAmount.toFixed(2)} MARCO`,
        harvestableUsd === 0 ? 'zero' : 'available',
        'live',
      )
    }
  }

  const byId: Record<FarmsOverviewKpiId, FarmsOverviewKpiCardModel> = {
    tvl: tvlCard,
    activeFarms: activeFarmsCard,
    activeFarmers: activeFarmersCard,
    rewards24h: rewards24hCard,
    sustainableApr: aprCard,
    harvestable: harvestableCard,
  }
  const cards = FARMS_OVERVIEW_KPI_ORDER.map((id) => byId[id])
  const anyLoading = cards.some((c) => c.state === 'loading')
  const anyPartial = cards.some((c) => c.state === 'partial' || c.state === 'unavailable')
  const phase = anyLoading ? 'loading' : anyPartial ? 'partial' : 'ready'

  return {
    cards,
    phase,
    diagnostics: {
      tvlUsd: valuedFarmCount > 0 ? tvlUsd : null,
      valuedFarmCount,
      farmUniverseCount: universe,
      activeFarmCount: lpCards.length > 0 || !farmsLoading ? activeCards.length : null,
      activeFarmersCount:
        activeFarmersCount != null && Number.isFinite(activeFarmersCount)
          ? Math.max(0, Math.floor(activeFarmersCount))
          : null,
      activeFarmersState: activeFarmersCard.state,
      rewards24hUsd,
      rewards24hMarco,
      rewards24hState: rewards24hCard.state,
      rewards24hSource,
      sustainableApr: best?.display ?? null,
      sustainableAprFarm: best?.name ?? null,
      harvestableUsd: harvestableUsdDiag,
      harvestableFarmCount: harvestableFarmCountDiag,
      walletState: !account ? 'disconnected' : userDataLoaded ? 'ready' : 'loading',
      emissionNotUsedAs24h: rewards24hSource !== 'masterchef_emission_per_block',
      poolsTvlNotIncluded: true,
      provenance: {
        tvl: 'farm.liquidity (LP farms only; pid 0 excluded; Pools excluded)',
        activeFarms: 'live/indexing LP farms with non-zero multiplier',
        activeFarmers:
          activeFarmersReason ||
          'Indexed MasterChef Deposit/Withdraw unique wallets (protocol activity)',
        rewards24h:
          rewards24hSource === 'masterchef_emission_per_block'
            ? 'MasterChef dexTokenPerBlock × blocks/day'
            : emissionReason || 'emission unavailable',
        sustainableApr: 'listRewardingFarms + positive liquidity + live status',
        harvestable: 'userData.earnings × cakePriceBusd',
      },
      fetchedAt,
    },
  }
}
