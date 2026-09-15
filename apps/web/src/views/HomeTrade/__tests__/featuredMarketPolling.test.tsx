import React, { useState } from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SWRConfig, useSWRConfig } from 'swr'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFeaturedProjectMarkets } from '../useFeaturedProjectMarkets'
vi.mock('lib/market-data', () => ({ useCanonicalMarketSnapshot: () => ({ featured: [], isLoading: false }) }))
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
function Consumer({ id }: { id: string }) {
  const result = useFeaturedProjectMarkets()
  return <output data-testid={id}>{result.rowsBySlug.mm72?.latestPriceUsd ?? 'empty'}</output>
}
function Refresh() {
  const { mutate } = useSWRConfig()
  return <button onClick={() => void mutate('/api/indexer/featured-markets/')}>Refresh</button>
}
function Harness() {
  const [cache] = useState(() => new Map())
  return <SWRConfig value={{ provider: () => cache, shouldRetryOnError: false }}>
    <Consumer id="first" /><Consumer id="second" /><Refresh />
  </SWRConfig>
}
describe('shared featured market polling', () => {
  it('shares requests and retains last-good price on unavailable rows and failed refresh', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ rows: [
      { slug: 'mm72', status: 'LIVE', latestPriceUsd: 0.25 },
    ] }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<Harness />)
    await waitFor(() => expect(screen.getByTestId('first').textContent).toBe('0.25'))
    expect(screen.getByTestId('second').textContent).toBe('0.25')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ rows: [{ slug: 'mm72', status: 'UNAVAILABLE' }] }) })
    await act(async () => { fireEvent.click(screen.getByText('Refresh')) })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('first').textContent).toBe('0.25')
    fetchMock.mockRejectedValue(new Error('offline'))
    await act(async () => { fireEvent.click(screen.getByText('Refresh')) })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(screen.getByTestId('second').textContent).toBe('0.25')
  })
})
