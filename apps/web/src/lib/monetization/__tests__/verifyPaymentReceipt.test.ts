import { describe, expect, it } from 'vitest'
import { FEATURED_OFFER, FEATURED_PAYMENT_TOKENS } from 'lib/featured-placement/constants'
import { verifyBscPaymentReceipt } from '../verifyPaymentReceipt'

const HASH = `0x${'ab'.repeat(32)}`
const BUYER = '0x1111111111111111111111111111111111111111'

function topic(address: string): string {
  return `0x${address.slice(2).toLowerCase().padStart(64, '0')}`
}

function rpcFetch(transaction: Record<string, unknown>, receipt: Record<string, unknown>): typeof fetch {
  return (async (_url: string, init?: RequestInit) => {
    const request = JSON.parse(String(init?.body || '{}')) as { method: string }
    const result = request.method === 'eth_getTransactionByHash' ? transaction : receipt
    return {
      ok: true,
      status: 200,
      json: async () => ({ jsonrpc: '2.0', id: request.method, result }),
    } as Response
  }) as typeof fetch
}

describe('verifyBscPaymentReceipt', () => {
  it('certifies a mined native payment using RPC transaction value', async () => {
    const result = await verifyBscPaymentReceipt({
      transactionHash: HASH,
      buyerWallet: BUYER,
      paymentAsset: 'BNB',
      tokenAmountRaw: '1000',
      treasuryWallet: FEATURED_OFFER.treasuryWallet,
      fetcher: rpcFetch(
        {
          hash: HASH,
          from: BUYER,
          to: FEATURED_OFFER.treasuryWallet,
          value: '0x3e8',
          blockNumber: '0x10',
        },
        {
          transactionHash: HASH,
          from: BUYER,
          to: FEATURED_OFFER.treasuryWallet,
          status: '0x1',
          blockNumber: '0x10',
          logs: [],
        },
      ),
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a receipt belonging to a different sender', async () => {
    const result = await verifyBscPaymentReceipt({
      transactionHash: HASH,
      buyerWallet: BUYER,
      paymentAsset: 'BNB',
      tokenAmountRaw: '1000',
      treasuryWallet: FEATURED_OFFER.treasuryWallet,
      fetcher: rpcFetch(
        {
          hash: HASH,
          from: '0x2222222222222222222222222222222222222222',
          to: FEATURED_OFFER.treasuryWallet,
          value: '0x3e8',
          blockNumber: '0x10',
        },
        {
          transactionHash: HASH,
          status: '0x1',
          blockNumber: '0x10',
        },
      ),
    })
    expect(result).toMatchObject({ ok: false, reason: 'BAD_SENDER' })
  })

  it('certifies only an exact token transfer path from buyer to treasury', async () => {
    const token = FEATURED_PAYMENT_TOKENS.USDT.address!
    const result = await verifyBscPaymentReceipt({
      transactionHash: HASH,
      buyerWallet: BUYER,
      paymentAsset: 'USDT',
      tokenAmountRaw: '1000',
      treasuryWallet: FEATURED_OFFER.treasuryWallet,
      fetcher: rpcFetch(
        { hash: HASH, from: BUYER, to: token, value: '0x0', blockNumber: '0x10' },
        {
          transactionHash: HASH,
          from: BUYER,
          to: token,
          status: '0x1',
          blockNumber: '0x10',
          logs: [
            {
              address: token,
              topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                topic(BUYER),
                topic(FEATURED_OFFER.treasuryWallet),
              ],
              data: '0x3e8',
            },
          ],
        },
      ),
    })
    expect(result.ok).toBe(true)
  })
})
