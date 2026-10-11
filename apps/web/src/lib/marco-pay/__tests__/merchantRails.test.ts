import { describe, expect, it } from 'vitest'
import { FEATURED_PAYMENT_TOKENS } from 'lib/featured-placement/constants'
import { MARCO_PAY_SETTLEMENT_WALLET } from '../settlement'
import {
  assertObservedPayChain,
  isAuthoritativeMarcoPaidStatus,
  listMerchantPayRails,
} from '../merchantRails'

describe('MARCO Pay merchant rails', () => {
  it('executes only BNB against the verified merchant wallet and prepares the other authority chains', () => {
    const rails = listMerchantPayRails()
    expect(rails.map((rail) => rail.id)).toEqual(['bnb', 'base', 'polygon', 'robinhood', 'arc', 'solana'])
    const bnb = rails.find((rail) => rail.id === 'bnb')!
    expect(bnb).toMatchObject({
      chainId: 56,
      executable: true,
      settlementWallet: MARCO_PAY_SETTLEMENT_WALLET,
    })
    expect(bnb.token.toLowerCase()).toBe(FEATURED_PAYMENT_TOKENS.MARCO.address?.toLowerCase())
    for (const id of ['base', 'polygon', 'robinhood', 'arc', 'solana'] as const) {
      const rail = rails.find((item) => item.id === id)!
      expect(rail.executable).toBe(false)
      expect(rail.status).toBe('prepared')
      expect(rail.settlementWallet).toBeNull()
      expect(rail.reason).toBeTruthy()
    }
    expect(rails.find((rail) => rail.id === 'base')?.chainId).toBe(8453)
    expect(rails.find((rail) => rail.id === 'polygon')?.chainId).toBe(137)
    expect(rails.find((rail) => rail.id === 'robinhood')?.chainId).toBe(4663)
    expect(rails.find((rail) => rail.id === 'arc')?.chainId).toBe(5042)
    expect(rails.find((rail) => rail.id === 'solana')?.chainId).toBeNull()
  })

  it('refuses prepared and unknown chains and does not treat PAID as completed', () => {
    expect(assertObservedPayChain(null, false)).toBe(56)
    expect(assertObservedPayChain(56, false)).toBe(56)
    expect(() => assertObservedPayChain(8453, false)).toThrow('CHAIN_NOT_EXECUTABLE')
    expect(() => assertObservedPayChain(137, false)).toThrow('CHAIN_NOT_EXECUTABLE')
    expect(() => assertObservedPayChain(4663, false)).toThrow('CHAIN_NOT_EXECUTABLE')
    expect(() => assertObservedPayChain(5042, false)).toThrow('CHAIN_NOT_EXECUTABLE')
    expect(() => assertObservedPayChain(1, false)).toThrow('CHAIN_MISMATCH')
    expect(() => assertObservedPayChain(null, true)).toThrow('CHAIN_MISMATCH')
    expect(isAuthoritativeMarcoPaidStatus('COMPLETED')).toBe(true)
    expect(isAuthoritativeMarcoPaidStatus('PAID')).toBe(false)
    expect(isAuthoritativeMarcoPaidStatus('SETTLED')).toBe(false)
    expect(isAuthoritativeMarcoPaidStatus('PENDING')).toBe(false)
  })
})
