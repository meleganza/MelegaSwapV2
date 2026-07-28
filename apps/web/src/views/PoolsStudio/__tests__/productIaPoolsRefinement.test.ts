/**
 * MELEGA_DEX_V1_PRODUCT_INFORMATION_ARCHITECTURE_REFINEMENT — Pools gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '..')

describe('Product IA refinement — Pools', () => {
  it('orders Hero → My Positions → Analytics before Explore; Create Pool near bottom', () => {
    const screen = readFileSync(path.join(ROOT, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('data-pools-ia="provider-first-v1"')
    const hero = screen.indexOf('<PoolsHeroModule')
    const positions = screen.indexOf('<PoolsMyPositionsModule')
    const analytics = screen.indexOf('<PoolsAnalyticsModule')
    const explore = screen.indexOf('<PoolsExplorePoolsModule')
    const create = screen.indexOf('data-ps-create-pool-section')
    expect(hero).toBeGreaterThan(-1)
    expect(positions).toBeGreaterThan(hero)
    expect(analytics).toBeGreaterThan(positions)
    expect(explore).toBeGreaterThan(analytics)
    expect(create).toBeGreaterThan(explore)
  })

  it('Explore hook retains last-good pools during loading', () => {
    const hook = readFileSync(path.join(ROOT, 'modules/usePoolsExplorePools.ts'), 'utf8')
    expect(hook).toContain('lastGoodExploreByChain')
    expect(hook).toContain('Showing last known active pools while refreshing')
  })
})
