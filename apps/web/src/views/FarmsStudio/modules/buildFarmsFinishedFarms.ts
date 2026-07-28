/**
 * FARMS_MODULE_005 — pure Finished Farms builder.
 * Wallet-scoped recovery positions only. Composes portfolioFarms — no second indexer.
 */

import BigNumber from 'bignumber.js'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { FarmPreviewCard } from '../farmsStudioData'
import { formatFarmPositionAmount } from './buildFarmsWalletPositions'
import { farmsFinished } from './farmsFinishedFarmsTokens'
import type {
  FarmsFinishedAction,
  FarmsFinishedFarmsViewModel,
  FarmsFinishedStatus,
  FarmsFinishedStatusLabel,
  FinishedFarmPosition,
} from './farmsFinishedFarmsTypes'

type RawFarm = NonNullable<FarmPreviewCard['rawFarm']> & {
  earningToken?: { symbol?: string; name?: string; address?: string; decimals?: number }
  lpToken?: { decimals?: number }
  masterChefAddress?: string
  enableEmergencyWithdraw?: boolean
  isTokenOnly?: boolean
  auctionHostingStartSeconds?: number
}

/** EMERGENCY → WITHDRAW+reward → WITHDRAW → ENDED reward → PARTIAL → UNAVAILABLE */
const STATUS_PRIORITY: Record<FarmsFinishedStatus, number> = {
  EMERGENCY: 1,
  WITHDRAW_ONLY: 2,
  ENDED: 4,
  PARTIAL: 5,
  UNAVAILABLE: 6,
  LOADING: 7,
}

function usd(n: number | null): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null
  return n >= 1000 ? `($${(n / 1000).toFixed(1)}K)` : `($${n.toFixed(2)})`
}

function isTokenOnly(raw?: RawFarm | null): boolean {
  if (!raw) return false
  if (raw.isTokenOnly) return true
  return raw.pid === 0
}

export function isFinishedWalletOwnership(card: FarmPreviewCard): boolean {
  return Boolean(card.userStaked?.gt(0)) || Boolean(card.pendingReward?.gt(0))
}

/** Recovery-relevant finished/disabled-deposit surface — never ACTIVE explore farms. */
export function isFinishedFarmCard(card: FarmPreviewCard): boolean {
  if (!card.rawFarm) return false
  if (isTokenOnly(card.rawFarm as RawFarm)) return false
  if (!isFinishedWalletOwnership(card)) return false

  const raw = card.rawFarm as RawFarm
  if (card.status === 'finished' || raw.multiplier === '0X') return true
  // Disabled-deposit with remaining wallet value (not stakeable Explore).
  if (card.cta !== 'stake' && (card.status === 'live' || card.status === 'indexing' || card.status === 'new')) {
    return true
  }
  return false
}

export function resolveFinishedFarmStatus(card: FarmPreviewCard): {
  status: FarmsFinishedStatus
  label: FarmsFinishedStatusLabel
  recoveryLine: string
  withdrawSupported: boolean
  emergencyWithdrawSupported: boolean
  harvestSupported: boolean
} | null {
  if (!isFinishedFarmCard(card)) return null

  const hasPrincipal = Boolean(card.userStaked?.gt(0))
  const hasClaimable = Boolean(card.pendingReward?.gt(0))
  const raw = card.rawFarm as RawFarm
  const emergency = Boolean(raw.enableEmergencyWithdraw) && hasPrincipal
  const partialReward = card.pendingReward == null && hasPrincipal

  if (emergency) {
    return {
      status: 'EMERGENCY',
      label: 'Emergency',
      recoveryLine: 'Emergency withdrawal only',
      withdrawSupported: false,
      emergencyWithdrawSupported: true,
      harvestSupported: false,
    }
  }
  if (hasPrincipal) {
    return {
      status: partialReward ? 'PARTIAL' : 'WITHDRAW_ONLY',
      label: partialReward ? 'Partial' : 'Withdraw',
      recoveryLine: hasClaimable
        ? 'Harvest and withdrawal available'
        : partialReward
          ? 'Position data partially unavailable'
          : 'Withdrawal available',
      withdrawSupported: true,
      emergencyWithdrawSupported: false,
      harvestSupported: hasClaimable,
    }
  }
  if (hasClaimable) {
    return {
      status: 'ENDED',
      label: 'Ended',
      recoveryLine: 'Rewards remain claimable',
      withdrawSupported: false,
      emergencyWithdrawSupported: false,
      harvestSupported: true,
    }
  }
  return null
}

function resolveEndedDate(card: FarmPreviewCard): { label: string; endedAt: string | null; sortEnded: number } {
  const start = card.rawFarm?.auctionHostingStartSeconds
  if (typeof start === 'number' && Number.isFinite(start) && start > 0) {
    // Hosting start is not an end date — do not invent ended-at from it.
  }
  // No factual end timestamp in preview model — honest unavailable.
  return { label: 'Ended date unavailable', endedAt: null, sortEnded: 0 }
}

function buildActions(
  card: FarmPreviewCard,
  resolved: NonNullable<ReturnType<typeof resolveFinishedFarmStatus>>,
  opts: { account: string | null; chainSupported: boolean; s0: string; s1: string; reward: string },
): FarmsFinishedAction[] {
  if (!opts.account) {
    return [
      {
        kind: 'connect',
        label: 'Connect Wallet',
        enabled: true,
        accessibleName: 'Connect wallet to review finished farm positions',
      },
    ]
  }
  if (!opts.chainSupported) {
    return [
      {
        kind: 'switch_network',
        label: 'Switch Network',
        enabled: true,
        accessibleName: 'Switch network to manage finished farm positions',
      },
    ]
  }
  if (!card.rawFarm) {
    return [
      {
        kind: 'unavailable',
        label: 'Unavailable',
        enabled: false,
        accessibleName: 'Action unavailable for this finished farm',
      },
    ]
  }

  const actions: FarmsFinishedAction[] = []
  if (resolved.emergencyWithdrawSupported) {
    actions.push({
      kind: 'emergency_withdraw',
      label: 'Emergency Withdraw',
      modalAction: 'unstake',
      enabled: true,
      accessibleName: `Emergency withdraw ${opts.s0} ${opts.s1} LP`,
    })
    return actions
  }
  if (resolved.withdrawSupported) {
    actions.push({
      kind: 'withdraw',
      label: 'Withdraw LP',
      modalAction: 'unstake',
      enabled: true,
      accessibleName: `Withdraw ${opts.s0} ${opts.s1} LP from ended farm`,
    })
  }
  if (resolved.harvestSupported) {
    actions.push({
      kind: 'claim',
      label: 'Harvest',
      modalAction: 'claim',
      enabled: true,
      accessibleName: `Harvest ${opts.reward} from ended ${opts.s0} ${opts.s1} farm`,
    })
  }
  if (!actions.length) {
    actions.push({
      kind: 'unavailable',
      label: 'Unavailable',
      enabled: false,
      accessibleName: 'No further action available',
    })
  }
  return actions.slice(0, 2)
}

export function cardToFinishedFarmPosition(
  card: FarmPreviewCard,
  opts: { wallet: string; chainId: number; chainSupported?: boolean },
): FinishedFarmPosition | null {
  const resolved = resolveFinishedFarmStatus(card)
  if (!resolved) return null

  const raw = card.rawFarm as RawFarm
  const token0 = raw.token
  const token1 = raw.quoteToken
  const reward = raw.earningToken
  const s0 = token0?.symbol ?? card.tokens?.[0] ?? '?'
  const s1 = token1?.symbol ?? card.tokens?.[1] ?? '?'
  const rs = reward?.symbol ?? card.rewardToken ?? 'REWARD'
  const stakeDecimals = raw.lpToken?.decimals ?? token0?.decimals ?? 18
  const rewardDecimals = reward?.decimals ?? 18
  const hasStake = Boolean(card.userStaked?.gt(0))
  const hasPending = Boolean(card.pendingReward?.gt(0))

  const stake = formatFarmPositionAmount(card.userStaked, stakeDecimals, 'LP', true)
  const pending = formatFarmPositionAmount(card.pendingReward, rewardDecimals, rs, true)

  const stakeNumber =
    card.userStaked && stakeDecimals != null ? getBalanceNumber(card.userStaked, stakeDecimals) : 0
  const pendingNumber =
    card.pendingReward && rewardDecimals != null ? getBalanceNumber(card.pendingReward, rewardDecimals) : 0

  const rawAny = raw as RawFarm & { lpTokenPrice?: number; earningTokenPrice?: number }
  const stakeUsd = hasStake && rawAny.lpTokenPrice ? stakeNumber * rawAny.lpTokenPrice : null
  const pendingUsd = hasPending && rawAny.earningTokenPrice ? pendingNumber * rawAny.earningTokenPrice : null

  const ended = resolveEndedDate(card)
  const partialReasons: string[] = []
  if (card.pendingReward == null && hasStake) partialReasons.push('Reward unavailable')
  if (hasStake && stakeUsd == null) partialReasons.push('Valuation unavailable')

  // Status PARTIAL only when operational reward capability cannot be verified.
  // Missing USD valuation stays a local support disclosure — not a status demotion.
  let status = resolved.status
  let label = resolved.label
  if (card.pendingReward == null && hasStake && status === 'WITHDRAW_ONLY') {
    status = 'PARTIAL'
    label = 'Partial'
  }

  // WITHDRAW_ONLY with pending sorts before plain WITHDRAW_ONLY
  let sortPriority = STATUS_PRIORITY[status]
  if (status === 'WITHDRAW_ONLY' && hasPending) sortPriority = 2
  else if (status === 'WITHDRAW_ONLY') sortPriority = 3
  else if (status === 'ENDED') sortPriority = 4

  const pid = card.pid ?? raw.pid ?? null
  const positionId = `finished:${opts.chainId}:${opts.wallet.toLowerCase()}:${pid ?? card.id}`

  return {
    positionId,
    farmId: card.id,
    pid: typeof pid === 'number' ? pid : null,
    masterbuilder: raw.masterChefAddress ?? null,
    chainId: opts.chainId,
    lpToken: {
      symbol: `${s0}/${s1} LP`,
      address: raw.lpAddress ?? null,
      decimals: stakeDecimals,
      chainId: opts.chainId,
    },
    token0: {
      symbol: s0,
      address: token0?.address ?? null,
      decimals: token0?.decimals ?? null,
      chainId: opts.chainId,
    },
    token1: {
      symbol: s1,
      address: token1?.address ?? null,
      decimals: token1?.decimals ?? null,
      chainId: opts.chainId,
    },
    rewardToken: {
      symbol: rs,
      address: reward?.address ?? null,
      decimals: rewardDecimals,
      chainId: opts.chainId,
    },
    stakedRaw: stake.raw,
    stakedFormatted: stake.ok ? stake.formatted : '—',
    stakedValue: usd(stakeUsd),
    pendingRaw: pending.raw,
    pendingFormatted: pending.ok ? pending.formatted : '—',
    pendingValue: usd(pendingUsd),
    farmEndState: resolved.recoveryLine,
    endedAt: ended.endedAt,
    endedDateLabel: ended.label,
    positionStatus: status,
    statusLabel: label,
    withdrawSupported: resolved.withdrawSupported,
    emergencyWithdrawSupported: resolved.emergencyWithdrawSupported,
    harvestSupported: resolved.harvestSupported,
    recoveryLine: resolved.recoveryLine,
    actions: buildActions(card, resolved, {
      account: opts.wallet,
      chainSupported: opts.chainSupported !== false,
      s0,
      s1,
      reward: rs,
    }),
    source: 'portfolioFarms → finished / recovery residue',
    freshness: partialReasons.length ? 'partial' : 'live',
    partialData: partialReasons.length > 0,
    partialReasons,
    errorState: null,
    provenance: 'canonical Farms runtime portfolioFarms (wallet-scoped)',
    title: `${s0} / ${s1} LP`,
    subtitle: `Rewards in ${rs}`,
    sourceCard: card,
    sortPriority,
    sortStaked: stakeNumber,
    sortPending: pendingNumber,
    sortEnded: ended.sortEnded,
  }
}

export function compareFinishedFarmPositions(a: FinishedFarmPosition, b: FinishedFarmPosition): number {
  if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority
  // Quantize valuation to avoid continuous reordering on tiny price noise
  const sa = Math.round(a.sortStaked * 100)
  const sb = Math.round(b.sortStaked * 100)
  if (sa !== sb) return sb - sa
  const pa = Math.round(a.sortPending * 100)
  const pb = Math.round(b.sortPending * 100)
  if (pa !== pb) return pb - pa
  if (a.sortEnded !== b.sortEnded) return b.sortEnded - a.sortEnded
  const pidA = a.pid ?? 0
  const pidB = b.pid ?? 0
  if (pidA !== pidB) return pidA - pidB
  return a.positionId.localeCompare(b.positionId)
}

function farmsUserDataPresence(cards: FarmPreviewCard[]) {
  if (!cards.length) return 'empty_universe' as const
  return cards.some((c) => c.userStaked != null || c.pendingReward != null || c.rawFarm?.userData != null)
    ? ('present' as const)
    : ('absent' as const)
}

function base(
  state: FarmsFinishedFarmsViewModel['state'],
  liveRegion: string,
): FarmsFinishedFarmsViewModel {
  return {
    state,
    positions: [],
    totalCount: null,
    showCountBadge: false,
    moduleDisclosure: null,
    liveRegion,
    freshness: state === 'loading' ? 'loading' : state === 'unavailable' ? 'unavailable' : null,
    historyHref: farmsFinished.historyHref,
  }
}

export function buildFarmsFinishedFarmsViewModel(input: {
  account?: string | null
  chainId?: number | null
  portfolioFarms: FarmPreviewCard[]
  userDataLoaded: boolean
  farmsLoading: boolean
  chainSupported?: boolean
  sourcesFailed?: boolean
  previous?: FinishedFarmPosition[] | null
  previousWallet?: string | null
  previousChainId?: number | null
}): FarmsFinishedFarmsViewModel {
  const account = input.account ?? null
  const chainId = input.chainId ?? null
  const chainSupported = input.chainSupported !== false

  if (!account) {
    return base('disconnected', 'Connect your wallet to review finished farms')
  }
  if (!chainId) {
    return base('unavailable', 'Finished farms are temporarily unavailable')
  }

  const walletChanged =
    Boolean(input.previousWallet) && input.previousWallet!.toLowerCase() !== account.toLowerCase()
  const chainChanged = input.previousChainId != null && input.previousChainId !== chainId
  const previous = !walletChanged && !chainChanged && input.previous?.length ? input.previous : null

  if (input.sourcesFailed && !previous) {
    return base('unavailable', 'Finished farms are temporarily unavailable')
  }

  if (
    input.sourcesFailed ||
    input.farmsLoading ||
    !input.userDataLoaded ||
    farmsUserDataPresence(input.portfolioFarms) === 'absent'
  ) {
    if (!previous) {
      return base('loading', 'Loading finished farm positions')
    }
    return {
      state: 'stale',
      positions: previous,
      totalCount: previous.length,
      showCountBadge: true,
      moduleDisclosure: 'Some historical farm data is temporarily unavailable.',
      liveRegion: 'Showing last confirmed finished farm positions.',
      freshness: 'stale',
      historyHref: farmsFinished.historyHref,
    }
  }

  const built = input.portfolioFarms
    .map((card) =>
      cardToFinishedFarmPosition(card, { wallet: account, chainId, chainSupported }),
    )
    .filter((p): p is FinishedFarmPosition => Boolean(p))
    .sort(compareFinishedFarmPositions)

  if (!built.length) {
    return {
      ...base('empty', 'No finished farm positions'),
      totalCount: 0,
      freshness: 'live',
    }
  }

  const anyPartial = built.some((p) => p.partialData || p.positionStatus === 'PARTIAL')
  return {
    state: anyPartial ? 'partial' : 'ready',
    positions: built,
    totalCount: built.length,
    showCountBadge: true,
    moduleDisclosure: anyPartial ? 'Some historical farm data is temporarily unavailable.' : null,
    liveRegion: `${built.length} position${built.length === 1 ? '' : 's'} requiring attention`,
    freshness: anyPartial ? 'partial' : 'live',
    historyHref: farmsFinished.historyHref,
  }
}

/** Test helper */
export function bn(v: string | number): BigNumber {
  return new BigNumber(v)
}
