import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import { VaultKey } from 'state/types'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { derivePoolLifecycle, reconcilePoolLifecycle, POOL_HIDDEN_REASON_LABELS } from 'lib/data-truth/poolLifecycle'
import type { PoolLifecycleFlags } from 'lib/data-truth/poolLifecycle'
import { getAprData, getPoolBlockInfo } from 'views/Pools/helpers'
import type { PoolAnalyzePreview, PoolPreviewCard, PoolStatus, PoolsKpiItem } from '../poolsStudioData'
import { formatDisplayApr, formatRewardBudgetUsd, getAutoCompound, getContractRef, getCooldown, getEstimatedDailyReward, getEstimatedDuration, getLockPeriod, getPoolDisplayStatus, getPoolSafetyRisk, getPoolVisualType, getRemainingRewards, getRemainingRewardsRaw, getRewardBadge, getRewardBudgetUsd, getRewardSustainability, getTokenExplorerUrl, getWeeklyMonthlyRewards, normalizeAddress, poolIsLive } from './formatPoolPresentation'
import { isForbiddenAprDisplay, resolveSustainableApr } from './poolsAprRules'

const BLOCKS_PER_DAY = 28800

function isPoolsMetricUnavailable(value?: string | null): boolean {
  return !value || value === '—' || value === RUNTIME_UNAVAILABLE_LABEL
}

function tokenPerBlockBn(tokenPerBlock: Pool.DeserializedPool<Token>['tokenPerBlock']): BigNumber {
  if (!tokenPerBlock) return new BigNumber(0)
  if (typeof (tokenPerBlock as BigNumber).times === 'function') return tokenPerBlock as BigNumber
  return new BigNumber(tokenPerBlock as string | number)
}

export const formatUsd = (value?: number | null): string => {
  if (value === undefined || value === null || !Number.isFinite(value) || value <= 0) return RUNTIME_UNAVAILABLE_LABEL
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export const formatApr = (apr?: number | null): string => {
  if (apr === undefined || apr === null || !Number.isFinite(apr)) return RUNTIME_UNAVAILABLE_LABEL
  return `${apr.toFixed(2)}%`
}

export const formatTokenAmount = (amount?: BigNumber, decimals = 18, symbol?: string): string => {
  if (!amount || amount.isZero()) return RUNTIME_UNAVAILABLE_LABEL
  const n = getBalanceNumber(amount, decimals)
  const text = n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toFixed(2)
  return symbol ? `${text} ${symbol}` : text
}

export function getPoolTypeLabel(pool: Pool.DeserializedPool<Token>): string {
  if (pool.vaultKey === VaultKey.CakeVault) return 'Locked Pool'
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'Flexible Pool'
  if (pool.stakingToken?.symbol === 'MARCO' && pool.earningToken?.symbol && pool.earningToken.symbol !== 'MARCO') {
    return 'Reward MARCO Holders'
  }
  if (pool.poolCategory === PoolCategory.COMMUNITY) return 'Community Pool'
  if (pool.poolCategory === PoolCategory.BINANCE) return 'Institutional Pool'
  if (pool.profileRequirement?.required) return 'Private Pool'
  return 'Flexible Pool'
}

export function getPoolDisplayName(pool: Pool.DeserializedPool<Token>): string {
  if (pool.vaultKey === VaultKey.CakeVault) return 'MARCO Locked'
  if (pool.vaultKey === VaultKey.CakeFlexibleSideVault) return 'MARCO Flexible'
  if (pool.sousId === 0 && !pool.vaultKey) return 'MARCO Staking'
  if (pool.stakingToken?.symbol && pool.earningToken?.symbol) {
    return `${pool.stakingToken.symbol} → ${pool.earningToken.symbol}`
  }
  return pool.earningToken?.symbol ? `${pool.earningToken.symbol} Pool` : `Pool #${pool.sousId}`
}

function poolHasClaimableRewards(pool: Pool.DeserializedPool<Token>): boolean {
  return Boolean(pool.userData?.pendingReward?.gt(0))
}

function poolHasActiveEmission(pool: Pool.DeserializedPool<Token>): boolean {
  return tokenPerBlockBn(pool.tokenPerBlock).gt(0)
}

function poolStatus(pool: Pool.DeserializedPool<Token>, currentBlock: number): PoolStatus {
  if (pool.isFinished) return 'ended'
  if (pool.sousId !== 0) {
    const { hasPoolStarted } = getPoolBlockInfo(pool, currentBlock)
    if (!hasPoolStarted) return 'indexing'
  }
  if (poolHasActiveEmission(pool)) return 'live'
  if (poolIsLive(pool, currentBlock) || poolHasClaimableRewards(pool)) return 'live'
  return 'ended'
}

function evaluatePoolVisibility(
  pool: Pool.DeserializedPool<Token>,
  status: PoolStatus,
  sustainableAprDisplay?: string,
  rewardBudgetDisplay?: string,
  currentBlock = 0,
): {
  visibilityStatus: PoolVisibilityStatus
  discoveryClass: import('../poolsStudioData').PoolDiscoveryClass
  hiddenReason?: string
} {
  const contract = getContractRef(pool)
  if (!contract.address || contract.address.length < 10) {
    return { visibilityStatus: 'HIDDEN', discoveryClass: 'invalid_contract', hiddenReason: 'INVALID_CONTRACT' }
  }

  const hasEmission = poolHasActiveEmission(pool)
  const live = poolIsLive(pool, currentBlock)
  const ended = status === 'ended'

  if (ended) {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'inactive', hiddenReason: 'POOL_ENDED' }
  }
  if (status === 'indexing') {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'metadata_incomplete', hiddenReason: 'INDEXING' }
  }
  if (!pool.stakingToken?.symbol || !pool.earningToken?.symbol) {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'metadata_incomplete', hiddenReason: 'METADATA_INCOMPLETE' }
  }
  if (!live && !hasEmission) {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'inactive', hiddenReason: 'NEEDS_FUNDING' }
  }
  if (!hasEmission) {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'liquidity_present', hiddenReason: 'NO_EMISSION' }
  }
  if (!sustainableAprDisplay || isForbiddenAprDisplay(sustainableAprDisplay)) {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'metadata_incomplete', hiddenReason: 'APR_UNAVAILABLE' }
  }
  if (!rewardBudgetDisplay || isPoolsMetricUnavailable(rewardBudgetDisplay)) {
    return { visibilityStatus: 'DISCOVERABLE', discoveryClass: 'metadata_incomplete', hiddenReason: 'REWARD_BUDGET_UNAVAILABLE' }
  }
  return { visibilityStatus: 'VISIBLE', discoveryClass: 'tradeable' }
}

function estimateAprFromEmission(pool: Pool.DeserializedPool<Token>): number | null {
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  if (!perBlock.gt(0) || !pool.earningToken?.decimals || !pool.stakingToken?.decimals) return null

  const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
  const stakingUsd = staked * (pool.stakingTokenPrice || 0)
  const earningPrice = pool.earningTokenPrice || pool.stakingTokenPrice || 0
  if (stakingUsd <= 0 || earningPrice <= 0) return null

  const dailyReward = getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
  const dailyRewardUsd = dailyReward * earningPrice
  const annualized = (dailyRewardUsd / stakingUsd) * 365 * 100
  return Number.isFinite(annualized) && annualized > 0 ? annualized : null
}

function displayPoolApr(
  pool: Pool.DeserializedPool<Token>,
  apr: number,
  status: PoolStatus,
  currentBlock: number,
): {
  display?: string
  exact: number
  rawApr: number
  currentApr?: string
  reason?: string
} {
  const visualType = getPoolVisualType(pool)
  const badge = getRewardBadge(pool)
  const emissionActive = poolHasActiveEmission(pool) && !pool.isFinished

  if (status === 'indexing') {
    return { display: undefined, exact: apr, rawApr: apr, reason: 'INDEXING' }
  }

  if (status === 'ended') {
    return { display: undefined, exact: apr, rawApr: apr }
  }

  let rawApr = apr
  if (!Number.isFinite(rawApr) || rawApr <= 0) {
    const estimated = estimateAprFromEmission(pool)
    if (estimated) rawApr = estimated
    else {
      return {
        display: undefined,
        exact: apr,
        rawApr: apr,
        reason: 'INVALID_RAW_APR',
      }
    }
  }

  const resolved = resolveSustainableApr(rawApr, visualType, emissionActive, badge)
  return {
    display: resolved.sustainableAprDisplay,
    exact: resolved.rawApr,
    rawApr: resolved.rawApr,
    currentApr: resolved.sustainableAprDisplay,
    reason: resolved.aprDisplayReason,
  }
}

export function mapPoolToPreviewCard(
  pool: Pool.DeserializedPool<Token>,
  currentBlock: number,
  performanceFee = 0,
): PoolPreviewCard | null {
  if (!pool?.earningToken?.decimals || !pool?.stakingToken?.decimals) return null

  const { apr } = getAprData(pool, performanceFee)
  const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
  const tvlUsd = staked * (pool.stakingTokenPrice || 0)
  const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
  const status = poolStatus(pool, currentBlock)
  const aprDisplay = displayPoolApr(pool, apr, status, currentBlock)
  const remaining = getRemainingRewards(pool, currentBlock)
  const sustainability = getRewardSustainability(pool, currentBlock)
  const contract = getContractRef(pool)
  const stakeAddr = normalizeAddress(pool.stakingToken?.address)
  const rewardAddr = normalizeAddress(pool.earningToken?.address)
  const budgetUsd = getRewardBudgetUsd(pool, currentBlock)
  const budgetLabel = formatRewardBudgetUsd(budgetUsd)
  const rewardBudgetDisplay =
    !isPoolsMetricUnavailable(budgetLabel)
      ? budgetLabel
      : !isPoolsMetricUnavailable(remaining.label)
        ? remaining.label
        : !isPoolsMetricUnavailable(getEstimatedDailyReward(pool))
          ? getEstimatedDailyReward(pool)
          : 'Active emission'
  const distribution = getWeeklyMonthlyRewards(pool)

  const analyzePreview: PoolAnalyzePreview = {
    rewardBudget: rewardBudgetDisplay,
    remainingRewards: isPoolsMetricUnavailable(remaining.label) || /nan/i.test(remaining.label) ? RUNTIME_UNAVAILABLE_LABEL : remaining.label,
    dailyEmission: getEstimatedDailyReward(pool),
    emissionEndEstimate: getEstimatedDuration(pool, currentBlock),
    aprHistory: aprDisplay.display && !isForbiddenAprDisplay(aprDisplay.display) ? aprDisplay.display : 'Indexed',
    rewardSustainability: sustainability.level,
    risk: getPoolSafetyRisk(pool, currentBlock),
    contractAddress: contract.address || contract.label,
    contractExplorerUrl: contract.explorerUrl,
    sousChefAddress: contract.label,
    depositFee: '0%',
    withdrawFee: '0%',
    harvestInterval: pool.vaultKey ? 'Auto' : 'Manual',
    autoCompound: getAutoCompound(pool),
    poolVersion: pool.vaultKey ? `Vault ${pool.vaultKey}` : `SousChef #${pool.sousId}`,
    created: pool.startBlock ? `Block ${pool.startBlock}` : '—',
    lastUpdated: new Date().toISOString(),
    rewardToken: pool.earningToken.symbol ?? '—',
    emission: perBlock.gt(0) ? `${formatTokenAmount(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)} / day` : '—',
    contract: contract.label,
    rewardContract: rewardAddr ? `${normalizeAddress(rewardAddr).slice(0, 6)}...${normalizeAddress(rewardAddr).slice(-4)}` : '—',
    stakeContract: stakeAddr ? `${normalizeAddress(stakeAddr).slice(0, 6)}...${normalizeAddress(stakeAddr).slice(-4)}` : '—',
    tokenExplorerUrl: getTokenExplorerUrl(rewardAddr),
    estimatedRoi: aprDisplay.display && !isForbiddenAprDisplay(aprDisplay.display) ? aprDisplay.display : '—',
    duration: getEstimatedDuration(pool, currentBlock),
    poolHistory: contract.explorerUrl,
    transactions: contract.explorerUrl,
  }

  const visibility = evaluatePoolVisibility(pool, status, aprDisplay.display, rewardBudgetDisplay, currentBlock)
  const lifecycle = derivePoolLifecycle(pool, currentBlock)
  const humanHiddenReason = visibility.hiddenReason
    ? POOL_HIDDEN_REASON_LABELS[visibility.hiddenReason] ?? visibility.hiddenReason
    : undefined

  return {
    id: pool.vaultKey ? `${pool.vaultKey}` : `sous-${pool.sousId}`,
    sousId: pool.sousId,
    vaultKey: pool.vaultKey,
    poolType: getPoolTypeLabel(pool),
    name: getPoolDisplayName(pool),
    tokens: [pool.stakingToken.symbol, pool.earningToken.symbol].filter(Boolean) as string[],
    stakeToken: pool.stakingToken.symbol,
    apr: aprDisplay.display,
    sustainableAprDisplay: aprDisplay.display,
    rawApr: aprDisplay.rawApr,
    aprDisplayReason: aprDisplay.reason,
    aprExact: aprDisplay.exact,
    currentApr: aprDisplay.currentApr,
    status,
    displayStatus: getPoolDisplayStatus(pool, status, currentBlock),
    visibilityStatus: visibility.visibilityStatus,
    discoveryClass: visibility.discoveryClass,
    hiddenReason: visibility.hiddenReason,
    hiddenReasonLabel: humanHiddenReason,
    lifecycle,
    healthScore: sustainability.score,
    rewardBadge: getRewardBadge(pool),
    visualType: getPoolVisualType(pool),
    tvl: formatUsd(tvlUsd),
    rewardToken: pool.earningToken.symbol ?? '—',
    dailyRewards:
      perBlock.gt(0) ? formatTokenAmount(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals) : '—',
    estimatedDailyReward: getEstimatedDailyReward(pool),
    remainingRewards: remaining.label,
    remainingRewardsPct: remaining.pct,
    remainingRewardsTone: remaining.tone,
    rewardBudgetUsd: rewardBudgetDisplay,
    estimatedDuration: getEstimatedDuration(pool, currentBlock),
    lockPeriod: getLockPeriod(pool),
    cooldown: getCooldown(pool),
    poolSafetyRisk: getPoolSafetyRisk(pool, currentBlock),
    rewardSustainability: sustainability.level,
    sustainabilityScore: sustainability.score,
    weeklyRewards: distribution.weekly,
    monthlyRewards: distribution.monthly,
    contractAddress: contract.address,
    stakeContractAddress: stakeAddr,
    rewardContractAddress: rewardAddr,
    contractLabel: contract.label,
    explorerUrl: contract.explorerUrl,
    stakeExplorerUrl: getTokenExplorerUrl(stakeAddr),
    rewardExplorerUrl: getTokenExplorerUrl(rewardAddr),
    participants: staked > 0 ? formatTokenAmount(pool.totalStaked, pool.stakingToken.decimals) : '—',
    cta: status === 'ended' ? 'none' : status === 'indexing' ? 'analyze' : 'stake',
    analyzePreview,
    rawPool: pool,
    userStaked: pool.userData?.stakedBalance,
    pendingReward: pool.userData?.pendingReward,
    poolTypeLabel: getPoolTypeLabel(pool),
  }
}

export function aggregateKpis(
  pools: Pool.DeserializedPool<Token>[],
  featured?: PoolPreviewCard,
  currentBlock = 0,
  previewCards: PoolPreviewCard[] = [],
): PoolsKpiItem[] {
  let totalStakedUsd = 0
  let dailyRewardsUsd = 0
  const reconciliation = reconcilePoolLifecycle(pools, currentBlock)
  const discoveredCount = reconciliation.discovered
  const activeLive = reconciliation.active
  const fundedCount = reconciliation.funded
  const rewardingCount = reconciliation.rewarding
  let stakerPositions = 0

  pools.forEach((pool) => {
    if (!pool?.stakingToken?.decimals || !pool?.earningToken?.decimals) return
    const lc = derivePoolLifecycle(pool, currentBlock)
    const staked = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
    totalStakedUsd += staked * (pool.stakingTokenPrice || 0)
    if (pool.userData?.stakedBalance?.gt(0)) stakerPositions += 1
    const perBlock = tokenPerBlockBn(pool.tokenPerBlock)
    if (perBlock.gt(0) && lc.rewarding) {
      const dailyTokens = getBalanceNumber(perBlock.times(BLOCKS_PER_DAY), pool.earningToken.decimals)
      dailyRewardsUsd += dailyTokens * (pool.earningTokenPrice || pool.stakingTokenPrice || 0)
    }
  })

  const displayable = listUsablePools(previewCards)
  const highestApr = displayable.reduce<{ apr?: string; exact: number }>(
    (best, p) => {
      const exact = parseFloat(p.sustainableAprDisplay?.replace('%', '') || '0') || p.aprExact || 0
      const label = p.sustainableAprDisplay ?? p.apr
      if (exact > best.exact && label && !isForbiddenAprDisplay(label)) {
        return { apr: label, exact }
      }
      return best
    },
    { exact: 0 },
  )

  const rewardBudgetLive =
    rewardingCount > 0
      ? String(rewardingCount)
      : RUNTIME_UNAVAILABLE_LABEL
  const dailyEmissionLabel =
    dailyRewardsUsd > 0 ? `${formatUsd(dailyRewardsUsd)}/day emission` : undefined
  const tokenCount = new Set(displayable.map((p) => p.rewardToken)).size

  const featuredApr =
    featured?.sustainableAprDisplay && !isForbiddenAprDisplay(featured.sustainableAprDisplay)
      ? featured.sustainableAprDisplay
      : featured?.apr && !isForbiddenAprDisplay(featured.apr)
        ? featured.apr
        : ''

  return [
    {
      id: 'tvl',
      label: 'Total Value Locked',
      value: formatUsd(totalStakedUsd) || RUNTIME_UNAVAILABLE_LABEL,
    },
    {
      id: 'active',
      label: 'Pools Discovered',
      value: String(discoveredCount),
      secondary: `${activeLive} active · ${fundedCount} funded · ${rewardingCount} rewarding`,
    },
    {
      id: 'budget',
      label: 'Pools Rewarding',
      value: rewardBudgetLive,
      secondary: dailyEmissionLabel ?? `${rewardingCount} with on-chain emission`,
    },
    {
      id: 'highestApr',
      label: 'Highest APR',
      value: highestApr.apr ?? RUNTIME_UNAVAILABLE_LABEL,
      green: Boolean(highestApr.apr),
    },
    {
      id: 'featured',
      label: 'Featured Pool',
      value: featured?.name ?? 'No live pool',
      secondary: featuredApr || undefined,
      gold: !featured?.name,
      green: Boolean(featured?.name),
    },
  ]
}

/** R768 — discoverable pools: all verified contracts except invalid_contract. */
export function listDiscoverablePools(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  return cards.filter((p) => p.discoveryClass !== 'invalid_contract')
}

export function listUsablePools(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  return listDiscoverablePools(cards)
}

/** @deprecated use listUsablePools */
export function listDisplayablePools(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  return listUsablePools(cards)
}

export function selectFeaturedPool(cards: PoolPreviewCard[]): PoolPreviewCard | undefined {
  const rewarding = cards.filter((p) => p.lifecycle?.rewarding)
  const ranked = rewarding.length
    ? rewarding
    : cards.filter((p) => p.lifecycle?.active && p.lifecycle?.rewardPerBlockPositive)
  const poolSet = ranked.length ? ranked : listDiscoverablePools(cards).filter((p) => p.status === 'live')
  if (!poolSet.length) return undefined
  return [...poolSet].sort((a, b) => {
    const aprDiff = (b.sustainabilityScore ?? 0) - (a.sustainabilityScore ?? 0)
    if (aprDiff !== 0) return aprDiff
    return (b.aprExact ?? 0) - (a.aprExact ?? 0)
  })[0]
}

export function listRewardingPools(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  return cards.filter((p) => p.lifecycle?.rewarding)
}

export { reconcilePoolLifecycle, type PoolLifecycleFlags }

export function listActivePools(cards: PoolPreviewCard[]): {
  activePools: string[]
  sourceMethod: string
} {
  const active = cards.filter((p) => p.status === 'live')
  return {
    activePools: active.map((p) => p.name),
    sourceMethod: 'sous_chef_bonus_end_block_rpc',
  }
}

export function sortPoolsDefault(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  const statusRank: Record<string, number> = { live: 0, indexing: 1, ended: 2 }
  const parseApr = (card: PoolPreviewCard) => {
    if (card.apr === 'Calculating...' || card.apr === 'Synchronizing...') return -1
    return parseFloat(card.apr?.replace('%', '') || '0')
  }
  const parseTvl = (v?: string) => parseFloat(v?.replace(/[^0-9.]/g, '') || '0')

  return [...cards].sort((a, b) => {
    const sa = statusRank[a.status] ?? 1
    const sb = statusRank[b.status] ?? 1
    if (sa !== sb) return sa - sb
    const aprDiff = parseApr(b) - parseApr(a)
    if (aprDiff !== 0) return aprDiff
    return parseTvl(b.tvl) - parseTvl(a.tvl)
  })
}

export function buildDonutSegments(pools: Pool.DeserializedPool<Token>[]) {
  const colors = ['#D4AF37', '#00E676', '#4DA3FF', '#A78BFA']
  const buckets = [
    { label: '0–1K', max: 1000, value: 0 },
    { label: '1K–10K', max: 10000, value: 0 },
    { label: '10K–100K', max: 100000, value: 0 },
    { label: '100K+', max: Infinity, value: 0 },
  ]

  pools.forEach((pool) => {
    if (!pool?.stakingToken?.decimals) return
    const usd = getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals) * (pool.stakingTokenPrice || 0)
    const bucket = buckets.find((b) => usd <= b.max) ?? buckets[buckets.length - 1]
    bucket.value += 1
  })

  const total = buckets.reduce((s, b) => s + b.value, 0) || 1
  return buckets.map((b, i) => ({
    label: b.label,
    value: Math.round((b.value / total) * 100) || (i === 0 ? 100 : 0),
    color: colors[i % colors.length],
  }))
}
