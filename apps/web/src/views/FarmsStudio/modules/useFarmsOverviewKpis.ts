/**
 * FARMS_MODULE_002 — Overview KPIs React hook (shared Farms runtime).
 */
import { useMemo } from 'react'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useMasterChefEmission } from 'lib/data-truth/useMasterChefEmission'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsOverviewKpisFromParts } from './buildFarmsOverviewKpis'
import type { FarmsOverviewKpisViewModel } from './farmsOverviewKpisTypes'

export { buildFarmsOverviewKpisFromParts } from './buildFarmsOverviewKpis'

export function useFarmsOverviewKpis(): FarmsOverviewKpisViewModel {
  const runtime = useFarmsRuntime()
  const cakePrice = usePriceCakeBusd()
  const emission = useMasterChefEmission()

  return useMemo(() => {
    const previewCards = runtime.portfolioFarms?.length ? runtime.portfolioFarms : runtime.farms
    const farmsLoading = runtime.phase === 'loading_farms'
    const emissionReady = emission.status === 'ready' && emission.perDay > 0
    return buildFarmsOverviewKpisFromParts({
      previewCards,
      farmsLoading,
      account: runtime.account,
      userDataLoaded: runtime.userDataLoaded,
      cakePriceUsd: cakePrice?.toNumber?.() ?? 0,
      emissionPerDay: emissionReady ? emission.perDay : null,
      emissionPerDayLabel: emissionReady ? emission.perDayLabel || `${emission.perDay} MARCO` : null,
    })
  }, [runtime, cakePrice, emission])
}
