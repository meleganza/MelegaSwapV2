import { afterEach, describe, expect, it } from 'vitest'
import { FEATURED_PAYMENT_TOKENS } from 'lib/featured-placement/constants'
import { MARCO_PAY_SETTLEMENT_WALLET } from '../settlement'
import {
  assertObservedPayChain,
  assertPaySettlementBinding,
  isAuthoritativeMarcoPaidStatus,
  listMerchantPayRails,
  resolveMerchantPayRail,
} from '../merchantRails'

describe('MARCO Pay merchant rails', () => {
  afterEach(() => {
    delete process.env.MARCO_PAY_EVM_CONSENTED_CHAIN_IDS
    delete process.env.MARCO_PAY_SOLANA_MERCHANT_PUBKEY
  })

  it('consents BNB by default and keeps the canonical BNB token', () => {
    const rails = listMerchantPayRails()
    expect(rails.map((rail) => rail.id)).toEqual(['bnb', 'base', 'polygon', 'robinhood', 'arc', 'solana'])
    const bnb = rails.find((rail) => rail.id === 'bnb')!
    expect(bnb.chainId).toBe(56)
    expect(bnb.executable).toBe(true)
    expect(bnb.settlementWallet).toBe(MARCO_PAY_SETTLEMENT_WALLET)
    expect(bnb.token.toLowerCase()).toBe(FEATURED_PAYMENT_TOKENS.MARCO.address?.toLowerCase())
    expect(assertObservedPayChain(null, false)).toBe(56)
    expect(assertObservedPayChain(56, false)).toBe(56)
  })

  it('opens every registry EVM chain on the verified merchant address and still honors an explicit consent list', () => {
    for (const chainId of [56, 8453, 137, 4663, 5042]) {
      expect(resolveMerchantPayRail({ chainId }).settlementWallet).toBe(MARCO_PAY_SETTLEMENT_WALLET)
    }
    process.env.MARCO_PAY_EVM_CONSENTED_CHAIN_IDS = '56'
    expect(resolveMerchantPayRail({ chainId: 56 }).chainId).toBe(56)
    expect(() => resolveMerchantPayRail({ chainId: 8453 })).toThrow('MERCHANT_NETWORK_NOT_CONFIGURED')
    expect(() => resolveMerchantPayRail({ chainId: 137 })).toThrow('MERCHANT_NETWORK_NOT_CONFIGURED')
    expect(() => assertObservedPayChain(1, false)).toThrow('CHAIN_MISMATCH')
    expect(() => assertObservedPayChain(null, true)).toThrow('CHAIN_MISMATCH')
  })

  it('rejects a mismatched token or recipient and keeps Solana on its own pubkey', () => {
    expect(() =>
      assertPaySettlementBinding({
        chainId: 56,
        token: '0x0000000000000000000000000000000000000001',
        recipient: MARCO_PAY_SETTLEMENT_WALLET,
      }),
    ).toThrow('TOKEN_MISMATCH')
    expect(() =>
      assertPaySettlementBinding({
        chainId: 56,
        recipient: '0x000000000000000000000000000000000000dead',
      }),
    ).toThrow('SETTLEMENT_WALLET_NOT_TREASURY')
    expect(() => resolveMerchantPayRail({ networkId: 'solana' })).toThrow('SOLANA_MERCHANT_PUBKEY_UNCONFIGURED')
    process.env.MARCO_PAY_SOLANA_MERCHANT_PUBKEY = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'
    const solana = resolveMerchantPayRail({ networkId: 'solana' })
    expect(solana.chainId).toBeNull()
    expect(solana.settlementWallet).not.toBe(MARCO_PAY_SETTLEMENT_WALLET)
    expect(solana.token).toBe('6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF')
    expect(isAuthoritativeMarcoPaidStatus('COMPLETED')).toBe(true)
    expect(isAuthoritativeMarcoPaidStatus('PAID')).toBe(false)
    expect(isAuthoritativeMarcoPaidStatus('SETTLED')).toBe(false)
  })
})
