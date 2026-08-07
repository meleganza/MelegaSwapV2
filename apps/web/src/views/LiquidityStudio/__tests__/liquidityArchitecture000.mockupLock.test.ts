/**
 * LIQUIDITY_ARCHITECTURE_000 — mockup lock, contracts, ownership, legacy freeze.
 * Architecture only — does not assert UI redesign.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  LIQUIDITY_ARCHITECTURE_ID,
  LIQUIDITY_ACTION_DOMAINS,
  LIQUIDITY_DATA_OWNERSHIP,
  LIQUIDITY_FOUNDER_MOCKUP,
  LIQUIDITY_LEGACY_IMPLEMENTATION,
  LIQUIDITY_MODULE_PLAN,
  LIQUIDITY_PRIMARY_JOURNEYS,
  LIQUIDITY_PRODUCT_MODEL,
  LIQUIDITY_SUPERSEDED_ONE_PAGE_MODULES,
  LIQUIDITY_USER_ACTIONS,
} from '../liquidityArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

describe('LIQUIDITY_ARCHITECTURE_000 Mockup Lock', () => {
  it('archives Founder mockup with recorded SHA-256 and dimensions', () => {
    const meta = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/liquidity-architecture-000/mockup-integrity.json'), 'utf8'),
    )
    const mockupPath = path.join(REPO, meta.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(meta.sha256)
    expect(sha).toBe(LIQUIDITY_FOUNDER_MOCKUP.sha256)
    expect(bytes.length).toBe(meta.bytes)
    expect(meta.width).toBe(1024)
    expect(meta.height).toBe(528)
    expect(meta.byteIdenticalToSource).toBe(true)
    expect(meta.visualDirection.avoid).toEqual(
      expect.arrayContaining(['dashboards', 'database tables', 'empty panels']),
    )
  })

  it('locks product model, primary journeys, and module plan order', () => {
    expect(LIQUIDITY_ARCHITECTURE_ID).toBe('LIQUIDITY_ARCHITECTURE_000')
    expect(LIQUIDITY_PRODUCT_MODEL.is).toMatch(/two primary journeys/i)
    expect([...LIQUIDITY_PRIMARY_JOURNEYS]).toEqual([
      'Provide liquidity manually',
      'Use Melega AI Liquidity Builder',
    ])
    expect([...LIQUIDITY_ACTION_DOMAINS]).toEqual([
      'Add Liquidity',
      'Remove Liquidity',
      'My Positions',
      'Simulation',
    ])
    expect(LIQUIDITY_MODULE_PLAN[0].id).toBe('000-architecture')
    expect(LIQUIDITY_MODULE_PLAN.map((m) => m.id)).toContain('002-liquidity-actions')
    expect(LIQUIDITY_MODULE_PLAN.map((m) => m.id)).toContain('003-pool-discovery')
    expect(LIQUIDITY_MODULE_PLAN.map((m) => m.id)).toContain('004-add-liquidity')
    expect(LIQUIDITY_MODULE_PLAN.map((m) => m.id)).toContain('006-your-positions')
    expect(LIQUIDITY_MODULE_PLAN.map((m) => m.id)).toContain('008-visual-polish')
    const idx = (id: string) => LIQUIDITY_MODULE_PLAN.findIndex((m) => m.id === id)
    expect(idx('001-hero')).toBeLessThan(idx('002-liquidity-actions'))
    expect(idx('002-liquidity-actions')).toBeLessThan(idx('003-pool-discovery'))
    expect(idx('003-pool-discovery')).toBeLessThan(idx('004-add-liquidity'))
    expect(idx('008-visual-polish')).toBeLessThan(idx('009-integration'))
  })

  it('locks user actions and data ownership vocabulary', () => {
    expect([...LIQUIDITY_USER_ACTIONS]).toEqual([
      'Add Liquidity',
      'Remove Liquidity',
      'Select Pool',
      'Open AI Liquidity Builder',
      'Review Position',
      'Manage Position',
      'View Pool',
    ])
    expect(LIQUIDITY_DATA_OWNERSHIP.sourceOfTruth).toContain('LP balances')
    expect(LIQUIDITY_DATA_OWNERSHIP.derived).toContain('Estimated APR')
    expect([...LIQUIDITY_SUPERSEDED_ONE_PAGE_MODULES]).toContain('LIQUIDITY_MODULE_002_LB_CARD')
  })

  it('freezes current liquidity mounts as LEGACY_IMPLEMENTATION without cutover', () => {
    expect(LIQUIDITY_LEGACY_IMPLEMENTATION.label).toBe('LEGACY_IMPLEMENTATION')
    const classic = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    // Provider-first modular body (legacy views/Pool archived); no architecture shell cutover.
    expect(classic).toContain('LiquidityStudioV3Shell')
    expect(classic).not.toContain('LiquidityActionsModule')
    expect(classic).not.toContain('LiquidityHeroModule')
    expect(classic).not.toContain('LiquidityArchitectureShell')
    expect(classic).not.toContain('views/Pool')

    const studio = readFileSync(path.join(WEB, 'src/pages/liquidity-studio.tsx'), 'utf8')
    // Alias route re-exports certified /liquidity stack (no separate Studio shell mount).
    expect(studio).toContain("from './liquidity'")
    expect(studio).not.toContain('modules/LiquidityHero')
    expect(studio).not.toContain('LiquidityArchitectureShell')

    const freeze = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/liquidity-architecture-000/legacy-implementation-freeze.json'), 'utf8'),
    )
    expect(freeze.label).toBe('LEGACY_IMPLEMENTATION')
    expect(freeze.policy.featureDevelopment).toBe('FORBIDDEN')
    expect(freeze.policy.criticalProductionBugfixes).toBe('ALLOWED')
    expect(freeze.policy.productionUiChangesInThisMission).toBe('FORBIDDEN')
  })

  it('validates ownership map, runtime boundaries, dependencies, and report', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('MODULE 001')
    expect(map).toContain('MODULE 002')
    expect(map).toContain('MODULE 008')
    expect(map).toContain('Provide liquidity manually')
    expect(map).toContain('Melega AI Liquidity Builder')
    expect(map).toContain('LEGACY_IMPLEMENTATION')
    expect(map).toContain('000 → 001 → 002')
    expect(map).toContain('exchange.ts')
    expect(map).not.toContain('$24.56M')

    const boundaries = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_RUNTIME_BOUNDARIES.md'), 'utf8')
    expect(boundaries).toContain('One runtime')
    expect(boundaries).toContain('SOURCE OF TRUTH')
    expect(boundaries).toContain('LiquidityRuntimeProvider')

    const deps = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_MODULE_DEPENDENCIES.md'), 'utf8')
    expect(deps).toContain('002 Liquidity Actions')
    expect(deps).toContain('004 Add Liquidity')
    expect(deps).toContain('010 Certification')

    const report = readFileSync(path.join(WEB, 'docs/runtime/LIQUIDITY_ARCHITECTURE_000_REPORT.md'), 'utf8')
    expect(report).toContain('Current legacy analysis')
    expect(report).toContain('Module decomposition')
    expect(report).toContain('Migration strategy')
    expect(report).toContain('Certification strategy')
    expect(report).toContain('LIQUIDITY_ARCHITECTURE_000_CERTIFIED')
  })

  it('keeps LiquidityStudioScreen as LEGACY_IMPLEMENTATION shell (Module 001 mounts on /liquidity)', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/LiquidityStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('UnifiedLiquidityPage')
    expect(screen).toContain('LiquidityRuntimeProvider')
    expect(screen).not.toContain('LiquidityHeroModule')
    expect(screen).not.toContain('data-liquidity-module-001')
    expect(screen).not.toContain('LiquidityArchitectureShell')
  })
})
