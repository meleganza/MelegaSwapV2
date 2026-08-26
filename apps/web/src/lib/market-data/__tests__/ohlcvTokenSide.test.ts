import { describe, expect, it } from 'vitest'
import { resolveOhlcvTokenSide } from '../ohlcvTokenSide'

const MARCO = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const LUCK = '0xee86b71b787f6dcf83a9856d181dda2b7b8398b0'

describe('resolveOhlcvTokenSide', () => {
  it('selects the quote series when the provider orients MARCO / LUCK', () => {
    expect(resolveOhlcvTokenSide(LUCK, `bsc_${MARCO}`, `bsc_${LUCK}`)).toBe('quote')
  })

  it('selects the base series for the provider base token', () => {
    expect(resolveOhlcvTokenSide(MARCO, `bsc_${MARCO}`, `bsc_${LUCK}`)).toBe('base')
  })

  it('fails closed when the selected token is not part of the pool', () => {
    expect(
      resolveOhlcvTokenSide('0x0000000000000000000000000000000000000001', `bsc_${MARCO}`, `bsc_${LUCK}`),
    ).toBeNull()
  })
})
