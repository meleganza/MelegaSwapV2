import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetProviderHealthForTests } from '../rpc/providerHealth'
import { SWAP_TOPIC } from '../constants'

const fetchMock = vi.fn()

if (typeof AbortSignal.timeout !== 'function') {
  Object.defineProperty(AbortSignal, 'timeout', {
    configurable: true,
    writable: true,
    value: (ms: number) => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), ms)
      return controller.signal
    },
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  resetProviderHealthForTests()
  process.env.BSC_RPC_URL = 'https://primary.example/qn'
  process.env.BSC_RPC_FALLBACK_URL = 'https://fallback.example/rpc'
  delete process.env.BSC_LOG_RPC_URL
})

afterEach(() => {
  delete process.env.BSC_RPC_URL
  delete process.env.BSC_RPC_FALLBACK_URL
})

function jsonRpcError(message: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({ jsonrpc: '2.0', id: 1, error: { message } }),
  }
}

function jsonRpcResult<T>(result: T) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ jsonrpc: '2.0', id: 1, result }),
  }
}

describe('deterministic provider-limit fallback', () => {
  it('does not multiply retries on the same URL for a limit response', async () => {
    fetchMock.mockResolvedValue(jsonRpcError('query exceeds limit of 10000 blocks'))
    const { rpcCallWithFailover, isDeterministicProviderLimitError } = await import('../rpc/chunkedLogs')
    expect(isDeterministicProviderLimitError('query exceeds limit of 10000 blocks')).toBe(true)
    await expect(
      rpcCallWithFailover('eth_getLogs', [{ fromBlock: '0x1', toBlock: '0x2', topics: [SWAP_TOPIC] }], [
        'https://primary.example/qn',
      ]),
    ).rejects.toThrow(/limit/i)
    const primaryCalls = fetchMock.mock.calls.filter((call) => String(call[0]).includes('primary.example'))
    expect(primaryCalls).toHaveLength(1)
  })

  it('still fails over to the next URL after a deterministic limit', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('primary.example')) return jsonRpcError('eth_getLogs limit exceeded')
      return jsonRpcResult([])
    })
    const { rpcCallWithFailover } = await import('../rpc/chunkedLogs')
    const { result, url } = await rpcCallWithFailover(
      'eth_getLogs',
      [{ fromBlock: '0x1', toBlock: '0x2', topics: [SWAP_TOPIC] }],
      ['https://primary.example/qn', 'https://fallback.example/rpc'],
    )
    expect(result).toEqual([])
    expect(url).toContain('fallback.example')
    const primaryCalls = fetchMock.mock.calls.filter((call) => String(call[0]).includes('primary.example'))
    expect(primaryCalls).toHaveLength(1)
  })

  it('shrinks chunk size on provider-limit without same-URL retry multiplication', async () => {
    fetchMock.mockImplementation(async (_url: string, init: { body?: string }) => {
      const body = JSON.parse(String(init.body ?? '{}')) as {
        method: string
        params: Array<{ fromBlock?: string; toBlock?: string }>
      }
      if (body.method !== 'eth_getLogs') return jsonRpcResult('0x1')
      const filter = body.params[0] ?? {}
      const from = parseInt(filter.fromBlock ?? '0x0', 16)
      const to = parseInt(filter.toBlock ?? '0x0', 16)
      if (to - from >= 100) return jsonRpcError('eth_getLogs limit exceeded')
      return jsonRpcResult([])
    })

    const { getLogsChunked } = await import('../rpc/chunkedLogs')
    const result = await getLogsChunked({
      address: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
      topics: [[SWAP_TOPIC]],
      fromBlock: 1,
      toBlock: 200,
      initialChunk: 200,
      rpcUrls: ['https://primary.example/qn'],
    })
    expect(result.logs).toEqual([])
    expect(result.finalChunkSize).toBeLessThanOrEqual(100)

    const getLogsBodies = fetchMock.mock.calls
      .map((call) => JSON.parse(String((call[1] as { body?: string }).body ?? '{}')))
      .filter((body) => body.method === 'eth_getLogs')
    expect(getLogsBodies.length).toBeGreaterThanOrEqual(2)
    expect(getLogsBodies.length).toBeLessThan(6)
  })
})
