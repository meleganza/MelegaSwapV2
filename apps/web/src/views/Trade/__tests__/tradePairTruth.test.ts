import { describe, expect, it } from 'vitest'
import { resolveTradeMarketOrientation, transactionMatchesPair } from '../tradePairTruth'

const RMBR = '0xe7ba8bcf0fe998c77163b42c96c0b12a834b06ed'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'

describe('selected Swap pair truth', () => {
  it('keeps RMBR/BNB as the market when the executable route is reversed', () => {
    const buy = resolveTradeMarketOrientation({
      inputSymbol: 'BNB',
      outputSymbol: 'RMBR',
      inputCurrencyId: 'BNB',
      outputCurrencyId: RMBR,
    })
    const sell = resolveTradeMarketOrientation({
      inputSymbol: 'RMBR',
      outputSymbol: 'BNB',
      inputCurrencyId: RMBR,
      outputCurrencyId: 'BNB',
    })

    expect(buy).toMatchObject({ baseSymbol: 'RMBR', quoteSymbol: 'BNB' })
    expect(sell).toMatchObject({ baseSymbol: 'RMBR', quoteSymbol: 'BNB' })
  })

  it('rejects unrelated swaps even when a token symbol is reused', () => {
    expect(
      transactionMatchesPair(
        {
          token0Address: RMBR,
          token1Address: WBNB,
          token0Symbol: 'RMBR',
          token1Symbol: 'WBNB',
        },
        RMBR,
        WBNB,
        'RMBR',
        'BNB',
      ),
    ).toBe(true)

    expect(
      transactionMatchesPair(
        {
          token0Address: '0x0000000000000000000000000000000000000001',
          token1Address: WBNB,
          token0Symbol: 'RMBR',
          token1Symbol: 'WBNB',
        },
        RMBR,
        WBNB,
        'RMBR',
        'BNB',
      ),
    ).toBe(false)
  })
})
