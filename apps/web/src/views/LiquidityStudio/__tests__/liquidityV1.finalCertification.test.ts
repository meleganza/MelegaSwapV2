/**
 * LIQUIDITY_V1_FINAL — integration & certification guards (no redesign).
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  LIQUIDITY_FOUNDER_MOCKUP,
  LIQUIDITY_MODULE_PLAN,
  LIQUIDITY_PRIMARY_JOURNEYS,
  LIQUIDITY_LEGACY_IMPLEMENTATION,
} from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const FREEZE = path.join(__dirname, 'liquidityV1.final.freeze.sha256.json')

function sha256File(abs: string): string {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

describe('LIQUIDITY_V1 Final Integration & Certification', () => {
  it('locks Founder mockup SHA + Architecture / Module tips', () => {
    const mockup = path.join(REPO, LIQUIDITY_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    expect(sha256File(mockup)).toBe(LIQUIDITY_FOUNDER_MOCKUP.sha256)
    expect(sha256File(mockup)).toBe(
      'c14eea98d6c15e4d9012378597fb6d7414ad9be2595c0ae9acd764053d35147d',
    )
    const lock = JSON.parse(readFileSync(FREEZE, 'utf8'))
    expect(lock.baseTip).toBe('0746ab01')
    expect(lock.architectureTip).toBe('e9708c78')
    expect(lock.mission007).toBe('7de01db4')
    expect(lock.mission008).toBe('0746ab01')
  })

  it('freezes Modules 001–008 + runtime + page + contracts byte-identically', () => {
    const lock = JSON.parse(readFileSync(FREEZE, 'utf8'))
    for (const [rel, expected] of Object.entries(lock.files as Record<string, string>)) {
      const actual = sha256File(path.join(STUDIO, rel))
      expect(actual, rel).toBe(expected)
    }
    for (const [rel, expected] of Object.entries(lock.shared as Record<string, string>)) {
      const actual = sha256File(path.join(STUDIO, rel))
      expect(actual, `shared:${rel}`).toBe(expected)
    }
    for (const [rel, expected] of Object.entries(lock.webFiles as Record<string, string>)) {
      const actual = sha256File(path.join(WEB, rel))
      expect(actual, `web:${rel}`).toBe(expected)
    }
  })

  it('mounts V3 shell with module markers on /liquidity', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    const shell = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx'), 'utf8')
    expect(page).toContain('LiquidityStudioV3Shell')
    for (let n = 1; n <= 8; n++) {
      const id = String(n).padStart(3, '0')
      expect(shell).toContain(`data-liquidity-module-${id}="mounted"`)
    }
    expect(shell).toContain('data-liquidity-studio-screen')
    expect(shell).toContain('data-liquidity-architecture="000"')
    expect(shell).toContain('LiquidityRuntimeProvider')
    expect((shell.match(/<LiquidityRuntimeProvider(?:\s[^>]*)?>/g) || []).length).toBe(1)
    expect(shell).toContain('data-liquidity-ia="v3-tabs"')
    expect(page).not.toContain('data-liquidity-module-009')
  })

  it('architecture plan includes Modules 001–008 and primary liquidity journeys', () => {
    const ids = LIQUIDITY_MODULE_PLAN.map((m) => m.id)
    expect(ids).toContain('000-architecture')
    expect(ids).toContain('001-hero')
    expect(ids).toContain('004-add-liquidity')
    expect(ids).toContain('006-your-positions')
    expect(ids).toContain('007-analytics')
    expect(ids).toContain('008-visual-polish')
    expect(ids).toContain('010-certification')
    expect([...LIQUIDITY_PRIMARY_JOURNEYS]).toEqual([
      'Provide liquidity manually',
      'Use Melega AI Liquidity Builder',
    ])
    expect(LIQUIDITY_LEGACY_IMPLEMENTATION.label).toBe('LEGACY_IMPLEMENTATION')
  })

  it('journey contracts remain wired (manual / AI / positions manage-remove)', () => {
    const hero = readFileSync(path.join(STUDIO, 'modules/liquidityHeroTokens.ts'), 'utf8')
    const actions = readFileSync(path.join(STUDIO, 'modules/liquidityActionsTokens.ts'), 'utf8')
    const positions = readFileSync(path.join(STUDIO, 'modules/LiquidityMyPositionsModule.tsx'), 'utf8')

    expect(hero).toContain("addLiquidityHref: '#add-liquidity'")
    expect(actions).toContain("manualHref: '/add'")
    expect(actions).toContain("aiBuilderHref: '/liquidity-studio'")
    expect(positions).toContain("setMode('Remove Liquidity')")
    expect(positions).toContain("setMode('Add Liquidity')")
    expect(positions).toContain('setSelectedPositionId')
    expect(positions).toContain('ChainSwitchConfirmDialog')
  })

  it('shared runtime boundaries remain single-owner (no nested providers / duplicate scanners)', () => {
    const moduleFiles = [
      'LiquidityAddModule.tsx',
      'LiquidityMarketSnapshotModule.tsx',
      'LiquidityMyPositionsModule.tsx',
      'LiquidityAnalyticsModule.tsx',
      'LiquidityVisualPolishModule.tsx',
      'LiquidityHeroModule.tsx',
      'LiquidityActionsModule.tsx',
      'LiquidityPoolDiscoveryModule.tsx',
    ]
    for (const f of moduleFiles) {
      const src = readFileSync(path.join(STUDIO, 'modules', f), 'utf8')
      expect(src).not.toContain('<LiquidityRuntimeProvider')
      expect(src).not.toContain('LiquidityRuntimeProvider>')
    }
    const positions = readFileSync(path.join(STUDIO, 'modules/LiquidityMyPositionsModule.tsx'), 'utf8')
    expect(positions).not.toContain('useLiquidityPositions()')
  })

  it('analytics + snapshot honesty contracts — no fake metrics / Awaiting Indexer', () => {
    const snapshot = readFileSync(path.join(STUDIO, 'modules/buildLiquidityMarketSnapshot.ts'), 'utf8')
    const analytics = readFileSync(path.join(STUDIO, 'modules/buildLiquidityAnalytics.ts'), 'utf8')
    const snapTokens = readFileSync(path.join(STUDIO, 'modules/liquidityMarketSnapshotTokens.ts'), 'utf8')
    const anTokens = readFileSync(path.join(STUDIO, 'modules/liquidityAnalyticsTokens.ts'), 'utf8')
    expect(snapTokens).toContain("unavailable: '—'")
    expect(anTokens).toContain("unavailable: '—'")
    expect(snapshot + analytics + snapTokens + anTokens).not.toMatch(/Awaiting Indexer/i)
    expect(analytics).toContain('TransactionType.MINT')
    expect(analytics).toContain('TransactionType.BURN')
    expect(analytics).not.toContain('projectedTvl')
    expect(analytics).not.toContain('estimatedProviders')
  })

  it('production mock audit — modules + runtime avoid fixture producers', () => {
    const banned = [
      'mockPositions',
      'mockAnalytics',
      'mockPolish',
      'SAMPLE_POSITION',
      'SAMPLE_POOL',
      'fakeApr',
      'fakeTvl',
      'fakeRewards',
      'fakeWallets',
      'demoLiquidity',
      'getLiquidityUxFixture',
      'fixturePool',
    ]
    const hits: { file: string; token: string }[] = []
    const walk = (dir: string) => {
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        if (ent.name === '__tests__' || ent.name === 'node_modules') continue
        const abs = path.join(dir, ent.name)
        if (ent.isDirectory()) walk(abs)
        else if (/\.(ts|tsx)$/.test(ent.name)) {
          const src = readFileSync(abs, 'utf8')
          for (const b of banned) {
            if (src.includes(b)) hits.push({ file: path.relative(STUDIO, abs), token: b })
          }
        }
      }
    }
    walk(path.join(STUDIO, 'modules'))
    walk(path.join(STUDIO, 'liquidityRuntime'))
    expect(hits).toEqual([])
  })

  it('ships V1 evidence pack + certification report', () => {
    expect(existsSync(path.join(WEB, 'docs/runtime/LIQUIDITY_V1_FINAL_CERTIFICATION_REPORT.md'))).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/liquidity-v1-final-certification'))).toBe(true)
    expect(existsSync(path.join(WEB, 'docs/runtime/liquidity-v1-final-certification/certify.mjs'))).toBe(true)
  })
})
