import { describe, expect, it, vi } from 'vitest'
import { subscribeWalletChain } from '../useWalletChainId'

describe('subscribeWalletChain', () => {
  it('resolves without a subscription when the provider read rejects', async () => {
    const onChainId = vi.fn()
    await expect(
      subscribeWalletChain(
        () => Promise.reject(new Error('provider unavailable')),
        () => false,
        onChainId,
      ),
    ).resolves.toBeUndefined()
    expect(onChainId).not.toHaveBeenCalled()
  })

  it('publishes eth_chainId and later chainChanged events', async () => {
    const onChainId = vi.fn()
    let chainHandler: ((value: unknown) => void) | undefined
    const provider = {
      request: vi.fn().mockResolvedValue('0x38'),
      on: (event: string, handler: (value: unknown) => void) => {
        if (event === 'chainChanged') chainHandler = handler
      },
      removeListener: vi.fn(),
    }
    const detach = await subscribeWalletChain(() => Promise.resolve(provider), () => false, onChainId)
    expect(onChainId).toHaveBeenCalledWith(56)
    chainHandler?.('0xa')
    expect(onChainId).toHaveBeenCalledWith(10)
    detach?.()
    expect(provider.removeListener).toHaveBeenCalled()
  })
})
