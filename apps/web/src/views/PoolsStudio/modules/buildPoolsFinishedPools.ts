/**
 * POOLS_MODULE_005 — pure Finished Pools builder.
 * Wallet-scoped ENDED / WITHDRAW_ONLY / EMERGENCY only.
 */

import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolPreviewCard } from '../poolsStudioData'
import { formatPositionTokenAmount } from './buildPoolsWalletPositions'
import type {
  PoolsFinishedAction,
  PoolsFinishedPoolCardModel,
  PoolsFinishedPoolsViewModel,
  PoolsFinishedStatus,
} from './poolsFinishedPoolsTypes'

const STATUS_PRIORITY: Record<PoolsFinishedStatus, number> = {
  EMERGENCY: 1,
  WITHDRAW_ONLY: 2,
  ENDED: 3,
}

export function isFinishedPoolCard(card: PoolPreviewCard): boolean {
  if (!card.rawPool) return false
  if (card.id.startsWith('amm-')) return false
  return card.status === 'ended' || card.displayStatus === 'ENDED'
}

export function isFinishedWalletOwnership(card: PoolPreviewCard): boolean {
  return Boolean(card.userStaked?.gt(0)) || Boolean(card.pendingReward?.gt(0))
}

export function resolveFinishedStatus(card: PoolPreviewCard): {
  status: PoolsFinishedStatus
  label: PoolsFinishedPoolCardModel['statusLabel']
  withdrawalState: string
} | null {
  if (!isFinishedPoolCard(card) || !isFinishedWalletOwnership(card)) return null

  const hasPrincipal = Boolean(card.userStaked?.gt(0))
  const hasClaimable = Boolean(card.pendingReward?.gt(0))
  const emergency = Boolean(card.rawPool?.enableEmergencyWithdraw) && hasPrincipal

  if (emergency) {
    return {
      status: 'EMERGENCY',
      label: 'Emergency',
      withdrawalState: 'Emergency withdrawal only',
    }
  }
  if (hasPrincipal) {
    return {
      status: 'WITHDRAW_ONLY',
      label: 'Withdraw',
      withdrawalState: hasClaimable ? 'Withdrawal and claim available' : 'Withdrawal available',
    }
  }
  // Claimable-only historical residue
  return {
    status: 'ENDED',
    label: 'Ended',
    withdrawalState: hasClaimable ? 'Claim remaining rewards' : 'No remaining action',
  }
}

function resolveEndedDateLabel(card: PoolPreviewCard): string {
  const est = card.estimatedDuration
  if (est && est !== '—' && !/unavailable|calculating|sync/i.test(est)) {
    if (/ended|finish/i.test(est)) return est
    return `Ended · ${est}`
  }
  return 'Ended'
}

function buildActions(
  card: PoolPreviewCard,
  status: PoolsFinishedStatus,
  stakeSymbol: string,
  rewardSymbol: string,
  hasPrincipal: boolean,
  hasClaimable: boolean,
  account: string | null,
): PoolsFinishedAction[] {
  if (!account) {
    return [
      {
        kind: 'connect',
        label: 'Connect Wallet',
        enabled: true,
        accessibleName: 'Connect wallet to manage finished pool positions',
      },
    ]
  }

  const hasRaw = Boolean(card.rawPool)
  const actions: PoolsFinishedAction[] = []

  if (hasPrincipal && hasRaw) {
    // Primary: Withdraw when factual. Emergency is secondary when supported.
    actions.push({
      kind: 'withdraw',
      label: 'Withdraw',
      modalAction: 'unstake',
      enabled: true,
      accessibleName: `Withdraw ${stakeSymbol} from ended pool`,
    })
    if (card.rawPool?.enableEmergencyWithdraw || status === 'EMERGENCY') {
      actions.push({
        kind: 'emergency_withdraw',
        label: 'Emergency Withdraw',
        modalAction: 'unstake',
        enabled: true,
        accessibleName: `Emergency withdraw ${stakeSymbol} from ended pool`,
      })
    } else if (hasClaimable) {
      actions.push({
        kind: 'claim',
        label: 'Claim',
        modalAction: 'claim',
        enabled: true,
        accessibleName: `Claim ${rewardSymbol} rewards from ended ${stakeSymbol} pool`,
      })
    }
    return actions.slice(0, 2)
  }

  if (hasClaimable && hasRaw) {
    actions.push({
      kind: 'claim',
      label: 'Claim',
      modalAction: 'claim',
      enabled: true,
      accessibleName: `Claim ${rewardSymbol} rewards from ended ${stakeSymbol} pool`,
    })
  }

  return actions
}

export function cardToFinishedPoolModel(
  card: PoolPreviewCard,
  opts: { wallet: string; chainId: number },
): PoolsFinishedPoolCardModel | null {
  const resolved = resolveFinishedStatus(card)
  if (!resolved) return null

  const raw = card.rawPool
  const stakeSymbol = card.stakeToken || raw?.stakingToken?.symbol || card.tokens?.[0] || 'TOKEN'
  const rewardSymbol = card.rewardToken || raw?.earningToken?.symbol || 'REWARD'
  const stakeDecimals = raw?.stakingToken?.decimals ?? null
  const rewardDecimals = raw?.earningToken?.decimals ?? null

  const hasPrincipal = Boolean(card.userStaked?.gt(0))
  const hasClaimable = Boolean(card.pendingReward?.gt(0))

  const principal = formatPositionTokenAmount(card.userStaked, stakeDecimals, stakeSymbol, {
    allowZero: true,
    unavailable: card.userStaked == null,
  })
  const claimable = formatPositionTokenAmount(card.pendingReward, rewardDecimals, rewardSymbol, {
    allowZero: card.pendingReward != null,
    unavailable: card.pendingReward == null,
  })

  const stakedNum =
    card.userStaked && stakeDecimals != null ? getBalanceNumber(card.userStaked, stakeDecimals) : 0
  const claimNum =
    card.pendingReward && rewardDecimals != null ? getBalanceNumber(card.pendingReward, rewardDecimals) : 0

  const sousKey = card.sousId != null ? String(card.sousId) : card.id
  const positionId = `finished:${opts.chainId}:${opts.wallet.toLowerCase()}:${sousKey}`

  return {
    positionId,
    poolId: sousKey,
    title: card.name,
    endedDateLabel: resolveEndedDateLabel(card),
    status: resolved.status,
    statusLabel: resolved.label,
    withdrawalState: resolved.withdrawalState,
    principalFormatted: principal.ok ? principal.formatted : '—',
    claimableFormatted: claimable.ok ? claimable.formatted : '—',
    stakeToken: {
      symbol: stakeSymbol,
      address: card.stakeContractAddress || raw?.stakingToken?.address || null,
      chainId: opts.chainId,
    },
    rewardToken: {
      symbol: rewardSymbol,
      address: card.rewardContractAddress || raw?.earningToken?.address || null,
      chainId: opts.chainId,
    },
    actions: buildActions(
      card,
      resolved.status,
      stakeSymbol,
      rewardSymbol,
      hasPrincipal,
      hasClaimable,
      opts.wallet,
    ),
    sourceCard: card,
    sortPriority: STATUS_PRIORITY[resolved.status],
    sortPrincipal: stakedNum,
    sortClaimable: claimNum,
  }
}

export function compareFinishedPools(a: PoolsFinishedPoolCardModel, b: PoolsFinishedPoolCardModel): number {
  if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority
  const p = Math.round(b.sortPrincipal * 100) - Math.round(a.sortPrincipal * 100)
  if (p !== 0) return p
  const c = Math.round(b.sortClaimable * 100) - Math.round(a.sortClaimable * 100)
  if (c !== 0) return c
  return a.positionId.localeCompare(b.positionId)
}

export function buildPoolsFinishedPoolsViewModel(input: {
  account?: string | null
  chainId?: number | null
  portfolioPools: PoolPreviewCard[]
  userDataLoaded: boolean
  poolsLoading: boolean
  sourcesFailed?: boolean
}): PoolsFinishedPoolsViewModel {
  const account = input.account ?? null
  const chainId = input.chainId ?? null

  if (!account) {
    return {
      state: 'disconnected',
      pools: [],
      totalCount: null,
      showCountBadge: false,
      liveRegion: 'Connect your wallet to view finished pool positions',
    }
  }

  if (!chainId) {
    return {
      state: 'unavailable',
      pools: [],
      totalCount: null,
      showCountBadge: false,
      liveRegion: 'Finished pool positions are temporarily unavailable',
    }
  }

  if (input.sourcesFailed) {
    return {
      state: 'unavailable',
      pools: [],
      totalCount: null,
      showCountBadge: false,
      liveRegion: 'Finished pool positions are temporarily unavailable',
    }
  }

  if (input.poolsLoading || !input.userDataLoaded) {
    return {
      state: 'loading',
      pools: [],
      totalCount: null,
      showCountBadge: false,
      liveRegion: 'Loading finished pool positions',
    }
  }

  const built = input.portfolioPools
    .map((card) => cardToFinishedPoolModel(card, { wallet: account, chainId }))
    .filter((p): p is PoolsFinishedPoolCardModel => Boolean(p))
    .sort(compareFinishedPools)

  if (!built.length) {
    return {
      state: 'empty',
      pools: [],
      totalCount: 0,
      showCountBadge: false,
      liveRegion: 'No finished pool positions',
    }
  }

  return {
    state: 'ready',
    pools: built,
    totalCount: built.length,
    showCountBadge: true,
    liveRegion: `${built.length} finished pool position${built.length === 1 ? '' : 's'}`,
  }
}
