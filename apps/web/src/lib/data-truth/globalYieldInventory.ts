/**
 * Multichain farm/pool inventory normalization (config-first).
 * Canonical identities:
 *   farm → chainId + masterChef + pid
 *   pool → chainId + contract address
 */
import farmsBsc from '@pancakeswap/farms/constants/56'
import farmsBase from '@pancakeswap/farms/constants/8453'
import farmsPolygon from '@pancakeswap/farms/constants/137'
import farmsEth from '@pancakeswap/farms/constants/1'
import farmsArb from '@pancakeswap/farms/constants/42161'
import type { SerializedFarmConfig } from '@pancakeswap/farms'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { LIVE_POOL_INVENTORY_BY_CHAIN } from './liveInventoryCounts'

export const LIVE_YIELD_CHAIN_IDS = [56, 8453, 137, 1, 42161, 43114] as const
export type LiveYieldChainId = (typeof LIVE_YIELD_CHAIN_IDS)[number]

export const LIVE_CHAIN_FILTERS: Array<{ id: 'all' | LiveYieldChainId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 56, label: 'BNB' },
  { id: 8453, label: 'Base' },
  { id: 137, label: 'Polygon' },
  { id: 1, label: 'Ethereum' },
  { id: 42161, label: 'Arbitrum' },
  { id: 43114, label: 'Avalanche' },
]

export type NormalizedFarmInventoryRow = {
  identity: string
  chainId: number
  masterChef: string
  pid: number
  lpSymbol: string
  lpAddress: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  multiplier: string
  configured: true
  source: string
  updatedAt: string
  /** Serialized config for explore card hydration */
  config: SerializedFarmConfig
}

const FARM_CONFIG_BY_CHAIN: Record<number, SerializedFarmConfig[]> = {
  56: farmsBsc as SerializedFarmConfig[],
  8453: farmsBase as SerializedFarmConfig[],
  137: farmsPolygon as SerializedFarmConfig[],
  1: farmsEth as SerializedFarmConfig[],
  42161: farmsArb as SerializedFarmConfig[],
  // Avalanche: pid-0 MARCO token-only only — no LP farm inventory yet.
  43114: [],
}

export function farmIdentity(chainId: number, masterChef: string, pid: number): string {
  return `${chainId}:${(masterChef || 'unknown').toLowerCase()}:${pid}`
}

export function poolIdentity(chainId: number, contractAddress: string): string {
  return `${chainId}:${(contractAddress || '').toLowerCase()}`
}

export function listNormalizedFarms(): NormalizedFarmInventoryRow[] {
  const asOf = new Date().toISOString()
  const out: NormalizedFarmInventoryRow[] = []
  for (const chainId of LIVE_YIELD_CHAIN_IDS) {
    const farms = FARM_CONFIG_BY_CHAIN[chainId] ?? []
    const mc = getMasterChefAddress(chainId)
    for (const farm of farms) {
      if (farm.pid == null || farm.pid === 0) continue
      if (String(farm.multiplier ?? '1X').toUpperCase() === '0X') continue
      if (farm.isTokenOnly) continue
      const lpAddress = String(farm.lpAddress ?? '').toLowerCase()
      if (!/^0x[a-f0-9]{40}$/.test(lpAddress)) continue
      const token0 = farm.token
      const token1 = farm.quoteToken
      if (!token0?.symbol || !token1?.symbol) continue
      if (token0.chainId != null && Number(token0.chainId) !== chainId) continue
      if (token1.chainId != null && Number(token1.chainId) !== chainId) continue
      out.push({
        identity: farmIdentity(chainId, mc, farm.pid),
        chainId,
        masterChef: mc,
        pid: farm.pid,
        lpSymbol: farm.lpSymbol ?? `${token0.symbol}-${token1.symbol} LP`,
        lpAddress,
        token0Symbol: token0.symbol,
        token1Symbol: token1.symbol,
        token0Address: String(token0.address ?? '').toLowerCase(),
        token1Address: String(token1.address ?? '').toLowerCase(),
        multiplier: String(farm.multiplier ?? '1X'),
        configured: true,
        source: `packages/farms/constants/${chainId}`,
        updatedAt: asOf,
        config: farm,
      })
    }
  }
  return out
}

export function countNormalizedFarmsByChain(): Record<number, number> {
  const counts: Record<number, number> = {}
  for (const row of listNormalizedFarms()) {
    counts[row.chainId] = (counts[row.chainId] ?? 0) + 1
  }
  return counts
}

export function poolInventoryCount(chainId?: number): number {
  if (chainId == null) {
    return Object.values(LIVE_POOL_INVENTORY_BY_CHAIN).reduce((a, b) => a + b, 0)
  }
  return LIVE_POOL_INVENTORY_BY_CHAIN[chainId] ?? 0
}

/** Re-export generated inventory size for tests (config stubs, not certified KPI counts). */
export { listGeneratedLivePools } from './poolConfigPreviewCards'
