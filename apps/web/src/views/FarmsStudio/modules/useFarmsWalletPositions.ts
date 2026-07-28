import { useEffect, useMemo, useRef } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsWalletPositionsViewModel } from './buildFarmsWalletPositions'
import type { FarmsMyFarmsViewModel, FarmsWalletPosition } from './farmsMyFarmsTypes'

export function useFarmsWalletPositions(): FarmsMyFarmsViewModel {
  const runtime = useFarmsRuntime()
  const { chainId: activeChainId } = useActiveChainId()
  const generationRef = useRef(0)
  const lastGoodRef = useRef<{ wallet: string; chainId: number; positions: FarmsWalletPosition[] } | null>(null)
  const scopeRef = useRef<{ wallet: string | null; chainId: number | null }>({ wallet: null, chainId: null })
  const account = runtime.account ?? null
  const chainId = activeChainId ?? runtime.machine?.chainId ?? null
  useEffect(() => {
    const old = scopeRef.current
    if (!account || (old.wallet && old.wallet.toLowerCase() !== account.toLowerCase()) || (old.chainId != null && chainId != null && old.chainId !== chainId)) {
      lastGoodRef.current = null
      generationRef.current += 1
    }
    scopeRef.current = { wallet: account, chainId }
  }, [account, chainId])
  return useMemo(() => {
    const prior = lastGoodRef.current
    const previous = prior && account && chainId && prior.wallet.toLowerCase() === account.toLowerCase() && prior.chainId === chainId ? prior.positions : null
    const vm = buildFarmsWalletPositionsViewModel({
      account, chainId, portfolioFarms: runtime.portfolioFarms ?? [], userDataLoaded: runtime.userDataLoaded,
      farmsLoading: runtime.phase === 'loading_farms', generation: generationRef.current, previous,
      previousWallet: prior?.wallet, previousChainId: prior?.chainId, sourcesFailed: runtime.phase === 'error',
    })
    if ((vm.state === 'ready' || vm.state === 'partial' || vm.state === 'empty') && account && chainId) {
      lastGoodRef.current = { wallet: account, chainId, positions: vm.positions }
    }
    return vm
  }, [account, chainId, runtime.portfolioFarms, runtime.userDataLoaded, runtime.phase])
}

export { buildFarmsWalletPositionsViewModel }
