import { describe, expect, it } from 'vitest'
import { computeMarcoPairMarket } from '../computeMarcoPairMarket'

describe('computeMarcoPairMarket', () => {
  it('derives price, two-sided liquidity and FDV from factual pair reserves', () => {
    expect(
      computeMarcoPairMarket({
        marcoReserve: 2_000_000,
        nativeReserve: 4,
        nativeUsd: 500,
        totalSupply: 1_000_000_000,
      }),
    ).toEqual({
      priceUsd: 0.001,
      liquidityUsd: 4_000,
      fdvUsd: 1_000_000,
    })
  })

  it('fails closed when a reserve or native USD observation is missing', () => {
    expect(computeMarcoPairMarket({ marcoReserve: 0, nativeReserve: 4, nativeUsd: 500 })).toBeUndefined()
    expect(computeMarcoPairMarket({ marcoReserve: 2_000_000, nativeReserve: 4, nativeUsd: 0 })).toBeUndefined()
  })

  it('never invents FDV without a positive on-chain supply', () => {
    expect(
      computeMarcoPairMarket({ marcoReserve: 2_000_000, nativeReserve: 4, nativeUsd: 500 })?.fdvUsd,
    ).toBeUndefined()
  })
})
