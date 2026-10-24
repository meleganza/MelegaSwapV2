import { describe, expect, it } from 'vitest'
import {
  MARCO_PAY_PREPARED_QUOTE_TTL_MS,
  MARCO_PAY_PROVIDER_UNAVAILABLE,
  MARCO_PAY_WALLET_COPY,
  isMarcoPayPreparedOrderCurrent,
  marcoPayReviewErrorMessage,
  marcoPayWalletErrorMessage,
  type MarcoPayPreparedBinding,
} from '../preparedCheckout'

const order: MarcoPayPreparedBinding = {
  referralCode: '2mjywytuw5',
  packageId: 'trend_6h',
  serviceId: 'trend-boost',
  buyerWallet: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
  targetKey: '56:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
  quotedAt: 1_000_000,
}

const requested = {
  referralCode: order.referralCode,
  packageId: order.packageId,
  serviceId: order.serviceId,
  buyerWallet: order.buyerWallet,
  targetKey: order.targetKey,
  now: order.quotedAt + 1_000,
}

describe('MARCO Pay prepared checkout binding', () => {
  it('keeps a fresh referral quote and a fresh non-referral quote', () => {
    expect(isMarcoPayPreparedOrderCurrent(order, requested)).toBe(true)
    expect(
      isMarcoPayPreparedOrderCurrent(
        { ...order, referralCode: null },
        { ...requested, referralCode: null },
      ),
    ).toBe(true)
  })

  it('drops the cached session when the referral changes', () => {
    expect(isMarcoPayPreparedOrderCurrent(order, { ...requested, referralCode: null })).toBe(false)
    expect(isMarcoPayPreparedOrderCurrent({ ...order, referralCode: null }, requested)).toBe(false)
  })

  it('drops a stale quote once the commercial quote window has passed', () => {
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        now: order.quotedAt + MARCO_PAY_PREPARED_QUOTE_TTL_MS,
      }),
    ).toBe(false)
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        now: order.quotedAt + MARCO_PAY_PREPARED_QUOTE_TTL_MS - 1,
      }),
    ).toBe(true)
  })

  it('drops the cached session when the account or chain changes', () => {
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        buyerWallet: '0x1111111111111111111111111111111111111111',
      }),
    ).toBe(false)
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        targetKey: '1:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
      }),
    ).toBe(false)
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        buyerWallet: order.buyerWallet.toUpperCase(),
      }),
    ).toBe(true)
  })

  it('does not describe a referral verification failure as a provider outage', () => {
    expect(marcoPayReviewErrorMessage({ error: 'REFERRAL_NOT_VERIFIED' })).toBe(
      'This Passport PRO referral could not be verified. MARCO Pay was not charged.',
    )
    expect(marcoPayReviewErrorMessage({ error: 'REFERRAL_NOT_VERIFIED', message: '' })).not.toBe(
      MARCO_PAY_PROVIDER_UNAVAILABLE,
    )
    expect(marcoPayReviewErrorMessage({ error: 'MARCO_CONVERSION_INVALID', message: 'Quote rejected.' })).toBe(
      'Quote rejected.',
    )
    expect(marcoPayReviewErrorMessage({})).toBe(MARCO_PAY_PROVIDER_UNAVAILABLE)
  })
})

describe('marcoPayWalletErrorMessage', () => {
  it('maps wallet rejection, including EIP-1193 4001 and ethers ACTION_REJECTED', () => {
    expect(marcoPayWalletErrorMessage({ code: 4001, message: 'User rejected the request.' }).kind).toBe('cancelled')
    expect(marcoPayWalletErrorMessage({ code: 'ACTION_REJECTED', message: 'user rejected transaction' }).kind).toBe('cancelled')
  })

  it('maps the production insufficient-MARCO estimateGas failure', () => {
    const result = marcoPayWalletErrorMessage({
      code: 'UNPREDICTABLE_GAS_LIMIT',
      message:
        'cannot estimate gas; transaction may fail or may require manual gas limit [ See: https://links.ethers.org/v5-errors-UNPREDICTABLE_GAS_LIMIT ] (reason="execution reverted: ERC20: transfer amount exceeds balance")',
    })
    expect(result).toEqual({ kind: 'insufficientMarco', message: MARCO_PAY_WALLET_COPY.insufficientMarco })
  })

  it('maps missing BNB gas, reverts and RPC timeouts without calling them a MARCO Pay outage', () => {
    expect(marcoPayWalletErrorMessage({ code: 'INSUFFICIENT_FUNDS', message: 'insufficient funds for intrinsic transaction cost' }).kind).toBe(
      'insufficientGas',
    )
    expect(marcoPayWalletErrorMessage({ code: 'CALL_EXCEPTION', message: 'execution reverted' }).kind).toBe('reverted')
    const timeout = marcoPayWalletErrorMessage({ code: 'TIMEOUT', message: 'timeout' })
    expect(timeout.kind).toBe('rpcUnavailable')
    expect(timeout.message).not.toMatch(/not charged/)
    for (const kind of ['cancelled', 'insufficientMarco', 'insufficientGas', 'reverted', 'rpcUnavailable'] as const) {
      expect(MARCO_PAY_WALLET_COPY[kind]).not.toBe(MARCO_PAY_PROVIDER_UNAVAILABLE)
    }
  })

  it('keeps only the first sentence of unknown wallet errors and never invents a cause', () => {
    expect(marcoPayWalletErrorMessage(new Error('Ledger device locked (reason="x")')).message).toBe('Ledger device locked')
    expect(marcoPayWalletErrorMessage({}).message).toBe(MARCO_PAY_WALLET_COPY.notSent)
  })
})
