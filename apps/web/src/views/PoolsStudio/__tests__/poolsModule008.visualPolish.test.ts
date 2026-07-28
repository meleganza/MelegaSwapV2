/**
 * POOLS_MODULE_008 — Final Visual Polish focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  POOLS_MODULE_001_FREEZE_SHA256,
  POOLS_MODULE_002_FREEZE_SHA256,
  POOLS_MODULE_003_FREEZE_SHA256,
  POOLS_MODULE_004_FREEZE_SHA256,
  POOLS_MODULE_005_FREEZE_SHA256,
  POOLS_MODULE_006_FREEZE_SHA256,
  POOLS_MODULE_007_FREEZE_SHA256,
  poolsVisualPolish,
} from '../modules/poolsVisualPolishTokens'
import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')

function sha256File(relFromWeb: string): string {
  return createHash('sha256').update(readFileSync(path.join(WEB, relFromWeb))).digest('hex')
}

describe('POOLS_MODULE_008 Final Visual Polish', () => {
  it('freezes Architecture 000 mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(poolsVisualPolish.mockupSha256)
  })

  it('freezes Modules 001–007 sources byte-identically', () => {
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsOverviewKpisModule.tsx')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.PoolsOverviewKpisModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx')).toBe(
      POOLS_MODULE_003_FREEZE_SHA256.PoolsMyPositionsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.PoolsExplorePoolsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsFinishedPoolsModule.tsx')).toBe(
      POOLS_MODULE_005_FREEZE_SHA256.PoolsFinishedPoolsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsRewardAdvisorModule.tsx')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.PoolsRewardAdvisorModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsRewardAdvisor.ts')).toBe(
      POOLS_MODULE_006_FREEZE_SHA256.buildPoolsRewardAdvisor,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsAnalyticsModule.tsx')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.PoolsAnalyticsModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsAnalyticsPanel.tsx')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.PoolsAnalyticsPanel,
    )
    expect(sha256File('src/views/PoolsStudio/modules/buildPoolsAnalytics.ts')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.buildPoolsAnalytics,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsAnalytics.ts')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.usePoolsAnalytics,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsAnalyticsTokens.ts')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.poolsAnalyticsTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsAnalyticsTypes.ts')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.poolsAnalyticsTypes,
    )
  })

  it('mounts polish style layer; Modules 009–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('PoolsVisualPolishModule')
    expect(screen).toContain('data-pools-module-008="mounted"')
    expect(screen).not.toContain('data-pools-module="009"')
    expect(screen).not.toContain('PoolsIntegrationModule')
  })

  it('polish is style-only — no geometry / runtime / business logic', () => {
    const polish = readFileSync(path.join(MODULES, 'PoolsVisualPolishStyle.tsx'), 'utf8')
    const mod = readFileSync(path.join(MODULES, 'PoolsVisualPolishModule.tsx'), 'utf8')
    expect(polish).toContain('[data-pools-studio-screen]')
    expect(polish).toContain('--pools-polish-ms')
    expect(polish).toContain('focus-visible')
    expect(polish).toContain('prefers-reduced-motion')
    expect(polish).toContain('scrollbar')
    expect(polish).toContain('poolsVisualPolish.cardShadow')
    expect(mod).toContain('PoolsVisualPolishStyle')
    expect(mod).not.toContain('usePoolsRuntime')
    expect(mod).not.toContain('requestModal')
    expect(mod).not.toContain('fetch(')
    expect(poolsVisualPolish.transitionMs).toBe('120ms')

    const withoutScrollbar = polish.replace(/@media[\s\S]*scrollbar[\s\S]*\}\s*\}/, '')
    expect(withoutScrollbar).not.toContain('padding:')
    expect(withoutScrollbar).not.toContain('margin:')
    expect(withoutScrollbar).not.toContain('grid-template')
    expect(withoutScrollbar).not.toMatch(/\b(height|width|max-height|max-width|min-width):\s*\d/)
  })

  it('uses restrained gold accent consistent with Liquidity polish', () => {
    expect(poolsVisualPolish.gold).toBe('#C9A84A')
    expect(poolsVisualPolish.transitionMs).toBe('120ms')
    expect(poolsVisualPolish.cardShadow).toContain('0 16px 40px')
  })

  it('does not modify Modules 001–007 source files in this mission', () => {
    // Guard: polish module files are the only new module sources for 008
    expect(existsSync(path.join(MODULES, 'PoolsVisualPolishStyle.tsx'))).toBe(true)
    expect(existsSync(path.join(MODULES, 'PoolsVisualPolishModule.tsx'))).toBe(true)
    expect(existsSync(path.join(MODULES, 'poolsVisualPolishTokens.ts'))).toBe(true)
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsAnalyticsModule.tsx')).toBe(
      POOLS_MODULE_007_FREEZE_SHA256.PoolsAnalyticsModule,
    )
  })
})
