import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHolderCount } from '../fetchHolderCount'

describe('fetchHolderCount', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads a BNB Chain holder count from the indexed token response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ holdersCount: 3_991_907 }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchHolderCount(56, '0x963556de0eb8138e97a85f0a86ee0acd159d210b')

    expect(result).toMatchObject({
      status: 'ready',
      count: 3_991_907,
      source: 'binplorer',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('api.binplorer.com/getTokenInfo/')
  })

  it('rejects malformed contract addresses without calling a provider', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchHolderCount(56, 'not-an-address')

    expect(result.status).toBe('unavailable')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
