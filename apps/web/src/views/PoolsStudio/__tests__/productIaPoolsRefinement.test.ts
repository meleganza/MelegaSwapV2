/**
 * MELEGA_DEX_V1_PRODUCT_INFORMATION_ARCHITECTURE_REFINEMENT — Pools gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..')

describe('Product IA refinement — Pools', () => {
  it('orders Hero → KPI → My Positions → Analytics → Explore → Finished → Create Pool', () => {
    const screen = readFileSync(path.join(ROOT, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('data-pools-ia="wave-03-founder"')
    expect(screen).not.toContain('PoolsRewardAdvisorModule')
    expect(screen).not.toContain('PoolsSidebar')
    expect(screen).not.toContain('PoolsBelowFold')
    const hero = screen.indexOf('<PoolsHeroModule')
    const kpis = screen.indexOf('<PoolsOverviewKpisModule')
    const positions = screen.indexOf('<PoolsMyPositionsModule')
    const analytics = screen.indexOf('<PoolsAnalyticsModule')
    const explore = screen.indexOf('<PoolsExplorePoolsModule')
    const finished = screen.indexOf('<PoolsFinishedPoolsModule')
    const create = screen.indexOf('data-ps-create-pool-section')
    expect(hero).toBeGreaterThan(-1)
    expect(kpis).toBeGreaterThan(hero)
    expect(positions).toBeGreaterThan(kpis)
    expect(analytics).toBeGreaterThan(positions)
    expect(explore).toBeGreaterThan(analytics)
    expect(finished).toBeGreaterThan(explore)
    expect(create).toBeGreaterThan(finished)
  })

  it('Explore hook retains last-good pools during loading', () => {
    const hook = readFileSync(path.join(ROOT, 'modules/usePoolsExplorePools.ts'), 'utf8')
    expect(hook).toContain('lastGoodExploreByChain')
    expect(hook).toContain('Showing last known active pools while refreshing')
  })

  it('pool cards expose View Contract ↗ SmartChef explorer link', () => {
    const card = readFileSync(path.join(ROOT, 'components/PoolGridCard.tsx'), 'utf8')
    expect(card).toContain('View Contract ↗')
    expect(card).toContain('data-ps-view-contract')
    expect(card).toContain('noopener,noreferrer')
  })
})
