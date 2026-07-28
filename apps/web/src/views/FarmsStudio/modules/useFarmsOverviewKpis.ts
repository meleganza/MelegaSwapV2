/**
 * FARMS_MODULE_002 — Overview KPIs React hook (shared Farms runtime).
 */
import { useMemo } from 'react'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsOverviewKpisFromParts } from './buildFarmsOverviewKpis'
import type { FarmsOverviewKpisViewModel } from './farmsOverviewKpisTypes'

export { buildFarmsOverviewKpisFromParts } from './buildFarmsOverviewKpis'

export function useFarmsOverviewKpis(): FarmsOverviewKpisViewModel {
  const runtime = useFarmsRuntime()
  const cakePrice = usePriceCakeBusd()

  return useMemo(() => {
    const previewCards = runtime.portfolioFarms?.length ? runtime.portfolioFarms : runtime.farms
    const farmsLoading = runtime.phase === 'loading_farms'
    return buildFarmsOverviewKpisFromParts({
      previewCards,
      farmsLoading,
      account: runtime.account,
      userDataLoaded: runtime.userDataLoaded,
      cakePriceUsd: cakePrice?.toNumber?.() ?? 0,
    })
  }, [runtime, cakePrice])
}
