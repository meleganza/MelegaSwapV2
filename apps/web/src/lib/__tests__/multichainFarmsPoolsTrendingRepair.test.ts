/**
 * Multichain farms/pools/trending product repair — unit contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  LIVE_CHAIN_FILTERS,
  LIVE_YIELD_CHAIN_IDS,
  countNormalizedFarmsByChain,
  farmIdentity,
  listNormalizedFarms,
  poolIdentity,
  poolInventoryCount,
} from 'lib/data-truth/globalYieldInventory'
import { mergeFarmPreviewCards, buildGlobalFarmPreviewCards } from 'lib/data-truth/farmConfigPreviewCards'
import {
  buildGlobalPoolPreviewCards,
  mergePoolPreviewCards,
  listGeneratedLivePools,
} from 'lib/data-truth/poolConfigPreviewCards'
import { unionPositionsByWallet } from 'lib/data-truth/multichainPositions'
import { resolveTokenMetaLocal, shortAddressLabel } from 'lib/data-truth/tokenMetadataResolution'
import { mergeTickerWithPaidPlacements, tickerItemIsEligible } from 'lib/trending/paidTickerPlacements'
import { dedupeExploreFarms } from 'views/FarmsStudio/modules/buildFarmsExploreFarms'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('multichain farm inventory normalization', () => {
  it('covers all LIVE yield chain IDs and never merges by symbol alone', () => {
    expect([...LIVE_YIELD_CHAIN_IDS]).toEqual([56, 8453, 137, 1, 42161, 43114])
    const farms = listNormalizedFarms()
    expect(farms.length).toBeGreaterThan(50)
    const counts = countNormalizedFarmsByChain()
    expect(counts[56]).toBeGreaterThan(0)
    expect(counts[8453]).toBeGreaterThan(0)
    expect(counts[137]).toBeGreaterThan(0)
    const ids = new Set(farms.map((f) => f.identity))
    expect(ids.size).toBe(farms.length)
    expect(farmIdentity(56, '0xabc', 1)).not.toBe(farmIdentity(8453, '0xabc', 1))
  })

  it('hydrates explore cards from config and merges runtime without dropping other chains', () => {
    const global = buildGlobalFarmPreviewCards()
    expect(global.length).toBeGreaterThan(50)
    const merged = mergeFarmPreviewCards([], 56, '0x41D5487836452d23f2c467070244E5842B412794')
    expect(merged.length).toBe(global.length)
    const chains = new Set(
      merged.map((c) => c.rawFarm?.token?.chainId).filter((n): n is number => typeof n === 'number'),
    )
    expect(chains.size).toBeGreaterThan(1)
  })

  it('dedupes explore farms by canonical identity not pid alone', () => {
    const a = {
      farmId: '56:0xmc:1',
      pid: 1,
      chainId: 56,
      masterbuilder: '0xmc',
      lpToken: { address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', symbol: 'A', name: null, chainId: 56 },
    } as any
    const b = {
      farmId: '8453:0xmc:1',
      pid: 1,
      chainId: 8453,
      masterbuilder: '0xmc',
      lpToken: { address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', symbol: 'B', name: null, chainId: 8453 },
    } as any
    expect(dedupeExploreFarms([a, b])).toHaveLength(2)
  })
})

describe('multichain pool inventory + layout', () => {
  it('exposes certified pool inventory counts across LIVE chains', () => {
    expect(poolInventoryCount()).toBeGreaterThan(0)
    expect(poolInventoryCount(56)).toBeGreaterThan(0)
    expect(poolIdentity(56, '0xabc')).toBe('56:0xabc')
  })

  it('hydrates global pool cards from generated LIVE inventory', () => {
    const rows = listGeneratedLivePools()
    expect(rows.length).toBeGreaterThan(100)
    const chains = new Set(rows.map((r) => r.chainId))
    expect(chains.has(56)).toBe(true)
    expect(chains.has(8453)).toBe(true)
    expect(chains.has(137)).toBe(true)
    const global = buildGlobalPoolPreviewCards()
    expect(global.length).toBe(rows.length)
    const merged = mergePoolPreviewCards([], 56)
    expect(merged.length).toBe(global.length)
  })

  it('Pools screen uses Create Pool modal instead of permanent side column', () => {
    const screen = load('views/PoolsStudio/PoolsStudioScreen.tsx')
    expect(screen).toContain('create-pool-modal')
    expect(screen).toContain('multichain-product-repair-v1')
    expect(screen).not.toContain('PositionsCreateRow')
    expect(screen).not.toContain('data-ps-create-pool-permanently-expanded')
  })

  it('Farms and Pools explore expose chain filters', () => {
    expect(LIVE_CHAIN_FILTERS.map((c) => c.label)).toEqual([
      'All chains',
      'BNB',
      'Base',
      'Polygon',
      'Ethereum',
      'Arbitrum',
      'Avalanche',
    ])
    const farms = load('views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx')
    expect(farms).toContain('farms-chain-filters')
    expect(farms).toContain('LIVE_CHAIN_FILTERS')
    const pools = load('views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx')
    expect(pools).toContain('pools-chain-filters')
    expect(pools).toContain('LIVE_CHAIN_FILTERS')
  })
})

describe('chain switch + badge + trending truth', () => {
  it('ships ChainSwitchConfirmDialog and compact chain badge', () => {
    expect(existsSync(path.join(ROOT, 'components/ChainSwitchConfirmDialog.tsx'))).toBe(true)
    const badge = load('components/Logo/MelegaExploreChainBadge.tsx')
    expect(badge).toContain('MELEGA_CHAIN_A11Y_LABELS')
    expect(badge).toContain('compact')
    const farmCard = load('views/FarmsStudio/modules/FarmsExploreFarmCard.tsx')
    expect(farmCard).toContain('ChainSwitchConfirmDialog')
    const poolCard = load('views/PoolsStudio/modules/PoolsExplorePoolCard.tsx')
    expect(poolCard).toContain('ChainSwitchConfirmDialog')
  })

  it('trending ranker still forbids registry padding without %', () => {
    const src = load('views/HomeTrade/useDexTrendingRankings.ts')
    expect(src).not.toMatch(/const backfill = all/)
    expect(src).toMatch(/Never pad empty slots|Never fabricate/)
    expect(src).toMatch(/withCredibleMove\.slice/)
    expect(src).toContain('mergeTickerWithPaidPlacements')
  })

  it('paid ticker placements require disclosed Boosted/Featured labels', () => {
    const organic = [{ id: 'o1', primary: 'MARCO', accent: '+12.4%', accentPositive: true }]
    const merged = mergeTickerWithPaidPlacements({
      organic,
      boosted: [{ id: 'b1', kind: 'boosted', symbol: 'BOOST', chainId: 56, address: '0x' + '1'.repeat(40) }],
      featured: [],
    })
    expect(merged[0].primary).toMatch(/Boosted/)
    expect(tickerItemIsEligible(merged[0])).toBe(true)
    expect(tickerItemIsEligible(organic[0])).toBe(true)
    expect(tickerItemIsEligible({ id: 'x', primary: 'RAND', secondary: undefined })).toBe(false)
  })

  it('discovery metadata prefers short address over Unknown', () => {
    const src = load('views/LiquidityStudio/modules/liquidityPoolDiscoveryModel.ts')
    expect(src).toMatch(/shortAddressLabel/)
    expect(src).toMatch(/never invent cross-chain metadata/i)
    const meta = resolveTokenMetaLocal({
      chainId: 56,
      address: '0x' + 'a'.repeat(40),
    })
    expect(meta.symbol).toBe(shortAddressLabel('0x' + 'a'.repeat(40)))
    expect(meta.symbol).not.toBe('Unknown')
  })

  it('aggregates positions across chains without dropping siblings', () => {
    const cached = new Map([
      [137, [{ positionId: 'p-137', chainId: 137 }]],
      [8453, [{ positionId: 'p-8453', chainId: 8453 }]],
    ])
    const current = [{ positionId: 'p-56', chainId: 56 }]
    const union = unionPositionsByWallet(current, cached, 56)
    expect(union).toHaveLength(3)
  })
})
