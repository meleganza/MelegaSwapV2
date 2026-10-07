import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  bindCheckoutTarget,
  checkoutTargetUnchanged,
  checkoutTokenAddressesMatch,
} from '../checkoutTargetBinding'
import {
  activateVerifiedTrendBoostWindow,
  clearTrendBoostOrdersForTests,
  createTrendBoostOrder,
  updateTrendBoostOrder,
} from '../trendBoostOrders'

const M01 = '0x4034875250F797D00b819e9011c5BB9c2e799631'
const LUCK = '0xeE86B71B787f6DCF83a9856D181dda2b7b8398B0'
const MM72 = '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E'
const BABYMARCO = '0x7d48423Feac5AA05380Db98a1f24cE17D641754D'
const CHAIN = 56

function detected(address: string, symbol: string, name: string, slug: string | null = null) {
  return { contract: address, chainId: CHAIN, symbol, name, slug }
}

describe('checkout target binding', () => {
  it('binds LUCK after a previous M01 detection is no longer the input', () => {
    const stale = bindCheckoutTarget({
      inputAddress: LUCK,
      inputChainId: CHAIN,
      detected: detected(M01, 'M01', 'MISSION 1'),
      projectId: '',
      projectSlug: '',
      projectContract: '',
    })
    expect(stale).toBeNull()

    const bound = bindCheckoutTarget({
      inputAddress: LUCK,
      inputChainId: CHAIN,
      detected: detected(LUCK, 'LUCK', '4LEAF CLOVER'),
      projectId: M01,
      projectSlug: 'm01',
      projectContract: M01,
    })
    expect(bound).toMatchObject({
      chainId: CHAIN,
      tokenAddress: LUCK.toLowerCase(),
      projectSlug: null,
      projectId: LUCK.toLowerCase(),
      symbol: 'LUCK',
    })
  })

  it('binds a direct LUCK selection', () => {
    const bound = bindCheckoutTarget({
      inputAddress: LUCK,
      inputChainId: CHAIN,
      detected: detected(LUCK, 'LUCK', '4LEAF CLOVER'),
      projectId: '',
      projectSlug: null,
    })
    expect(bound?.tokenAddress).toBe(LUCK.toLowerCase())
    expect(bound?.chainId).toBe(CHAIN)
    expect(bound?.projectSlug).toBeNull()
  })

  it('binds MM72 by its own address and slug', () => {
    const bound = bindCheckoutTarget({
      inputAddress: MM72,
      inputChainId: CHAIN,
      detected: detected(MM72, 'MM72', 'MM72', 'mm72'),
      projectId: '',
      projectSlug: '',
    })
    expect(bound).toMatchObject({
      chainId: CHAIN,
      tokenAddress: MM72.toLowerCase(),
      projectSlug: 'mm72',
      projectId: 'mm72',
      symbol: 'MM72',
    })
  })

  it('binds BABYMARCO by address when it has no slug', () => {
    const bound = bindCheckoutTarget({
      inputAddress: BABYMARCO,
      inputChainId: CHAIN,
      detected: detected(BABYMARCO, 'BABYMARCO', 'BabyMarco'),
      projectId: '',
      projectSlug: null,
    })
    expect(bound).toMatchObject({
      chainId: CHAIN,
      tokenAddress: BABYMARCO.toLowerCase(),
      projectSlug: null,
      projectId: BABYMARCO.toLowerCase(),
      symbol: 'BABYMARCO',
    })
  })

  it('never resolves a null slug and LUCK address to M01', () => {
    const bound = bindCheckoutTarget({
      inputAddress: LUCK,
      inputChainId: CHAIN,
      detected: detected(LUCK, 'LUCK', '4LEAF CLOVER', null),
      projectId: null,
      projectSlug: null,
      projectContract: null,
    })
    expect(bound?.projectSlug).toBeNull()
    expect(bound?.tokenAddress).not.toBe(M01.toLowerCase())
    expect(bound?.projectId).toBe(LUCK.toLowerCase())
    expect(checkoutTokenAddressesMatch(bound?.tokenAddress, M01)).toBe(false)
  })

  it('drops a prepared M01 target when the reopened checkout selects LUCK', () => {
    const reopened = bindCheckoutTarget({
      inputAddress: LUCK,
      inputChainId: CHAIN,
      detected: detected(LUCK, 'LUCK', '4LEAF CLOVER'),
      projectId: '',
      projectSlug: '',
      projectContract: M01,
    })
    expect(reopened?.tokenAddress).toBe(LUCK.toLowerCase())
    expect(checkoutTokenAddressesMatch(M01, reopened?.tokenAddress)).toBe(false)
  })

  it('activation preserves the created chain and token address exactly', () => {
    const created = {
      chainId: CHAIN,
      projectContract: LUCK.toLowerCase(),
    }
    const activated = {
      chainId: created.chainId,
      projectContract: created.projectContract,
    }
    expect(checkoutTargetUnchanged(created, activated)).toBe(true)
    expect(
      checkoutTargetUnchanged(created, {
        chainId: CHAIN,
        projectContract: M01.toLowerCase(),
      }),
    ).toBe(false)
  })
})

describe('trend boost order target immutability', () => {
  beforeEach(() => {
    process.env.TREND_BOOST_ORDERS_DIR = '/tmp/melega-checkout-target-binding-orders'
    clearTrendBoostOrdersForTests()
  })
  afterEach(() => clearTrendBoostOrdersForTests())

  it('activation keeps the LUCK chain and address after a hostile identity patch', () => {
    const created = createTrendBoostOrder({
      projectId: LUCK.toLowerCase(),
      projectSlug: null,
      projectContract: LUCK,
      buyerWallet: '0x1111111111111111111111111111111111111111',
      paymentAsset: 'BNB',
      packageId: 'trend_24h',
    })
    expect(created.chainId).toBe(CHAIN)
    expect(created.projectContract).toBe(LUCK.toLowerCase())

    updateTrendBoostOrder(created.orderId, {
      state: 'PAYMENT_CONFIRMED',
      paymentStatus: 'confirmed',
      receiptVerified: true,
      projectId: M01,
      projectSlug: 'm01',
      projectContract: M01,
      chainId: 1 as 56,
    })
    const activated = activateVerifiedTrendBoostWindow(created.orderId)
    expect(activated?.state).toBe('ACTIVE')
    expect(activated?.chainId).toBe(created.chainId)
    expect(activated?.projectContract).toBe(created.projectContract)
    expect(activated?.projectId).toBe(created.projectId)
    expect(activated?.projectSlug).toBeNull()
    expect(checkoutTargetUnchanged(created, activated!)).toBe(true)
  })
})
