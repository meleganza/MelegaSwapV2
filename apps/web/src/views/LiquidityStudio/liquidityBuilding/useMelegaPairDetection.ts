import { useMemo } from 'react'
import { Currency } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { usePair, PairState } from 'hooks/usePairs'

export type MelegaPairDetection = {
  loading: boolean
  available: boolean
  pairAddress: string | null
  quoteSymbol: string
  quoteAddress: string
  reserveProject: string | null
  reserveQuote: string | null
  poolStatus: 'LOADING' | 'EXISTS' | 'NOT_EXISTS' | 'INVALID' | 'NO_TOKEN'
}

/**
 * Live Melega pair detection for project token × WBNB (primary quote probe).
 * Uses CREATE2 + reserves multicall — does not invent pools.
 */
export function useMelegaPairDetection(projectToken: Currency | null | undefined): MelegaPairDetection {
  const quote = bscTokens.wbnb
  const [pairState, pair] = usePair(projectToken ?? undefined, quote)

  return useMemo(() => {
    if (!projectToken) {
      return {
        loading: false,
        available: false,
        pairAddress: null,
        quoteSymbol: quote.symbol,
        quoteAddress: quote.address,
        reserveProject: null,
        reserveQuote: null,
        poolStatus: 'NO_TOKEN',
      }
    }

    if (pairState === PairState.LOADING) {
      return {
        loading: true,
        available: false,
        pairAddress: null,
        quoteSymbol: quote.symbol,
        quoteAddress: quote.address,
        reserveProject: null,
        reserveQuote: null,
        poolStatus: 'LOADING',
      }
    }

    if (pairState === PairState.EXISTS && pair) {
      const projectIsToken0 = pair.token0.address.toLowerCase() === projectToken.wrapped.address.toLowerCase()
      return {
        loading: false,
        available: true,
        pairAddress: pair.liquidityToken.address,
        quoteSymbol: quote.symbol,
        quoteAddress: quote.address,
        reserveProject: (projectIsToken0 ? pair.reserve0 : pair.reserve1).toSignificant(6),
        reserveQuote: (projectIsToken0 ? pair.reserve1 : pair.reserve0).toSignificant(6),
        poolStatus: 'EXISTS',
      }
    }

    return {
      loading: false,
      available: false,
      pairAddress: null,
      quoteSymbol: quote.symbol,
      quoteAddress: quote.address,
      reserveProject: null,
      reserveQuote: null,
      poolStatus: pairState === PairState.INVALID ? 'INVALID' : 'NOT_EXISTS',
    }
  }, [pair, pairState, projectToken, quote.address, quote.symbol])
}
