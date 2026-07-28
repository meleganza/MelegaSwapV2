/**
 * LIQUIDITY_MODULE_003 — discovery data hook.
 * Reuses factory indexer + optional subgraph metrics. Read-only.
 */
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useMelegaFactoryPools } from 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools'
import { usePoolDatasSWR } from 'state/info/hooks'
import { useAllTokenBalances } from 'state/wallet/hooks'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import {
  factualFilters,
  factualSorts,
  filterDiscoveryCards,
  searchDiscoveryPairs,
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
}): LiquidityPoolDiscoveryView {
  const { query, filter, sort } = options
  const { address: account } = useAccount()
  const factory = useMelegaFactoryPools(MELEGA_CHAIN_ID)
  const balances = useAllTokenBalances()

  const pairAddresses = useMemo(
    () => factory.pools.map((p) => p.pairAddress).filter(Boolean).slice(0, 80),
    [factory.pools],
  )
  const poolDatas = usePoolDatasSWR(pairAddresses)

  const metricsByPair = useMemo(() => {
    const map = new Map<string, { tvlUsd?: number; volumeUsd?: number; feesUsd?: number }>()
    for (const row of poolDatas) {
      if (!row?.address) continue
      map.set(row.address.toLowerCase(), {
        tvlUsd: row.liquidityUSD,
        volumeUsd: row.volumeUSD,
        feesUsd: row.lpFees24h,
      })
    }
    return map
  }, [poolDatas])

  const myTokenAddresses = useMemo(() => {
    const set = new Set<string>()
    for (const [addr, amount] of Object.entries(balances ?? {})) {
      if (amount && amount.greaterThan(0)) set.add(addr.toLowerCase())
    }
    return set
  }, [balances])

  const myTokensReady = Boolean(account) && myTokenAddresses.size > 0

  return useMemo((): LiquidityPoolDiscoveryView => {
    if (factory.discoveryState === 'loading') {
      return {
        state: 'loading',
        cards: [],
        visibleCards: [],
        availableFilters: ['all'],
        availableSorts: [],
        myTokensReady,
        factoryAddress: factory.factoryAddress,
        discoveryMethod: factory.discoveryMethod,
        error: null,
      }
    }

    if (factory.discoveryState === 'unavailable' || factory.discoveryState === 'unsupported_chain') {
      return {
        state: 'unavailable',
        cards: [],
        visibleCards: [],
        availableFilters: ['all'],
        availableSorts: [],
        myTokensReady,
        factoryAddress: factory.factoryAddress,
        discoveryMethod: factory.discoveryMethod,
        error: factory.error,
      }
    }

    const searched = searchDiscoveryPairs(factory.pools, query)
    const cards = searched
      .map((pair) => toDiscoveryCard(pair, metricsByPair.get(pair.pairAddress.toLowerCase())))
      .filter((c): c is DiscoveryPoolCardModel => Boolean(c))

    if (cards.length === 0 && !query.trim()) {
      return {
        state: 'empty',
        cards: [],
        visibleCards: [],
        availableFilters: ['all'],
        availableSorts: [],
        myTokensReady,
        factoryAddress: factory.factoryAddress,
        discoveryMethod: factory.discoveryMethod,
        error: null,
      }
    }

    const availableFilters = factualFilters(cards, myTokensReady)
    const availableSorts = factualSorts(cards)
    const activeFilter = availableFilters.includes(filter) ? filter : 'all'
    const activeSort = availableSorts.includes(sort)
      ? sort
      : availableSorts[0] ?? 'newest'

    const filtered = filterDiscoveryCards(cards, activeFilter, myTokenAddresses)
    const sorted = availableSorts.length > 0 ? sortDiscoveryCards(filtered, activeSort) : filtered
    const visibleCards = sorted.slice(0, liquidityPoolDiscovery.pageSize)

    return {
      state: visibleCards.length === 0 ? 'empty' : 'ready',
      cards,
      visibleCards,
      availableFilters,
      availableSorts,
      myTokensReady,
      factoryAddress: factory.factoryAddress,
      discoveryMethod: factory.discoveryMethod,
      error: null,
    }
  }, [
    factory.discoveryState,
    factory.pools,
    factory.factoryAddress,
    factory.discoveryMethod,
    factory.error,
    query,
    filter,
    sort,
    metricsByPair,
    myTokenAddresses,
    myTokensReady,
  ])
}
