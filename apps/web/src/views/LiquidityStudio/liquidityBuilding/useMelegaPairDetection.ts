import { useMemo } from 'react'
import { Currency } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { usePair, PairState } from 'hooks/usePairs'
import type { QuoteAssetKey } from './strategyPresets'
import { QUOTE_ASSET_OPTIONS } from './strategyPresets'

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
  const [pairState, pair] = usePair(projectToken ?? undefined, quote)

  return useMemo(() => {
    const base = {
      quoteSymbol: quote.symbol,
      quoteAddress: quote.address,
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

    if (pairState === PairState.LOADING) {
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

    return {
      ...base,
      loading: false,
      available: false,
      pairAddress: null,
      reserveProject: null,
      reserveQuote: null,
      poolStatus: (pairState === PairState.INVALID ? 'INVALID' : 'NOT_EXISTS') as const,
    }
  }, [pair, pairState, projectToken, quote.address, quote.symbol, key])
}

export function quoteOptionLabel(key: QuoteAssetKey): string {
  return QUOTE_ASSET_OPTIONS.find((o) => o.key === key)?.label ?? key
}
