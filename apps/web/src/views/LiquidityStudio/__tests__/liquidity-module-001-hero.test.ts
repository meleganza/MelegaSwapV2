/**
 * LIQUIDITY_MODULE_001_HERO — Architecture 000 freeze, mount, geometry, responsive.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { LIQUIDITY_HERO_COPY, liquidityHero } from '../modules/liquidityHeroTokens'
import {
  LIQUIDITY_FOUNDER_MOCKUP,
  LIQUIDITY_LEGACY_IMPLEMENTATION,
  LIQUIDITY_MODULE_PLAN,
  LIQUIDITY_PRIMARY_JOURNEYS,
} from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

describe('LIQUIDITY_MODULE_001 Hero', () => {
  it('keeps Architecture 000 Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, LIQUIDITY_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(LIQUIDITY_FOUNDER_MOCKUP.sha256)
    expect(sha).toBe(liquidityHero.mockupSha256)
    expect(bytes.length).toBe(LIQUIDITY_FOUNDER_MOCKUP.bytes)
  })

  it('locks Architecture 000 freeze: legacy Pool / Studio / runtime not feature-edited', () => {
    expect(LIQUIDITY_LEGACY_IMPLEMENTATION.label).toBe('LEGACY_IMPLEMENTATION')
    expect(LIQUIDITY_LEGACY_IMPLEMENTATION.navMount).toBe('views/Pool')

    const poolIndex = path.join(WEB, 'src/views/Pool/index.tsx')
    expect(existsSync(poolIndex)).toBe(true)

    const screen = load('LiquidityStudioScreen.tsx')
    expect(screen).toContain('UnifiedLiquidityPage')
    expect(screen).toContain('LiquidityRuntimeProvider')
    expect(screen).not.toContain('LiquidityHeroModule')

    const runtimeDir = path.join(STUDIO, 'liquidityRuntime')
    expect(existsSync(runtimeDir)).toBe(true)

    const heroBundle = [
      load('modules/LiquidityHeroModule.tsx'),
      load('modules/LiquidityHeroArtwork.tsx'),
      load('modules/LiquidityHeroTrustPanel.tsx'),
      load('modules/liquidityHeroTokens.ts'),
    ].join('\n')
    expect(heroBundle).not.toContain('liquidityRuntime/')
    expect(heroBundle).not.toContain('useLiquidityRuntime')
    expect(heroBundle).not.toContain('from \'config/constants/contracts\'')
    expect(heroBundle).not.toContain('exchange.ts')
  })

  it('locks Hero geometry contracts (1376×260 / 440+48+480+48+360)', () => {
    expect(liquidityHero.heroW).toBe('1376px')
    expect(liquidityHero.heroH).toBe('260px')
    expect(liquidityHero.topAfterTrending).toBe('24px')
    expect(liquidityHero.leftW).toBe('440px')
    expect(liquidityHero.artworkW).toBe('480px')
    expect(liquidityHero.trustW).toBe('360px')
    expect(liquidityHero.columnGap).toBe('48px')
    expect(liquidityHero.trustBoxW).toBe('360px')
    expect(liquidityHero.trustBoxH).toBe('230px')
    expect(liquidityHero.artworkBoxW).toBe('480px')
    expect(liquidityHero.artworkBoxH).toBe('230px')
    const sum =
      parseInt(liquidityHero.leftW, 10) +
      parseInt(liquidityHero.columnGap, 10) +
      parseInt(liquidityHero.artworkW, 10) +
      parseInt(liquidityHero.columnGap, 10) +
      parseInt(liquidityHero.trustW, 10)
    expect(sum).toBe(1376)

    const mod = load('modules/LiquidityHeroModule.tsx')
    expect(mod).toContain('data-liquidity-hero-geometry="1376x260"')
    expect(mod).toContain('height: ${liquidityHero.heroH}')
    expect(mod).toContain('max-width: ${liquidityHero.tabletBreak}')
    expect(mod).toContain('max-width: ${liquidityHero.mobileBreak}')
  })

  it('ships locked factual copy, journeys intro, and no fake KPIs', () => {
    expect(LIQUIDITY_HERO_COPY.title).toBe('Liquidity')
    expect(LIQUIDITY_HERO_COPY.description).toBe('Provide liquidity.\nEarn fees.\nGrow markets.')
    expect(LIQUIDITY_HERO_COPY.primaryCta).toBe('Add Liquidity')
    expect(LIQUIDITY_HERO_COPY.trustTitle).toBe('Why provide liquidity?')
    expect(LIQUIDITY_HERO_COPY.trustItems).toHaveLength(4)
    expect(LIQUIDITY_HERO_COPY.trustItems.map((i) => i.title)).toEqual([
      'Non-custodial Ownership',
      'Transparent Pools',
      'Earn Fees',
      'Open Ecosystem',
    ])
    expect(LIQUIDITY_HERO_COPY.journeys).toMatch(/manually/i)
    expect(LIQUIDITY_HERO_COPY.journeys).toMatch(/Melega AI Liquidity Builder/)
    expect([...LIQUIDITY_PRIMARY_JOURNEYS]).toEqual([
      'Provide liquidity manually',
      'Use Melega AI Liquidity Builder',
    ])

    const uiSrc = [
      load('modules/LiquidityHeroModule.tsx'),
      load('modules/LiquidityHeroTrustPanel.tsx'),
      load('modules/LiquidityHeroArtwork.tsx'),
      JSON.stringify(LIQUIDITY_HERO_COPY),
    ].join('\n')

    expect(uiSrc).not.toMatch(/\$\d/)
    expect(uiSrc).not.toMatch(/\bTVL\b/)
    expect(uiSrc).not.toMatch(/\bvolume\b/i)
    expect(uiSrc).not.toContain('useAccount')
    expect(uiSrc).not.toContain('AI Liquidity Builder execution')
  })

  it('mounts Module 001 above legacy Pool on /liquidity without editing Pool', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityHeroModule')
    expect(page).toContain('data-liquidity-module-001="mounted"')
    expect(page).toContain('views/Pool')
    expect(page).toContain('data-liquidity-legacy-body="LEGACY_IMPLEMENTATION"')
    expect(page).toContain('<Liquidity />')
    expect(page).not.toContain('LiquidityArchitectureShell')
    expect(page).not.toContain('UnifiedLiquidityPage')

    // Pool implementation file remains outside Module 001 ownership edits in this mission
    // (mount-only page wrapper). Studio one-page stack not cut over.
    const studioPage = readFileSync(path.join(WEB, 'src/pages/liquidity-studio.tsx'), 'utf8')
    expect(studioPage).toContain('LiquidityStudioScreen')
    expect(studioPage).not.toContain('LiquidityHeroModule')
  })

  it('uses Add Liquidity link only — no Module 004 form / AI Builder execution', () => {
    expect(liquidityHero.addLiquidityHref).toBe('/add')
    const tokens = load('modules/liquidityHeroTokens.ts')
    expect(tokens).toContain("addLiquidityHref: '/add'")
    const mod = load('modules/LiquidityHeroModule.tsx')
    expect(mod).toContain('liquidity-hero-cta-add')
    expect(mod).toContain('liquidityHero.addLiquidityHref')
    expect(mod).not.toContain('AddLiquidityV2')
    expect(mod).not.toContain('liquidityBuilding')
    expect(mod).not.toContain('Start Liquidity Building')
  })

  it('artwork communicates Token → Pool → LP without Farms/Pools reuse or fake numbers', () => {
    const art = load('modules/LiquidityHeroArtwork.tsx')
    expect(art).toContain('Token')
    expect(art).toContain('Pool')
    expect(art).toContain('LP')
    expect(art).toContain('aria-hidden')
    expect(art).not.toContain('FarmsHeroArtwork')
    expect(art).not.toContain('PoolsHeroArtwork')
    expect(art).not.toContain('LP Pair')
    expect(art).not.toContain('Reward Token')
    expect(art).not.toMatch(/\b\d{1,3}\.\d+%\b/)
    expect(art).not.toMatch(/\$\d/)
  })

  it('records Module 001 ownership and plan certification', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('LiquidityHeroModule.tsx')
    expect(map).toContain('liquidityHeroTokens.ts')
    expect(map).toContain('liquidity-module-001-hero')
    expect(map).toContain('LEGACY_IMPLEMENTATION')
    expect(LIQUIDITY_MODULE_PLAN.find((m) => m.id === '001-hero')?.phase).toBe(
      'certified-by-this-mission',
    )
  })

  it('responsive tokens cover 390 / 430 single-column layout', () => {
    expect(liquidityHero.mobile390).toBe('390px')
    expect(liquidityHero.mobile430).toBe('430px')
    expect(liquidityHero.mobileBreak).toBe('767px')
    expect(liquidityHero.tabletBreak).toBe('1199px')
    expect(liquidityHero.mobileContentW).toBe('358px')
    expect(liquidityHero.mobile430ContentW).toBe('398px')
    expect(liquidityHero.mobileTrustW).toBe('326px')

    const mod = load('modules/LiquidityHeroModule.tsx')
    expect(mod).toContain('grid-template-columns: 1fr')
    expect(mod).toContain('row-gap: 16px')
  })

  it('evidence folder exists for Module 001 certification artifacts', () => {
    const evidence = path.join(WEB, 'docs/runtime/liquidity-module-001-hero')
    expect(existsSync(evidence)).toBe(true)
    expect(existsSync(path.join(evidence, 'report.md'))).toBe(true)
    expect(existsSync(path.join(evidence, 'test-summary.json'))).toBe(true)
    expect(existsSync(path.join(evidence, 'geometry-evidence.json'))).toBe(true)
    expect(existsSync(path.join(evidence, 'freeze-evidence.json'))).toBe(true)
  })
})
