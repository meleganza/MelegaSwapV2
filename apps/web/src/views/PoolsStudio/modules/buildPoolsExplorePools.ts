/**
 * POOLS_MODULE_004 — pure Explore Pools builder.
 * ACTIVE stakeable SmartChef pools only. No Farms / AMM / Finished.
 * Multichain: cards carry their own chainId; filter by chain without cross-chain merge.
 */

import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { poolIdentity } from 'lib/data-truth/globalYieldInventory'
import { resolvePoolTvlUsd } from 'lib/data-truth/yieldMetricHelpers'
import { getBlockExploreLink } from 'utils'
import type { PoolPreviewCard } from '../poolsStudioData'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import type {
  PoolsExploreFilter,
  PoolsExploreLockType,
  PoolsExplorePoolCardModel,
  PoolsExplorePoolsViewModel,
  PoolsExplorePrimaryAction,
  PoolsExploreSort,
  PoolsExploreStatus,
} from './poolsExplorePoolsTypes'

const HIGH_APR_THRESHOLD = 20

export function isActiveStakeableExplorePool(card: PoolPreviewCard): boolean {
  if (!card.rawPool) return false
  if (card.id.startsWith('amm-')) return false
  if (card.discoveryClass === 'invalid_contract') return false
  // Membership must not flicker when CTA briefly leaves 'stake' during reload.
  // Stake button enablement is decided separately via stakeEnabled.
  if (card.cta === 'none' || card.cta === 'emergency') return false
  const lifecycleLive = Boolean(card.lifecycle?.active || card.lifecycle?.rewarding)
  // Prefer status/display LIVE; also accept factual lifecycle for open-ended emission pools
  // that classification already counts as active/rewarding.
  if (card.status === 'live' || card.displayStatus === 'LIVE' || lifecycleLive) {
    if (card.status === 'ended' && card.displayStatus === 'ENDED' && !lifecycleLive) return false
    return true
  }
  return false
}

export function resolveExploreLockType(card: PoolPreviewCard): PoolsExploreLockType {
  const visual = (card.visualType || card.lockPeriod || card.poolTypeLabel || '').toLowerCase()
  if (visual.includes('365')) return '365 Days'
  if (visual.includes('180')) return '180 Days'
  if (visual.includes('90')) return '90 Days'
  if (visual.includes('30')) return '30 Days'
  if (visual.includes('flexible') || visual.includes('auto compound')) return 'Flexible'
  if (visual.includes('locked') || visual.includes('fixed')) return 'Custom'
  if (card.lockPeriod && card.lockPeriod !== '—' && !card.lockPeriod.toLowerCase().includes('flex')) {
    return 'Custom'
  }
  return 'Flexible'
}

function parseTvlUsd(card: PoolPreviewCard): number {
  if (card.rawPool) return resolvePoolTvlUsd(card.rawPool)
  const fromLabel = Number(String(card.tvl || '').replace(/[^0-9.]/g, ''))
  if (String(card.tvl || '').includes('M')) return fromLabel * 1_000_000
  if (String(card.tvl || '').includes('K')) return fromLabel * 1_000
  return Number.isFinite(fromLabel) ? fromLabel : 0
}

function resolveApr(card: PoolPreviewCard): { display: string; support: string | null; sort: number; ok: boolean } {
  const candidate = card.sustainableAprDisplay || card.apr
  if (candidate && !isForbiddenAprDisplay(candidate) && card.aprDisplayReason !== 'APR_ESTIMATED_FROM_POOL_TYPE') {
    const n = card.aprExact ?? parseFloat(candidate.replace('%', ''))
    return {
      display: candidate,
      support: null,
      sort: Number.isFinite(n) ? n : 0,
      ok: true,
    }
  }
  return { display: '—', support: 'APR unavailable', sort: 0, ok: false }
}

function resolveTvl(card: PoolPreviewCard): {
  display: string
  support: string | null
  sort: number
  partial: boolean
  ok: boolean
} {
  const pool = card.rawPool
  const staked =
    pool?.totalStaked && pool.stakingToken?.decimals
      ? getBalanceNumber(pool.totalStaked, pool.stakingToken.decimals)
      : 0
  const price = pool?.stakingTokenPrice || 0
  if (staked > 0 && price <= 0) {
    return {
      display: '—',
      support: 'Valuation unavailable',
      sort: 0,
      partial: true,
      ok: false,
    }
  }
  const usd = parseTvlUsd(card)
  if (usd <= 0) {
    const label = card.tvl
    if (!label || label === '—' || label === RUNTIME_UNAVAILABLE_LABEL || label === '$0' || label === '$0.00') {
      return { display: '—', support: 'TVL unavailable', sort: 0, partial: false, ok: false }
    }
  }
  if (usd > 0) {
    const display =
      usd >= 1_000_000
        ? `$${(usd / 1_000_000).toFixed(2)}M`
        : usd >= 1_000
          ? `$${(usd / 1_000).toFixed(1)}K`
          : `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    return { display, support: null, sort: usd, partial: false, ok: true }
  }
  return { display: '—', support: 'TVL unavailable', sort: 0, partial: false, ok: false }
}

/** Participants = wallet census. No indexer today — never show totalStaked as participants. */
function resolveParticipants(_card: PoolPreviewCard): string {
  return '—'
}

function truthLabel(value?: string | null): string {
  if (!value || value === RUNTIME_UNAVAILABLE_LABEL || value === 'Unavailable' || /nan/i.test(value)) return '—'
  return value
}

/** Remaining = remaining reward duration only — never mix with reward inventory. */
function resolveRemaining(card: PoolPreviewCard): string {
  return truthLabel(card.estimatedDuration || card.analyzePreview?.emissionEndEstimate || null)
}

/** Rewards left = remaining reward inventory when factual. */
function resolveRewardsLeft(card: PoolPreviewCard): string {
  return truthLabel(card.remainingRewards || card.analyzePreview?.remainingRewards || null)
}

/** Duration = lock model / schedule label — not remaining countdown. */
function resolveDurationDisplay(card: PoolPreviewCard, lock: PoolsExploreLockType): string {
  if (lock === 'Flexible') return 'Flexible'
  const ends = truthLabel(card.analyzePreview?.emissionEndEstimate || null)
  if (ends !== '—') return ends
  if (lock !== 'Custom') return lock
  return truthLabel(card.estimatedDuration || null)
}

function resolveEmission(card: PoolPreviewCard): string {
  return truthLabel(
    card.dailyRewards ||
      card.estimatedDailyReward ||
      card.analyzePreview?.dailyEmission ||
      card.analyzePreview?.emission,
  )
}

function buildDescription(card: PoolPreviewCard, lock: PoolsExploreLockType): string {
  const stake = card.stakeToken || card.tokens?.[0] || 'Token'
  const reward = card.rewardToken || 'rewards'
  if (lock === 'Flexible') return `Flexible ${stake} staking earning ${reward}.`
  return `${lock} ${stake} staking earning ${reward}.`
}

function resolvePoolChainId(card: PoolPreviewCard, fallbackChainId: number): number {
  const fromId = String(card.id ?? '')
  const m = fromId.match(/^(\d+):/)
  if (m) return Number(m[1])
  const fromStake = card.rawPool?.stakingToken?.chainId
  if (typeof fromStake === 'number' && Number.isFinite(fromStake)) return fromStake
  const fromEarn = card.rawPool?.earningToken?.chainId
  if (typeof fromEarn === 'number' && Number.isFinite(fromEarn)) return fromEarn
  return fallbackChainId
}

function resolvePrimaryAction(input: {
  depositEnabled: boolean
  account?: string | null
  poolChainMatchesWallet: boolean
}): PoolsExplorePrimaryAction {
  if (!input.depositEnabled) return 'Unavailable'
  if (!input.account) return 'Connect Wallet'
  if (!input.poolChainMatchesWallet) return 'Switch Network'
  return 'Stake'
}

export function cardToExploreModel(
  card: PoolPreviewCard,
  chainId: number,
  opts?: {
    account?: string | null
    walletChainId?: number
  },
): PoolsExplorePoolCardModel | null {
  if (!isActiveStakeableExplorePool(card)) return null

  const poolChainId = resolvePoolChainId(card, chainId)
  const walletChainId = opts?.walletChainId ?? chainId
  const poolChainMatchesWallet = walletChainId === poolChainId

  const apr = resolveApr(card)
  const tvl = resolveTvl(card)
  const lockType = resolveExploreLockType(card)
  const partialReasons: string[] = []
  if (!apr.ok) partialReasons.push('APR unavailable')
  if (tvl.partial || !tvl.ok) partialReasons.push(tvl.support || 'TVL unavailable')

  let status: PoolsExploreStatus = 'ACTIVE'
  let statusLabel: PoolsExplorePoolCardModel['statusLabel'] = 'Active'
  if (partialReasons.length > 0) {
    status = 'PARTIAL'
    statusLabel = 'Partial'
  }

  const stakeSymbol =
    (card.stakeToken || card.tokens?.[0] || card.rawPool?.stakingToken?.symbol || 'TOKEN').trim() || 'TOKEN'
  const rewardSymbol =
    (card.rewardToken || card.rawPool?.earningToken?.symbol || 'REWARD').trim() || 'REWARD'
  const isLp =
    Boolean(card.rawPool?.stakingToken?.symbol?.includes('LP')) ||
    /lp/i.test(stakeSymbol) ||
    Boolean(card.poolTypeLabel?.toLowerCase().includes('lp'))

  const depositEnabled = card.cta === 'stake' && Boolean(card.rawPool)
  const primaryAction = resolvePrimaryAction({
    depositEnabled,
    account: opts?.account,
    poolChainMatchesWallet,
  })
  const stakeEnabled = primaryAction === 'Stake' || primaryAction === 'Switch Network' || primaryAction === 'Connect Wallet'

  const contractAddress =
    card.contractAddress ||
    (typeof (card.rawPool as any)?.contractAddress === 'object'
      ? (card.rawPool as any).contractAddress?.[poolChainId]
      : null) ||
    null
  const normalizedAddr = contractAddress && /^0x[a-fA-F0-9]{40}$/.test(contractAddress) ? contractAddress : null
  const identity =
    normalizedAddr != null
      ? poolIdentity(poolChainId, normalizedAddr)
      : card.id?.includes(':')
        ? card.id
        : `${poolChainId}:${card.id}`

  return {
    poolId: identity,
    chainId: poolChainId,
    title: card.name,
    description: buildDescription(card, lockType),
    status,
    statusLabel,
    aprDisplay: apr.display,
    aprSupport: apr.support,
    tvlDisplay: tvl.display,
    tvlSupport: tvl.support,
    participantsDisplay: resolveParticipants(card),
    remainingDisplay: resolveRemaining(card),
    rewardsLeftDisplay: resolveRewardsLeft(card),
    emissionDisplay: resolveEmission(card),
    durationDisplay: resolveDurationDisplay(card, lockType),
    lockType,
    stakeToken: {
      symbol: stakeSymbol,
      address: card.stakeContractAddress || card.rawPool?.stakingToken?.address || null,
      chainId: poolChainId,
    },
    rewardToken: {
      symbol: rewardSymbol,
      address: card.rewardContractAddress || card.rawPool?.earningToken?.address || null,
      chainId: poolChainId,
    },
    stakeEnabled,
    stakeLabel: primaryAction,
    primaryAction,
    detailsHref: null,
    contractAddress: normalizedAddr,
    contractExplorerUrl: normalizedAddr
      ? getBlockExploreLink(normalizedAddr, 'address', poolChainId)
      : card.explorerUrl || null,
    sourceCard: card,
    sortApr: apr.sort,
    sortTvl: tvl.sort,
    sortNewest: card.sousId ?? 0,
    sortTitle: card.name.toLowerCase(),
    isLp,
    isFlexible: lockType === 'Flexible',
    isLocked: lockType !== 'Flexible',
    partialReasons,
  }
}

export function dedupeExplorePools(pools: PoolsExplorePoolCardModel[]): PoolsExplorePoolCardModel[] {
  const byId = new Map<string, PoolsExplorePoolCardModel>()
  for (const p of pools) {
    if (!byId.has(p.poolId)) byId.set(p.poolId, p)
  }
  return [...byId.values()]
}

export function filterExplorePools(
  pools: PoolsExplorePoolCardModel[],
  filter: PoolsExploreFilter,
): PoolsExplorePoolCardModel[] {
  switch (filter) {
    case 'Single Asset':
      return pools.filter((p) => !p.isLp)
    case 'LP':
      return pools.filter((p) => p.isLp)
    case 'Flexible':
      return pools.filter((p) => p.isFlexible)
    case 'Locked':
      return pools.filter((p) => p.isLocked)
    case 'High APR':
      return pools.filter((p) => p.sortApr >= HIGH_APR_THRESHOLD)
    case 'Highest TVL':
      return [...pools].sort((a, b) => b.sortTvl - a.sortTvl)
    case 'Newest':
      return [...pools].sort((a, b) => b.sortNewest - a.sortNewest)
    default:
      return pools
  }
}

export function sortExplorePools(
  pools: PoolsExplorePoolCardModel[],
  sort: PoolsExploreSort,
): PoolsExplorePoolCardModel[] {
  const list = [...pools]
  switch (sort) {
    case 'Highest APR':
      return list.sort((a, b) => b.sortApr - a.sortApr || a.sortTitle.localeCompare(b.sortTitle))
    case 'Highest TVL':
      return list.sort((a, b) => b.sortTvl - a.sortTvl || a.sortTitle.localeCompare(b.sortTitle))
    case 'Newest':
      return list.sort((a, b) => b.sortNewest - a.sortNewest || a.sortTitle.localeCompare(b.sortTitle))
    case 'Alphabetical':
      return list.sort((a, b) => a.sortTitle.localeCompare(b.sortTitle))
    default:
      return list
  }
}

export function searchExplorePools(pools: PoolsExplorePoolCardModel[], query: string): PoolsExplorePoolCardModel[] {
  const q = query.trim().toLowerCase()
  if (!q) return pools
  return pools.filter((p) => {
    const hay = [
      p.title,
      p.stakeToken.symbol,
      p.rewardToken.symbol,
      p.poolId,
      p.sourceCard.contractAddress,
      p.stakeToken.address,
      p.rewardToken.address,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}

export function buildPoolsExplorePoolsViewModel(input: {
  portfolioPools: PoolPreviewCard[]
  poolsLoading: boolean
  chainId: number
  account?: string | null
  walletChainId?: number
  filter: PoolsExploreFilter
  sort: PoolsExploreSort
  search: string
  sourcesFailed?: boolean
  chainFilter?: 'all' | number
}): PoolsExplorePoolsViewModel {
  if (input.poolsLoading && !input.portfolioPools.length) {
    return {
      state: 'loading',
      pools: [],
      totalActive: 0,
      filter: input.filter,
      sort: input.sort,
      search: input.search,
      disclosure: null,
      liveRegion: 'Loading active staking pools',
    }
  }

  if (input.sourcesFailed && !input.portfolioPools.length) {
    return {
      state: 'unavailable',
      pools: [],
      totalActive: 0,
      filter: input.filter,
      sort: input.sort,
      search: input.search,
      disclosure: null,
      liveRegion: 'Active staking pools are temporarily unavailable',
    }
  }

  const built = dedupeExplorePools(
    input.portfolioPools
      .map((c) =>
        cardToExploreModel(c, input.chainId, {
          account: input.account,
          walletChainId: input.walletChainId ?? input.chainId,
        }),
      )
      .filter((p): p is PoolsExplorePoolCardModel => Boolean(p)),
  ).filter((p) => {
    if (input.chainFilter == null || input.chainFilter === 'all') return true
    return p.chainId === input.chainFilter
  })

  if (!built.length) {
    return {
      state: 'empty',
      pools: [],
      totalActive: 0,
      filter: input.filter,
      sort: input.sort,
      search: input.search,
      disclosure: null,
      liveRegion: 'No active staking pools',
    }
  }

  let list = filterExplorePools(built, input.filter)
  list = searchExplorePools(list, input.search)
  if (input.filter !== 'Highest TVL' && input.filter !== 'Newest') {
    list = sortExplorePools(list, input.sort)
  }

  const anyPartial = list.some((p) => p.status === 'PARTIAL')

  return {
    state: anyPartial ? 'partial' : 'ready',
    pools: list,
    totalActive: built.length,
    filter: input.filter,
    sort: input.sort,
    search: input.search,
    disclosure: anyPartial ? 'Some pool metrics are temporarily unavailable.' : null,
    liveRegion: `${list.length} active staking pool${list.length === 1 ? '' : 's'}`,
  }
}
