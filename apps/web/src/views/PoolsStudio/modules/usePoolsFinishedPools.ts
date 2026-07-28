/**
 * POOLS_MODULE_005 — Finished Pools hook.
 * Wallet-scoped ended positions from portfolioPools.
 */

import { useMemo } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolsFinishedPoolsViewModel } from './buildPoolsFinishedPools'
import type { PoolsFinishedPoolsViewModel } from './poolsFinishedPoolsTypes'

export function usePoolsFinishedPools(): PoolsFinishedPoolsViewModel {
  const runtime = usePoolsRuntime()
  const { chainId: activeChainId } = useActiveChainId()

  return useMemo(
    () =>
      buildPoolsFinishedPoolsViewModel({
        account: runtime.account ?? null,
        chainId: activeChainId ?? null,
        portfolioPools: runtime.portfolioPools ?? [],
        userDataLoaded: runtime.userDataLoaded,
        poolsLoading: runtime.phase === 'loading_pools',
        sourcesFailed: runtime.phase === 'error',
      }),
    [
      runtime.account,
      runtime.portfolioPools,
      runtime.userDataLoaded,
      runtime.phase,
      activeChainId,
    ],
  )
}
