/**
 * Factual Melega DEX AMM pool discovery via existing indexer pairs API
 * (factory-allPairs-enumeration). Read-only; no second indexer.
 */
import { useMemo } from 'react'
import useSWR from 'swr'
import { MELEGA_CHAIN_ID, MELEGA_FACTORY_BSC } from 'lib/bsc-indexer/constants'
import type { ClassifiedAmmPair } from 'lib/bsc-indexer/types'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import type { PoolPreviewCard } from '../poolsStudioData'

export type FactoryDiscoveryState =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'unavailable'
  | 'unsupported_chain'

export type MelegaFactoryPoolsResult = {
  discoveryState: FactoryDiscoveryState
  factoryAddress: string
  chainId: number
  factualPoolCount: number | null
  pools: ClassifiedAmmPair[]
  previewCards: PoolPreviewCard[]
  source: string | null
  discoveryMethod: string | null
  freshness: string | null
  error: string | null
  discoveredKpiValue: string
  discoveredKpiSecondary?: string
}

type PairsApiResponse = {
  status?: string
  total?: number
  rows?: ClassifiedAmmPair[]
  source?: string
  discoveryMethod?: string
  error?: string
}

function shortAddr(addr?: string): string {
  if (!addr || addr.length < 10) return '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function mapFactoryPairToPreviewCard(pair: ClassifiedAmmPair): PoolPreviewCard {
  const sym0 = pair.symbol0 || shortAddr(pair.token0)
  const sym1 = pair.symbol1 || shortAddr(pair.token1)
  const live = pair.active && (pair.classification === 'tradeable' || pair.classification === 'liquidity_present')
  return {
    id: `amm-${pair.pairAddress.toLowerCase()}`,
    name: `${sym0} / ${sym1}`,
    tokens: [sym0, sym1],
    stakeToken: sym0,
    status: live ? 'live' : 'ended',
    displayStatus: live ? 'LIVE' : 'ENDED',
    discoveryClass: pair.classification,
    visibilityStatus: 'VISIBLE',
    tvl: RUNTIME_UNAVAILABLE_LABEL,
    rewardToken: RUNTIME_UNAVAILABLE_LABEL,
    dailyRewards: RUNTIME_UNAVAILABLE_LABEL,
    participants: RUNTIME_UNAVAILABLE_LABEL,
    contractAddress: pair.pairAddress,
    explorerUrl: `https://bscscan.com/address/${pair.pairAddress}`,
    poolTypeLabel: 'Melega AMM Pair',
    cta: 'none',
    apr: RUNTIME_UNAVAILABLE_LABEL,
  }
}

const PAGE_SIZE = 100
const MAX_PAGES = 40

async function fetchFactoryPairs(): Promise<PairsApiResponse> {
  const all: ClassifiedAmmPair[] = []
  let page = 1
  let total = Infinity
  let source: string | undefined
  let discoveryMethod: string | undefined
  let status = 'ready'

  while (all.length < total && page <= MAX_PAGES) {
    const res = await fetch(`/api/indexer/pairs?page=${page}&pageSize=${PAGE_SIZE}`)
    if (!res.ok) {
      if (page === 1) {
        return { status: 'unavailable', error: `HTTP ${res.status}`, total: 0, rows: [] }
      }
      break
    }
    const data = (await res.json()) as PairsApiResponse
    source = data.source ?? source
    discoveryMethod = data.discoveryMethod ?? discoveryMethod
    status = data.status ?? status
    const rows = data.rows ?? []
    total = typeof data.total === 'number' ? data.total : all.length + rows.length
    all.push(...rows)
    if (rows.length === 0) break
    page += 1
  }

  return {
    status,
    total: all.length,
    rows: all,
    source,
    discoveryMethod,
    error: all.length === 0 && status === 'unavailable' ? 'Factory pairs unavailable' : undefined,
  }
}

export function useMelegaFactoryPools(activeChainId?: number): MelegaFactoryPoolsResult {
  const supported = activeChainId == null || activeChainId === MELEGA_CHAIN_ID
  const { data, error, isLoading } = useSWR(supported ? 'melega-factory-pools-v2-paginated' : null, fetchFactoryPairs, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  return useMemo((): MelegaFactoryPoolsResult => {
    const factoryAddress = MELEGA_FACTORY_BSC
    const chainId = MELEGA_CHAIN_ID

    if (!supported) {
      return {
        discoveryState: 'unsupported_chain',
        factoryAddress,
        chainId,
        factualPoolCount: null,
        pools: [],
        previewCards: [],
        source: null,
        discoveryMethod: null,
        freshness: null,
        error: 'Switch to BNB Smart Chain (56)',
        discoveredKpiValue: '—',
        discoveredKpiSecondary: 'Unsupported chain',
      }
    }

    if (isLoading && !data) {
      return {
        discoveryState: 'loading',
        factoryAddress,
        chainId,
        factualPoolCount: null,
        pools: [],
        previewCards: [],
        source: null,
        discoveryMethod: null,
        freshness: null,
        error: null,
        discoveredKpiValue: '—',
        discoveredKpiSecondary: 'Loading factory pairs…',
      }
    }

    if (error || data?.status === 'unavailable' || data?.error) {
      return {
        discoveryState: 'unavailable',
        factoryAddress,
        chainId,
        factualPoolCount: null,
        pools: [],
        previewCards: [],
        source: data?.source ?? null,
        discoveryMethod: data?.discoveryMethod ?? null,
        freshness: null,
        error: data?.error || String(error ?? 'unavailable'),
        discoveredKpiValue: '—',
        discoveredKpiSecondary: 'Factory discovery unavailable',
      }
    }

    const rows = data?.rows ?? []
    const total = typeof data?.total === 'number' ? data.total : rows.length
    const previewCards = rows.map(mapFactoryPairToPreviewCard)

    if (total === 0) {
      return {
        discoveryState: 'empty',
        factoryAddress,
        chainId,
        factualPoolCount: 0,
        pools: rows,
        previewCards: [],
        source: data?.source ?? null,
        discoveryMethod: data?.discoveryMethod ?? 'factory-allPairs-enumeration',
        freshness: new Date().toISOString(),
        error: null,
        discoveredKpiValue: '0',
        discoveredKpiSecondary: 'Melega Factory returned no pairs',
      }
    }

    return {
      discoveryState: 'ready',
      factoryAddress,
      chainId,
      factualPoolCount: total,
      pools: rows,
      previewCards,
      source: data?.source ?? null,
      discoveryMethod: data?.discoveryMethod ?? 'factory-allPairs-enumeration',
      freshness: new Date().toISOString(),
      error: null,
      discoveredKpiValue: String(total),
      discoveredKpiSecondary: 'Melega Factory · allPairs',
    }
  }, [supported, isLoading, data, error])
}
