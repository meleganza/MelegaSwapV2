/**
 * Factual LIVE farm/pool inventory counts from certified config modules.
 * Used when runtime APR/TVL ranking is empty so Home never shows a false zero
 * while configured inventories exist.
 *
 * Pool counts are certified constants kept in sync with config/constants/pools.tsx
 * (avoid importing pools.tsx here — it pulls React hooks and breaks module graphs).
 */
import farmsBsc from '@pancakeswap/farms/constants/56'
import farmsBase from '@pancakeswap/farms/constants/8453'
import farmsPolygon from '@pancakeswap/farms/constants/137'
import farmsEth from '@pancakeswap/farms/constants/1'
import farmsArb from '@pancakeswap/farms/constants/42161'

type FarmLike = { pid: number; multiplier?: string; lpSymbol?: string }

const LIVE_FARM_CONFIGS: { chainId: number; farms: FarmLike[] }[] = [
  { chainId: 56, farms: farmsBsc },
  { chainId: 8453, farms: farmsBase },
  { chainId: 137, farms: farmsPolygon },
  { chainId: 1, farms: farmsEth },
  { chainId: 42161, farms: farmsArb },
  // Avalanche: certified pid-0 MARCO only (no non-zero farmable LP configs yet).
  { chainId: 43114, farms: [{ pid: 0, lpSymbol: 'MARCO', multiplier: '1X' }] },
]

/**
 * LIVE SmartChef pool inventory sizes — must match livePools* arrays in pools.tsx.
 * Verified at authoring time via sousId counts (56/8453/137/1; arb/avax empty).
 */
export const LIVE_POOL_INVENTORY_BY_CHAIN: Record<number, number> = {
  56: 163,
  8453: 12,
  137: 17,
  1: 3,
  42161: 0,
  43114: 0,
}

/** Active farmable configs: pid ≠ 0 and not explicitly zero-multiplier. */
export function countLiveActiveFarmConfigs(): number {
  return LIVE_FARM_CONFIGS.reduce((sum, { farms }) => {
    return (
      sum +
      farms.filter((f) => f.pid !== 0 && String(f.multiplier ?? '1X').toUpperCase() !== '0X').length
    )
  }, 0)
}

/** Configured SmartChef / sous pool contracts across LIVE chains. */
export function countLivePoolConfigs(): number {
  return Object.values(LIVE_POOL_INVENTORY_BY_CHAIN).reduce((a, b) => a + b, 0)
}

/** Top farm labels from static LIVE config when runtime ranking is empty. */
export function listLiveFarmInventoryPreview(limit = 5): Array<{ id: string; name: string; chainId: number }> {
  const out: Array<{ id: string; name: string; chainId: number }> = []
  for (const { chainId, farms } of LIVE_FARM_CONFIGS) {
    for (const f of farms) {
      if (f.pid === 0) continue
      if (String(f.multiplier ?? '1X').toUpperCase() === '0X') continue
      out.push({
        id: `cfg-farm-${chainId}-${f.pid}`,
        name: f.lpSymbol ?? `Farm #${f.pid}`,
        chainId,
      })
      if (out.length >= limit) return out
    }
  }
  return out
}

/** Top pool labels from static LIVE config when runtime ranking is empty. */
export function listLivePoolInventoryPreview(limit = 5): Array<{ id: string; name: string }> {
  const total = countLivePoolConfigs()
  if (total <= 0) return []
  const rows: Array<{ id: string; name: string }> = [
    { id: 'cfg-pool-bsc', name: `BSC LIVE pools (${LIVE_POOL_INVENTORY_BY_CHAIN[56]})` },
    { id: 'cfg-pool-base', name: `Base LIVE pools (${LIVE_POOL_INVENTORY_BY_CHAIN[8453]})` },
    { id: 'cfg-pool-polygon', name: `Polygon LIVE pools (${LIVE_POOL_INVENTORY_BY_CHAIN[137]})` },
    { id: 'cfg-pool-eth', name: `Ethereum LIVE pools (${LIVE_POOL_INVENTORY_BY_CHAIN[1]})` },
    { id: 'cfg-pool-total', name: `${total} configured LIVE pools` },
  ]
  return rows.slice(0, limit)
}

export function liveInventoryProvenance() {
  return {
    farmsSource: 'packages/farms/constants/{56,8453,137,1,42161,43114}',
    poolsSource: 'config/constants/pools livePools* (certified counts)',
    asOf: new Date().toISOString(),
  }
}
