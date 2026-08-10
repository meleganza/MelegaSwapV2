/**
 * Progressive My Melega data — reuses Portfolio + LB owner inventory.
 */
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { usePortfolioRuntime } from 'views/PortfolioStudio/runtime/usePortfolioRuntime'
import { useLbOwnerPrograms } from 'views/LiquidityStudio/liquidityBuilding/useLbOwnerPrograms'
import {
  buildMyMelegaSnapshot,
  type MyMelegaChainFilter,
  type MyMelegaSnapshot,
} from 'lib/data-truth/myMelegaPositions'

export function useMyMelegaPositions(enabled: boolean) {
  const { address, isConnected } = useAccount()
  const [chainFilter, setChainFilter] = useState<MyMelegaChainFilter>('all')
  // Always call hooks (rules of hooks); portfolio runtime is light when disconnected.
  const { model } = usePortfolioRuntime()
  const lb = useLbOwnerPrograms(enabled && isConnected ? address : null)

  const snapshot: MyMelegaSnapshot = useMemo(
    () =>
      buildMyMelegaSnapshot({
        liquidity: model.liquidity,
        farms: model.farms,
        pools: model.pools,
        claimables: model.claimables,
        builderCount: lb.programs?.length ?? 0,
        chainFilter,
      }),
    [model.liquidity, model.farms, model.pools, model.claimables, lb.programs, chainFilter],
  )

  return {
    connected: Boolean(isConnected && address),
    address: address ?? null,
    chainId: model.chainId,
    walletLoading: model.wallet.loading,
    chainFilter,
    setChainFilter,
    snapshot,
    builderLoading: lb.loading,
  }
}
