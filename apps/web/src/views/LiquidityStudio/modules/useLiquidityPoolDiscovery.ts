/** Global discovery: KPI and Explore consume the same complete, server-cached census. */
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useAllTokenBalances } from 'state/wallet/hooks'
import { useGlobalLiquiditySnapshot } from 'lib/global-liquidity/useGlobalLiquiditySnapshot'
import { searchGlobalPools } from 'lib/global-liquidity/model'
import {
  factualFilters,
  factualSorts,
  filterDiscoveryCards,
  sortDiscoveryCards,
  toDiscoveryCard,
  type DiscoveryPoolCardModel,
} from './liquidityPoolDiscoveryModel'
import type { LiquidityDiscoveryFilter, LiquidityDiscoverySort } from './liquidityPoolDiscoveryTokens'
import { liquidityPoolDiscovery } from './liquidityPoolDiscoveryTokens'

export type LiquidityPoolDiscoveryView = {
  state: 'loading' | 'ready' | 'empty' | 'unavailable'
  cards: DiscoveryPoolCardModel[]
  visibleCards: DiscoveryPoolCardModel[]
  matchedCount: number
  hasMore: boolean
  availableFilters: LiquidityDiscoveryFilter[]
  availableSorts: LiquidityDiscoverySort[]
  myTokensReady: boolean
  factoryAddress: string
  discoveryMethod: string | null
  error: string | null
}

export function useLiquidityPoolDiscovery(options: {
  query: string
  filter: LiquidityDiscoveryFilter
  sort: LiquidityDiscoverySort
  pageSize?: number
}): LiquidityPoolDiscoveryView {
  const { query, filter, sort, pageSize = liquidityPoolDiscovery.pageSize } = options
  const { address: account } = useAccount()
  const balances = useAllTokenBalances()
  const { data: snapshot, error, isLoading } = useGlobalLiquiditySnapshot()
  const myTokenAddresses = useMemo(() => {
    const set = new Set<string>()
    for (const [address, amount] of Object.entries(balances ?? {})) {
      if (amount && amount.greaterThan(0)) set.add(address.toLowerCase())
    }
    return set
  }, [balances])
  const myTokensReady = Boolean(account) && myTokenAddresses.size > 0

  return useMemo((): LiquidityPoolDiscoveryView => {
    const base = {
      availableFilters: ['all'] as LiquidityDiscoveryFilter[],
      availableSorts: [] as LiquidityDiscoverySort[],
      myTokensReady,
      factoryAddress: snapshot?.chains.map((chain) => chain.factory).join(', ') ?? '',
      discoveryMethod: 'canonical-public-factories-complete-census',
    }
    if (isLoading && !snapshot) {
      return { ...base, state: 'loading', cards: [], visibleCards: [], matchedCount: 0, hasMore: false, error: null }
    }
    if (error || !snapshot || snapshot.status === 'unavailable') {
      return {
        ...base,
        state: 'unavailable',
        cards: [],
        visibleCards: [],
        matchedCount: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Global factory census unavailable',
      }
    }

    const cards = searchGlobalPools(snapshot.pools, query).flatMap((pool) => {
      const card = toDiscoveryCard(
        {
          pairAddress: pool.pairAddress,
          token0: pool.token0,
          token1: pool.token1,
          symbol0: pool.symbol0,
          symbol1: pool.symbol1,
          reserve0: pool.reserve0Raw,
          reserve1: pool.reserve1Raw,
          classification:
            pool.status === 'ZERO_LIQUIDITY' ? 'inactive' : pool.status === 'INVALID_PAIR' ? 'invalid_contract' : 'tradeable',
          metadataStatus: pool.symbol0 === 'Unknown token' || pool.symbol1 === 'Unknown token' ? 'partial' : 'complete',
          active: pool.status === 'ACTIVE_WITH_LIQUIDITY',
          lastVerified: snapshot.sourceTimestamp,
        },
        { tvlUsd: pool.tvlUsd == null ? null : Number(pool.tvlUsd), tvlKnown: pool.tvlUsd != null },
        null,
        pool.chainId,
      )
      return card ? [card] : []
    })
    const availableFilters = factualFilters(cards, myTokensReady)
    const availableSorts = factualSorts(cards)
    const activeFilter = availableFilters.includes(filter) ? filter : 'all'
    const activeSort = availableSorts.includes(sort) ? sort : 'tvl'
    const filtered = filterDiscoveryCards(cards, activeFilter, myTokenAddresses)
    const sorted = sortDiscoveryCards(filtered, activeSort)
    const visibleCards = sorted.slice(0, Math.max(1, pageSize))
    return {
      ...base,
      state: sorted.length ? 'ready' : 'empty',
      cards,
      visibleCards,
      matchedCount: sorted.length,
      hasMore: sorted.length > visibleCards.length,
      availableFilters,
      availableSorts,
      error: snapshot.status === 'partial' ? 'One or more chains are temporarily unavailable' : null,
    }
  }, [snapshot, error, isLoading, query, filter, sort, pageSize, myTokenAddresses, myTokensReady])
}
