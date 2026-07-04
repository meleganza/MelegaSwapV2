import type BigNumber from 'bignumber.js'
import type { PoolPreviewCard } from '../poolsStudioData'

export type PoolCardAction = 'ended' | 'stake' | 'unstake' | 'claim' | 'analyze'

export function resolvePoolCardActions(pool: PoolPreviewCard, account?: string | null): PoolCardAction[] {
  if (pool.cta === 'none' || pool.status === 'ended') return ['ended']

  const actions: PoolCardAction[] = []
  if (pool.cta === 'stake') actions.push('stake')
  if (pool.userStaked?.gt(0) && account) actions.push('unstake')
  if (pool.pendingReward?.gt(0) && account) actions.push('claim')
  if (pool.cta === 'stake' || pool.cta === 'analyze') actions.push('analyze')
  return actions
}

export function poolHasStakedPosition(userStaked?: BigNumber): boolean {
  return Boolean(userStaked?.gt(0))
}

export function poolHasPendingRewards(pendingReward?: BigNumber): boolean {
  return Boolean(pendingReward?.gt(0))
}
