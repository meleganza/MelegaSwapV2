/**
 * MELEGASWAP_V2_RELEASE_CANDIDATE_RC2_USER_JOURNEY_OPTIMIZATION
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  FOUNDER_JOURNEY,
  INVESTOR_JOURNEY,
  LIQUIDITY_MANAGER_JOURNEY,
  getNextStep,
  resolveJourneyContext,
} from 'lib/user-journeys'
import { shellBottomNavItems } from 'app-shell/config/navigation'

const WEB = path.resolve(__dirname, '../../..')
const EVIDENCE = path.join(WEB, 'docs/runtime/melegaswap-v2-release-candidate-rc2-user-journey')

function load(rel: string) {
  return readFileSync(path.join(WEB, 'src', rel), 'utf8')
}

describe('MELEGASWAP_V2_RC2_USER_JOURNEY', () => {
  it('Founder journey steps: Create Token → Liquidity → Farm → Featured → Trend Boost → Project', () => {
    const labels = FOUNDER_JOURNEY.steps.map((s) => s.id)
    expect(labels).toEqual([
      'landing',
      'create_token',
      'liquidity',
      'create_farm',
      'featured',
      'trend_boost',
      'project_page',
      'done',
    ])
    expect(getNextStep(FOUNDER_JOURNEY, 'create_token')?.id).toBe('liquidity')
    expect(getNextStep(FOUNDER_JOURNEY, 'liquidity')?.id).toBe('create_farm')
    expect(getNextStep(FOUNDER_JOURNEY, 'create_farm')?.id).toBe('featured')
  })

  it('Investor journey steps: Trending → Project → Buy → Wallet → Farm → Pool', () => {
    const labels = INVESTOR_JOURNEY.steps.map((s) => s.id)
    expect(labels).toContain('trending')
    expect(labels).toContain('buy_token')
    expect(labels).toContain('farm')
    expect(labels).toContain('pool')
    expect(getNextStep(INVESTOR_JOURNEY, 'trending')?.id).toBe('project_page')
    expect(getNextStep(INVESTOR_JOURNEY, 'project_page')?.id).toBe('buy_token')
  })

  it('Liquidity Manager journey: Portfolio → Programs → Analytics → Docs → Create', () => {
    expect(LIQUIDITY_MANAGER_JOURNEY.steps.map((s) => s.id)).toEqual([
      'portfolio',
      'programs',
      'analytics',
      'documentation',
      'create_program',
    ])
    expect(getNextStep(LIQUIDITY_MANAGER_JOURNEY, 'documentation')?.id).toBe('create_program')
  })

  it('mounts journey rails on primary surfaces', () => {
    expect(load('views/ListStudio/ListStudioScreen.tsx')).toContain('list-founder-journey')
    expect(load('views/HomeTrade/DexHomeScreen.tsx')).toContain('home-investor-journey')
    expect(load('views/TrendingStudio/components/TrendingStudioPageHeader.tsx')).toContain(
      'trending-investor-journey',
    )
    expect(load('views/LiquidityStudio/onePage/UnifiedLiquidityPage.tsx')).toContain(
      'liquidity-founder-journey',
    )
    expect(load('views/FarmsStudio/FarmsStudioScreen.tsx')).toContain('farms-founder-journey')
    expect(load('views/PoolsStudio/PoolsStudioScreen.tsx')).toContain('pools-investor-journey')
    expect(load('views/ProjectPage/v1/ProjectPageV1Shell.tsx')).toContain('project-investor-journey')
    expect(load('views/ListStudio/ListWorkspace.tsx')).toContain('list-create-token-next')
    expect(load('views/ListStudio/ListWorkspace.tsx')).toContain('list-create-token-featured')
  })

  it('resolves pathname context for journeys', () => {
    expect(resolveJourneyContext('/list')?.journeyId).toBe('founder')
    expect(resolveJourneyContext('/trending')?.stepId).toBe('trending')
    expect(resolveJourneyContext('/liquidity-studio')?.journeyId).toBe('liquidity_manager')
    expect(resolveJourneyContext('/')?.stepId).toBe('landing')
  })

  it('mobile bottom nav exposes Trending + List for journey discoverability', () => {
    expect(shellBottomNavItems.map((i) => i.id)).toEqual([
      'home',
      'trending',
      'liquidity',
      'farms',
      'list',
    ])
  })

  it('responsive: journey rail CSS collapses Here/Next on small screens', () => {
    const rail = load('views/shared/journeys/JourneyGuideRail.tsx')
    expect(rail).toContain('@media (max-width: 639px)')
    expect(rail).toContain('What you can do here')
    expect(rail).toContain('What to do next')
  })

  it('evidence pack present', () => {
    for (const name of [
      'MISSION_REPORT.md',
      'journey-map.json',
      'cta-flow.json',
      'friction-report.json',
      'before-after.json',
      'tests.json',
      'build.json',
    ]) {
      expect(existsSync(path.join(EVIDENCE, name)), name).toBe(true)
    }
    expect(readFileSync(path.join(EVIDENCE, 'MISSION_REPORT.md'), 'utf8')).toContain(
      'MELEGASWAP_V2_RC2_USER_JOURNEY_COMPLETE',
    )
  })
})
