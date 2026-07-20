/**
 * R791-INFRA-003 — RPC failover load reduction.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  RATE_LIMIT_QUARANTINE_MS,
  expireProviderQuarantineForTests,
  isProviderEligibleForRecovery,
  isProviderQuarantined,
  isRateLimitReason,
  recordProviderFailure,
  recordProviderSuccess,
  resetProviderHealthForTests,
} from '../rpc/providerHealth'
import {
  backoffDelayMs,
  clearBlockTimestampCacheForTests,
  getBlockTimestamp,
  getBlockTimestampCacheSize,
  maxAttemptsForFailureReason,
  resolveFeaturedPairLogRpcUrls,
  rpcCallWithFailover,
} from '../rpc/chunkedLogs'
import {
  nextPersistedChunkSize,
  sanitizePersistedChunkSize,
  MIN_PERSISTED_CHUNK_SIZE,
} from '../constants'

const fetchMock = vi.fn()

beforeEach(() => {
  if (typeof (AbortSignal as { timeout?: (ms: number) => AbortSignal }).timeout !== 'function') {
    ;(AbortSignal as { timeout: (ms: number) => AbortSignal }).timeout = (ms: number) => {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), ms)
      controller.signal.addEventListener('abort', () => clearTimeout(t))
      return controller.signal
    }
  }
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  resetProviderHealthForTests()
  clearBlockTimestampCacheForTests()
  delete process.env.BSC_LOG_RPC_URL
  delete process.env.BSC_RPC_URL
  delete process.env.BSC_RPC_FALLBACK_URL
})

afterEach(() => {
  resetProviderHealthForTests()
  clearBlockTimestampCacheForTests()
})

function jsonRpcOk(result: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ jsonrpc: '2.0', id: 1, result }),
  }
}

function jsonRpcHttpError(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => ({ jsonrpc: '2.0', id: 1, error: { message } }),
  }
}

describe('R791-INFRA-003 RPC failover load reduction', () => {
  it('TEST 1 — 429 QuickNode → fallback works', async () => {
    const primary = 'https://indulgent-long-diagram.bsc.quiknode.pro/key/'
    const fallback = 'https://rpc.ankr.com/bsc/fallback-key'
    process.env.BSC_RPC_URL = primary
    process.env.BSC_RPC_FALLBACK_URL = fallback

    fetchMock
      .mockResolvedValueOnce(jsonRpcHttpError(429, 'Too many requests'))
      .mockResolvedValueOnce(jsonRpcOk('0x10'))

    const { result, url } = await rpcCallWithFailover<string>('eth_blockNumber', [])
    expect(result).toBe('0x10')
    expect(url).toBe(fallback)
    expect(isProviderQuarantined(primary)).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('TEST 2 — Temporary QN failure recovery → primary can return', async () => {
    const primary = 'https://indulgent-long-diagram.bsc.quiknode.pro/key/'
    const fallback = 'https://rpc.ankr.com/bsc/fallback-key'
    process.env.BSC_RPC_URL = primary
    process.env.BSC_RPC_FALLBACK_URL = fallback

    recordProviderFailure(primary, 'quicknode', 'HTTP 429: Too many requests')
    expect(isProviderQuarantined(primary)).toBe(true)
    expect(resolveFeaturedPairLogRpcUrls()[0]).toBe(fallback)

    expireProviderQuarantineForTests(primary)
    expect(isProviderEligibleForRecovery(primary)).toBe(true)
    expect(resolveFeaturedPairLogRpcUrls()[0]).toBe(primary)

    fetchMock.mockResolvedValueOnce(jsonRpcOk('0x22'))
    const { url } = await rpcCallWithFailover<string>('eth_blockNumber', [])
    expect(url).toBe(primary)
    recordProviderSuccess(primary, 'quicknode')
    expect(isProviderQuarantined(primary)).toBe(false)
  })

  it('TEST 3 — Chunk shrink recovers after success', () => {
    const recovered = nextPersistedChunkSize(1, 25)
    expect(recovered).toBeGreaterThanOrEqual(MIN_PERSISTED_CHUNK_SIZE)
    expect(recovered).toBe(50)

    const towardForward = nextPersistedChunkSize(50, 50)
    expect(towardForward).toBe(100)

    const capped = nextPersistedChunkSize(200, 200)
    expect(capped).toBe(200)
  })

  it('TEST 4 — Chunk size persistence never stays at chunk=1', () => {
    expect(sanitizePersistedChunkSize(1)).toBe(200)
    expect(sanitizePersistedChunkSize(0)).toBe(200)
    expect(sanitizePersistedChunkSize(undefined)).toBe(200)
    expect(sanitizePersistedChunkSize(24)).toBe(200)
    expect(sanitizePersistedChunkSize(25)).toBe(25)
    expect(sanitizePersistedChunkSize(80)).toBe(80)
    expect(nextPersistedChunkSize(1, 1)).toBeGreaterThanOrEqual(MIN_PERSISTED_CHUNK_SIZE)
    expect(nextPersistedChunkSize(1, 1)).not.toBe(1)
  })

  it('TEST 5 — Retry backoff: 429 does not create uncontrolled retries', () => {
    expect(isRateLimitReason('HTTP 429: Too many requests')).toBe(true)
    expect(maxAttemptsForFailureReason('HTTP 429: Too many requests')).toBe(1)
    expect(maxAttemptsForFailureReason('timeout')).toBe(3)
    expect(backoffDelayMs('HTTP 429: Too many requests', 0)).toBe(0)
    expect(backoffDelayMs('timeout', 0)).toBe(250)
    expect(backoffDelayMs('timeout', 1)).toBe(500)
    expect(RATE_LIMIT_QUARANTINE_MS).toBeLessThan(15 * 60 * 1000)
  })

  it('TEST 6 — Timestamp cache: same block queried once', async () => {
    process.env.BSC_RPC_URL = 'https://indulgent-long-diagram.bsc.quiknode.pro/key/'
    fetchMock.mockResolvedValue(
      jsonRpcOk({ timestamp: '0x64', number: '0x1', hash: '0xabc', parentHash: '0x0' }),
    )

    const a = await getBlockTimestamp(1_000_001)
    const b = await getBlockTimestamp(1_000_001)
    expect(a).toBe(b)
    expect(a).toBe(0x64)
    expect(getBlockTimestampCacheSize()).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('TEST 7 — Indexer correctness unchanged (sanitize is deterministic, non-mutating)', () => {
    const input = { chunkSize: 1 }
    const out = sanitizePersistedChunkSize(input.chunkSize)
    expect(input.chunkSize).toBe(1)
    expect(out).toBe(200)
    expect(sanitizePersistedChunkSize(100)).toBe(100)
    expect(MIN_PERSISTED_CHUNK_SIZE).toBe(25)
  })
})
