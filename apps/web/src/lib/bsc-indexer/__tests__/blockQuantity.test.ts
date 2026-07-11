import { describe, expect, it } from 'vitest'
import { toBlockQuantity } from '../rpc/blockQuantity'

describe('toBlockQuantity', () => {
  it('encodes block 0 as 0x0', () => {
    expect(toBlockQuantity(0)).toBe('0x0')
  })

  it('encodes odd numeric values with even-length hex', () => {
    expect(toBlockQuantity(15)).toBe('0x0f')
    expect(toBlockQuantity(255)).toBe('0xff')
  })

  it('encodes large block numbers', () => {
    expect(toBlockQuantity(109_000_000)).toBe('0x067f3540')
    expect(toBlockQuantity(26_001_999)).toBe('0x018cc24f')
  })

  it('never produces malformed hex quantities', () => {
    for (const n of [0, 1, 7, 15, 16, 100, 999_999, 109_123_456]) {
      const hex = toBlockQuantity(n)
      expect(hex.startsWith('0x')).toBe(true)
      if (n !== 0) expect(hex.length % 2).toBe(0)
      expect(/^0x[0-9a-f]+$/.test(hex)).toBe(true)
    }
    expect(toBlockQuantity(0)).toBe('0x0')
  })
})
