/**
 * FARMS_MODULE_008 — Final Visual Polish focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  FARMS_ARCHITECTURE_000_TIP,
  FARMS_MODULE_001_FREEZE_SHA256,
  FARMS_MODULE_002_FREEZE_SHA256,
  FARMS_MODULE_003_FREEZE_SHA256,
  FARMS_MODULE_004_FREEZE_SHA256,
  FARMS_MODULE_005_FREEZE_SHA256,
  FARMS_MODULE_006_FREEZE_SHA256,
  FARMS_MODULE_007_FREEZE_SHA256,
  FARMS_MODULE_007_TIP,
  farmsVisualPolish,
} from '../modules/farmsVisualPolishTokens'
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')
const sha = (rel: string) => createHash('sha256').update(readFileSync(path.join(WEB, rel))).digest('hex')

describe('FARMS_MODULE_008 Final Visual Polish', () => {
  it('freezes Architecture 000 mockup SHA and certified tips', () => {
    const mockup = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(farmsVisualPolish.mockupSha256)
    expect(FARMS_ARCHITECTURE_000_TIP.startsWith('8edd68d4')).toBe(true)
    expect(FARMS_MODULE_007_TIP.startsWith('17a901c9')).toBe(true)
  })

  it('freezes Modules 001–007 sources byte-identically', () => {
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.FarmsOverviewKpisModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmsModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsFinishedFarmsModule.tsx')).toBe(
      FARMS_MODULE_005_FREEZE_SHA256.FarmsFinishedFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsYieldAdvisorModule.tsx')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.FarmsYieldAdvisorModule,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsYieldAdvisor.ts')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.buildFarmsYieldAdvisor,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsAnalyticsModule.tsx')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.FarmsAnalyticsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsAnalyticsPanel.tsx')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.FarmsAnalyticsPanel,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsAnalytics.ts')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.buildFarmsAnalytics,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsAnalytics.ts')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.useFarmsAnalytics,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsAnalyticsTokens.ts')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.farmsAnalyticsTokens,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsAnalyticsTypes.ts')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.farmsAnalyticsTypes,
    )
  })

  it('mounts polish style layer; Modules 009–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('FarmsVisualPolishModule')
    expect(screen).toContain('data-farms-module-008="mounted"')
    expect(screen).not.toContain('data-farms-module="009"')
    expect(screen).not.toContain('FarmsIntegrationModule')
  })

  it('polish is style-only — no geometry / runtime / business logic', () => {
    const polish = readFileSync(path.join(MODULES, 'FarmsVisualPolishStyle.tsx'), 'utf8')
    const mod = readFileSync(path.join(MODULES, 'FarmsVisualPolishModule.tsx'), 'utf8')
    expect(polish).toContain('[data-farms-studio-screen]')
    expect(polish).toContain('--farms-polish-ms')
    expect(polish).toContain('focus-visible')
    expect(polish).toContain('prefers-reduced-motion')
    expect(polish).toContain('scrollbar')
    expect(polish).toContain('farmsVisualPolish.cardShadow')
    expect(mod).toContain('FarmsVisualPolishStyle')
    expect(mod).not.toContain('useFarmsRuntime')
    expect(mod).not.toContain('requestModal')
    expect(mod).not.toContain('fetch(')
    expect(farmsVisualPolish.transitionMs).toBe('120ms')

    const withoutScrollbar = polish.replace(/@media[\s\S]*scrollbar[\s\S]*\}\s*\}/, '')
    expect(withoutScrollbar).not.toContain('padding:')
    expect(withoutScrollbar).not.toContain('margin:')
    expect(withoutScrollbar).not.toContain('grid-template')
    expect(withoutScrollbar).not.toMatch(/\b(height|width|max-height|max-width|min-width):\s*\d/)
  })

  it('uses restrained gold accent consistent with Liquidity / Pools polish', () => {
    expect(farmsVisualPolish.gold).toBe('#C9A84A')
    expect(farmsVisualPolish.canvas).toBe('#0D0D0D')
    expect(farmsVisualPolish.transitionMs).toBe('120ms')
    expect(farmsVisualPolish.cardShadow).toContain('0 16px 40px')
  })

  it('does not modify Modules 001–007 source files in this mission', () => {
    expect(existsSync(path.join(MODULES, 'FarmsVisualPolishStyle.tsx'))).toBe(true)
    expect(existsSync(path.join(MODULES, 'FarmsVisualPolishModule.tsx'))).toBe(true)
    expect(existsSync(path.join(MODULES, 'farmsVisualPolishTokens.ts'))).toBe(true)
    expect(sha('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsAnalyticsModule.tsx')).toBe(
      FARMS_MODULE_007_FREEZE_SHA256.FarmsAnalyticsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsYieldAdvisorModule.tsx')).toBe(
      FARMS_MODULE_006_FREEZE_SHA256.FarmsYieldAdvisorModule,
    )
  })

  it('ships no production mock polish fixtures', () => {
    const src = [
      readFileSync(path.join(MODULES, 'FarmsVisualPolishStyle.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'FarmsVisualPolishModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'farmsVisualPolishTokens.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('mockPolish')
    expect(src).not.toContain('SAMPLE_')
    expect(src).not.toContain('fakeApr')
  })
})
