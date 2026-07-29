/**
 * MELEGA_DEX_V1_POOLS_FINAL_FOUNDER_ACCEPTANCE — Pools IA + flicker gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..')

describe('Product IA refinement — Pools Founder Acceptance', () => {
  it('orders Hero → KPI → Featured → My Positions → Create → Explore → Finished → Analytics', () => {
    const screen = readFileSync(path.join(ROOT, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('data-pools-ia="founder-acceptance-v1"')
    expect(screen).not.toContain('PoolsRewardAdvisorModule')
    expect(screen).not.toContain('PoolsSidebar')
    expect(screen).not.toContain('PoolsBelowFold')
    const hero = screen.indexOf('<PoolsHeroModule')
    const kpis = screen.indexOf('<PoolsOverviewKpisModule')
    const featured = screen.indexOf('<PoolsFeaturedPoolBand')
    const positions = screen.indexOf('<PoolsMyPositionsModule')
    const create = screen.indexOf('data-ps-create-pool-section')
    const explore = screen.indexOf('<PoolsExplorePoolsModule')
    const finished = screen.indexOf('<PoolsFinishedPoolsModule')
    const analytics = screen.indexOf('<PoolsAnalyticsModule')
    expect(hero).toBeGreaterThan(-1)
    expect(kpis).toBeGreaterThan(hero)
    expect(featured).toBeGreaterThan(kpis)
    expect(positions).toBeGreaterThan(featured)
    expect(create).toBeGreaterThan(positions)
    expect(explore).toBeGreaterThan(create)
    expect(finished).toBeGreaterThan(explore)
    expect(analytics).toBeGreaterThan(finished)
  })

  it('Explore hook retains last-good pools during loading', () => {
    const hook = readFileSync(path.join(ROOT, 'modules/usePoolsExplorePools.ts'), 'utf8')
    expect(hook).toContain('lastGoodExploreByChain')
    expect(hook).toContain('Showing last known active pools while refreshing')
  })

  it('runtime stabilizes card inventory against block-tick flicker', () => {
    const runtime = readFileSync(path.join(ROOT, 'poolsRuntime/usePoolsStakingRuntime.ts'), 'utf8')
    expect(runtime).toContain('currentBlockRef')
    expect(runtime).toContain('lastGoodStakingCardsRef')
    expect(runtime).toMatch(/mapPoolToPreviewCard\(p, currentBlockRef\.current/)
  })

  it('pool cards expose View Contract ↗ SmartChef explorer link', () => {
    const explore = readFileSync(path.join(ROOT, 'modules/PoolsExplorePoolCard.tsx'), 'utf8')
    const finished = readFileSync(path.join(ROOT, 'modules/PoolsFinishedPoolCard.tsx'), 'utf8')
    const positions = readFileSync(path.join(ROOT, 'modules/PoolsMyPositionCard.tsx'), 'utf8')
    const featured = readFileSync(path.join(ROOT, 'modules/PoolsFeaturedPoolBand.tsx'), 'utf8')
    for (const src of [explore, finished, positions, featured]) {
      expect(src).toContain('View Contract ↗')
      expect(src).toContain('poolBscScanContractUrl')
      expect(src).toContain('noopener,noreferrer')
    }
  })

  it('featured selection is highest-TVL active pool', () => {
    const fmt = readFileSync(path.join(ROOT, 'poolsRuntime/formatPoolsRuntime.ts'), 'utf8')
    expect(fmt).toContain('highest-TVL active SmartChef pool')
    expect(fmt).toContain('parseCardTvlUsd')
  })

  it('Create Pool uses Reward Duration / Daily Reward Emission labels', () => {
    const wizard = readFileSync(path.join(ROOT, 'components/CreatePoolCta.tsx'), 'utf8')
    expect(wizard).toContain('Reward Duration (Days)')
    expect(wizard).toContain('Daily Reward Emission')
    expect(wizard).not.toMatch(/>\s*Emission Duration\s*</)
    expect(wizard).not.toMatch(/>\s*Daily Rewards\s*</)
  })
})
