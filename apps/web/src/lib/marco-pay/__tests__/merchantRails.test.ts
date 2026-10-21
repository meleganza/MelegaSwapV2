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

  it('keeps non-BNB rails closed until the canonical gateway enables them', () => {
    expect(resolveMerchantPayRail({ chainId: 56 }).settlementWallet).toBe(MARCO_PAY_SETTLEMENT_WALLET)
    for (const chainId of [8453, 137, 4663, 5042]) {
      expect(() => resolveMerchantPayRail({ chainId })).toThrow('GATEWAY_CHAIN_NOT_ENABLED')
    }
    process.env.MARCO_PAY_EVM_CONSENTED_CHAIN_IDS = '56,8453,137,4663,5042'
    process.env.MARCO_PAY_SOLANA_MERCHANT_PUBKEY = 'ConfiguredMerchantPubkey111111111111111111111'
    expect(() => resolveMerchantPayRail({ chainId: 8453 })).toThrow('GATEWAY_CHAIN_NOT_ENABLED')
    expect(() => resolveMerchantPayRail({ networkId: 'solana' })).toThrow('GATEWAY_CHAIN_NOT_ENABLED')
    expect(() => assertObservedPayChain(1, false)).toThrow('CHAIN_MISMATCH')
    expect(() => assertObservedPayChain(null, true)).toThrow('CHAIN_MISMATCH')
  })

  it('rejects a mismatched BNB token or recipient and keeps Solana closed', () => {
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
    expect(() => resolveMerchantPayRail({ networkId: 'solana' })).toThrow('GATEWAY_CHAIN_NOT_ENABLED')
    expect(isAuthoritativeMarcoPaidStatus('COMPLETED')).toBe(true)
    expect(isAuthoritativeMarcoPaidStatus('PAID')).toBe(false)
    expect(isAuthoritativeMarcoPaidStatus('SETTLED')).toBe(false)
  })
})
