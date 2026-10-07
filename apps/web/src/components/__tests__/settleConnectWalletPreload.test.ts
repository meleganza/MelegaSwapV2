import { describe, expect, it, vi } from 'vitest'
import { settleConnectWalletPreload } from '../ConnectWalletButton'

describe('settleConnectWalletPreload', () => {
  it('opens only after the runtime preload fulfills', async () => {
    const onReady = vi.fn()
    await expect(settleConnectWalletPreload(Promise.resolve('ready'), onReady)).resolves.toBeUndefined()
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('keeps the modal closed and handles a rejected preload', async () => {
    const onReady = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(
      settleConnectWalletPreload(Promise.reject(new Error('chunk failed')), onReady),
    ).resolves.toBeUndefined()
    expect(onReady).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledWith('Connect wallet runtime failed to load', expect.any(Error))
    error.mockRestore()
  })
})
