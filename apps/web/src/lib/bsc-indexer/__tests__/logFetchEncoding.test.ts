import { describe, expect, it } from 'vitest'
import { blockQuantityVariants, toBlockQuantityEven } from '../rpc/blockQuantity'

describe('log fetch block encoding', () => {
  it('even variant has even string length for large BSC heads', () => {
    const block = 109_315_647
    const even = toBlockQuantityEven(block)
    expect(even.length % 2).toBe(0)
    expect(blockQuantityVariants(block).length).toBeGreaterThan(0)
  })
})
