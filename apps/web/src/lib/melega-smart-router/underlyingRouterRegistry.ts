import { ChainId } from '@pancakeswap/sdk'
import type { UnderlyingRouterEntry } from './types'

/** PancakeSwap Smart Router — execution layer only; unchanged by Melega D87 adapter. */
const UNDERLYING_ROUTER_ADDRESSES: Partial<Record<number, string>> = {
  [ChainId.BSC]: '0xC6665d98Efd81f47B03801187eB46cbC63F328B0',
}

export function getUnderlyingRouterEntry(chainId: number): UnderlyingRouterEntry {
  const routerAddress = UNDERLYING_ROUTER_ADDRESSES[chainId]
  if (routerAddress) {
    return { chainId, routerAddress, status: 'active', source: 'config' }
  }
  return { chainId, status: 'missing', source: 'config' }
}
