/**
 * FARMS_MODULE_007 — Analytics hook.
 */

import { useMemo } from 'react'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsAnalyticsViewModel } from './buildFarmsAnalytics'
import type { FarmsAnalyticsViewModel } from './farmsAnalyticsTypes'

export function useFarmsAnalytics(): FarmsAnalyticsViewModel {
  const runtime = useFarmsRuntime()

  return useMemo(
    () =>
      buildFarmsAnalyticsViewModel({
        portfolioFarms: runtime.portfolioFarms?.length ? runtime.portfolioFarms : runtime.farms ?? [],
        farmsLoading: runtime.phase === 'loading_farms',
        sourcesFailed: runtime.phase === 'error' || Boolean(runtime.error),
      }),
    [runtime.portfolioFarms, runtime.farms, runtime.phase, runtime.error],
  )
}
