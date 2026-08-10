/**
 * Sync config inventory match — chainId + token address (no Redux).
 */
import { livePools1, livePools56, livePools137, livePools8453, livePools42161, livePools43114 } from 'config/constants/pools'
import { listNormalizedFarms, type NormalizedFarmInventoryRow } from 'lib/data-truth/globalYieldInventory'
import { normalizeEvmAddress } from 'registry/projects/identity/caip'

function livePoolsForChain(chainId: number) {
  if (chainId === 1) return livePools1
  if (chainId === 56) return livePools56
  if (chainId === 137) return livePools137
  if (chainId === 8453) return livePools8453
  if (chainId === 42161) return livePools42161
  if (chainId === 43114) return livePools43114
  return []
}

export function matchFarmsByToken(
  chainId: number,
  tokenAddress: string | null | undefined,
): NormalizedFarmInventoryRow[] {
  const addr = tokenAddress ? normalizeEvmAddress(tokenAddress) : null
  if (!addr || !chainId) return []
  return listNormalizedFarms().filter(
    (f) =>
      f.chainId === chainId &&
      (f.token0Address === addr || f.token1Address === addr || f.lpAddress === addr),
  )
}

export function matchPoolsByToken(chainId: number, tokenAddress: string | null | undefined) {
  const addr = tokenAddress ? normalizeEvmAddress(tokenAddress) : null
  if (!addr || !chainId) return []
  return livePoolsForChain(chainId).filter((p) => {
    const stake = p.stakingToken?.address ? normalizeEvmAddress(p.stakingToken.address) : null
    const earn = p.earningToken?.address ? normalizeEvmAddress(p.earningToken.address) : null
    return stake === addr || earn === addr
  })
}
