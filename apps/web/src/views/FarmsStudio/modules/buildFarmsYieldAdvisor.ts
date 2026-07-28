/**
 * FARMS_MODULE_006 — factual Yield Advisor priority engine.
 * No AI. No predictions. No APR opportunity recommendations.
 */

import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import type { FarmPreviewCard } from '../farmsStudioData'
import { formatFarmPositionAmount } from './buildFarmsWalletPositions'
import { farmsYieldAdvisor } from './farmsYieldAdvisorTokens'
import type {
  FarmsAdvisorPriorityCard,
  FarmsYieldAdvisorViewModel,
} from './farmsYieldAdvisorTypes'

type RawFarm = NonNullable<FarmPreviewCard['rawFarm']> & {
  enableEmergencyWithdraw?: boolean
  earningToken?: { symbol?: string; decimals?: number }
  lpToken?: { decimals?: number }
}

function pairLabel(card: FarmPreviewCard): string {
  const raw = card.rawFarm as RawFarm | undefined
  const s0 = raw?.token?.symbol ?? card.tokens?.[0] ?? '?'
  const s1 = raw?.quoteToken?.symbol ?? card.tokens?.[1] ?? '?'
  return `${s0}/${s1}`
}

function rewardSymbol(card: FarmPreviewCard): string {
  const raw = card.rawFarm as RawFarm | undefined
  return raw?.earningToken?.symbol ?? card.rewardToken ?? 'REWARD'
}

function isFinishedLike(card: FarmPreviewCard): boolean {
  const raw = card.rawFarm as RawFarm | undefined
  return card.status === 'finished' || raw?.multiplier === '0X' || card.cta === 'none'
}

function isActiveLike(card: FarmPreviewCard): boolean {
  return (card.status === 'live' || card.status === 'new' || card.status === 'indexing') && !isFinishedLike(card)
}

function hasPrincipal(card: FarmPreviewCard): boolean {
  return Boolean(card.userStaked?.gt(0))
}

function hasPending(card: FarmPreviewCard): boolean {
  return Boolean(card.pendingReward?.gt(0))
}

function pendingAmountLabel(card: FarmPreviewCard): string {
  const raw = card.rawFarm as RawFarm | undefined
  const decimals = raw?.earningToken?.decimals ?? 18
  const formatted = formatFarmPositionAmount(card.pendingReward, decimals, rewardSymbol(card), true)
  return formatted.ok ? formatted.formatted : `${rewardSymbol(card)} rewards`
}

function pendingSort(card: FarmPreviewCard): number {
  const raw = card.rawFarm as RawFarm | undefined
  if (!card.pendingReward || !raw?.earningToken?.decimals) return 0
  return getBalanceNumber(card.pendingReward, raw.earningToken.decimals)
}

function stakedSort(card: FarmPreviewCard): number {
  const raw = card.rawFarm as RawFarm | undefined
  if (!card.userStaked) return 0
  const decimals = raw?.lpToken?.decimals ?? raw?.token?.decimals ?? 18
  return getBalanceNumber(card.userStaked, decimals)
}

function buildEmergencyCard(card: FarmPreviewCard): FarmsAdvisorPriorityCard {
  const pair = pairLabel(card)
  return {
    id: `emergency:${card.id}`,
    kind: 'emergency_withdraw',
    icon: '!',
    title: 'Emergency withdrawal available',
    reason: `Your ${pair} LP farm supports emergency withdrawal.`,
    sourcePositionLabel: `${pair} LP`,
    actionKind: 'emergency_withdraw',
    actionLabel: 'Withdraw',
    actionEnabled: Boolean(card.rawFarm),
    accessibleName: `Emergency withdraw ${pair.replace('/', ' ')} LP`,
    sourceCard: card,
    modalAction: 'unstake',
    sortPriority: 1,
    freshness: 'live',
  }
}

function buildWithdrawFinishedCard(card: FarmPreviewCard): FarmsAdvisorPriorityCard {
  const pair = pairLabel(card)
  return {
    id: `withdraw:${card.id}`,
    kind: 'withdraw_finished',
    icon: '↓',
    title: 'Finished farm requires attention',
    reason: 'Your LP remains in an ended farm.',
    sourcePositionLabel: `${pair} LP`,
    actionKind: 'withdraw',
    actionLabel: 'Withdraw',
    actionEnabled: Boolean(card.rawFarm),
    accessibleName: `Withdraw ${pair.replace('/', ' ')} LP`,
    sourceCard: card,
    modalAction: 'unstake',
    sortPriority: 2,
    freshness: 'live',
  }
}

function buildHarvestCard(card: FarmPreviewCard, kind: 'harvest_rewards' | 'harvest_active'): FarmsAdvisorPriorityCard {
  const pair = pairLabel(card)
  const rs = rewardSymbol(card)
  const amount = pendingAmountLabel(card)
  return {
    id: `${kind}:${card.id}`,
    kind,
    icon: '◎',
    title: 'Rewards available',
    reason: `${amount} can be harvested.`,
    sourcePositionLabel: `${pair} LP`,
    actionKind: 'harvest',
    actionLabel: 'Harvest',
    actionEnabled: Boolean(card.rawFarm),
    accessibleName: `Harvest ${rs} rewards from ${pair.replace('/', ' ')} farm`,
    sourceCard: card,
    modalAction: 'claim',
    sortPriority: kind === 'harvest_rewards' ? 3 : 4,
    freshness: 'live',
  }
}

function buildInactiveCard(card: FarmPreviewCard): FarmsAdvisorPriorityCard {
  const pair = pairLabel(card)
  return {
    id: `inactive:${card.id}`,
    kind: 'inactive_attention',
    icon: '◷',
    title: 'Inactive position attention',
    reason: `Your ${pair} LP position needs review.`,
    sourcePositionLabel: `${pair} LP`,
    actionKind: 'withdraw',
    actionLabel: 'Withdraw',
    actionEnabled: Boolean(card.rawFarm) && hasPrincipal(card),
    accessibleName: `Review inactive ${pair.replace('/', ' ')} LP position`,
    sourceCard: card,
    modalAction: hasPrincipal(card) ? 'unstake' : null,
    sortPriority: 5,
    freshness: 'partial',
  }
}

function allClearCard(): FarmsAdvisorPriorityCard {
  return {
    id: 'all-clear',
    kind: 'all_clear',
    icon: '✓',
    title: 'Everything looks good',
    reason: 'No immediate farming actions require attention.',
    sourcePositionLabel: '—',
    actionKind: 'none',
    actionLabel: '—',
    actionEnabled: false,
    accessibleName: 'No immediate farming actions require attention',
    sourceCard: null,
    modalAction: null,
    sortPriority: 99,
    freshness: null,
  }
}

/** Pure builder — deterministic factual priorities only. */
export function buildFarmsYieldAdvisorViewModel(input: {
  account?: string | null
  portfolioFarms: FarmPreviewCard[]
  userDataLoaded: boolean
  farmsLoading: boolean
  sourcesFailed?: boolean
}): FarmsYieldAdvisorViewModel {
  if (input.sourcesFailed && !input.portfolioFarms.length) {
    return {
      state: 'unavailable',
      cards: [],
      liveRegion: 'Yield Advisor unavailable',
    }
  }

  if (input.farmsLoading && !input.portfolioFarms.length) {
    return {
      state: 'loading',
      cards: [],
      liveRegion: 'Loading yield advisor',
    }
  }

  if (!input.account) {
    return {
      state: 'disconnected',
      cards: [allClearCard()],
      liveRegion: 'Connect wallet for personal farming action priorities',
    }
  }

  if (!input.userDataLoaded) {
    return {
      state: 'loading',
      cards: [],
      liveRegion: 'Loading yield advisor',
    }
  }

  const farms = input.portfolioFarms.filter((f) => f.rawFarm && f.pid !== 0)
  const cards: FarmsAdvisorPriorityCard[] = []
  const used = new Set<string>()

  const take = (card: FarmPreviewCard | undefined, builder: (c: FarmPreviewCard) => FarmsAdvisorPriorityCard) => {
    if (!card || used.has(card.id)) return
    cards.push(builder(card))
    used.add(card.id)
  }

  // 1. Emergency
  const emergencies = farms
    .filter(
      (f) =>
        isFinishedLike(f) &&
        hasPrincipal(f) &&
        Boolean((f.rawFarm as RawFarm)?.enableEmergencyWithdraw),
    )
    .sort((a, b) => stakedSort(b) - stakedSort(a))
  take(emergencies[0], buildEmergencyCard)

  // 2. Withdraw finished (non-emergency)
  const withdrawables = farms
    .filter(
      (f) =>
        isFinishedLike(f) &&
        hasPrincipal(f) &&
        !Boolean((f.rawFarm as RawFarm)?.enableEmergencyWithdraw),
    )
    .sort((a, b) => stakedSort(b) - stakedSort(a))
  take(withdrawables[0], buildWithdrawFinishedCard)

  // 3. Harvest on finished / reward-only ended
  const finishedHarvest = farms
    .filter((f) => isFinishedLike(f) && hasPending(f))
    .sort((a, b) => pendingSort(b) - pendingSort(a))
  take(finishedHarvest[0], (c) => buildHarvestCard(c, 'harvest_rewards'))

  // 4. Harvest on active farm
  const activeHarvest = farms
    .filter((f) => isActiveLike(f) && hasPending(f))
    .sort((a, b) => pendingSort(b) - pendingSort(a))
  take(activeHarvest[0], (c) => buildHarvestCard(c, 'harvest_active'))

  // 5. Inactive attention — finished with principal not yet covered (edge partial)
  const inactive = farms
    .filter((f) => isFinishedLike(f) && hasPrincipal(f) && !used.has(f.id))
    .sort((a, b) => stakedSort(b) - stakedSort(a))
  take(inactive[0], buildInactiveCard)

  cards.sort((a, b) => a.sortPriority - b.sortPriority)
  const visible = cards.slice(0, farmsYieldAdvisor.maxVisible)

  if (!visible.length) {
    return {
      state: 'all_clear',
      cards: [allClearCard()],
      liveRegion: 'Everything looks good. No immediate farming actions require attention.',
    }
  }

  return {
    state: 'ready',
    cards: visible,
    liveRegion: `${visible.length} advisor priorit${visible.length === 1 ? 'y' : 'ies'}`,
  }
}
