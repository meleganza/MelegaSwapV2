import { describe, expect, it } from 'vitest'
import {
  BSC_CHAIN_ID,
  foreignChainRpcAllowed,
  idleHomeReadChainIds,
  shouldCommitHomeChainFetch,
  shouldRunBlockPolling,
  shouldStartHomeChainFetch,
} from '../idleHomeChainPolicy'

describe('idle home chain reads', () => {
  it('reads only BSC on the initial disconnected homepage', () => {
    expect(idleHomeReadChainIds({ walletConnected: false })).toEqual([BSC_CHAIN_ID])
    expect(foreignChainRpcAllowed({ walletConnected: false, requestedChainId: 1 })).toBe(false)
    expect(foreignChainRpcAllowed({ walletConnected: false, requestedChainId: 137 })).toBe(false)
    expect(foreignChainRpcAllowed({ walletConnected: false, requestedChainId: 8453 })).toBe(false)
    expect(shouldStartHomeChainFetch(undefined)).toBe(false)
  })

  it('loads the chain the user explicitly selects while disconnected', () => {
    expect(idleHomeReadChainIds({ walletConnected: false, activeChainId: 8453 })).toEqual([8453])
    expect(foreignChainRpcAllowed({ walletConnected: false, activeChainId: 8453, requestedChainId: 8453 })).toBe(true)
    expect(foreignChainRpcAllowed({ walletConnected: false, activeChainId: 8453, requestedChainId: 1 })).toBe(false)
  })

  it('follows wallet connect and returns to BSC after disconnect', () => {
    expect(idleHomeReadChainIds({ walletConnected: true, activeChainId: 137 })).toEqual([137])
    expect(foreignChainRpcAllowed({ walletConnected: true, activeChainId: 137, requestedChainId: 137 })).toBe(true)
    expect(idleHomeReadChainIds({ walletConnected: false, activeChainId: BSC_CHAIN_ID })).toEqual([BSC_CHAIN_ID])
    expect(foreignChainRpcAllowed({ walletConnected: false, activeChainId: BSC_CHAIN_ID, requestedChainId: 137 })).toBe(
      false,
    )
  })

  it('drops stale results after a chain change or route unmount', () => {
    expect(shouldCommitHomeChainFetch(56, 56)).toBe(true)
    expect(shouldCommitHomeChainFetch(56, 1)).toBe(false)
    expect(shouldCommitHomeChainFetch(1, undefined)).toBe(false)
  })

  it('stops block polling on static routes and until a chain is resolved', () => {
    expect(shouldRunBlockPolling('market', 56)).toBe(true)
    expect(shouldRunBlockPolling('transactional', 1)).toBe(true)
    expect(shouldRunBlockPolling('static', 56)).toBe(false)
    expect(shouldRunBlockPolling('market', undefined)).toBe(false)
  })
})
