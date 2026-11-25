import { ChainId } from '@pancakeswap/sdk'
import {
  getNativeYieldChainState,
  isNativeYieldEntryAllowed,
  isNativeYieldOperationAllowed,
  isNativeYieldTerminatedChain,
} from 'config/nativeYieldPolicy'

describe('native Melega Farms/Pools capability policy', () => {
  it('keeps BNB entry operations active', () => {
    expect(isNativeYieldEntryAllowed(ChainId.BSC)).toBe(true)
    expect(isNativeYieldOperationAllowed(ChainId.BSC, 'create')).toBe(true)
    expect(isNativeYieldOperationAllowed(ChainId.BSC, 'stake')).toBe(true)
  })

  it.each([ChainId.POLYGON, ChainId.ETHEREUM, ChainId.BASE])(
    'blocks every new native yield entry on terminated chain %s',
    (chainId) => {
      expect(isNativeYieldTerminatedChain(chainId)).toBe(true)
      expect(isNativeYieldOperationAllowed(chainId, 'create')).toBe(false)
      expect(isNativeYieldOperationAllowed(chainId, 'stake')).toBe(false)
    },
  )

  it.each([ChainId.POLYGON, ChainId.ETHEREUM, ChainId.BASE])(
    'preserves reads and legacy exits on terminated chain %s',
    (chainId) => {
      expect(isNativeYieldOperationAllowed(chainId, 'read')).toBe(true)
      expect(isNativeYieldOperationAllowed(chainId, 'unstake')).toBe(true)
      expect(isNativeYieldOperationAllowed(chainId, 'withdraw')).toBe(true)
      expect(isNativeYieldOperationAllowed(chainId, 'emergency-withdraw')).toBe(true)
      expect(isNativeYieldOperationAllowed(chainId, 'claim')).toBe(true)
    },
  )

  it('fails closed when the chain is unavailable', () => {
    expect(isNativeYieldOperationAllowed(undefined, 'stake')).toBe(false)
    expect(isNativeYieldOperationAllowed(undefined, 'withdraw')).toBe(false)
  })

  it('exposes the lifecycle state rendered by Earn', () => {
    expect(getNativeYieldChainState(ChainId.BSC)).toBe('active')
    expect(getNativeYieldChainState(ChainId.POLYGON)).toBe('terminated')
    expect(getNativeYieldChainState(ChainId.BASE)).toBe('terminated')
    expect(getNativeYieldChainState(ChainId.ETHEREUM)).toBe('terminated')
    expect(getNativeYieldChainState(ChainId.ARBITRUM)).toBe('unsupported')
  })
})
