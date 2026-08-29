import { describe, expect, it } from 'vitest'
import { probeEvmRpcReadiness } from '../evmV2Quote'
import { VENUE_HEALTH_STATE } from '../health'

const NOW = '2026-08-29T19:00:00.000Z'
const RPC = 'https://bsc-dataseed.binance.org'
const VENUE = 'pancakeswap'

type FetchCall = { url: string; init: RequestInit }

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function recordFetch(handler: (call: FetchCall, index: number) => Response | Promise<Response> | never): {
  fetchImpl: typeof fetch
  calls: FetchCall[]
} {
  const calls: FetchCall[] = []
  const fetchImpl = (async (url: RequestInfo | URL, init?: RequestInit) => {
    const call = { url: String(url), init: init ?? {} }
    calls.push(call)
    return handler(call, calls.length - 1)
  }) as typeof fetch
  return { fetchImpl, calls }
}

function baseInput(overrides: Partial<Parameters<typeof probeEvmRpcReadiness>[0]> = {}) {
  return {
    venueId: VENUE,
    chainId: 56,
    rpcUrlByChain: { 56: RPC },
    signal: new AbortController().signal,
    nowIso: NOW,
    ...overrides,
  }
}

describe('M8-A1 EVM RPC readiness probe', () => {
  it('returns HEALTHY when chainId and blockNumber succeed', async () => {
    const signal = new AbortController().signal
    const { fetchImpl, calls } = recordFetch((call) => {
      const body = JSON.parse(String(call.init.body)) as { method: string }
      if (body.method === 'eth_chainId') return jsonResponse({ jsonrpc: '2.0', id: 1, result: '0x38' })
      if (body.method === 'eth_blockNumber') return jsonResponse({ jsonrpc: '2.0', id: 1, result: '0x7123ab' })
      throw new Error(`unexpected method ${body.method}`)
    })

    const snapshot = await probeEvmRpcReadiness(baseInput({ signal, fetchImpl }))

    expect(snapshot.state).toBe(VENUE_HEALTH_STATE.HEALTHY)
    expect(snapshot.signals.providerHealthy).toBe(true)
    expect(snapshot.reason).toBeNull()
    expect(snapshot.updatedAt).toBe(NOW)
    expect(snapshot.venueId).toBe(VENUE)
    expect(calls).toHaveLength(2)
    expect(calls[0].url).toBe(RPC)
    expect(calls[1].url).toBe(RPC)
    expect(calls[0].init.method).toBe('POST')
    expect(calls[1].init.method).toBe('POST')
    expect(JSON.parse(String(calls[0].init.body)).method).toBe('eth_chainId')
    expect(JSON.parse(String(calls[1].init.body)).method).toBe('eth_blockNumber')
    expect(calls[0].init.signal).toBe(signal)
    expect(calls[1].init.signal).toBe(signal)
  })

  it('returns UNAVAILABLE when the RPC URL is missing and does not fetch', async () => {
    const { fetchImpl, calls } = recordFetch(() => {
      throw new Error('fetch must not be called')
    })

    const snapshot = await probeEvmRpcReadiness(
      baseInput({
        rpcUrlByChain: {},
        fetchImpl,
      }),
    )

    expect(snapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(snapshot.reason).toBe('rpc-url-missing')
    expect(snapshot.signals.providerHealthy).toBe(false)
    expect(snapshot.updatedAt).toBe(NOW)
    expect(calls).toHaveLength(0)
  })

  it('returns UNAVAILABLE on blank RPC URL without fetching', async () => {
    const { fetchImpl, calls } = recordFetch(() => {
      throw new Error('fetch must not be called')
    })

    const snapshot = await probeEvmRpcReadiness(
      baseInput({
        rpcUrlByChain: { 56: '   ' },
        fetchImpl,
      }),
    )

    expect(snapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(snapshot.reason).toBe('rpc-url-missing')
    expect(snapshot.signals.providerHealthy).toBe(false)
    expect(calls).toHaveLength(0)
  })

  it('returns UNAVAILABLE on chain mismatch and skips the block request', async () => {
    const { fetchImpl, calls } = recordFetch(() => jsonResponse({ jsonrpc: '2.0', id: 1, result: '0x1' }))

    const snapshot = await probeEvmRpcReadiness(baseInput({ fetchImpl }))

    expect(snapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(snapshot.reason).toBe('rpc-chain-mismatch')
    expect(snapshot.signals.providerHealthy).toBe(false)
    expect(snapshot.updatedAt).toBe(NOW)
    expect(calls).toHaveLength(1)
    expect(JSON.parse(String(calls[0].init.body)).method).toBe('eth_chainId')
  })

  it('maps a thrown fetch/abort to UNAVAILABLE without throwing', async () => {
    const { fetchImpl, calls } = recordFetch(() => {
      throw new Error('Aborted')
    })

    await expect(probeEvmRpcReadiness(baseInput({ fetchImpl }))).resolves.toMatchObject({
      state: VENUE_HEALTH_STATE.UNAVAILABLE,
      reason: 'rpc-unavailable',
      signals: expect.objectContaining({ providerHealthy: false }),
      updatedAt: NOW,
    })
    expect(calls).toHaveLength(1)
  })

  it('maps JSON-RPC error and non-2xx HTTP to UNAVAILABLE without throwing', async () => {
    const rpcError = recordFetch(() =>
      jsonResponse({ jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'unavailable' } }),
    )
    const rpcErrorSnapshot = await probeEvmRpcReadiness(baseInput({ fetchImpl: rpcError.fetchImpl }))
    expect(rpcErrorSnapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(rpcErrorSnapshot.reason).toBe('rpc-unavailable')
    expect(rpcErrorSnapshot.signals.providerHealthy).toBe(false)

    const httpError = recordFetch(() => jsonResponse({ jsonrpc: '2.0', id: 1, result: '0x38' }, 503))
    const httpErrorSnapshot = await probeEvmRpcReadiness(baseInput({ fetchImpl: httpError.fetchImpl }))
    expect(httpErrorSnapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(httpErrorSnapshot.reason).toBe('rpc-unavailable')
    expect(httpErrorSnapshot.signals.providerHealthy).toBe(false)
  })

  it('maps malformed JSON to UNAVAILABLE without throwing', async () => {
    const { fetchImpl } = recordFetch(
      () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Unexpected token')
          },
        }) as Response,
    )

    const snapshot = await probeEvmRpcReadiness(baseInput({ fetchImpl }))
    expect(snapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(snapshot.reason).toBe('rpc-unavailable')
    expect(snapshot.signals.providerHealthy).toBe(false)
  })

  it('maps an invalid eth_blockNumber result to UNAVAILABLE', async () => {
    const { fetchImpl, calls } = recordFetch((call) => {
      const body = JSON.parse(String(call.init.body)) as { method: string }
      if (body.method === 'eth_chainId') return jsonResponse({ jsonrpc: '2.0', id: 1, result: '0x38' })
      return jsonResponse({ jsonrpc: '2.0', id: 1, result: 'not-a-hex' })
    })

    const snapshot = await probeEvmRpcReadiness(baseInput({ fetchImpl }))
    expect(snapshot.state).toBe(VENUE_HEALTH_STATE.UNAVAILABLE)
    expect(snapshot.reason).toBe('rpc-unavailable')
    expect(snapshot.signals.providerHealthy).toBe(false)
    expect(calls).toHaveLength(2)
    expect(JSON.parse(String(calls[1].init.body)).method).toBe('eth_blockNumber')
  })
})
