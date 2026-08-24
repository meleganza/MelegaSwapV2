import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'
import { ChainId } from '@pancakeswap/sdk'
import useSWR from 'swr'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useFarms } from 'state/farms/hooks'
import { useMasterChefEmission } from '../useMasterChefEmission'

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(() => ({ data: undefined, error: undefined, isLoading: false })),
}))

vi.mock('hooks/useActiveChainId', () => ({
  useActiveChainId: vi.fn(() => ({ chainId: 56 })),
}))

vi.mock('state/farms/hooks', () => ({
  useFarms: vi.fn(() => ({ regularCakePerBlock: 9 })),
}))

const NON_BSC_CHAIN_IDS = [1, 137, 42161, 43114, 8453] as const

const BSC_EMISSION_PAYLOAD = {
  status: 'ready' as const,
  masterChefAddress: '0x41D5487836452d23f2c467070244E5842B412794',
  emissionMethod: 'dexTokenPerBlock',
  rawEmissionPerBlock: '0x4563918244f40000',
  rawPerBlockWei: '5000000000000000000',
  normalizedEmissionPerBlock: 5,
  totalDailyEmission: 144000,
  rewardToken: '0x9635',
  decimals: 18,
  totalAllocPoint: 478453,
  poolLength: 387,
  multiplier: 1,
  blocksPerDay: 28800,
  currentBlock: 110000000,
  poolAllocations: { 1: 10000 },
  source: 'masterchef-rpc',
}

type SwrCapture = {
  key: unknown
  fetcher?: () => Promise<unknown>
}

describe('useMasterChefEmission chain guard', () => {
  const originalFetch = globalThis.fetch
  const capture: SwrCapture = { key: undefined }

  beforeEach(() => {
    capture.key = undefined
    capture.fetcher = undefined
    vi.mocked(useFarms).mockReturnValue({ regularCakePerBlock: 9 } as ReturnType<typeof useFarms>)
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
    'does not fetch /api/masterchef/emission or use Redux fallback on chainId %s',
    (chainId) => {
      vi.mocked(useActiveChainId).mockReturnValue({ chainId } as ReturnType<typeof useActiveChainId>)
      const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>

      const { result, unmount } = renderHook(() => useMasterChefEmission())

      expect(capture.key).toBeNull()
      expect(fetchMock).not.toHaveBeenCalled()
      expect(result.current.status).toBe('unavailable')
      expect(result.current.perBlock).toBe(0)
      expect(result.current.perDay).toBe(0)
      expect(result.current.perDayLabel).toBe('')
      expect(result.current.source).toBe('unavailable')
      unmount()
    },
  )

  it('fetches and parses /api/masterchef/emission on BSC', async () => {
    vi.mocked(useActiveChainId).mockReturnValue({ chainId: ChainId.BSC } as ReturnType<typeof useActiveChainId>)
    vi.mocked(useFarms).mockReturnValue({ regularCakePerBlock: 0 } as ReturnType<typeof useFarms>)
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => BSC_EMISSION_PAYLOAD,
    })

    const { result, rerender, unmount } = renderHook(() => useMasterChefEmission())

    expect(capture.key).toBe('masterchef-emission-api')
    expect(typeof capture.fetcher).toBe('function')

    const parsed = await capture.fetcher!()
    vi.mocked(useSWR).mockImplementation(((key: unknown, fetcher?: () => Promise<unknown>) => {
      capture.key = key
      capture.fetcher = fetcher
      return { data: parsed, error: undefined, isLoading: false }
    }) as typeof useSWR)
    rerender()

    expect(fetchMock).toHaveBeenCalledWith('/api/masterchef/emission')
    expect(result.current.status).toBe('ready')
    expect(result.current.perBlock).toBe(5)
    expect(result.current.perDay).toBe(144000)
    expect(result.current.source).toBe('masterchef-rpc')
    expect(result.current.perDayLabel).toContain('MARCO')
    expect(result.current.contract).toBe(BSC_EMISSION_PAYLOAD.masterChefAddress)
    unmount()
  })

  it('keeps BSC pid query and Redux fallback semantics', async () => {
    vi.mocked(useActiveChainId).mockReturnValue({ chainId: ChainId.BSC } as ReturnType<typeof useActiveChainId>)
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) })

    const { result, rerender, unmount } = renderHook(() => useMasterChefEmission([1, 2]))

    expect(capture.key).toBe('masterchef-emission-1,2')
    const parsed = await capture.fetcher!()
    vi.mocked(useSWR).mockImplementation(((key: unknown, fetcher?: () => Promise<unknown>) => {
      capture.key = key
      capture.fetcher = fetcher
      return { data: parsed, error: undefined, isLoading: false }
    }) as typeof useSWR)
    rerender()

    expect(fetchMock).toHaveBeenCalledWith('/api/masterchef/emission?pids=1,2')
    expect(parsed).toBeNull()
    expect(result.current.source).toBe('redux-farms-fallback')
    expect(result.current.perBlock).toBe(9)
    expect(result.current.perDay).toBeGreaterThan(0)
    unmount()
  })
})
