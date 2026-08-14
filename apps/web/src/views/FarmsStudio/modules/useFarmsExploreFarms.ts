/**
 * FARMS_MODULE_004 — Explore Farms hook.
 * Multichain inventory: merge active-chain runtime farms with global LIVE config inventory.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'
import { mergeFarmPreviewCards } from 'lib/data-truth/farmConfigPreviewCards'
import { enrichFarmParticipantCounts } from 'lib/yield-participants/enrichYieldParticipantCards'
import { useYieldParticipants } from 'lib/yield-participants/useYieldParticipants'
import { LIVE_YIELD_CHAIN_IDS, type LiveYieldChainId } from 'lib/data-truth/globalYieldInventory'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsExplore } from './farmsExploreFarmsTokens'
import { buildFarmsExploreFarmsViewModel } from './buildFarmsExploreFarms'
import type {
  ExploreFarmViewModel,
  FarmsExploreFarmsViewModel,
  FarmsExploreFilter,
  FarmsExploreSort,
} from './farmsExploreFarmsTypes'

const FALLBACK_CHAIN = 56

function liveYieldChain(chainId: number): LiveYieldChainId {
  return LIVE_YIELD_CHAIN_IDS.includes(chainId as LiveYieldChainId)
    ? (chainId as LiveYieldChainId)
    : FALLBACK_CHAIN
}

export function useExploreFarms(): FarmsExploreFarmsViewModel & {
  setFilter: (f: FarmsExploreFilter) => void
  setSort: (s: FarmsExploreSort) => void
  setSearch: (q: string) => void
  setChainFilter: (c: 'all' | LiveYieldChainId) => void
  chainFilter: 'all' | LiveYieldChainId
  loadMore: () => void
} {
  const runtime = useFarmsRuntime()
  const { snapshot: participantSnapshot } = useYieldParticipants()
  const { address: account } = useAccount()
  const { chainId: activeChainId } = useActiveChainId()
  const [filter, setFilter] = useState<FarmsExploreFilter>('All')
  const [sort, setSort] = useState<FarmsExploreSort>('Highest TVL')
  const [search, setSearch] = useState('')
  const [chainFilter, setChainFilter] = useState<'all' | LiveYieldChainId>(() =>
    liveYieldChain(activeChainId ?? FALLBACK_CHAIN),
  )
  const [visibleLimit, setVisibleLimit] = useState<number>(farmsExplore.initialLimit)
  const previousRef = useRef<ExploreFarmViewModel[] | null>(null)
  const previousChainRef = useRef<number | null>(null)

  const chainId = activeChainId ?? FALLBACK_CHAIN
  const chainSupported = isMelegaCapabilityEnabled(chainId, 'farms')
  const masterChefAddress = getMasterChefAddress(chainId)

  useEffect(() => {
    // The selected/wallet chain is the default Explore scope. Cross-chain rows
    // remain available through the explicit “All” filter, but never replace
    // live Base/Ethereum/etc. runtime cards with metric-less config stubs.
    setChainFilter(liveYieldChain(chainId))
  }, [chainId])

  useEffect(() => {
    setVisibleLimit(farmsExplore.initialLimit)
  }, [filter, sort, search, chainFilter, chainId])

  const portfolioFarms = useMemo(() => {
    const merged = mergeFarmPreviewCards(runtime.portfolioFarms ?? [], chainId, masterChefAddress)
    return enrichFarmParticipantCounts(merged, participantSnapshot, chainId, masterChefAddress)
  }, [runtime.portfolioFarms, chainId, masterChefAddress, participantSnapshot])

  const vm = useMemo(() => {
    return buildFarmsExploreFarmsViewModel({
      portfolioFarms,
      farmsLoading: runtime.phase === 'loading_farms' && !(runtime.portfolioFarms?.length),
      chainId,
      account,
      userDataLoaded: runtime.userDataLoaded,
      chainSupported,
      masterChefAddress,
      filter,
      sort,
      search,
      visibleLimit,
      sourcesFailed: runtime.phase === 'error' && portfolioFarms.length === 0,
      previous: previousRef.current,
      previousChainId: previousChainRef.current,
      chainFilter,
    })
  }, [
    portfolioFarms,
    runtime.phase,
    runtime.portfolioFarms,
    runtime.userDataLoaded,
    chainId,
    account,
    chainSupported,
    masterChefAddress,
    filter,
    sort,
    search,
    visibleLimit,
    chainFilter,
  ])

  useEffect(() => {
    if ((vm.state === 'ready' || vm.state === 'partial') && vm.registry.length) {
      previousRef.current = vm.registry
      previousChainRef.current = chainId
    }
  }, [vm.state, vm.registry, chainId])

  const loadMore = useCallback(() => {
    setVisibleLimit((n) => n + farmsExplore.pageStep)
  }, [])

  return { ...vm, setFilter, setSort, setSearch, setChainFilter, chainFilter, loadMore }
}

/** Repository-consistent alias. */
export const useFarmsExploreFarms = useExploreFarms
