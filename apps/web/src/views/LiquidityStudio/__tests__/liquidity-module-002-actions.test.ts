/**
 * LIQUIDITY_MODULE_002_ACTIONS — Hero freeze, two journeys, CTA routes, no execution.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { LIQUIDITY_ACTIONS_COPY, LIQUIDITY_MODULE_001_FREEZE, liquidityActions } from '../modules/liquidityActionsTokens'
import { LIQUIDITY_MODULE_PLAN } from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

describe('LIQUIDITY_MODULE_002 Actions', () => {
  it('keeps Module 001 Hero sources frozen (byte-identical)', () => {
    const heroMod = path.join(STUDIO, 'modules/LiquidityHeroModule.tsx')
    const heroTokens = path.join(STUDIO, 'modules/liquidityHeroTokens.ts')
    expect(sha256File(heroMod)).toBe(LIQUIDITY_MODULE_001_FREEZE.LiquidityHeroModule)
    expect(sha256File(heroTokens)).toBe(LIQUIDITY_MODULE_001_FREEZE.liquidityHeroTokens)

    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityHeroModule')
    expect(page).toContain('data-liquidity-module-001="mounted"')
  })

  it('locks Actions geometry (1376 container / 24 gap / ~676 cards)', () => {
    expect(liquidityActions.contentMax).toBe('1376px')
    expect(liquidityActions.columnGap).toBe('24px')
    expect(liquidityActions.cardW).toBe('676px')
    expect(liquidityActions.gapAfterHero).toBe('16px')
    const pair =
      parseInt(liquidityActions.cardW, 10) +
      parseInt(liquidityActions.columnGap, 10) +
      parseInt(liquidityActions.cardW, 10)
    expect(pair).toBe(1376)

    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain('data-liquidity-actions-geometry="1376-24-676"')
    expect(mod).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)')
    expect(mod).toContain(`max-width: \${liquidityActions.twoColMin}`)
  })

  it('renders two primary actions with locked factual copy and steps', () => {
    expect(LIQUIDITY_ACTIONS_COPY.manual.title).toBe('Add Liquidity')
    expect(LIQUIDITY_ACTIONS_COPY.manual.description).toBe(
      'Provide liquidity to existing pools or create a new position.',
    )
    expect([...LIQUIDITY_ACTIONS_COPY.manual.steps]).toEqual([
      'Select Pool',
      'Deposit Pair',
      'Receive LP Tokens',
    ])
    expect(LIQUIDITY_ACTIONS_COPY.manual.cta).toBe('Add Liquidity')

    expect(LIQUIDITY_ACTIONS_COPY.aiBuilder.title).toBe('AI Liquidity Builder')
    expect(LIQUIDITY_ACTIONS_COPY.aiBuilder.description).toBe(
      'Let Melega progressively build liquidity while you keep ownership.',
    )
    expect([...LIQUIDITY_ACTIONS_COPY.aiBuilder.steps]).toEqual([
      'Choose Token',
      'Set Budget',
      'Select Strategy',
      'Liquidity Growth',
    ])
    expect(LIQUIDITY_ACTIONS_COPY.aiBuilder.cta).toBe('Create Liquidity Plan')

    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain('liquidity-actions-manual')
    expect(mod).toContain('liquidity-actions-ai')
    expect(mod).toContain('↓')
  })

  it('locks CTA routes and honest AI unavailable contract', () => {
    expect(liquidityActions.manualHref).toBe('/add')
    expect(liquidityActions.aiBuilderHref).toBe('/liquidity-studio')
    expect(typeof liquidityActions.aiBuilderAvailable).toBe('boolean')

    const tokens = load('modules/liquidityActionsTokens.ts')
    expect(tokens).toContain("manualHref: '/add'")
    expect(tokens).toContain("aiBuilderHref: '/liquidity-studio'")

    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain('liquidity-actions-cta-manual')
    expect(mod).toContain('liquidityActions.manualHref')
    expect(mod).toContain('liquidityActions.aiBuilderHref')
    expect(mod).toContain('liquidity-actions-ai-unavailable')
    expect(mod).toContain('LIQUIDITY_ACTIONS_COPY.aiBuilder.unavailableBody')
  })

  it('introduces no execution logic, runtime, or fake metrics', () => {
    const bundle = [
      load('modules/LiquidityActionsModule.tsx'),
      load('modules/liquidityActionsTokens.ts'),
    ].join('\n')

    expect(bundle).not.toContain('liquidityRuntime/')
    expect(bundle).not.toContain('useLiquidityRuntime')
    expect(bundle).not.toContain('useLiquidityMintRuntime')
    expect(bundle).not.toContain('liquidityBuilding/')
    expect(bundle).not.toContain('AddLiquidityV2')
    expect(bundle).not.toContain('useAccount')
    expect(bundle).not.toMatch(/\$\d/)
    expect(bundle).not.toMatch(/\bTVL\b/)
    expect(bundle).not.toMatch(/\bAPR\b/)
    expect(bundle).not.toMatch(/\bvolume\b/i)
  })

  it('mounts Module 002 after Hero and above frozen legacy Pool', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityActionsModule')
    expect(page).toContain('data-liquidity-module-002="mounted"')
    expect(page).toContain('views/Pool')
    expect(page).toContain('data-liquidity-legacy-body="LEGACY_IMPLEMENTATION"')

    const heroIdx = page.indexOf('<LiquidityHeroModule')
    const actionsIdx = page.indexOf('<LiquidityActionsModule')
    const legacyIdx = page.indexOf('data-liquidity-legacy-body')
    expect(heroIdx).toBeGreaterThan(-1)
    expect(actionsIdx).toBeGreaterThan(heroIdx)
    expect(legacyIdx).toBeGreaterThan(actionsIdx)

    const screen = load('LiquidityStudioScreen.tsx')
    expect(screen).not.toContain('LiquidityActionsModule')
  })

  it('responsive tokens support tablet two-col and mobile single-col', () => {
    expect(liquidityActions.mobile390).toBe('390px')
    expect(liquidityActions.mobile430).toBe('430px')
    expect(liquidityActions.mobileBreak).toBe('767px')
    expect(liquidityActions.twoColMin).toBe('900px')

    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain('grid-template-columns: 1fr')
  })

  it('records Module 002 ownership and plan certification', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('LiquidityActionsModule.tsx')
    expect(map).toContain('liquidityActionsTokens.ts')
    expect(map).toContain('liquidity-module-002-actions')
    expect(LIQUIDITY_MODULE_PLAN.find((m) => m.id === '002-liquidity-actions')?.phase).toBe(
      'certified-by-this-mission',
    )
  })

  it('evidence folder exists for Module 002 certification artifacts', () => {
    const evidence = path.join(WEB, 'docs/runtime/liquidity-module-002-actions')
    expect(existsSync(evidence)).toBe(true)
    expect(existsSync(path.join(evidence, 'report.md'))).toBe(true)
    expect(existsSync(path.join(evidence, 'test-summary.json'))).toBe(true)
    expect(existsSync(path.join(evidence, 'geometry-evidence.json'))).toBe(true)
  })
})
