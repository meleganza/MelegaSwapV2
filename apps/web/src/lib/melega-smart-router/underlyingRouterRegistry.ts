import { ChainId } from '@pancakeswap/sdk'
import { resolveExecutionAdapterForSwap, getV2RouterAddress } from './execution-adapter'
import type { UnderlyingRouterEntry } from './types'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

/** Resolves canonical execution router via AdapterResolver (ExecutionPlan → adapter → router). */
export function getUnderlyingRouterEntry(chainId: number): UnderlyingRouterEntry {
  try {
    const resolved = resolveExecutionAdapterForSwap({
      chainId,
      preferSmartRouter: chainId === ChainId.BSC,
      inputIsNative: false,
      path: [],
    })
    return {
      chainId,
      routerAddress: resolved.adapter.routerAddress(),
      status: 'active',
      source: 'config',
    }
  } catch {
    const fallback = getV2RouterAddress(chainId) ?? (chainId === ChainId.BSC_TESTNET ? BSC_TESTNET_ADDRESSES.router : undefined)
    if (fallback) {
      return { chainId, routerAddress: fallback, status: 'active', source: 'config' }
    }
    return { chainId, status: 'missing', source: 'config' }
  }
}
