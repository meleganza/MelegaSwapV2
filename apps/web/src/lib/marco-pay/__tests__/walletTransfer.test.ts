import { describe, expect, it, vi } from 'vitest'
import { buildMarcoPayWalletTransfer, marcoMinorToTokenRaw } from '../walletTransfer'
import { MARCO_PAY_SETTLEMENT_WALLET } from '../settlement'
import { FEATURED_PAYMENT_TOKENS } from 'lib/featured-placement/constants'

describe('MARCO Pay wallet transfer', () => {
  it('builds a complete ERC-20 transfer to the Melega treasury before wallet request', () => {
    const transfer = buildMarcoPayWalletTransfer({
      marcoAmountMinor: '26018510',
      destinationWallet: MARCO_PAY_SETTLEMENT_WALLET,
      chainId: 56,
    })
    expect(transfer.chainId).toBe(56)
    expect(transfer.destination).toBe(MARCO_PAY_SETTLEMENT_WALLET)
    expect(transfer.tokenAddress).toBe(FEATURED_PAYMENT_TOKENS.MARCO.address)
    expect(transfer.to).toBe(FEATURED_PAYMENT_TOKENS.MARCO.address)
    expect(transfer.value).toBe('0x0')
    expect(transfer.tokenAmountRaw).toBe(marcoMinorToTokenRaw('26018510', 18))
    expect(transfer.data.startsWith('0xa9059cbb')).toBe(true)
    expect(transfer.data).toContain(MARCO_PAY_SETTLEMENT_WALLET.slice(2).toLowerCase())
  })

  it('fails closed on a non-treasury destination or wrong chain', () => {
    expect(() =>
      buildMarcoPayWalletTransfer({
        marcoAmountMinor: '26018510',
        destinationWallet: '0x000000000000000000000000000000000000dead',
      }),
    ).toThrow('SETTLEMENT_WALLET_NOT_TREASURY')
    expect(() =>
      buildMarcoPayWalletTransfer({
        marcoAmountMinor: '26018510',
        destinationWallet: MARCO_PAY_SETTLEMENT_WALLET,
        chainId: 1,
      }),
    ).toThrow('CHAIN_MISMATCH')
  })
})
