import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import {
  EAGER_CONNECT_MAX_ATTEMPTS,
  restoreEagerWalletSession,
} from '../restoreEagerWalletSession'

describe('eager wallet session restoration', () => {
  it('restores a previously authorized injected account without prompting', async () => {
    const autoConnect = vi.fn().mockResolvedValue({ account: '0xabc' })
    const sleep = vi.fn()
    await expect(restoreEagerWalletSession({ autoConnect, sleep })).resolves.toEqual({
      status: 'restored',
      address: '0xabc',
      attempts: 1,
    })
    expect(autoConnect).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it('retries when the first provider wake-up fails or returns no account, then restores', async () => {
    const autoConnect = vi
      .fn()
      .mockRejectedValueOnce(new Error('provider waking'))
      .mockResolvedValueOnce({ account: null })
      .mockResolvedValueOnce({ account: '0xdef' })
    const sleep = vi.fn().mockResolvedValue(undefined)

    await expect(restoreEagerWalletSession({ autoConnect, sleep })).resolves.toEqual({
      status: 'restored',
      address: '0xdef',
      attempts: 3,
    })
    expect(autoConnect).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenCalledTimes(2)
  })

  it('stops after a bounded number of unsuccessful wake-ups and does not loop', async () => {
    const autoConnect = vi.fn().mockResolvedValue({ account: undefined })
    const sleep = vi.fn().mockResolvedValue(undefined)

    await expect(restoreEagerWalletSession({ autoConnect, sleep })).resolves.toEqual({
      status: 'unavailable',
      attempts: EAGER_CONNECT_MAX_ATTEMPTS,
    })
    expect(autoConnect).toHaveBeenCalledTimes(EAGER_CONNECT_MAX_ATTEMPTS)
    expect(sleep).toHaveBeenCalledTimes(EAGER_CONNECT_MAX_ATTEMPTS - 1)
  })

  it('uses autoConnect only and keeps a single-flight remount lock in the hook', () => {
    const hook = readFileSync(path.join(__dirname, '../useEagerConnect.ts'), 'utf8')
    expect(hook).toContain('restoreEagerWalletSession')
    expect(hook).toContain('client.autoConnect()')
    expect(hook).toContain('if (eagerConnectPromise || typeof window === \'undefined\') return')
    expect(hook).not.toMatch(/eagerConnectPromise = null/)
    expect(hook).not.toMatch(/connectAsync\(\{\s*connector: injected/)
    expect(hook).toContain("c.id === SAFE_ID")
  })
})
