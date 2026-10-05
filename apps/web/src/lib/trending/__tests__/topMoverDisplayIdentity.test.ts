import { describe, expect, it } from 'vitest'
import { resolveTopMoverDisplayMeta } from '../buildServerTopMoversSnapshot'

describe('Top Movers display identity', () => {
  it('uses matching factual live metadata for BROWNIE and FTM registry gaps', () => {
    expect(
      resolveTopMoverDisplayMeta('0xaa7cd678c8a2809c6dff1250a87f184e779922c9', {
        address: '0xAA7cD678C8a2809c6DFF1250a87f184E779922c9',
        symbol: 'BROWNIE',
        name: "CZ's Dog",
      }),
    ).toMatchObject({ symbol: 'BROWNIE', displayName: "CZ's Dog", chainId: 56 })

    expect(
      resolveTopMoverDisplayMeta('0xad29abb318791d579433d831ed122afeaf29dcfe', {
        address: '0xAD29AbB318791D579433D831ed122aFeAf29dcfe',
        symbol: 'FTM',
        name: 'Fantom',
      }),
    ).toMatchObject({ symbol: 'FTM', displayName: 'Fantom', chainId: 56 })
  })

  it('rejects cross-address or address-shaped metadata and returns a neutral label', () => {
    const address = '0x1111111111111111111111111111111111111111'
    expect(resolveTopMoverDisplayMeta(address)).toMatchObject({
      symbol: 'Unknown token',
      displayName: 'Unknown token',
    })
    expect(
      resolveTopMoverDisplayMeta(address, {
        address: '0x2222222222222222222222222222222222222222',
        symbol: 'WRONG',
      }),
    ).toMatchObject({ symbol: 'Unknown token' })
    expect(
      resolveTopMoverDisplayMeta(address, {
        address,
        symbol: '0x1111…1111',
      }),
    ).toMatchObject({ symbol: 'Unknown token' })
  })
})
