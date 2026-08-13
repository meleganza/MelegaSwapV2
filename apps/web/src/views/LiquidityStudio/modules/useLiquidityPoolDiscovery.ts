/**
 * LIQUIDITY_MODULE_003 — discovery data hook.
 * Reuses factory indexer + optional subgraph metrics + durable tier-metrics. Read-only.
 */
import { useMemo } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import { WBNB } from '@pancakeswap/sdk'
import { useMelegaFactoryPools } from 'views/PoolsStudio/poolsRuntime/useMelegaFactoryPools'
import { usePoolDatasSWR } from 'state/info/hooks'
import { useAllTokenBalances } from 'state/wallet/hooks'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { LP_HOLDERS_FEE } from 'config/constants/info'
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
  /** Filtered+sorted count before page slice — for Load more. */
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
  /** Visible page size (defaults to module pageSize). */
  pageSize?: number
}): LiquidityPoolDiscoveryView {
  const { query, filter, sort, pageSize = liquidityPoolDiscovery.pageSize } = options
  const { address: account } = useAccount()
  const factory = useMelegaFactoryPools(MELEGA_CHAIN_ID)
  const balances = useAllTokenBalances()
  const wbnbPrice = useBUSDPrice(WBNB[56])
  const bnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined

  const pairAddresses = useMemo(
    () =>
      factory.pools
        .map((p) => p.pairAddress)
        .filter(Boolean)
        .slice(0, 80),
    [factory.pools],
  )
  const poolDatas = usePoolDatasSWR(pairAddresses)
  const { data: tierMetrics } = useSWR(
    'liquidity-discovery-tier-metrics',
    async () => {
      const res = await fetch('/api/indexer/tier-metrics/')
      if (!res.ok) return null
      return (await res.json()) as {
        rows?: Array<{ pairAddress?: string; volume24hQuote?: number; tradeCount24h?: number; status?: string }>
      }
    },
    { refreshInterval: 60_000, revalidateOnFocus: false },
  )

  const metricsByPair = useMemo(() => {
    const map = new Map<string, { tvlUsd?: number; volumeUsd?: number; feesUsd?: number; aprPct?: number }>()
    for (const row of poolDatas) {
      if (!row?.address) continue
      map.set(row.address.toLowerCase(), {
        tvlUsd: row.liquidityUSD,
        volumeUsd: row.volumeUSD,
        feesUsd: row.lpFees24h,
        aprPct: row.lpApr7d != null && Number.isFinite(row.lpApr7d) && row.lpApr7d > 0 ? row.lpApr7d : undefined,
      })
    }
    // Prefer factual indexed Melega DEX volume when subgraph metrics are missing.
    for (const row of tierMetrics?.rows ?? []) {
      const addr = row.pairAddress?.toLowerCase()
      if (!addr) continue
      const quoteVol = row.volume24hQuote
      if (!(typeof quoteVol === 'number') || !(quoteVol > 0) || !(bnbUsd && bnbUsd > 0)) continue
      const volumeUsd = quoteVol * bnbUsd
      const existing = map.get(addr) ?? {}
      if (!(existing.volumeUsd && existing.volumeUsd > 0)) {
        existing.volumeUsd = volumeUsd
        existing.feesUsd = volumeUsd * LP_HOLDERS_FEE
        map.set(addr, existing)
      }
    }
    return map
  }, [poolDatas, tierMetrics, bnbUsd])

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
        matchedCount: 0,
        hasMore: false,
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
        matchedCount: 0,
        hasMore: false,
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
      .map((pair) => toDiscoveryCard(pair, metricsByPair.get(pair.pairAddress.toLowerCase()), bnbUsd))
      .filter((c): c is DiscoveryPoolCardModel => Boolean(c))

    if (cards.length === 0 && !query.trim()) {
      return {
        state: 'empty',
        cards: [],
        visibleCards: [],
        matchedCount: 0,
        hasMore: false,
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
      : availableSorts.includes('tvl')
      ? 'tvl'
      : availableSorts.includes('market')
      ? 'market'
      : availableSorts[0] ?? 'tvl'

    const filtered = filterDiscoveryCards(cards, activeFilter, myTokenAddresses)
    const sorted = availableSorts.length > 0 ? sortDiscoveryCards(filtered, activeSort) : filtered
    const matchedCount = sorted.length
    const visibleCards = sorted.slice(0, Math.max(1, pageSize))

    return {
      state: matchedCount === 0 ? 'empty' : 'ready',
      cards,
      visibleCards,
      matchedCount,
      hasMore: matchedCount > visibleCards.length,
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
    pageSize,
    metricsByPair,
    myTokenAddresses,
    myTokensReady,
    bnbUsd,
  ])
}
