import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveIndexerLogRpcUrls, rpcCall, rpcCallWithFailover } from '../rpc/chunkedLogs'
import { isProviderQuarantined, resetProviderHealthForTests } from '../rpc/providerHealth'
import { scanBlockRangeEvents } from '../rpc/scanBlockRange'

const fetchMock = vi.fn()
beforeEach(() => {
  resetProviderHealthForTests()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
const ok = (result: unknown) => ({ ok: true, json: async () => ({ result }) })

describe('RPC quota resilience', () => {
  it('keeps public head-read fallback and deduplicates configured endpoints', () => {
    vi.stubEnv('BSC_RPC_URL', 'https://primary.example')
    vi.stubEnv('BSC_RPC_FALLBACK_URL', 'https://primary.example')
    const urls = resolveIndexerLogRpcUrls()
    expect(urls.filter((url) => url === 'https://primary.example')).toHaveLength(1)
    expect(urls).toContain('https://bsc-dataseed.binance.org')
  })
  it('fails over once on a non-JSON 429 and skips that provider on subsequent calls', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValue(ok('0x10'))
    const urls = ['https://quota.example', 'https://backup.example']
    expect((await rpcCallWithFailover('eth_blockNumber', [], urls)).result).toBe('0x10')
    expect(isProviderQuarantined(urls[0])).toBe(true)
    await rpcCall('eth_blockNumber', [], urls)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([urls[0], urls[1], urls[1]])
  })
  it('records network failures so repeated timeouts cannot bypass quarantine', async () => {
    fetchMock.mockRejectedValue(new Error('network timeout'))
    await expect(rpcCall('eth_blockNumber', [], ['https://timeout.example'])).rejects.toThrow()
    await expect(rpcCall('eth_blockNumber', [], ['https://timeout.example'])).rejects.toThrow()
    expect(isProviderQuarantined('https://timeout.example')).toBe(true)
  })
  it('rejects an incomplete range instead of returning a successful empty scan', async () => {
    fetchMock.mockImplementation(async (_url, init) => {
      const { method } = JSON.parse(init.body)
      if (method === 'eth_getBlockByNumber') return ok({ number: '0x10', timestamp: '0x20', hash: '0xabc' })
      return { ok: false, status: 429 }
    })
    await expect(scanBlockRangeEvents({ address: '0xabc', fromBlock: 16, toBlock: 16,
      rpcUrls: ['https://headers.example'] })).rejects.toThrow()
  })
})

it('preserves range-limit details on HTTP errors for adaptive chunk sizing', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 400,
    json: async () => ({ error: { message: 'block range limit exceeded' } }) })
  await expect(rpcCall('eth_getLogs', [], ['https://range.example']))
    .rejects.toThrow('block range limit exceeded')
})

it('treats a valid empty log response as successful', async () => {
  fetchMock.mockImplementation(async (_url, init) => {
    const { method } = JSON.parse(init.body)
    return ok(method === 'eth_getBlockByNumber'
      ? { number: '0x10', timestamp: '0x20', hash: '0xabc' } : [])
  })
  const result = await scanBlockRangeEvents({ address: '0xabc', fromBlock: 16, toBlock: 16,
    rpcUrls: ['https://headers.example'] })
  expect(result.logs).toEqual([])
  expect(result.blockTimestamps.get(16)).toBe(32)
})
