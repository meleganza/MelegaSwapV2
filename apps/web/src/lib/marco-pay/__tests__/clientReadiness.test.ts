import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMarcoPayReadiness } from '../clientReadiness'

describe('MARCO Pay client readiness recovery', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('recovers from a transient unavailable response instead of freezing the checkout', async () => {
    const unavailable = { executable: false, reason: 'MARCO Pay is temporarily unavailable.', applicationRef: null }
    const ready = { executable: true, reason: null, applicationRef: 'app_melega' }
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(unavailable), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(ready), { status: 200 })),
    )

    await expect(fetchMarcoPayReadiness(new AbortController().signal)).resolves.toEqual(ready)
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('preserves a confirmed server-side blocker after bounded retries', async () => {
    const unavailable = { executable: false, reason: 'MARCO Pay is completing secure activation.', applicationRef: null }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(unavailable), { status: 200 })))

    await expect(fetchMarcoPayReadiness(new AbortController().signal)).resolves.toEqual(unavailable)
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
