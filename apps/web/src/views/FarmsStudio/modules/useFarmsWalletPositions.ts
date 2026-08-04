import { useEffect, useMemo, useRef } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { unionPositionsByWallet } from 'lib/data-truth/multichainPositions'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsWalletPositionsViewModel } from './buildFarmsWalletPositions'
import type { FarmsMyFarmsViewModel, FarmsWalletPosition } from './farmsMyFarmsTypes'

type LastGoodEntry = {
  wallet: string
  chainId: number
  positions: FarmsWalletPosition[]
}

const lastGoodByScope = new Map<string, LastGoodEntry>()

function scopeKey(wallet: string, chainId: number) {
  return `${chainId}:${wallet.toLowerCase()}`
}

function collectWalletCaches(wallet: string | null): Map<number, FarmsWalletPosition[]> {
  const out = new Map<number, FarmsWalletPosition[]>()
  if (!wallet) return out
  const w = wallet.toLowerCase()
  for (const entry of lastGoodByScope.values()) {
    if (entry.wallet.toLowerCase() !== w) continue
    if (!entry.positions.length) continue
    out.set(entry.chainId, entry.positions)
  }
  return out
}

export function useFarmsWalletPositions(): FarmsMyFarmsViewModel {
  const runtime = useFarmsRuntime()
  const { chainId: activeChainId } = useActiveChainId()
  const generationRef = useRef(0)
  const scopeRef = useRef<{ wallet: string | null; chainId: number | null }>({ wallet: null, chainId: null })
  const account = runtime.account ?? null
  const chainId = activeChainId ?? runtime.machine?.chainId ?? null

  useEffect(() => {
    const old = scopeRef.current
    if (
      !account ||
      (old.wallet && old.wallet.toLowerCase() !== account.toLowerCase()) ||
      (old.chainId != null && chainId != null && old.chainId !== chainId)
    ) {
      generationRef.current += 1
    }
    scopeRef.current = { wallet: account, chainId }
  }, [account, chainId])

  return useMemo(() => {
    const prior =
      account && chainId != null ? lastGoodByScope.get(scopeKey(account, chainId)) ?? null : null
    const previous =
      prior && account && chainId && prior.wallet.toLowerCase() === account.toLowerCase() && prior.chainId === chainId
        ? prior.positions
        : null
    const vm = buildFarmsWalletPositionsViewModel({
      account,
      chainId,
      portfolioFarms: runtime.portfolioFarms ?? [],
      userDataLoaded: runtime.userDataLoaded,
      farmsLoading: runtime.phase === 'loading_farms',
      generation: generationRef.current,
      previous,
      previousWallet: prior?.wallet,
      previousChainId: prior?.chainId,
      sourcesFailed: runtime.phase === 'error',
    })
    if ((vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty') && account && chainId) {
      lastGoodByScope.set(scopeKey(account, chainId), {
        wallet: account,
        chainId,
        positions: vm.positions,
      })
    }

    const aggregated = unionPositionsByWallet(vm.positions, collectWalletCaches(account), chainId)
    if (aggregated.length <= vm.positions.length) return vm
    return {
      ...vm,
      positions: aggregated,
      visiblePositions: aggregated.slice(0, vm.visiblePositions.length || aggregated.length),
      totalCount: aggregated.length,
      showCountBadge: aggregated.length > 0,
      liveRegion: `${aggregated.length} farm position${aggregated.length === 1 ? '' : 's'} across chains`,
      moduleDisclosure: vm.moduleDisclosure || 'Showing positions from all LIVE chains with known data.',
      state: aggregated.length ? (vm.state === 'empty' ? 'ready' : vm.state) : vm.state,
    }
  }, [account, chainId, runtime.portfolioFarms, runtime.userDataLoaded, runtime.phase])
}

export { buildFarmsWalletPositionsViewModel }
