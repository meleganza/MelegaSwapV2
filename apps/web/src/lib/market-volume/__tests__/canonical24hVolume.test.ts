import {
  isVolumeAnomaly,
  pairContributionUsd,
  sumPricedUsd,
  wbnbVolumeFromPairSides,
  WBNB_BSC,
} from '../canonical24hVolume'

describe('canonical24hVolume', () => {
  it('uses token1 when WBNB is quote', () => {
    const r = wbnbVolumeFromPairSides({
      token0: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token1: WBNB_BSC,
      baseVolume: 1_000_000,
      quoteVolume: 12.5,
    })
    expect(r.wbnbVolume).toBe(12.5)
    expect(r.priced).toBe(true)
  })

  it('uses token0 when WBNB is base', () => {
    const r = wbnbVolumeFromPairSides({
      token0: WBNB_BSC,
      token1: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      baseVolume: 3.2,
      quoteVolume: 9e12,
    })
    expect(r.wbnbVolume).toBe(3.2)
  })

  it('does not treat meme token1 volume as WBNB', () => {
    const r = wbnbVolumeFromPairSides({
      token0: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token1: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      baseVolume: 1,
      quoteVolume: 1e14,
    })
    expect(r.priced).toBe(false)
    expect(r.wbnbVolume).toBe(0)
  })

  it('sums pair contributions without double-counting sides', () => {
    const a = pairContributionUsd({
      pairAddress: '0x1',
      token0: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token1: WBNB_BSC,
      baseVolume: 100,
      quoteVolume: 10,
      bnbUsd: 600,
    })
    const b = pairContributionUsd({
      pairAddress: '0x2',
      token0: WBNB_BSC,
      token1: '0xcccccccccccccccccccccccccccccccccccccccc',
      baseVolume: 2,
      quoteVolume: 999999,
      bnbUsd: 600,
    })
    const sum = sumPricedUsd([a, b])
    expect(sum.totalUsd).toBe(10 * 600 + 2 * 600)
    expect(sum.pricedPairCount).toBe(2)
  })

  it('flags implausible magnitude anomalies', () => {
    expect(
      isVolumeAnomaly({ nextUsd: 73_164_280_000, lastGoodUsd: 12_000, pricedPairCount: 4 }),
    ).toBe(true)
    expect(isVolumeAnomaly({ nextUsd: 15_000, lastGoodUsd: 12_000, pricedPairCount: 4 })).toBe(false)
  })
})
