/**
 * POOLS_MODULE_006 — factual Reward Advisor priority engine.
 * No AI. No predictions. No invented advice.
 */

import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { PoolPreviewCard } from '../poolsStudioData'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import { poolsRewardAdvisor } from './poolsRewardAdvisorTokens'
import type {
  PoolsAdvisorPriorityCard,
  PoolsRewardAdvisorViewModel,
} from './poolsRewardAdvisorTypes'

function poolLabel(card: PoolPreviewCard): string {
  return card.name || `${card.stakeToken ?? 'Token'} → ${card.rewardToken ?? 'Reward'}`
}

function claimableUsd(card: PoolPreviewCard): number {
  const raw = card.rawPool
  if (!card.pendingReward?.gt(0) || !raw?.earningToken?.decimals) return 0
  const n = getBalanceNumber(card.pendingReward, raw.earningToken.decimals)
  const price = raw.earningTokenPrice || 0
  return price > 0 ? n * price : n
}

function buildClaimCard(card: PoolPreviewCard): PoolsAdvisorPriorityCard {
  return {
    id: `claim:${card.id}`,
    kind: 'claim',
    icon: '◎',
    title: 'Claim Rewards',
    explanation: 'Claimable rewards are ready on this pool.',
    affectedPool: poolLabel(card),
    actionKind: 'claim',
    actionLabel: 'Claim',
    actionEnabled: Boolean(card.rawPool),
    accessibleName: `Claim rewards from ${poolLabel(card)}`,
    sourceCard: card,
    modalAction: 'claim',
    sortPriority: 1,
  }
}

function buildWithdrawCard(card: PoolPreviewCard): PoolsAdvisorPriorityCard {
  return {
    id: `withdraw:${card.id}`,
    kind: 'withdraw',
    icon: '↓',
    title: 'Withdraw Position',
    explanation: 'This pool has ended and principal remains withdrawable.',
    affectedPool: poolLabel(card),
    actionKind: 'withdraw',
    actionLabel: 'Withdraw',
    actionEnabled: Boolean(card.rawPool),
    accessibleName: `Withdraw from ${poolLabel(card)}`,
    sourceCard: card,
    modalAction: 'unstake',
    sortPriority: 2,
  }
}

function buildEmergencyCard(card: PoolPreviewCard): PoolsAdvisorPriorityCard {
  return {
    id: `emergency:${card.id}`,
    kind: 'emergency_withdraw',
    icon: '!',
    title: 'Emergency Withdraw',
    explanation: 'Emergency withdraw is enabled for remaining principal.',
    affectedPool: poolLabel(card),
    actionKind: 'emergency_withdraw',
    actionLabel: 'Emergency Withdraw',
    actionEnabled: Boolean(card.rawPool),
    accessibleName: `Emergency withdraw from ${poolLabel(card)}`,
    sourceCard: card,
    modalAction: 'unstake',
    sortPriority: 3,
  }
}

function buildEndingSoonCard(card: PoolPreviewCard): PoolsAdvisorPriorityCard {
  const pct = card.remainingRewardsPct
  const pctText = typeof pct === 'number' ? `${Math.round(pct)}% rewards remaining` : 'Rewards nearly depleted'
  return {
    id: `ending:${card.id}`,
    kind: 'ending_soon',
    icon: '◷',
    title: 'Pool Ending Soon',
    explanation: pctText,
    affectedPool: poolLabel(card),
    actionKind: 'view_pool',
    actionLabel: 'View Pool',
    actionEnabled: true,
    accessibleName: `View pool ending soon ${poolLabel(card)}`,
    sourceCard: card,
    modalAction: null,
    sortPriority: 4,
  }
}

function buildHighAprCard(card: PoolPreviewCard): PoolsAdvisorPriorityCard {
  const apr = card.sustainableAprDisplay || card.apr || '—'
  return {
    id: `apr:${card.id}`,
    kind: 'high_apr',
    icon: '▲',
    title: 'High APR Opportunity',
    explanation: `Factual APR ${apr} is available to stake.`,
    affectedPool: poolLabel(card),
    actionKind: 'stake',
    actionLabel: 'Stake',
    actionEnabled: card.cta === 'stake' && Boolean(card.rawPool),
    accessibleName: `Stake in high APR pool ${poolLabel(card)}`,
    sourceCard: card,
    modalAction: 'stake',
    sortPriority: 5,
  }
}

function allClearCard(): PoolsAdvisorPriorityCard {
  return {
    id: 'all-clear',
    kind: 'all_clear',
    icon: '✓',
    title: 'Everything looks good',
    explanation: 'No immediate staking action is required.',
    affectedPool: '—',
    actionKind: 'none',
    actionLabel: '—',
    actionEnabled: false,
    accessibleName: 'No immediate staking action is required',
    sourceCard: null,
    modalAction: null,
    sortPriority: 99,
  }
}

export function isPoolEndingSoon(card: PoolPreviewCard): boolean {
  if (card.status === 'ended' || card.displayStatus === 'ENDED') return false
  if (card.status !== 'live' && card.displayStatus !== 'LIVE') return false
  if (typeof card.remainingRewardsPct === 'number') {
    return card.remainingRewardsPct >= 0 && card.remainingRewardsPct <= poolsRewardAdvisor.endingSoonRemainingPct
  }
  if (card.remainingRewardsTone === 'red') return true
  return false
}

export function isHighAprOpportunity(card: PoolPreviewCard): boolean {
  if (card.id.startsWith('amm-')) return false
  if (!card.rawPool) return false
  if (card.cta !== 'stake') return false
  if (card.status !== 'live' && card.displayStatus !== 'LIVE') return false
  if (card.userStaked?.gt(0)) return false
  const apr = card.aprExact ?? parseFloat(String(card.sustainableAprDisplay || card.apr || '').replace('%', ''))
  if (!Number.isFinite(apr) || apr < poolsRewardAdvisor.highAprThreshold) return false
  if (isForbiddenAprDisplay(card.sustainableAprDisplay || card.apr)) return false
  return true
}

/** Pure builder for unit tests and hook. */
export function buildPoolsRewardAdvisorViewModel(input: {
  account?: string | null
  portfolioPools: PoolPreviewCard[]
  userDataLoaded: boolean
  poolsLoading: boolean
  sourcesFailed?: boolean
}): PoolsRewardAdvisorViewModel {
  if (input.sourcesFailed && !input.portfolioPools.length) {
    return {
      state: 'unavailable',
      cards: [],
      liveRegion: 'Advisor unavailable',
    }
  }

  if (input.poolsLoading && !input.portfolioPools.length) {
    return {
      state: 'loading',
      cards: [],
      liveRegion: 'Loading reward advisor',
    }
  }

  // Wallet-scoped actions need account; opportunity cards may still surface for connected inventory.
  const cards: PoolsAdvisorPriorityCard[] = []
  const pools = input.portfolioPools.filter((p) => p.rawPool && !p.id.startsWith('amm-'))

  if (input.account && input.userDataLoaded) {
    // 1. Claim — highest claimable first
    const claimables = pools
      .filter((p) => p.pendingReward?.gt(0))
      .sort((a, b) => claimableUsd(b) - claimableUsd(a))
    if (claimables[0]) cards.push(buildClaimCard(claimables[0]))

    // 2. Withdraw — ended with principal
    const withdrawables = pools.filter(
      (p) =>
        (p.status === 'ended' || p.displayStatus === 'ENDED') &&
        p.userStaked?.gt(0) &&
        !p.rawPool?.enableEmergencyWithdraw,
    )
    if (withdrawables[0]) cards.push(buildWithdrawCard(withdrawables[0]))

    // 3. Emergency
    const emergencies = pools.filter(
      (p) =>
        (p.status === 'ended' || p.displayStatus === 'ENDED') &&
        p.userStaked?.gt(0) &&
        Boolean(p.rawPool?.enableEmergencyWithdraw),
    )
    if (emergencies[0]) cards.push(buildEmergencyCard(emergencies[0]))
  }

  // 4. Ending soon — factual remainingRewardsPct / tone (inventory-level, not guessed)
  const ending = pools.filter(isPoolEndingSoon).sort((a, b) => (a.remainingRewardsPct ?? 100) - (b.remainingRewardsPct ?? 100))
  if (ending[0]) cards.push(buildEndingSoonCard(ending[0]))

  // 5. High APR opportunity
  const highApr = pools
    .filter(isHighAprOpportunity)
    .sort((a, b) => (b.aprExact ?? 0) - (a.aprExact ?? 0))
  if (highApr[0]) cards.push(buildHighAprCard(highApr[0]))

  cards.sort((a, b) => a.sortPriority - b.sortPriority)
  const visible = cards.slice(0, poolsRewardAdvisor.maxVisible)

  if (!visible.length) {
    // Disconnected: still allow all-clear / opportunity-less honest empty
    if (!input.account) {
      return {
        state: 'disconnected',
        cards: [allClearCard()],
        liveRegion: 'Connect wallet for personal claim and withdraw priorities',
      }
    }
    if (input.account && !input.userDataLoaded) {
      return {
        state: 'loading',
        cards: [],
        liveRegion: 'Loading reward advisor',
      }
    }
    return {
      state: 'all_clear',
      cards: [allClearCard()],
      liveRegion: 'Everything looks good. No immediate staking action is required.',
    }
  }

  return {
    state: 'ready',
    cards: visible,
    liveRegion: `${visible.length} advisor priorit${visible.length === 1 ? 'y' : 'ies'}`,
  }
}
