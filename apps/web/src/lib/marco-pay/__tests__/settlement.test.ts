import { afterEach, describe, expect, it } from 'vitest'
import { MELEGA_TREASURY_WALLET_ADDRESS } from 'config/dexEconomicAuthority'
import {
  isCanonicalMarcoPaySettlementWallet,
  isForbiddenSettlementWallet,
  resolveMarcoPaySettlementWallet,
  usdCopiedToMarco,
} from '../settlement'

describe('MARCO Pay treasury settlement', () => {
  afterEach(() => {
    delete process.env.MARCO_DEX_RECEIVING_WALLET
    delete process.env.MARCO_TREASURY_SETTLEMENT_WALLET
  })

  it('accepts only the Melega Treasury wallet and rejects sentinel destinations', () => {
    expect(isCanonicalMarcoPaySettlementWallet(MELEGA_TREASURY_WALLET_ADDRESS)).toBe(true)
    expect(isForbiddenSettlementWallet('0x0000000000000000000000000000000000000000')).toBe(true)
    expect(isForbiddenSettlementWallet('0x000000000000000000000000000000000000dEaD')).toBe(true)
    expect(isForbiddenSettlementWallet('0xdE00000000000000000000000000000000000001')).toBe(true)
    expect(resolveMarcoPaySettlementWallet()).toEqual({
      ok: true,
      wallet: MELEGA_TREASURY_WALLET_ADDRESS,
      reason: null,
    })
  })

  it('uses MARCO_DEX_RECEIVING_WALLET and rejects a conflicting alias', () => {
    process.env.MARCO_DEX_RECEIVING_WALLET = MELEGA_TREASURY_WALLET_ADDRESS
    expect(resolveMarcoPaySettlementWallet().ok).toBe(true)
    process.env.MARCO_TREASURY_SETTLEMENT_WALLET = '0xdE00000000000000000000000000000000000001'
    expect(resolveMarcoPaySettlementWallet().ok).toBe(false)
  })

  it('never treats a USD amount as the MARCO quantity', () => {
    expect(usdCopiedToMarco({ usdMinor: '7900', marcoMinor: '7900' })).toBe(true)
    expect(usdCopiedToMarco({ usdMinor: '7900', usdLabel: 'USD 79', marcoLabel: '79 MARCO' })).toBe(true)
    expect(usdCopiedToMarco({ usdMinor: '900', marcoMinor: '2840000' })).toBe(false)
  })
})
