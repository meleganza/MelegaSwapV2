import type { Transaction } from 'state/info/types'

const QUOTE_SYMBOLS = new Set(['BNB', 'WBNB', 'ETH', 'WETH', 'USDT', 'USDC', 'BUSD', 'DAI'])

export type TradeMarketOrientation = {
  baseSide: 'input' | 'output'
  quoteSide: 'input' | 'output'
  baseSymbol: string
  quoteSymbol: string
  baseCurrencyId?: string
  quoteCurrencyId?: string
}

const normalizedSymbol = (symbol?: string) => {
  const upper = symbol?.trim().toUpperCase() ?? ''
  return upper === 'BNB' ? 'WBNB' : upper
}

/** Keep the market label stable when the user reverses the executable route. */
export function resolveTradeMarketOrientation({
  inputSymbol,
  outputSymbol,
  inputCurrencyId,
  outputCurrencyId,
}: {
  inputSymbol: string
  outputSymbol: string
  inputCurrencyId?: string
  outputCurrencyId?: string
}): TradeMarketOrientation {
  const inputIsQuote = QUOTE_SYMBOLS.has(inputSymbol.toUpperCase())
  const outputIsQuote = QUOTE_SYMBOLS.has(outputSymbol.toUpperCase())
  const baseSide = inputIsQuote && !outputIsQuote ? 'output' : 'input'

  if (baseSide === 'output') {
    return {
      baseSide,
      quoteSide: 'input',
      baseSymbol: outputSymbol,
      quoteSymbol: inputSymbol,
      baseCurrencyId: outputCurrencyId,
      quoteCurrencyId: inputCurrencyId,
    }
  }

  return {
    baseSide,
    quoteSide: 'output',
    baseSymbol: inputSymbol,
    quoteSymbol: outputSymbol,
    baseCurrencyId: inputCurrencyId,
    quoteCurrencyId: outputCurrencyId,
  }
}

const normalizedAddress = (address?: string | null) => address?.trim().toLowerCase()

/** Address identity is authoritative; symbols are only a fallback for legacy rows. */
export function transactionMatchesPair(
  tx: Pick<Transaction, 'token0Address' | 'token1Address' | 'token0Symbol' | 'token1Symbol'>,
  baseAddress?: string,
  quoteAddress?: string,
  baseSymbol?: string,
  quoteSymbol?: string,
): boolean {
  const expectedAddresses = [normalizedAddress(baseAddress), normalizedAddress(quoteAddress)]
  if (expectedAddresses.every(Boolean)) {
    const transactionAddresses = new Set([normalizedAddress(tx.token0Address), normalizedAddress(tx.token1Address)])
    return expectedAddresses.every((address) => transactionAddresses.has(address))
  }

  if (!baseSymbol || !quoteSymbol) return false
  const transactionSymbols = new Set([normalizedSymbol(tx.token0Symbol), normalizedSymbol(tx.token1Symbol)])
  return transactionSymbols.has(normalizedSymbol(baseSymbol)) && transactionSymbols.has(normalizedSymbol(quoteSymbol))
}
