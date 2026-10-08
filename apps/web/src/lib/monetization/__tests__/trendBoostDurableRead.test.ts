import type { NextApiRequest, NextApiResponse } from 'next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({
  get: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}))

import { get, list } from '@vercel/blob'
import activeHandler from 'pages/api/trend-boost/active'
import {
  TrendBoostOrderReadError,
  clearTrendBoostOrdersForTests,
  createTrendBoostOrder,
  hydrateTrendBoostOrder,
  listActiveTrendBoostOrders,
  listTrendBoostOrdersDurably,
  updateTrendBoostOrder,
  type TrendBoostOrder,
} from 'lib/monetization/trendBoostOrders'

const NOW = new Date('2026-10-07T18:00:00.000Z')
const ADDRESS = '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E'

function order(patch: Partial<TrendBoostOrder> = {}): TrendBoostOrder {
  return {
    schema: 'melega.trend-boost-order.v1',
    orderId: 'trend_live',
    state: 'ACTIVE',
    projectId: 'mm72',
    projectSlug: 'mm72',
    projectContract: ADDRESS,
    buyerWallet: '0x0000000000000000000000000000000000000001',
    packageId: 'trend_24h',
    durationMs: 86_400_000,
    paymentAsset: 'USDT',
    usdReferenceAmount: 79,
    tokenAmount: null,
    tokenAmountRaw: null,
    quoteExpiration: null,
    unitPriceUsd: 1,
    quoteSource: null,
    transactionHash: null,
    paymentStatus: 'confirmed',
    scheduledStart: '2026-10-07T14:00:00.000Z',
    scheduledEnd: '2099-10-08T14:00:00.000Z',
    treasuryWallet: '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
    chainId: 56,
    createdAt: '2026-10-07T14:00:00.000Z',
    updatedAt: '2026-10-07T14:00:00.000Z',
    receiptVerified: true,
    lastError: null,
    ...patch,
  }
}

function stream(value: unknown) {
  return new Response(JSON.stringify(value)).body
}

function mockResponse() {
  const headers = new Map<string, string>()
  const state: { statusCode: number; body: unknown; headers: Map<string, string> } = {
    statusCode: 200,
    body: null,
    headers,
  }
  const response = {
    status(code: number) {
      state.statusCode = code
      return response
    },
    json(body: unknown) {
      state.body = body
      return response
    },
    setHeader(name: string, value: string) {
      headers.set(name, value)
      return response
    },
  }
  return { state, response: response as unknown as NextApiResponse }
}

describe('Trend Boost durable read semantics', () => {
  const previousToken = process.env.BLOB_READ_WRITE_TOKEN

  beforeEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
    clearTrendBoostOrdersForTests()
    vi.mocked(get).mockReset()
    vi.mocked(list).mockReset()
  })

  afterEach(() => {
    if (previousToken) process.env.BLOB_READ_WRITE_TOKEN = previousToken
    else delete process.env.BLOB_READ_WRITE_TOKEN
    clearTrendBoostOrdersForTests()
  })

  it('treats a missing blob as not found and does not fail the active list', async () => {
    vi.mocked(list).mockResolvedValue({
      blobs: [{ pathname: 'monetization/v1/trend-boost/trend_missing.json' }],
      hasMore: false,
    } as never)
    vi.mocked(get).mockResolvedValue(null as never)
    await expect(listTrendBoostOrdersDurably()).resolves.toEqual([])
    await expect(hydrateTrendBoostOrder('trend_missing')).resolves.toBeNull()
  })

  it('throws on a real backend read failure instead of publishing a partial set', async () => {
    vi.mocked(list).mockResolvedValue({
      blobs: [{ pathname: 'monetization/v1/trend-boost/trend_live.json' }],
      hasMore: false,
    } as never)
    vi.mocked(get).mockResolvedValue({ statusCode: 304, stream: null } as never)
    await expect(listTrendBoostOrdersDurably()).rejects.toBeInstanceOf(TrendBoostOrderReadError)

    vi.mocked(list).mockRejectedValue(new Error('blob list unavailable'))
    await expect(listTrendBoostOrdersDurably()).rejects.toBeInstanceOf(TrendBoostOrderReadError)
  })

  it('returns 503 from the active feed when the durable read fails, and 200 when the source is empty', async () => {
    vi.mocked(list).mockRejectedValue(new Error('blob list unavailable'))
    const failed = mockResponse()
    await activeHandler({ method: 'GET' } as NextApiRequest, failed.response)
    expect(failed.state.statusCode).toBe(503)
    expect(failed.state.headers.get('Cache-Control')).toBe('no-store')
    expect(failed.state.body).toMatchObject({ error: 'TREND_BOOST_ACTIVE_UNAVAILABLE', count: 0 })

    vi.mocked(list).mockResolvedValue({ blobs: [], hasMore: false } as never)
    const empty = mockResponse()
    await activeHandler({ method: 'GET' } as NextApiRequest, empty.response)
    expect(empty.state.statusCode).toBe(200)
    expect(empty.state.body).toMatchObject({ count: 0, placements: [] })
  })

  it('publishes only settled unexpired orders and drops unconfirmed or expired ones', async () => {
    const live = order()
    const expired = order({
      orderId: 'trend_expired',
      scheduledEnd: '2026-10-07T15:00:00.000Z',
    })
    const unconfirmed = order({
      orderId: 'trend_unconfirmed',
      receiptVerified: false,
      paymentStatus: 'submitted',
      state: 'SUBMITTED',
    })
    vi.mocked(list).mockResolvedValue({
      blobs: [live, expired, unconfirmed].map((row) => ({
        pathname: `monetization/v1/trend-boost/${row.orderId}.json`,
      })),
      hasMore: false,
    } as never)
    vi.mocked(get).mockImplementation(async (pathname: string) => {
      const row = [live, expired, unconfirmed].find((candidate) => pathname.endsWith(`${candidate.orderId}.json`))
      return { statusCode: 200, stream: stream(row) } as never
    })
    const rows = await listTrendBoostOrdersDurably()
    expect(rows.map((row) => row.orderId).sort()).toEqual(['trend_expired', 'trend_live', 'trend_unconfirmed'])
    expect(listActiveTrendBoostOrders(NOW).map((row) => row.orderId)).toEqual(['trend_live'])

    const { state, response } = mockResponse()
    await activeHandler({ method: 'GET' } as NextApiRequest, response)
    expect(state.statusCode).toBe(200)
    expect(state.body).toMatchObject({
      count: 1,
      placements: [{ orderId: 'trend_live', chainId: 56, projectContract: ADDRESS }],
    })
  })

  it('does not let an update replace the purchased token identity', () => {
    const created = createTrendBoostOrder({
      projectId: 'mm72',
      projectSlug: 'mm72',
      projectContract: ADDRESS,
      buyerWallet: '0x0000000000000000000000000000000000000001',
      paymentAsset: 'USDT',
    })
    const next = updateTrendBoostOrder(created.orderId, {
      projectContract: '0x4034875250F797D00b819e9011c5BB9c2e799631',
      projectId: 'm01',
      chainId: 56,
      state: 'ACTIVE',
    })
    expect(next?.projectContract).toBe(ADDRESS.toLowerCase())
    expect(next?.projectId).toBe('mm72')
    expect(next?.state).toBe('ACTIVE')
  })
})
