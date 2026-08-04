/**
 * RC2 emergency rollback — journey removal, trending eligibility, inventory, ecosystem.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ECOSYSTEM_DESTINATIONS } from 'views/HomeTrade/ecosystemDestinations'
import {
  countLiveActiveFarmConfigs,
  countLivePoolConfigs,
  listLiveFarmInventoryPreview,
  listLivePoolInventoryPreview,
} from 'lib/data-truth/liveInventoryCounts'
import { shellBottomNavItems } from 'app-shell/config/navigation'
import { GLOBAL_HEADER_NAV } from 'app-shell/config/globalHeaderNav'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('RC2 emergency — journey UI removed', () => {
  it('deletes JourneyGuideRail / PageNextAction modules', () => {
    expect(existsSync(path.join(ROOT, 'views/shared/journeys/JourneyGuideRail.tsx'))).toBe(false)
    expect(existsSync(path.join(ROOT, 'views/shared/journeys/PageNextAction.tsx'))).toBe(false)
    expect(existsSync(path.join(ROOT, 'lib/user-journeys/definitions.ts'))).toBe(false)
  })

  it('product surfaces do not mount journey rails', () => {
    const files = [
      'views/HomeTrade/DexHomeScreen.tsx',
      'views/FarmsStudio/FarmsStudioScreen.tsx',
      'views/LiquidityStudio/onePage/UnifiedLiquidityPage.tsx',
      'views/PoolsStudio/PoolsStudioScreen.tsx',
      'views/ListStudio/ListStudioScreen.tsx',
      'views/TrendingStudio/components/TrendingStudioPageHeader.tsx',
    ]
    for (const f of files) {
      const src = load(f)
      expect(src).not.toMatch(/JourneyGuideRail|PageNextAction|Founder Path|Investor Path/)
    }
  })
})

describe('RC2 emergency — header / bottom nav', () => {
  it('header remains product destinations', () => {
    expect(GLOBAL_HEADER_NAV.map((i) => i.label)).toEqual([
      'Home',
      'Liquidity',
      'Farms',
      'Pools',
      'List',
      'Passport',
    ])
  })

  it('bottom nav restored away from RC2 journey set', () => {
    expect(shellBottomNavItems.map((i) => i.label)).toEqual([
      'Home',
      'Liquidity',
      'Farms',
      'Pools',
      'Passport',
    ])
  })

  it('app remounts page Component on route change and recovers chunk errors', () => {
    const app = load('pages/_app-full.tsx')
    expect(app).toMatch(/key=\{routeKey\}/)
    expect(app).toMatch(/useRouteTransitionRecovery/)
    expect(app).toMatch(/SuspenseWithChunkError/)
  })
})

describe('RC2 emergency — trending eligibility', () => {
  it('does not backfill trending with non-% registry tokens', () => {
    const src = load('views/HomeTrade/useDexTrendingRankings.ts')
    expect(src).not.toMatch(/const backfill = all/)
    expect(src).toMatch(/Never pad empty slots/)
    expect(src).toMatch(/withCredibleMove\.slice/)
  })

  it('requires finite percentage for credible movers', () => {
    const src = load('views/HomeTrade/useDexTrendingRankings.ts')
    expect(src).toMatch(/if \(pct == null \|\| !Number\.isFinite\(pct\)\) return false/)
    expect(src).toMatch(/isCredibleMoverChange/)
  })
})

describe('RC2 emergency — farms/pools inventory', () => {
  it('LIVE configs are non-zero so Home never false-zeros inventory', () => {
    expect(countLiveActiveFarmConfigs()).toBeGreaterThan(0)
    expect(countLivePoolConfigs()).toBeGreaterThan(0)
    expect(listLiveFarmInventoryPreview(3).length).toBeGreaterThan(0)
    expect(listLivePoolInventoryPreview(3).length).toBeGreaterThan(0)
  })
})

describe('RC2 emergency — ecosystem', () => {
  it('removes Radar/Labs and adds BlackPump', () => {
    expect(ECOSYSTEM_DESTINATIONS.find((d) => d.id === 'radar')).toBeUndefined()
    expect(ECOSYSTEM_DESTINATIONS.find((d) => d.id === 'labs')).toBeUndefined()
    expect(ECOSYSTEM_DESTINATIONS.find((d) => d.id === 'blackpump')?.href).toBe('https://blackpump.fun/')
  })
})

describe('RC2 emergency — error UX', () => {
  it('removes BSC-only recovery copy', () => {
    const src = load('components/ErrorBoundary/SentryErrorBoundary.tsx')
    expect(src).not.toMatch(/switch network to BSC Network/)
    expect(src).toMatch(/Return home/)
    expect(src).toMatch(/Technical details/)
    expect(src).toMatch(/Error Tracking Id/)
  })
})

describe('RC2 emergency — Avalanche chain guards', () => {
  it('guards MasterChef polls and farm chain mapping', () => {
    const farmsHooks = load('state/farms/hooks.ts')
    expect(farmsHooks).toMatch(/getMasterChefAddress/)
    const topFarms = load('views/Home/hooks/useGetTopFarmsByApr.tsx')
    expect(topFarms).toMatch(/getFarmConfig\(chainId\)/)
    expect(topFarms).not.toMatch(/ChainId\.BASE/)
    const tokens = readFileSync(
      path.resolve(ROOT, '../../../packages/tokens/src/common.ts'),
      'utf8',
    )
    expect(tokens).toMatch(/ChainId\.AVAX/)
    expect(tokens).toMatch(/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E/)
  })
})
