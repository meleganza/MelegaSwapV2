import { describe, expect, it } from 'vitest'
import { collectTradeableObservationAddresses, mergeObservationAddresses } from '../observationUniverse'
import { isQuoteTokenAddress } from '../tierTrendingModel'

const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const BLION = '0x1111111111111111111111111111111111111111'
const IDLE = '0x2222222222222222222222222222222222222222'

describe('observation universe', () => {
  it('collects unique tradeable bases and excludes quote plumbing', () => {
    const addresses = collectTradeableObservationAddresses([
      { token0: MARCO, token1: WBNB, classification: 'tradeable' },
      { token0: BLION, token1: USDT, classification: 'tradeable' },
      { token0: IDLE, token1: WBNB, classification: 'inactive' },
      { token0: WBNB, token1: USDT, classification: 'tradeable' },
      { token0: BLION, token1: WBNB, classification: 'tradeable', active: false },
    ])
    expect(addresses).toEqual([MARCO.toLowerCase(), BLION.toLowerCase()])
    expect(addresses.every((address) => !isQuoteTokenAddress(address))).toBe(true)
  })

  it('merges factory + canonical addresses without inventing or duplicating', () => {
    const merged = mergeObservationAddresses(
      [MARCO, WBNB],
      ['not-an-address', BLION, BLION.toUpperCase()],
      collectTradeableObservationAddresses([{ token0: IDLE, token1: USDT, classification: 'tradeable' }]),
    )
    expect(merged.sort()).toEqual([BLION.toLowerCase(), IDLE.toLowerCase(), MARCO.toLowerCase()].sort())
  })
})
