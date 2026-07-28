/**
 * POOLS_MODULE_003 — wallet-scoped positions hook.
 * Composes shared portfolioPools; retains last-good on transient failure.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolsWalletPositionsViewModel } from './buildPoolsWalletPositions'
import type { PoolsMyPositionsViewModel, PoolsWalletPosition } from './poolsMyPositionsTypes'

export function usePoolsWalletPositions(): PoolsMyPositionsViewModel {
  const runtime = usePoolsRuntime()
  const { chainId: activeChainId } = useActiveChainId()
  const generationRef = useRef(0)
  const lastGoodRef = useRef<{
    wallet: string
    chainId: number
    positions: PoolsWalletPosition[]
    generation: number
  } | null>(null)
  const lastScopeRef = useRef<{ wallet: string | null; chainId: number | null }>({
    wallet: null,
    chainId: null,
  })

  const account = runtime.account ?? null
  const chainId = activeChainId ?? runtime.machine?.chainId ?? null
  const lastScopeKeyRef = useRef<string>('')

  // Synchronous scope identity — prevent post-render empty races from wiping last-good.
  const scopeKey = `${account?.toLowerCase() ?? ''}:${chainId ?? ''}`
  if (scopeKey !== lastScopeKeyRef.current) {
    lastScopeKeyRef.current = scopeKey
    generationRef.current += 1
    lastGoodRef.current = null
    lastScopeRef.current = { wallet: account, chainId }
  }

  useEffect(() => {
    lastScopeRef.current = { wallet: account, chainId }
  }, [account, chainId])

  return useMemo(() => {
    const previous =
      lastGoodRef.current &&
      account &&
      chainId &&
      lastGoodRef.current.wallet.toLowerCase() === account.toLowerCase() &&
      lastGoodRef.current.chainId === chainId
        ? lastGoodRef.current.positions
        : null

    // Ignore stale generation snapshots if scope advanced mid-build.
    const generation = generationRef.current

    const vm = buildPoolsWalletPositionsViewModel({
      account,
      chainId,
      portfolioPools: runtime.portfolioPools ?? [],
      userDataLoaded: runtime.userDataLoaded,
      poolsLoading: runtime.phase === 'loading_pools',
      generation,
      previous,
      previousWallet: lastGoodRef.current?.wallet ?? null,
      previousChainId: lastGoodRef.current?.chainId ?? null,
      sourcesFailed: runtime.phase === 'error',
    })

    if (
      (vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty') &&
      account &&
      chainId &&
      vm.generation === generationRef.current
    ) {
      if (vm.state === 'empty') {
        // Never replace a non-empty last-good with a transient empty response.
        if (!lastGoodRef.current?.positions.length) {
          lastGoodRef.current = { wallet: account, chainId, positions: [], generation }
        }
      } else if (vm.positions.length) {
        lastGoodRef.current = {
          wallet: account,
          chainId,
          positions: vm.positions,
          generation,
        }
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
