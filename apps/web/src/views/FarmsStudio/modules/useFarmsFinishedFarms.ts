/**
 * FARMS_MODULE_005 — Finished Farms hook.
 * Wallet-scoped recovery positions from portfolioFarms.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { buildFarmsFinishedFarmsViewModel } from './buildFarmsFinishedFarms'
import type { FarmsFinishedFarmsViewModel, FinishedFarmPosition } from './farmsFinishedFarmsTypes'

const SUPPORTED_CHAIN = 56

export function useFinishedFarmPositions(): FarmsFinishedFarmsViewModel {
  const runtime = useFarmsRuntime()
  const { address: account } = useAccount()
  const { chainId: activeChainId } = useActiveChainId()
  const previousRef = useRef<FinishedFarmPosition[] | null>(null)
  const previousWalletRef = useRef<string | null>(null)
  const previousChainRef = useRef<number | null>(null)

  const chainId = activeChainId ?? null
  const chainSupported = chainId === SUPPORTED_CHAIN

  const vm = useMemo(
    () =>
      buildFarmsFinishedFarmsViewModel({
        account: account ?? runtime.account ?? null,
        chainId,
        portfolioFarms: runtime.portfolioFarms ?? [],
        userDataLoaded: runtime.userDataLoaded,
        farmsLoading: runtime.phase === 'loading_farms',
        chainSupported,
        sourcesFailed: runtime.phase === 'error',
        previous: previousRef.current,
        previousWallet: previousWalletRef.current,
        previousChainId: previousChainRef.current,
      }),
    [
      account,
      runtime.account,
      runtime.portfolioFarms,
      runtime.userDataLoaded,
      runtime.phase,
      chainId,
      chainSupported,
    ],
  )

  useEffect(() => {
    if ((vm.state === 'ready' || vm.state === 'partial') && vm.positions.length) {
      previousRef.current = vm.positions
      previousWalletRef.current = account ?? null
      previousChainRef.current = chainId
    }
    if (vm.state === 'empty') {
      previousRef.current = null
    }
  }, [vm.state, vm.positions, account, chainId])

  useEffect(() => {
    if (previousWalletRef.current && account && previousWalletRef.current.toLowerCase() !== account.toLowerCase()) {
      previousRef.current = null
    }
    if (previousChainRef.current != null && chainId != null && previousChainRef.current !== chainId) {
      previousRef.current = null
    }
  }, [account, chainId])

  return vm
}

/** Repository-consistent alias. */
export const useFarmsFinishedFarms = useFinishedFarmPositions
