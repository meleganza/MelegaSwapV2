/**
 * MELEGA_DEX_V1_POOLS_RUNTIME_ECONOMICS — Pools IA + flicker gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..')

describe('Product IA refinement — Pools economics repair', () => {
  it('orders Hero(+Featured) → KPI → My Positions → Explore → Analytics; Create Pool is modal', () => {
    const screen = readFileSync(path.join(ROOT, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('data-pools-ia="multichain-product-repair-v1"')
    expect(screen).toContain('create-pool-modal')
    expect(screen).not.toContain('PoolsRewardAdvisorModule')
    expect(screen).not.toContain('PoolsSidebar')
    expect(screen).not.toContain('PoolsBelowFold')
    expect(screen).not.toContain('PoolsFinishedPoolsModule')
    expect(screen).not.toContain('PoolsFeaturedPoolBand')
    expect(screen).not.toContain('PositionsCreateRow')
    const hero = screen.indexOf('<PoolsHeroModule')
    const kpis = screen.indexOf('<PoolsOverviewKpisModule')
    const positions = screen.indexOf('<PoolsMyPositionsModule')
    const create = screen.indexOf('data-ps-create-pool-section')
    const explore = screen.indexOf('<PoolsExplorePoolsModule')
    const analytics = screen.indexOf('<PoolsAnalyticsModule')
    expect(hero).toBeGreaterThan(-1)
    expect(kpis).toBeGreaterThan(hero)
    expect(positions).toBeGreaterThan(kpis)
    expect(explore).toBeGreaterThan(positions)
    expect(analytics).toBeGreaterThan(explore)
    expect(create).toBeGreaterThan(-1)
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

  it('pool cards expose SmartChef explorer link (chain-aware)', () => {
    const explore = readFileSync(path.join(ROOT, 'modules/PoolsExplorePoolCard.tsx'), 'utf8')
    const positions = readFileSync(path.join(ROOT, 'modules/PoolsMyPositionCard.tsx'), 'utf8')
    const featured = readFileSync(path.join(ROOT, 'modules/PoolsHeroFeaturedCompact.tsx'), 'utf8')
    expect(explore).toMatch(/getBlockExploreName|getBlockExploreLink/)
    expect(explore).toContain('noopener,noreferrer')
    expect(positions).toMatch(/getBlockExploreName|BscScan ↗/)
    expect(positions).toContain('noopener,noreferrer')
    expect(featured).toContain('BscScan ↗')
    expect(featured).toContain('poolBscScanContractUrl')
    expect(featured).toContain('noopener,noreferrer')
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
