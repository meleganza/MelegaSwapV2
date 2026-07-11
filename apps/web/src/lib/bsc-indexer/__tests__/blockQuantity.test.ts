import { describe, expect, it } from 'vitest'
import { blockQuantityVariants, toBlockQuantity, toBlockQuantityEven } from '../rpc/blockQuantity'

describe('toBlockQuantity', () => {
  it('encodes block 0 as 0x0', () => {
    expect(toBlockQuantity(0)).toBe('0x0')
  })

  it('encodes minimal quantities without redundant leading zeros', () => {
    expect(toBlockQuantity(15)).toBe('0xf')
    expect(toBlockQuantity(255)).toBe('0xff')
    expect(toBlockQuantity(109_000_000)).toBe('0x67f3540')
  })

  it('provides even-length variant when minimal is odd-length', () => {
    expect(toBlockQuantityEven(15)).toBe('0x0f')
    expect(toBlockQuantityEven(109_000_000)).toBe('0x067f3540')
  })

  it('blockQuantityVariants includes minimal and even encodings', () => {
    expect(blockQuantityVariants(15)).toEqual(['0xf', '0x0f'])
    expect(blockQuantityVariants(16)).toEqual(['0x10'])
  })
})
