import { buildAiBriefing } from '../buildAiBriefing'
import { buildActivityTimeline } from '../buildActivityTimeline'
import { buildMachineSummary } from '../buildMachineSummary'
import { mapRecommendations } from '../buildNotifications'
import { formatSettlementUserLabel } from 'views/Trade/tradeRuntime/formatSettlementStatus'
import {
  countPendingActions,
  formatAssetRows,
  formatFarmPositionRows,
  formatLiquidityRows,
  formatPoolPositionRows,
  safePortfolioSection,
  sumPendingRewardsUsd,
} from '../formatCommandCenterRuntime'
import { createCommandCenterError } from '../commandCenterRuntimeErrors'
import BigNumber from 'bignumber.js'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import type { LiquidityPositionRow } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'

describe('commandCenterRuntime', () => {
  it('builds AI briefing for disconnected wallet', () => {
    const briefing = buildAiBriefing({
      account: undefined,
      liquidityCount: 0,
      poolPending: 0,
      farmPending: 0,
      radarAlerts: 0,
      projectCount: 1,
      recommendations: [],
    })
    expect(briefing.bullets[0]).toContain('Connect your wallet')
  })

  it('builds operational briefing when wallet connected', () => {
    const briefing = buildAiBriefing({
      account: '0xabc',
      liquidityCount: 2,
      poolPending: 1,
      farmPending: 0,
      radarAlerts: 3,
      infrastructureScore: 72,
      projectCount: 1,
      recommendations: [],
    })
    expect(briefing.bullets.length).toBeGreaterThan(0)
    expect(briefing.bullets.some((b) => b.includes('liquidity'))).toBe(true)
  })

  it('maps recommendations from runtime sources', () => {
    const recs = mapRecommendations(
      [{ title: 'Audit', description: 'Recommended' }],
      { title: 'Radar', description: 'Alert' },
      [{ title: 'Pool', description: 'Create pool' }],
    )
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].icon).toBeDefined()
  })

  it('builds activity timeline chronologically', () => {
    const timeline = buildActivityTimeline({
      tradeTxs: [{ label: 'Swap MARCO', time: '2026-07-03T10:00:00Z' }],
      poolActivity: [{ label: 'Stake — MARCO', time: '2026-07-03T09:00:00Z' }],
      farmActivity: [],
      buildActivity: [],
      liquidityActivity: [],
    })
    expect(timeline.length).toBe(2)
    expect(timeline[0].label).toContain('Swap')
  })

  it('generates machine summary with runtime sections', () => {
    const summary = buildMachineSummary({
      account: '0xabc',
      chainId: 56,
      tradeMachine: { status: 'idle' },
      liquidityCount: 1,
      poolCount: 1,
      farmCount: 0,
      assetCount: 2,
      projectsMachine: { indexed: 1 },
      radarMachine: { signals: 3 },
      buildMachine: { score: 72 },
      infrastructureScore: 72,
      notificationCount: 2,
      collectibleCount: 4,
    })
    expect(summary.schema).toContain('command-center')
    expect(summary.trade).toBeDefined()
    expect(summary.radar).toBeDefined()
  })

  it('formats settlement labels for command center mirror', () => {
    const label = formatSettlementUserLabel({
      settlementStatus: 'SETTLEMENT_ACCEPTED',
      treasuryRuntimeEndpointStatus: 'available',
      settlementId: 'stl_1',
    })
    expect(label).toBe('Settled')
  })

  it('exposes error catalog', () => {
    const err = createCommandCenterError('NO_WALLET')
    expect(err.code).toBe('NO_WALLET')
  })

  it('R791D.1A: farm formatter survives missing earningToken (wallet-connected crash path)', () => {
    const brokenFarm = {
      id: 'farm-broken',
      pair: 'MM72 / MARCO',
      tokens: ['MM72', 'MARCO'] as [string, string],
      status: 'live' as const,
      tvl: '—',
      dailyRewards: '—',
      multiplier: '1X',
      liquidity: '—',
      pid: 72,
      pendingReward: new BigNumber('1000000000000000000'),
      userStaked: new BigNumber('1'),
      rawFarm: {
        // earningToken intentionally absent — production crash trigger
        earningTokenPrice: 0.0004,
      } as unknown as FarmPreviewCard['rawFarm'],
    } satisfies FarmPreviewCard

    const healthyFarm = {
      id: 'farm-ok',
      pair: 'BNB / MARCO',
      tokens: ['BNB', 'MARCO'] as [string, string],
      status: 'live' as const,
      tvl: '—',
      dailyRewards: '—',
      multiplier: '1X',
      liquidity: '—',
      pid: 1,
      pendingReward: new BigNumber('2000000000000000000'),
      userStaked: new BigNumber('2'),
      rawFarm: {
        earningToken: { decimals: 18, symbol: 'MARCO' },
        earningTokenPrice: 0.0004,
      } as unknown as FarmPreviewCard['rawFarm'],
    } satisfies FarmPreviewCard

    expect(() => formatFarmPositionRows([brokenFarm, healthyFarm])).not.toThrow()
    const rows = formatFarmPositionRows([brokenFarm, healthyFarm])
    expect(rows.length).toBe(2)
    expect(rows[0].pending).toBe('Unavailable')
    expect(rows[1].pending).not.toBe('Unavailable')
    expect(() => sumPendingRewardsUsd([], [brokenFarm, healthyFarm])).not.toThrow()
  })

  it('R791D.1A: section isolation — liquidity/pools/farms throws still yield partial portfolio', () => {
    const throwingLiquidity = {
      get positions(): LiquidityPositionRow[] {
        throw new Error('LIQUIDITY_SECTION_THROW')
      },
    }
    const throwingPools = {
      get pools(): PoolPreviewCard[] {
        throw new Error('POOLS_SECTION_THROW')
      },
    }
    const throwingFarms = {
      get farms(): FarmPreviewCard[] {
        throw new Error('FARMS_SECTION_THROW')
      },
    }

    const liquidity = safePortfolioSection(() => formatLiquidityRows(throwingLiquidity.positions))
    const pools = safePortfolioSection(() => formatPoolPositionRows(throwingPools.pools))
    const farms = safePortfolioSection(() => formatFarmPositionRows(throwingFarms.farms))
    const assets = safePortfolioSection(() =>
      formatAssetRows([{ symbol: 'BNB', balance: '1.5', usd: '$1', address: '0xbnb' }], '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'),
    )

    expect(liquidity.status).toBe('unavailable')
    expect(liquidity.rows).toEqual([])
    expect(pools.status).toBe('unavailable')
    expect(farms.status).toBe('unavailable')
    expect(assets.status).toBe('ok')
    expect(assets.rows.length).toBe(1)

    // Partial portfolio still assembleable — Command Center must render surviving sections.
    const partial = {
      assets: assets.rows,
      liquidity: liquidity.rows,
      pools: pools.rows,
      farms: farms.rows,
    }
    expect(partial.assets.length).toBeGreaterThan(0)
    expect(partial.liquidity).toEqual([])
    expect(partial.pools).toEqual([])
    expect(partial.farms).toEqual([])
  })

  it('R791D.1A: pool formatter does not crash on incomplete earningToken metadata', () => {
    const brokenPool = {
      id: 'pool-broken',
      name: 'Broken Pool',
      tokens: ['MARCO'],
      status: 'live' as const,
      tvl: '—',
      dailyRewards: '—',
      pendingReward: new BigNumber('1'),
      userStaked: new BigNumber('1'),
      rawPool: { earningTokenPrice: 1 } as PoolPreviewCard['rawPool'],
    } as PoolPreviewCard

    expect(() => formatPoolPositionRows([brokenPool])).not.toThrow()
    expect(formatPoolPositionRows([brokenPool])[0]?.pending).toBe('Unavailable')
  })
})
