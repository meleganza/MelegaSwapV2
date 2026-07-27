/**
 * LIQUIDITY_MODULE_008 — Final Visual Polish focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  LIQUIDITY_ARCHITECTURE_000_TIP,
  LIQUIDITY_MODULE_001_FREEZE_SHA256,
  LIQUIDITY_MODULE_002_FREEZE_SHA256,
  LIQUIDITY_MODULE_003_FREEZE_SHA256,
  LIQUIDITY_MODULE_004_FREEZE_SHA256,
  LIQUIDITY_MODULE_005_FREEZE_SHA256,
  LIQUIDITY_MODULE_006_FREEZE_SHA256,
  LIQUIDITY_MODULE_007_FREEZE_SHA256,
  LIQUIDITY_MODULE_007_TIP,
  LIQUIDITY_RUNTIME_FREEZE_SHA256,
  liquidityVisualPolish,
} from '../modules/liquidityVisualPolishTokens'
import { LIQUIDITY_FOUNDER_MOCKUP, LIQUIDITY_MODULE_PLAN } from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')
const sha = (rel: string) => createHash('sha256').update(readFileSync(path.join(WEB, rel))).digest('hex')

describe('LIQUIDITY_MODULE_008 Final Visual Polish', () => {
  it('freezes Architecture 000 mockup SHA and certified tips', () => {
    const mockup = path.join(REPO, LIQUIDITY_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(LIQUIDITY_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(liquidityVisualPolish.mockupSha256)
    expect(LIQUIDITY_ARCHITECTURE_000_TIP.startsWith('e9708c78')).toBe(true)
    expect(LIQUIDITY_MODULE_007_TIP.startsWith('7de01db4')).toBe(true)
  })

  it('freezes Modules 001–007 sources byte-identically', () => {
    expect(sha('src/views/LiquidityStudio/modules/LiquidityHeroModule.tsx')).toBe(
      LIQUIDITY_MODULE_001_FREEZE_SHA256.LiquidityHeroModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/liquidityHeroTokens.ts')).toBe(
      LIQUIDITY_MODULE_001_FREEZE_SHA256.liquidityHeroTokens,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityActionsModule.tsx')).toBe(
      LIQUIDITY_MODULE_002_FREEZE_SHA256.LiquidityActionsModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityPoolDiscoveryModule.tsx')).toBe(
      LIQUIDITY_MODULE_003_FREEZE_SHA256.LiquidityPoolDiscoveryModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityPoolDiscoveryCard.tsx')).toBe(
      LIQUIDITY_MODULE_003_FREEZE_SHA256.LiquidityPoolDiscoveryCard,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityAddModule.tsx')).toBe(
      LIQUIDITY_MODULE_004_FREEZE_SHA256.LiquidityAddModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/liquidityAddTokens.ts')).toBe(
      LIQUIDITY_MODULE_004_FREEZE_SHA256.liquidityAddTokens,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityMarketSnapshotModule.tsx')).toBe(
      LIQUIDITY_MODULE_005_FREEZE_SHA256.LiquidityMarketSnapshotModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/buildLiquidityMarketSnapshot.ts')).toBe(
      LIQUIDITY_MODULE_005_FREEZE_SHA256.buildLiquidityMarketSnapshot,
    )
    expect(sha('src/views/LiquidityStudio/modules/useLiquidityMarketSnapshot.ts')).toBe(
      LIQUIDITY_MODULE_005_FREEZE_SHA256.useLiquidityMarketSnapshot,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx')).toBe(
      LIQUIDITY_MODULE_006_FREEZE_SHA256.LiquidityMyPositionsModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/liquidityMyPositionsModel.ts')).toBe(
      LIQUIDITY_MODULE_006_FREEZE_SHA256.liquidityMyPositionsModel,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityAnalyticsModule.tsx')).toBe(
      LIQUIDITY_MODULE_007_FREEZE_SHA256.LiquidityAnalyticsModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/buildLiquidityAnalytics.ts')).toBe(
      LIQUIDITY_MODULE_007_FREEZE_SHA256.buildLiquidityAnalytics,
    )
    expect(sha('src/views/LiquidityStudio/modules/useLiquidityAnalytics.ts')).toBe(
      LIQUIDITY_MODULE_007_FREEZE_SHA256.useLiquidityAnalytics,
    )
    expect(sha('src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx')).toBe(
      LIQUIDITY_RUNTIME_FREEZE_SHA256.useLiquidityMintRuntime,
    )
    expect(sha('src/views/LiquidityStudio/liquidityRuntime/LiquidityRuntimeContext.tsx')).toBe(
      LIQUIDITY_RUNTIME_FREEZE_SHA256.LiquidityRuntimeContext,
    )
  })

  it('mounts polish style layer after Analytics; Modules 009–010 stay unmounted', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityVisualPolishModule')
    expect(page).toContain('data-liquidity-module-008="mounted"')
    expect(page).toContain('data-liquidity-studio-screen')
    expect(page).not.toContain('data-liquidity-module-009')
    expect(page).not.toContain('LiquidityIntegrationModule')

    const analytics = page.indexOf('<LiquidityAnalyticsModule')
    const polish = page.indexOf('<LiquidityVisualPolishModule')
    const legacy = page.indexOf('data-liquidity-legacy-body')
    expect(polish).toBeGreaterThan(-1)
    expect(analytics).toBeGreaterThan(-1)
    expect(legacy).toBeGreaterThan(Math.max(polish, analytics))
  })

  it('polish is style-only — no geometry / runtime / business logic', () => {
    const polish = readFileSync(path.join(MODULES, 'LiquidityVisualPolishStyle.tsx'), 'utf8')
    const mod = readFileSync(path.join(MODULES, 'LiquidityVisualPolishModule.tsx'), 'utf8')
    expect(polish).toContain('[data-liquidity-studio-screen]')
    expect(polish).toContain('--liquidity-polish-ms')
    expect(polish).toContain('focus-visible')
    expect(polish).toContain('prefers-reduced-motion')
    expect(polish).toContain('scrollbar')
    expect(polish).toContain('liquidityVisualPolish.cardShadow')
    expect(mod).toContain('LiquidityVisualPolishStyle')
    expect(mod).not.toContain('useLiquidityRuntime')
    expect(mod).not.toContain('useLiquidityAnalytics')
    expect(mod).not.toContain('fetch(')
    expect(liquidityVisualPolish.transitionMs).toBe('120ms')

    const withoutScrollbar = polish.replace(/@media[\s\S]*scrollbar[\s\S]*\}\s*\}/, '')
    expect(withoutScrollbar).not.toContain('padding:')
    expect(withoutScrollbar).not.toContain('margin:')
    expect(withoutScrollbar).not.toContain('grid-template')
    expect(withoutScrollbar).not.toMatch(/\b(height|width|max-height|max-width|min-width):\s*\d/)
  })

  it('uses restrained gold accent consistent with Pools / Farms polish', () => {
    expect(liquidityVisualPolish.gold).toBe('#C9A84A')
    expect(liquidityVisualPolish.canvas).toBe('#0D0D0D')
    expect(liquidityVisualPolish.transitionMs).toBe('120ms')
    expect(liquidityVisualPolish.cardShadow).toContain('0 16px 40px')
    expect(liquidityVisualPolish.cardRadius).toBe('14px')
  })

  it('certifies Module 008 in architecture plan and ships evidence paths', () => {
    const plan = LIQUIDITY_MODULE_PLAN.find((m) => m.id === '008-visual-polish')
    expect(plan?.phase).toBe('certified-by-this-mission')
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_008_FINAL_VISUAL_POLISH_REPORT.md'))).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/liquidity-module-008-final-visual-polish'))).toBe(true)
  })

  it('ships no production mock polish fixtures', () => {
    const src = [
      readFileSync(path.join(MODULES, 'LiquidityVisualPolishStyle.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'LiquidityVisualPolishModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'liquidityVisualPolishTokens.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('mockPolish')
    expect(src).not.toContain('SAMPLE_')
    expect(src).not.toContain('fakeApr')
  })

  it('does not modify Modules 001–007 source files in this mission', () => {
    expect(existsSync(path.join(MODULES, 'LiquidityVisualPolishStyle.tsx'))).toBe(true)
    expect(sha('src/views/LiquidityStudio/modules/LiquidityHeroModule.tsx')).toBe(
      LIQUIDITY_MODULE_001_FREEZE_SHA256.LiquidityHeroModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityAddModule.tsx')).toBe(
      LIQUIDITY_MODULE_004_FREEZE_SHA256.LiquidityAddModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx')).toBe(
      LIQUIDITY_MODULE_006_FREEZE_SHA256.LiquidityMyPositionsModule,
    )
    expect(sha('src/views/LiquidityStudio/modules/LiquidityAnalyticsModule.tsx')).toBe(
      LIQUIDITY_MODULE_007_FREEZE_SHA256.LiquidityAnalyticsModule,
    )
  })
})
