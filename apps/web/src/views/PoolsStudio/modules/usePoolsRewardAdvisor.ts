/**
 * POOLS_MODULE_006 — Reward Advisor hook.
 */

import { useMemo } from 'react'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolsRewardAdvisorViewModel } from './buildPoolsRewardAdvisor'
import type { PoolsRewardAdvisorViewModel } from './poolsRewardAdvisorTypes'

export function usePoolsRewardAdvisor(): PoolsRewardAdvisorViewModel {
  const runtime = usePoolsRuntime()

  return useMemo(
    () =>
      buildPoolsRewardAdvisorViewModel({
        account: runtime.account ?? null,
        portfolioPools: runtime.portfolioPools ?? [],
        userDataLoaded: runtime.userDataLoaded,
        poolsLoading: runtime.phase === 'loading_pools',
        sourcesFailed: runtime.phase === 'error',
      }),
    [runtime.account, runtime.portfolioPools, runtime.userDataLoaded, runtime.phase],
  )
}
