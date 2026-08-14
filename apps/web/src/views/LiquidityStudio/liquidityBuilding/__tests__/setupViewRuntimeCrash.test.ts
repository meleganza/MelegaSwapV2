/**
 * MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_SETUP_VIEW_RUNTIME_CRASH_DIAGNOSIS
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { activityFromLatestExecution } from '../mapActivityEvents'
import { LB_UX } from '../uxCopy'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LB setup view runtime crash diagnosis', () => {
  it('reproduces production crash: activityFromLatestExecution(undefined) threw', () => {
    // Prior call site: activityFromLatestExecution(latestResult?.result?.[0] as any)
    // when an active program exists but latestExecution is empty → undefined.
    expect(() => activityFromLatestExecution(undefined)).not.toThrow()
    expect(activityFromLatestExecution(undefined)).toEqual([])
    expect(activityFromLatestExecution(null)).toEqual([])
    expect(
      activityFromLatestExecution({
        executionCount: 0,
        latest: null,
      }),
    ).toEqual([])
  })

  it('accepts structured latest execution payload', () => {
    expect(
      activityFromLatestExecution({
        executionCount: 2,
        latest: {
          executionId: '0xabc',
          projectTokenSold: '1',
          grossQuoteAcquired: '2',
          quoteAssetAdded: '3',
        },
      }),
    ).toHaveLength(1)
  })

  it('useProgramReadModel passes structured activity args (not raw result[0])', () => {
    const src = load('liquidityBuilding/useProgramReadModel.ts')
    expect(src).toContain('activityFromLatestExecution({')
    expect(src).toContain('executionCount: snapshot.executionCount')
    expect(src).not.toMatch(/activityFromLatestExecution\(latestResult\?\.result\?\.\[0\]/)
  })

  it('forceExpanded does not auto-open create when inventory has programs', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('inventory.programs.length > 0) return')
    expect(card).toContain('step === \'setup\'')
    expect(card).toContain('showPortfolio = !setupStarted && !isActive && !activating')
    expect(card).not.toMatch(/useState\(forceExpanded\)/)
    expect(card).toContain('inFlow = setupStarted && !isActive')
  })

  it('surfaces Program Active / Manage Program / View Portfolio copy', () => {
    expect(LB_UX.programActiveLabel).toBe('Program Active')
    expect(LB_UX.portfolioManage).toBe('Manage Program')
    expect(LB_UX.portfolioViewPortfolio).toBe('View Portfolio')
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('LB_UX.programActiveLabel')
    expect(card).toContain('LB_UX.portfolioViewPortfolio')
    const home = load('liquidityBuilding/product/LbPortfolioHome.tsx')
    expect(home).toContain('LB_UX.portfolioManage')
  })
})
