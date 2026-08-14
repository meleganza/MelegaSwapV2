import { useMemo } from 'react'
import useSWR from 'swr'
import { Currency } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { usePair, PairState } from 'hooks/usePairs'
import { useCanonicalMarcoPair } from 'hooks/useCanonicalMarcoPair'
import type { QuoteAssetKey } from './strategyPresets'
import { QUOTE_ASSET_OPTIONS } from './strategyPresets'
import type { ProjectDexAnalytics } from 'lib/market-data/projectDexAnalytics'

const MELEGA_FACTORY_BSC = '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c'

type IndexedPairsResponse = {
  analytics: ProjectDexAnalytics
}

async function fetchIndexedPairs(url: string): Promise<IndexedPairsResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP_${response.status}`)
  return response.json()
}

export type MelegaPairDetection = {
  loading: boolean
  available: boolean
  pairAddress: string | null
  quoteSymbol: string
  quoteAddress: string
  quoteKey: QuoteAssetKey
  reserveProject: string | null
  reserveQuote: string | null
  poolStatus: 'LOADING' | 'EXISTS' | 'NOT_EXISTS' | 'INVALID' | 'NO_TOKEN'
}

export function resolveQuoteCurrency(quoteKey: QuoteAssetKey | null | undefined): Currency {
  const key = quoteKey ?? 'WBNB'
  if (key === 'USDT') return bscTokens.usdt
  if (key === 'USDC') return bscTokens.usdc
  return bscTokens.wbnb
}

/**
 * Live Melega pair detection for project token × selected quote.
 * Uses CREATE2 + reserves multicall — does not invent pools.
 */
export function useMelegaPairDetection(
  projectToken: Currency | null | undefined,
  quoteKey: QuoteAssetKey | null | undefined = 'WBNB',
): MelegaPairDetection {
  const quote = resolveQuoteCurrency(quoteKey)
  const key = (quoteKey ?? 'WBNB') as QuoteAssetKey
  const [discoveredPairState, discoveredPair] = usePair(projectToken ?? undefined, quote)
  const canonicalMarcoPair = useCanonicalMarcoPair(projectToken?.wrapped, quote.wrapped)
  const pair = discoveredPair ?? canonicalMarcoPair
  const pairState = pair ? PairState.EXISTS : discoveredPairState
  const projectAddress = projectToken?.wrapped.address
  const indexedKey =
    projectToken?.chainId === 56 && projectAddress
      ? `/api/market-data/token-pairs?chainId=56&address=${encodeURIComponent(projectAddress)}`
      : null
  const { data: indexedData, isLoading: indexedLoading } = useSWR<IndexedPairsResponse>(indexedKey, fetchIndexedPairs, {
    revalidateOnFocus: false,
    dedupingInterval: 45_000,
  })
  const indexedPair = indexedData?.analytics.pairs.find(
    (candidate) =>
      candidate.dexId.toLowerCase() === MELEGA_FACTORY_BSC &&
      candidate.counterpartAddress?.toLowerCase() === quote.wrapped.address.toLowerCase(),
  )

  return useMemo(() => {
    const base = {
      quoteSymbol: quote.symbol,
      quoteAddress: quote.wrapped.address,
      quoteKey: key,
    }

    if (!projectToken) {
      return {
        ...base,
        loading: false,
        available: false,
        pairAddress: null,
        reserveProject: null,
        reserveQuote: null,
        poolStatus: 'NO_TOKEN' as const,
      }
    }

    if (pairState === PairState.EXISTS && pair) {
      const projectIsToken0 = pair.token0.address.toLowerCase() === projectToken.wrapped.address.toLowerCase()
      return {
        ...base,
        loading: false,
        available: true,
        pairAddress: pair.liquidityToken.address,
        reserveProject: (projectIsToken0 ? pair.reserve0 : pair.reserve1).toSignificant(6),
        reserveQuote: (projectIsToken0 ? pair.reserve1 : pair.reserve0).toSignificant(6),
        poolStatus: 'EXISTS' as const,
      }
    }

    // The indexed Melega factory inventory is a factual fallback when the
    // shared multicall remains pending. It never accepts pools from other DEXes.
    if (indexedPair) {
      return {
        ...base,
        loading: false,
        available: true,
        pairAddress: indexedPair.pairAddress,
        reserveProject: null,
        reserveQuote: null,
        poolStatus: 'EXISTS' as const,
      }
    }

    if (pairState === PairState.LOADING || indexedLoading) {
      return {
        ...base,
        loading: true,
        available: false,
        pairAddress: null,
        reserveProject: null,
        reserveQuote: null,
        poolStatus: 'LOADING' as const,
      }
    }

    const unavailableStatus: MelegaPairDetection['poolStatus'] =
      pairState === PairState.INVALID ? 'INVALID' : 'NOT_EXISTS'
    return {
      ...base,
      loading: false,
      available: false,
      pairAddress: null,
      reserveProject: null,
      reserveQuote: null,
      poolStatus: unavailableStatus,
    }
  }, [indexedLoading, indexedPair, pair, pairState, projectToken, quote.wrapped.address, quote.symbol, key])
}

export function quoteOptionLabel(key: QuoteAssetKey): string {
  return QUOTE_ASSET_OPTIONS.find((o) => o.key === key)?.label ?? key
}
