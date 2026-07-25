/**
 * POOLS_MODULE_007 — Analytics hook.
 */

import { useMemo } from 'react'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { resolveLifecycleCounts } from '../poolsRuntime/poolClassificationSummary'
import { buildPoolsAnalyticsViewModel } from './buildPoolsAnalytics'
import type { PoolsAnalyticsViewModel } from './poolsAnalyticsTypes'

export function usePoolsAnalytics(): PoolsAnalyticsViewModel {
  const runtime = usePoolsRuntime()

  return useMemo(() => {
    const counts = resolveLifecycleCounts(runtime.poolClassificationSummary)
    return buildPoolsAnalyticsViewModel({
      portfolioPools: runtime.portfolioPools?.length ? runtime.portfolioPools : runtime.pools ?? [],
      poolsLoading: runtime.phase === 'loading_pools',
      sourcesFailed: runtime.phase === 'error',
      classificationRewarding: counts?.rewarding ?? null,
    })
  }, [
    runtime.portfolioPools,
    runtime.pools,
    runtime.phase,
    runtime.poolClassificationSummary,
  ])
}
