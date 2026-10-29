import { ChainId } from '@pancakeswap/sdk'

export type NativeYieldOperation = 'create' | 'stake' | 'unstake' | 'withdraw' | 'emergency-withdraw' | 'claim' | 'read'

/**
 * Founder policy for Melega-owned Farms and Pools.
 * Entry operations are BNB-only. Historical reads and exits stay available on
 * retired chains so this policy can never strand a legacy position.
 */
export const NATIVE_YIELD_ACTIVE_CHAIN_ID = ChainId.BSC

export const NATIVE_YIELD_TERMINATED_CHAIN_IDS = [ChainId.POLYGON, ChainId.ETHEREUM, ChainId.BASE] as const

const ENTRY_OPERATIONS = new Set<NativeYieldOperation>(['create', 'stake'])

export function isNativeYieldTerminatedChain(chainId?: number | null): boolean {
  return chainId != null && NATIVE_YIELD_TERMINATED_CHAIN_IDS.includes(chainId as (typeof NATIVE_YIELD_TERMINATED_CHAIN_IDS)[number])
}
export function isNativeYieldEntryAllowed(chainId?: number | null): boolean {
  return chainId === NATIVE_YIELD_ACTIVE_CHAIN_ID
}

export type NativeYieldChainState = 'active' | 'terminated' | 'unsupported'

export function getNativeYieldChainState(chainId?: number | null): NativeYieldChainState {
  if (chainId === NATIVE_YIELD_ACTIVE_CHAIN_ID) return 'active'
  if (isNativeYieldTerminatedChain(chainId)) return 'terminated'
  return 'unsupported'
}

export function isNativeYieldOperationAllowed(
  chainId: number | null | undefined,
  operation: NativeYieldOperation,
): boolean {
  if (ENTRY_OPERATIONS.has(operation)) return isNativeYieldEntryAllowed(chainId)
  return chainId != null
}
