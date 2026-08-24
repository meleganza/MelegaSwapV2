import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'
import { ChainId } from '@pancakeswap/sdk'
import useSWR from 'swr'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolClassificationSummary } from '../usePoolClassificationSummary'

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(() => ({ data: undefined, error: undefined, isLoading: false })),
}))

vi.mock('hooks/useActiveChainId', () => ({
  useActiveChainId: vi.fn(() => ({ chainId: 56 })),
}))

const NON_BSC_CHAIN_IDS = [1, 137, 42161, 43114, 8453] as const

const BSC_CLASSIFICATION_PAYLOAD = {
  generatedAt: '2026-07-15T15:36:30.751Z',
  currentBlock: 110156497,
  counts: {
    discovered: 239,
    verified: 239,
    active: 0,
    funded: 229,
    rewarding: 0,
    ended: 239,
    invalid: 0,
  },
}

type SwrCapture = {
  key: unknown
  fetcher?: () => Promise<unknown>
}

describe('usePoolClassificationSummary chain guard', () => {
  const originalFetch = globalThis.fetch
  const capture: SwrCapture = { key: undefined }

  beforeEach(() => {
    capture.key = undefined
    capture.fetcher = undefined
    vi.mocked(useSWR).mockImplementation(((key: unknown, fetcher?: () => Promise<unknown>) => {
      capture.key = key
      capture.fetcher = fetcher
      return { data: undefined, error: undefined, isLoading: false }
    }) as typeof useSWR)
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  it.each(NON_BSC_CHAIN_IDS)(
    'does not fetch /api/pools/classification/ or return BSC counts on chainId %s',
    (chainId) => {
      vi.mocked(useActiveChainId).mockReturnValue({ chainId } as ReturnType<typeof useActiveChainId>)
      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>

      const { result, unmount } = renderHook(() => usePoolClassificationSummary())

      expect(capture.key).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
      expect(result.current.status).toBe('unavailable')
      expect(result.current.counts).toBeUndefined()
      unmount()
    },
  )

  it('fetches and parses /api/pools/classification/ on BSC', async () => {
    vi.mocked(useActiveChainId).mockReturnValue({ chainId: ChainId.BSC } as ReturnType<typeof useActiveChainId>)
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => BSC_CLASSIFICATION_PAYLOAD,
    })

    const { result, rerender, unmount } = renderHook(() => usePoolClassificationSummary())

    expect(capture.key).toBe('pool-classification-summary')
    expect(typeof capture.fetcher).toBe('function')

    const parsed = await capture.fetcher!()
    vi.mocked(useSWR).mockImplementation(((key: unknown, fetcher?: () => Promise<unknown>) => {
      capture.key = key
      capture.fetcher = fetcher
      return { data: parsed, error: undefined, isLoading: false }
    }) as typeof useSWR)
    rerender()

    expect(fetchMock).toHaveBeenCalledWith('/api/pools/classification/')
    expect(result.current.status).toBe('ready')
    expect(result.current.counts).toEqual(BSC_CLASSIFICATION_PAYLOAD.counts)
    expect(result.current.generatedAt).toBe(BSC_CLASSIFICATION_PAYLOAD.generatedAt)
    expect(result.current.currentBlock).toBe(BSC_CLASSIFICATION_PAYLOAD.currentBlock)
    unmount()
  })
})
