/**
 * FARMS_MODULE_006 — Yield Advisor hook.
 */

import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsYieldAdvisorViewModel } from './buildFarmsYieldAdvisor'
import type { FarmsYieldAdvisorViewModel } from './farmsYieldAdvisorTypes'

export function useFarmsYieldAdvisor(): FarmsYieldAdvisorViewModel {
  const runtime = useFarmsRuntime()
  const { address: account } = useAccount()

  return useMemo(
    () =>
      buildFarmsYieldAdvisorViewModel({
        account: account ?? runtime.account ?? null,
        portfolioFarms: runtime.portfolioFarms ?? [],
        userDataLoaded: runtime.userDataLoaded,
        farmsLoading: runtime.phase === 'loading_farms' || runtime.phase === 'reading_wallet',
        sourcesFailed: runtime.phase === 'error' || Boolean(runtime.error),
      }),
    [
      account,
      runtime.account,
      runtime.portfolioFarms,
      runtime.userDataLoaded,
      runtime.phase,
      runtime.error,
    ],
  )
}
