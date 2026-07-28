/**
 * POOLS_MODULE_003 — wallet-scoped positions hook.
 * Composes shared portfolioPools; retains last-good on transient failure.
 * Module-level cache survives remount / navigation for the same chain+wallet.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolsWalletPositionsViewModel } from './buildPoolsWalletPositions'
import type { PoolsMyPositionsViewModel, PoolsWalletPosition } from './poolsMyPositionsTypes'

type LastGoodEntry = {
  wallet: string
  chainId: number
  positions: PoolsWalletPosition[]
  generation: number
  updatedAt: number
}

/** chainId + normalized wallet → last confirmed positions (survives remount). */
const lastGoodByScope = new Map<string, LastGoodEntry>()

function scopeCacheKey(wallet: string | null | undefined, chainId: number | null | undefined): string | null {
  if (!wallet || chainId == null) return null
  return `${chainId}:${wallet.toLowerCase()}`
}

function readLastGood(wallet: string | null, chainId: number | null): LastGoodEntry | null {
  const key = scopeCacheKey(wallet, chainId)
  if (!key) return null
  return lastGoodByScope.get(key) ?? null
}

function writeLastGood(entry: LastGoodEntry): void {
  const key = scopeCacheKey(entry.wallet, entry.chainId)
  if (!key) return
  lastGoodByScope.set(key, entry)
}

/** Test / diagnostics helper — do not use in product UI. */
export function __poolsWalletPositionsCacheSizeForTests(): number {
  return lastGoodByScope.size
}

export function usePoolsWalletPositions(): PoolsMyPositionsViewModel {
  const runtime = usePoolsRuntime()
  const { chainId: activeChainId } = useActiveChainId()
  const generationRef = useRef(0)
  const lastScopeKeyRef = useRef<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const account = runtime.account ?? null
  const chainId = activeChainId ?? runtime.machine?.chainId ?? null

  // Synchronous scope identity — wallet/chain change invalidates only the old commit path.
  const scopeKey = `${account?.toLowerCase() ?? ''}:${chainId ?? ''}`
  if (scopeKey !== lastScopeKeyRef.current) {
    lastScopeKeyRef.current = scopeKey
    generationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = new AbortController()
  }

  useEffect(() => {
    return () => {
      // Cancel in-flight commit path on unmount; do NOT clear module last-good cache.
      abortRef.current?.abort()
    }
  }, [])

  return useMemo(() => {
    const cached = readLastGood(account, chainId)
    const previous = cached?.positions?.length ? cached.positions : null

    const generation = generationRef.current
    const signal = abortRef.current?.signal

    const vm = buildPoolsWalletPositionsViewModel({
      account,
      chainId,
      portfolioPools: runtime.portfolioPools ?? [],
      userDataLoaded: runtime.userDataLoaded,
      poolsLoading: runtime.phase === 'loading_pools',
      generation,
      previous,
      previousWallet: cached?.wallet ?? null,
      previousChainId: cached?.chainId ?? null,
      sourcesFailed: runtime.phase === 'error',
    })

    // Stale generation or aborted scope must not commit into the cache.
    if (signal?.aborted || vm.generation !== generationRef.current) {
      return vm
    }

    if (
      (vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty') &&
      account &&
      chainId != null
    ) {
      if (vm.state === 'empty') {
        // Never replace a non-empty last-good with a transient empty response.
        if (!cached?.positions.length) {
          writeLastGood({ wallet: account, chainId, positions: [], generation, updatedAt: Date.now() })
        }
      } else if (vm.positions.length) {
        writeLastGood({
          wallet: account,
          chainId,
          positions: vm.positions,
          generation,
          updatedAt: Date.now(),
        })
      }
    }

    return vm
  }, [
    account,
    chainId,
    runtime.portfolioPools,
    runtime.userDataLoaded,
    runtime.phase,
  ])
}

export { buildPoolsWalletPositionsViewModel }
