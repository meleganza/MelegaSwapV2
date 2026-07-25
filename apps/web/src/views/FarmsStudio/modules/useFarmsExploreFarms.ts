/**
 * FARMS_MODULE_004 — Explore Farms hook.
 * Composes portfolioFarms (MasterChef LP) — never Pools SmartChef / Factory AMM merge.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsExplore } from './farmsExploreFarmsTokens'
import { buildFarmsExploreFarmsViewModel } from './buildFarmsExploreFarms'
import type {
  ExploreFarmViewModel,
  FarmsExploreFarmsViewModel,
  FarmsExploreFilter,
  FarmsExploreSort,
} from './farmsExploreFarmsTypes'

const SUPPORTED_CHAIN = 56

export function useExploreFarms(): FarmsExploreFarmsViewModel & {
  setFilter: (f: FarmsExploreFilter) => void
  setSort: (s: FarmsExploreSort) => void
  setSearch: (q: string) => void
  loadMore: () => void
} {
  const runtime = useFarmsRuntime()
  const { address: account } = useAccount()
  const { chainId: activeChainId } = useActiveChainId()
  const [filter, setFilter] = useState<FarmsExploreFilter>('All')
  const [sort, setSort] = useState<FarmsExploreSort>('Highest Sustainable APR')
  const [search, setSearch] = useState('')
  const [visibleLimit, setVisibleLimit] = useState<number>(farmsExplore.initialLimit)
  const previousRef = useRef<ExploreFarmViewModel[] | null>(null)
  const previousChainRef = useRef<number | null>(null)

  const chainId = activeChainId ?? SUPPORTED_CHAIN
  const chainSupported = chainId === SUPPORTED_CHAIN

  useEffect(() => {
    setVisibleLimit(farmsExplore.initialLimit)
  }, [filter, sort, search, chainId])

  const vm = useMemo(() => {
    return buildFarmsExploreFarmsViewModel({
      portfolioFarms: runtime.portfolioFarms ?? [],
      farmsLoading: runtime.phase === 'loading_farms',
      chainId,
      account,
      userDataLoaded: runtime.userDataLoaded,
      chainSupported,
      masterChefAddress: getMasterChefAddress(chainId),
      filter,
      sort,
      search,
      visibleLimit,
      sourcesFailed: runtime.phase === 'error',
      previous: previousRef.current,
      previousChainId: previousChainRef.current,
    })
  }, [
    runtime.portfolioFarms,
    runtime.phase,
    runtime.userDataLoaded,
    chainId,
    account,
    chainSupported,
    filter,
    sort,
    search,
    visibleLimit,
  ])

  useEffect(() => {
    if ((vm.state === 'ready' || vm.state === 'partial') && vm.registry.length) {
      previousRef.current = vm.registry
      previousChainRef.current = chainId
    }
  }, [vm.state, vm.registry, chainId])

  // On chain change, drop retained registry so stale farms from another chain never show.
  useEffect(() => {
    if (previousChainRef.current != null && previousChainRef.current !== chainId) {
      previousRef.current = null
      previousChainRef.current = chainId
    }
  }, [chainId])

  const loadMore = useCallback(() => {
    setVisibleLimit((n) => n + farmsExplore.pageStep)
  }, [])

  return { ...vm, setFilter, setSort, setSearch, loadMore }
}

/** Repository-consistent alias. */
export const useFarmsExploreFarms = useExploreFarms
