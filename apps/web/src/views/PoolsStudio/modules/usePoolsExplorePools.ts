/**
 * POOLS_MODULE_004 — Explore Pools hook.
 * Composes portfolioPools (SmartChef) — never Factory AMM merge.
 */

import { useMemo, useState } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolsExplorePoolsViewModel } from './buildPoolsExplorePools'
import type { PoolsExploreFilter, PoolsExplorePoolsViewModel, PoolsExploreSort } from './poolsExplorePoolsTypes'

export function usePoolsExplorePools(): PoolsExplorePoolsViewModel & {
  setFilter: (f: PoolsExploreFilter) => void
  setSort: (s: PoolsExploreSort) => void
  setSearch: (q: string) => void
} {
  const runtime = usePoolsRuntime()
  const { chainId: activeChainId } = useActiveChainId()
  const [filter, setFilter] = useState<PoolsExploreFilter>('All')
  const [sort, setSort] = useState<PoolsExploreSort>('Highest APR')
  const [search, setSearch] = useState('')

  const vm = useMemo(() => {
    return buildPoolsExplorePoolsViewModel({
      portfolioPools: runtime.portfolioPools ?? [],
      poolsLoading: runtime.phase === 'loading_pools',
      chainId: activeChainId ?? 56,
      filter,
      sort,
      search,
      sourcesFailed: runtime.phase === 'error',
    })
  }, [runtime.portfolioPools, runtime.phase, activeChainId, filter, sort, search])

  return { ...vm, setFilter, setSort, setSearch }
}
