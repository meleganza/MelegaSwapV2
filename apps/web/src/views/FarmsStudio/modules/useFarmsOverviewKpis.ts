/**
 * FARMS_MODULE_002 — Overview KPIs React hook (shared Farms runtime + emission + farmers).
 */
import { useMemo } from 'react'
import useSWR from 'swr'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsOverviewKpisFromParts } from './buildFarmsOverviewKpis'
import type { FarmsOverviewKpisViewModel } from './farmsOverviewKpisTypes'

export { buildFarmsOverviewKpisFromParts } from './buildFarmsOverviewKpis'

type ActiveFarmersPayload = {
  status?: 'ready' | 'partial' | 'unavailable'
  uniqueActiveFarmers?: number | null
  reason?: string
}

async function fetchActiveFarmers(): Promise<ActiveFarmersPayload> {
  try {
    const res = await fetch('/api/farms/active-farmers')
    if (!res.ok) return { status: 'unavailable', reason: `HTTP ${res.status}` }
    return (await res.json()) as ActiveFarmersPayload
  } catch (error) {
    return {
      status: 'unavailable',
      reason: error instanceof Error ? error.message : 'Active farmers fetch failed',
    }
  }
}

export function useFarmsOverviewKpis(): FarmsOverviewKpisViewModel {
  const runtime = useFarmsRuntime()
  const cakePrice = usePriceCakeBusd()
  const { data: farmers, isValidating: farmersLoading } = useSWR(
    'farms-active-farmers',
    fetchActiveFarmers,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
    },
  )

  return useMemo(() => {
    const previewCards = runtime.portfolioFarms?.length ? runtime.portfolioFarms : runtime.farms
    const farmsLoading = runtime.phase === 'loading_farms'
    const emission = runtime.masterChefEmission
    const emissionReady = emission?.status === 'ready' && emission.perDay > 0

    return buildFarmsOverviewKpisFromParts({
      previewCards,
      farmsLoading,
      account: runtime.account,
      userDataLoaded: runtime.userDataLoaded,
      cakePriceUsd: cakePrice?.toNumber?.() ?? 0,
      emissionPerDayMarco: emissionReady ? emission.perDay : null,
      emissionStatus: farmsLoading
        ? 'loading'
        : emissionReady
          ? 'ready'
          : emission?.status === 'unavailable'
            ? 'unavailable'
            : emission?.perDay
              ? 'ready'
              : 'unavailable',
      emissionReason: emission?.reason ?? emission?.readError,
      activeFarmersCount: farmers?.uniqueActiveFarmers ?? null,
      activeFarmersStatus: farmersLoading
        ? 'loading'
        : farmers?.status === 'ready' || farmers?.status === 'partial'
          ? farmers.status
          : 'unavailable',
      activeFarmersReason: farmers?.reason,
    })
  }, [runtime, cakePrice, farmers, farmersLoading])
}
