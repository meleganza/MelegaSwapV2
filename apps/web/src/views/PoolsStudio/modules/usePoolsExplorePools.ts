/**
 * POOLS_MODULE_004 — Explore Pools hook.
 * Composes portfolioPools (SmartChef) — never Factory AMM merge.
 * Retains last-good pool snapshot while runtime reloads to prevent flicker.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolsExplorePoolsViewModel } from './buildPoolsExplorePools'
import type {
  PoolsExploreFilter,
  PoolsExplorePoolCardModel,
  PoolsExplorePoolsViewModel,
  PoolsExploreSort,
} from './poolsExplorePoolsTypes'

type ExploreSnapshot = {
  chainId: number
  pools: PoolsExplorePoolCardModel[]
  updatedAt: number
}

const lastGoodExploreByChain = new Map<number, ExploreSnapshot>()

export function usePoolsExplorePools(): PoolsExplorePoolsViewModel & {
  setFilter: (f: PoolsExploreFilter) => void
  setSort: (s: PoolsExploreSort) => void
  setSearch: (q: string) => void
} {
  const runtime = usePoolsRuntime()
  const { chainId: activeChainId } = useActiveChainId()
  const chainId = activeChainId ?? 56
  const [filter, setFilter] = useState<PoolsExploreFilter>('All')
  const [sort, setSort] = useState<PoolsExploreSort>('Highest APR')
  const [search, setSearch] = useState('')
  const lastGoodRef = useRef<ExploreSnapshot | null>(lastGoodExploreByChain.get(chainId) ?? null)

  // Unfiltered inventory snapshot — never let a filter/search empty overwrite last-good.
  const inventoryVm = useMemo(() => {
    return buildPoolsExplorePoolsViewModel({
      portfolioPools: runtime.portfolioPools ?? [],
      poolsLoading: runtime.phase === 'loading_pools',
      chainId,
      filter: 'All',
      sort: 'Highest APR',
      search: '',
      sourcesFailed: runtime.phase === 'error',
    })
  }, [runtime.portfolioPools, runtime.phase, chainId])

  const vm = useMemo(() => {
    return buildPoolsExplorePoolsViewModel({
      portfolioPools: runtime.portfolioPools ?? [],
      poolsLoading: runtime.phase === 'loading_pools',
      chainId,
      filter,
      sort,
      search,
      sourcesFailed: runtime.phase === 'error',
    })
  }, [runtime.portfolioPools, runtime.phase, chainId, filter, sort, search])

  useEffect(() => {
    if (inventoryVm.pools?.length) {
      const snap = { chainId, pools: inventoryVm.pools, updatedAt: Date.now() }
      lastGoodExploreByChain.set(chainId, snap)
      lastGoodRef.current = snap
    }
  }, [inventoryVm.pools, chainId])

  const stableVm = useMemo(() => {
    const cached = lastGoodRef.current
    const inventoryEmpty = !inventoryVm.pools || inventoryVm.pools.length === 0
    const refreshing = runtime.phase === 'loading_pools' || inventoryVm.state === 'loading'
    if (inventoryEmpty && refreshing && cached && cached.chainId === chainId && cached.pools.length > 0) {
      return {
        ...vm,
        state: 'ready' as const,
        pools: cached.pools,
        totalActive: cached.pools.length,
        liveRegion: 'Showing last known active pools while refreshing.',
      }
    }
    if (
      inventoryEmpty &&
      !refreshing &&
      cached &&
      cached.chainId === chainId &&
      cached.pools.length > 0 &&
      Date.now() - cached.updatedAt < 8_000
    ) {
      return {
        ...vm,
        state: 'ready' as const,
        pools: cached.pools,
        totalActive: cached.pools.length,
        liveRegion: 'Stabilizing pool inventory…',
      }
    }
    return vm
  }, [vm, inventoryVm, runtime.phase, chainId])

  return { ...stableVm, setFilter, setSort, setSearch }
}
