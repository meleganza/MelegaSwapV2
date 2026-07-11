import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MALFORMED_SWAP_TOPIC_HISTORICAL } from '../eventTopics'
import { EventTopicIntegrityError } from '../eventTopicIntegrity'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

describe('malformed topic blocks RPC (R773)', () => {
  it('does not invoke fetch when topic integrity fails before rpcCallWithFailover', async () => {
    const { validateTopicHash } = await import('../eventTopicIntegrity')
    expect(() => validateTopicHash('SWAP_TOPIC', MALFORMED_SWAP_TOPIC_HISTORICAL)).toThrow(
      EventTopicIntegrityError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('provider health quarantine (R773)', () => {
  it('quarantines dead fallback after repeated 404 failures', async () => {
    const { recordProviderFailure, isProviderQuarantined, resetProviderHealthForTests } = await import(
      '../rpc/providerHealth'
    )
    resetProviderHealthForTests()
    const url = 'https://rpc.ankr.com/bsc/dead-key'
    recordProviderFailure(url, 'ankr', 'HTTP 404: Not Found')
    recordProviderFailure(url, 'ankr', 'HTTP 404: Not Found')
    expect(isProviderQuarantined(url)).toBe(true)
  })

  it('excludes quarantined URLs from featured-pair log routing', async () => {
    const { recordProviderFailure, resetProviderHealthForTests } = await import('../rpc/providerHealth')
    resetProviderHealthForTests()
    const dead = 'https://rpc.ankr.com/bsc/dead-key'
    const live = 'https://indulgent-long-diagram.bsc.quiknode.pro/key/'
    process.env.BSC_RPC_URL = live
    process.env.BSC_RPC_FALLBACK_URL = dead
    recordProviderFailure(dead, 'ankr', 'HTTP 404: Not Found')
    recordProviderFailure(dead, 'ankr', 'HTTP 404: Not Found')
    const { resolveFeaturedPairLogRpcUrls } = await import('../rpc/chunkedLogs')
    const urls = resolveFeaturedPairLogRpcUrls()
    expect(urls[0]).toBe(live)
    expect(urls).not.toContain(dead)
    delete process.env.BSC_RPC_URL
    delete process.env.BSC_RPC_FALLBACK_URL
  })
})

describe('provider resolution order (R773)', () => {
  it('prefers BSC_LOG_RPC_URL then BSC_RPC_URL', async () => {
    const { resetProviderHealthForTests } = await import('../rpc/providerHealth')
    resetProviderHealthForTests()
    process.env.BSC_LOG_RPC_URL = 'https://log-rpc.example'
    process.env.BSC_RPC_URL = 'https://primary.example'
    process.env.BSC_RPC_FALLBACK_URL = 'https://fallback.example'
    const { resolveFeaturedPairLogRpcUrls } = await import('../rpc/chunkedLogs')
    expect(resolveFeaturedPairLogRpcUrls()[0]).toBe('https://log-rpc.example')
    expect(resolveFeaturedPairLogRpcUrls()[1]).toBe('https://primary.example')
    delete process.env.BSC_LOG_RPC_URL
    delete process.env.BSC_RPC_URL
    delete process.env.BSC_RPC_FALLBACK_URL
  })
})
