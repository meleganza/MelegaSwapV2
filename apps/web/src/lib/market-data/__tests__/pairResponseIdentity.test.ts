import { describe, expect, it } from 'vitest'
import { pairResponseMatchesRequest } from '../pairResponseIdentity'

const LUCK = '0xee86b71b787f6dcf83a9856d181dda2b7b8398b0'
const LUCK_WBNB_PAIR = '0x5a19fde41461eb998e74839e8a7527e7dc376850'
const LUCK_MARCO_PAIR = '0x119446446103a23a70cf56b65b235ceaa0e0f0e4'

describe('pair response identity', () => {
  it('accepts only the response for the currently requested chain, pool and token', () => {
    expect(
      pairResponseMatchesRequest(
        { chainId: 56, pairAddress: LUCK_WBNB_PAIR, tokenAddress: LUCK },
        56,
        LUCK_WBNB_PAIR,
        LUCK,
      ),
    ).toBe(true)
    expect(
      pairResponseMatchesRequest(
        { chainId: 56, pairAddress: LUCK_MARCO_PAIR, tokenAddress: LUCK },
        56,
        LUCK_WBNB_PAIR,
        LUCK,
      ),
    ).toBe(false)
  })
})
