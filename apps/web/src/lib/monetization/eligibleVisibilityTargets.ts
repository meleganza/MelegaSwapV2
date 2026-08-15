import { listNormalizedFarms } from 'lib/data-truth/globalYieldInventory'
import { listGeneratedLivePools } from 'lib/data-truth/poolConfigPreviewCards'

export type VisibilityTargetKind = 'farm' | 'pool'

export type EligibleVisibilityTarget = {
  id: string
  kind: VisibilityTargetKind
  chainId: number
  title: string
  detail: string
  contractAddress: string
  pid?: number
  stakeSymbol?: string
  rewardSymbol?: string
}

type ProjectTokenIdentity = {
  chainId: number
  address: string
  symbol: string
}

export function listEligibleFarmTargets(identity: ProjectTokenIdentity): EligibleVisibilityTarget[] {
  const address = identity.address.toLowerCase()
  return listNormalizedFarms()
    .filter((farm) => farm.chainId === identity.chainId)
    .filter((farm) => farm.token0Address === address || farm.token1Address === address)
    .map((farm) => ({
      id: farm.lpAddress,
      kind: 'farm' as const,
      chainId: farm.chainId,
      title: `${farm.token0Symbol} / ${farm.token1Symbol}`,
      detail: `Farm #${farm.pid} · Active`,
      contractAddress: farm.lpAddress,
      pid: farm.pid,
    }))
}

export function listEligiblePoolTargets(identity: ProjectTokenIdentity): EligibleVisibilityTarget[] {
  const symbol = identity.symbol.trim().toUpperCase()
  return listGeneratedLivePools()
    .filter((pool) => pool.chainId === identity.chainId)
    .filter(
      (pool) => pool.stakeSymbol.trim().toUpperCase() === symbol || pool.rewardSymbol.trim().toUpperCase() === symbol,
    )
    .map((pool) => ({
      id: pool.contractAddress,
      kind: 'pool' as const,
      chainId: pool.chainId,
      title: `Stake ${pool.stakeSymbol} → Earn ${pool.rewardSymbol}`,
      detail:
        pool.stakeSymbol.trim().toUpperCase() === symbol && pool.rewardSymbol.trim().toUpperCase() === symbol
          ? `${identity.symbol} is both the staking and reward token`
          : pool.stakeSymbol.trim().toUpperCase() === symbol
          ? `Stake ${identity.symbol} to earn ${pool.rewardSymbol}`
          : `Stake ${pool.stakeSymbol} to earn ${identity.symbol}`,
      contractAddress: pool.contractAddress,
      stakeSymbol: pool.stakeSymbol,
      rewardSymbol: pool.rewardSymbol,
    }))
}
