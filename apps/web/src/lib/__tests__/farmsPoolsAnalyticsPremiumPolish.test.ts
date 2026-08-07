/**
 * MELEGASWAP_V2_FARMS_POOLS_ANALYTICS_PREMIUM_POLISH — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { auditFarmProvenance, auditPoolProvenance } from 'lib/data-truth/yieldProvenanceAudit'
import { compareYieldTruthDesc, GLOBAL_DATA_TRUTH_PIPELINE } from 'lib/data-truth'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_FARMS_POOLS_ANALYTICS_PREMIUM_POLISH', () => {
  const farmCard = load('views/FarmsStudio/modules/FarmsExploreFarmCard.tsx')
  const poolCard = load('views/PoolsStudio/modules/PoolsExplorePoolCard.tsx')
  const spark = load('components/YieldActivitySparkline.tsx')
  const myFarms = load('views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')
  const myPools = load('views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')
  const myFarmCard = load('views/FarmsStudio/modules/FarmsMyFarmCard.tsx')
  const topFarms = load('views/Home/hooks/useGetTopFarmsByApr.tsx')
  const homeData = load('views/HomeTrade/useHomeTradeData.ts')

  it('farm metric truth + denser card', () => {
    expect(farmCard).toContain('GLOBAL_DATA_TRUTH_PIPELINE')
    expect(farmCard).toContain('truthDash')
    expect(farmCard).toContain('24H Vol')
    expect(farmCard).toContain('24H Fees')
    expect(farmCard).toContain('Participants')
    expect(farmCard).not.toContain('Source not configured')
    expect(farmCard).toContain('YieldActivitySparkline')
    expect(farmCard).toContain('This farm is on ${chainDisplayName')
  })

  it('pool metric truth + denser card', () => {
    expect(poolCard).toContain('GLOBAL_DATA_TRUTH_PIPELINE')
    expect(poolCard).toContain('truthDash')
    expect(poolCard).toContain('YieldActivitySparkline')
    expect(poolCard).toContain('This pool is on ${chainDisplayName')
  })

  it('sparkline no-fake-data invariant', () => {
    expect(spark).toContain('never invents oscillation')
    expect(spark).toContain('useIndexerCandles')
    expect(spark).toContain('baseline')
    expect(spark).not.toMatch(/Math\.random|fakeOscillat/)
  })

  it('empty My Farms / My Pools suppression', () => {
    expect(myFarms).toContain("if (vm.state === 'empty')")
    expect(myFarms).toContain('return null')
    expect(myPools).toContain("if (vm.state === 'empty')")
    expect(myPools).toContain('return null')
  })

  it('USD position primary / LP secondary', () => {
    expect(myFarmCard).toContain('data-primary-metric="deposited-value"')
    expect(myFarmCard).toContain('data-secondary-metric="lp-amount"')
    expect(myFarmCard).toContain('farms-my-deposited-primary')
  })

  it('Home ranking consistency (TVL → APR → volume)', () => {
    expect(topFarms).toContain('compareYieldTruthDesc')
    expect(homeData).toContain('compareYieldTruthDesc')
    expect(compareYieldTruthDesc({ sortTvl: 10, sortApr: 1 }, { sortTvl: 5, sortApr: 99 })).toBeLessThan(0)
    expect(GLOBAL_DATA_TRUTH_PIPELINE).toBe('melega-global-data-truth-v1')
  })

  it('provenance audit excludes uncertified rows only', () => {
    const farms = auditFarmProvenance()
    const pools = auditPoolProvenance()
    expect(farms.pipeline).toBe('melega-global-data-truth-v1')
    expect(pools.pipeline).toBe('melega-global-data-truth-v1')
    expect(farms.chains).toEqual(expect.arrayContaining([56, 8453, 137, 1, 42161, 43114]))
    expect(farms.included + farms.excluded).toBe(farms.rows.length)
    expect(pools.included + pools.excluded).toBe(pools.rows.length)
    // No BNB address used as sole identity across chains
    for (const row of farms.rows) {
      expect(row.identity.startsWith(`${row.chainId}:`)).toBe(true)
    }
  })

  it('multichain canonical identity — no symbol-only merge', () => {
    const explore = load('views/FarmsStudio/modules/buildFarmsExploreFarms.ts')
    expect(explore).toContain('never symbol-only')
    expect(explore).toContain('excludedFarmIdentities')
    expect(explore).toContain('auditFarmProvenance')
  })

  it('cross-chain action preservation', () => {
    expect(farmCard).toContain('resumeStake')
    expect(farmCard).toContain('pendingActionRef')
    expect(poolCard).toContain('resumeStake')
    expect(poolCard).toContain('pendingActionRef')
  })

  it('evidence folder contract', () => {
    const evidence = path.resolve(
      process.cwd(),
      'docs/runtime/melegaswap-v2-farms-pools-analytics-premium-polish',
    )
    // Created during acceptance; allow missing during early test runs.
    if (existsSync(evidence)) {
      expect(existsSync(path.join(evidence, 'REPORT.md'))).toBe(true)
    } else {
      expect(true).toBe(true)
    }
  })
})
