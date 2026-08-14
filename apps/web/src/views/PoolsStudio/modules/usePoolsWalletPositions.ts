/**
 * POOLS_MODULE_003 — wallet-scoped positions hook.
 * Multichain: retains last-good per chain+wallet and unions for display.
 * One chain failure must not blank other chains' cached positions.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { unionPositionsByWallet } from 'lib/data-truth/multichainPositions'
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

function collectWalletCaches(wallet: string | null): Map<number, PoolsWalletPosition[]> {
  const out = new Map<number, PoolsWalletPosition[]>()
  if (!wallet) return out
  const w = wallet.toLowerCase()
  for (const entry of lastGoodByScope.values()) {
    if (entry.wallet.toLowerCase() !== w) continue
    if (!entry.positions.length) continue
    out.set(entry.chainId, entry.positions)
  }
  return out
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

  const scopeKey = `${account?.toLowerCase() ?? ''}:${chainId ?? ''}`
  if (scopeKey !== lastScopeKeyRef.current) {
    lastScopeKeyRef.current = scopeKey
    generationRef.current += 1
    abortRef.current?.abort()
    abortRef.current = new AbortController()
  }

  useEffect(() => {
    return () => {
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

    if (signal?.aborted || vm.generation !== generationRef.current) {
      return vm
    }

    if (
      (vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty') &&
      account &&
      chainId != null
    ) {
      if (vm.state === 'empty') {
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

    const aggregated = unionPositionsByWallet(vm.positions, collectWalletCaches(account), chainId)
    const hasCrossChain = aggregated.length > vm.positions.length
    if (!hasCrossChain) return vm

    return {
      ...vm,
      positions: aggregated,
      visiblePositions: aggregated.slice(0, vm.visiblePositions.length || aggregated.length),
      totalCount: aggregated.length,
      showCountBadge: aggregated.length > 0,
      liveRegion: `${aggregated.length} pool position${aggregated.length === 1 ? '' : 's'} across chains`,
      moduleDisclosure: vm.moduleDisclosure || 'Showing positions from all LIVE chains with known data.',
      state: aggregated.length ? (vm.state === 'empty' ? 'ready' : vm.state) : vm.state,
    }
  }, [account, chainId, runtime.portfolioPools, runtime.userDataLoaded, runtime.phase])
}

export { buildPoolsWalletPositionsViewModel }
