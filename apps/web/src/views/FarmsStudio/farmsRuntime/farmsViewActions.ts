import type BigNumber from 'bignumber.js'
import type { FarmPreviewCard } from '../farmsStudioData'

export type FarmCardAction = 'coming-soon' | 'stake' | 'withdraw' | 'claim' | 'analyze'

export function resolveFarmCardActions(farm: FarmPreviewCard, account?: string | null): FarmCardAction[] {
  if (farm.status === 'coming-soon' || farm.cta === 'none') return ['coming-soon']
  if (farm.status === 'indexing' || farm.cta === 'analyze') return ['analyze']

  const actions: FarmCardAction[] = ['stake']
  if (farm.userStaked?.gt(0) && account) actions.push('withdraw')
  if (farm.pendingReward?.gt(0) && account) actions.push('claim')
  actions.push('analyze')
  return actions
}

export function farmHasStakedPosition(userStaked?: BigNumber): boolean {
  return Boolean(userStaked?.gt(0))
}

export function farmHasPendingRewards(pendingReward?: BigNumber): boolean {
  return Boolean(pendingReward?.gt(0))
}
