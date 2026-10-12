export const BSC_CHAIN_ID = 56

export type RuntimeProfile = 'static' | 'market' | 'transactional'

export function shouldStartHomeChainFetch(chainId: number | undefined | null): chainId is number {
  return typeof chainId === 'number' && Number.isInteger(chainId) && chainId > 0
}

/** Drop a fetch that finished after the user changed chain or left the screen. */
export function shouldCommitHomeChainFetch(
  startedChainId: number,
  currentChainId: number | undefined | null,
): boolean {
  return currentChainId === startedChainId
}

/**
 * Disconnected Home with no explicit chain reads BSC only.
 * A wallet chain or a selected chain is the only chain that may be read.
 */
export function idleHomeReadChainIds(input: {
  walletConnected: boolean
  activeChainId?: number | null
}): number[] {
  if (shouldStartHomeChainFetch(input.activeChainId)) return [input.activeChainId]
  if (!input.walletConnected) return [BSC_CHAIN_ID]
  return []
}

export function foreignChainRpcAllowed(input: {
  walletConnected: boolean
  activeChainId?: number | null
  requestedChainId: number
}): boolean {
  if (input.requestedChainId === BSC_CHAIN_ID) return false
  return idleHomeReadChainIds(input).includes(input.requestedChainId)
}

export function shouldRunBlockPolling(profile: RuntimeProfile, chainId?: number | null): boolean {
  if (profile === 'static') return false
  return shouldStartHomeChainFetch(chainId)
}
