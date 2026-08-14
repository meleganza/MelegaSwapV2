/**
 * POOLS_MODULE_004 — Explore Pools hook.
 * Multichain inventory: merge active-chain runtime pools with global LIVE config inventory.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { mergePoolPreviewCards } from 'lib/data-truth/poolConfigPreviewCards'
import { enrichPoolParticipantCounts } from 'lib/yield-participants/enrichYieldParticipantCards'
import { useYieldParticipants } from 'lib/yield-participants/useYieldParticipants'
import type { LiveYieldChainId } from 'lib/data-truth/globalYieldInventory'
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
  setChainFilter: (c: 'all' | LiveYieldChainId) => void
  chainFilter: 'all' | LiveYieldChainId
} {
  const runtime = usePoolsRuntime()
  const { snapshot: participantSnapshot } = useYieldParticipants()
  const { address: account } = useAccount()
  const { chainId: activeChainId } = useActiveChainId()
  const chainId = activeChainId ?? 56
  const [filter, setFilter] = useState<PoolsExploreFilter>('All')
  const [sort, setSort] = useState<PoolsExploreSort>('Highest APR')
  const [search, setSearch] = useState('')
  const [chainFilter, setChainFilter] = useState<'all' | LiveYieldChainId>('all')
  const lastGoodRef = useRef<ExploreSnapshot | null>(lastGoodExploreByChain.get(chainId) ?? null)

  const portfolioPools = useMemo(() => {
    const merged = mergePoolPreviewCards(runtime.portfolioPools ?? [], chainId)
    return enrichPoolParticipantCounts(merged, participantSnapshot, chainId)
  }, [runtime.portfolioPools, chainId, participantSnapshot])

  // Unfiltered inventory snapshot — never let a filter/search empty overwrite last-good.
  const inventoryVm = useMemo(() => {
    return buildPoolsExplorePoolsViewModel({
      portfolioPools,
      poolsLoading: runtime.phase === 'loading_pools' && !(runtime.portfolioPools?.length),
      chainId,
      account,
      walletChainId: chainId,
      filter: 'All',
      sort: 'Highest APR',
      search: '',
      sourcesFailed: runtime.phase === 'error' && portfolioPools.length === 0,
      chainFilter: 'all',
    })
  }, [portfolioPools, runtime.phase, runtime.portfolioPools, chainId, account])

  const vm = useMemo(() => {
    return buildPoolsExplorePoolsViewModel({
      portfolioPools,
      poolsLoading: runtime.phase === 'loading_pools' && !(runtime.portfolioPools?.length),
      chainId,
      account,
      walletChainId: chainId,
      filter,
      sort,
      search,
      sourcesFailed: runtime.phase === 'error' && portfolioPools.length === 0,
      chainFilter,
    })
  }, [portfolioPools, runtime.phase, runtime.portfolioPools, chainId, account, filter, sort, search, chainFilter])

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
    if (inventoryEmpty && refreshing && cached && cached.pools.length > 0) {
      return {
        ...vm,
        state: 'ready' as const,
        pools: cached.pools,
        totalActive: cached.pools.length,
        liveRegion: 'Showing last known active pools while refreshing.',
      }
    }
    return vm
  }, [vm, inventoryVm, runtime.phase])

  return { ...stableVm, setFilter, setSort, setSearch, setChainFilter, chainFilter }
}
