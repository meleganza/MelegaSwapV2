/**
 * FARMS_ARCHITECTURE_000 — mockup lock, contracts, ownership, legacy freeze.
 * Architecture only — does not assert UI redesign.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  FARMS_ARCHITECTURE_ID,
  FARMS_CANONICAL_STATUS,
  FARMS_DATA_OWNERSHIP,
  FARMS_FOUNDER_MOCKUP,
  FARMS_LEGACY_IMPLEMENTATION,
  FARMS_MODULE_PLAN,
  FARMS_PRIMARY_DOMAINS,
  FARMS_PRODUCT_MODEL,
  FARMS_USER_ACTIONS,
} from '../farmsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

describe('FARMS_ARCHITECTURE_000 Mockup Lock', () => {
  it('archives Founder mockup with recorded SHA-256 and dimensions', () => {
    const meta = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/farms-architecture-000/mockup-integrity.json'), 'utf8'),
    )
    const mockupPath = path.join(REPO, meta.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(meta.sha256)
    expect(sha).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(bytes.length).toBe(meta.bytes)
    expect(meta.width).toBe(1024)
    expect(meta.height).toBe(682)
    expect(meta.byteIdenticalToSource).toBe(true)
  })

  it('locks product model, primary domains, and module plan order', () => {
    expect(FARMS_ARCHITECTURE_ID).toBe('FARMS_ARCHITECTURE_000')
    expect(FARMS_PRODUCT_MODEL.is).toBe('LP yield farming center')
    expect(FARMS_PRODUCT_MODEL.relationship.pools).toBe('Single-token staking')
    expect(FARMS_PRODUCT_MODEL.relationship.farms).toBe('LP token staking')
    expect([...FARMS_PRIMARY_DOMAINS]).toEqual(['My Farms', 'Explore Farms', 'Finished Farms'])
    expect(FARMS_MODULE_PLAN[0].id).toBe('000-architecture')
    expect(FARMS_MODULE_PLAN.map((m) => m.id)).toContain('003-my-farms')
    expect(FARMS_MODULE_PLAN.map((m) => m.id)).toContain('004-explore-farms')
    expect(FARMS_MODULE_PLAN.map((m) => m.id)).toContain('005-finished-farms')
    expect(FARMS_MODULE_PLAN.map((m) => m.id)).toContain('006-yield-advisor')
    const idx = (id: string) => FARMS_MODULE_PLAN.findIndex((m) => m.id === id)
    expect(idx('001-hero')).toBeLessThan(idx('002-overview-kpis'))
    expect(idx('003-my-farms')).toBeLessThan(idx('004-explore-farms'))
    expect(idx('004-explore-farms')).toBeLessThan(idx('005-finished-farms'))
    expect(idx('008-visual-polish')).toBeLessThan(idx('009-integration'))
  })

  it('locks canonical farm status vocabulary and user actions', () => {
    expect([...FARMS_CANONICAL_STATUS]).toEqual([
      'ACTIVE',
      'ENDED',
      'WITHDRAW_ONLY',
      'EMERGENCY',
      'PARTIAL',
      'UNAVAILABLE',
      'LOADING',
    ])
    const statusDoc = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/farms-architecture-000/canonical-farm-status.json'), 'utf8'),
    )
    expect(statusDoc.vocabulary).toEqual([...FARMS_CANONICAL_STATUS])
    expect([...FARMS_USER_ACTIONS]).toEqual([
      'Stake',
      'Harvest',
      'Withdraw',
      'Emergency Withdraw',
      'Manage',
      'View Farm',
    ])
    expect(FARMS_DATA_OWNERSHIP.sourceOfTruth).toContain('LP balances')
    expect(FARMS_DATA_OWNERSHIP.derived).toContain('APR')
  })

  it('freezes current /farms mount as LEGACY_IMPLEMENTATION without cutover', () => {
    expect(FARMS_LEGACY_IMPLEMENTATION.label).toBe('LEGACY_IMPLEMENTATION')
    const page = readFileSync(path.join(WEB, 'src/pages/farms/index.tsx'), 'utf8')
    expect(page).toContain('FarmsStudioScreen')
    expect(page).not.toContain('FarmsArchitectureShell')
    expect(page).not.toContain('modules/FarmsHero')

    const freeze = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/farms-architecture-000/legacy-implementation-freeze.json'), 'utf8'),
    )
    expect(freeze.label).toBe('LEGACY_IMPLEMENTATION')
    expect(freeze.policy.featureDevelopment).toBe('FORBIDDEN')
    expect(freeze.policy.criticalProductionBugfixes).toBe('ALLOWED')
  })

  it('validates ownership map, runtime boundaries, dependencies, and report', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/FARMS_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('MODULE 001')
    expect(map).toContain('MODULE 005')
    expect(map).toContain('My Farms')
    expect(map).toContain('Explore Farms')
    expect(map).toContain('Finished Farms')
    expect(map).toContain('Yield Advisor')
    expect(map).toContain('LEGACY_IMPLEMENTATION')
    expect(map).toContain('000 → 001 → 002')
    expect(map).toContain('exchange.ts')
    expect(map).not.toContain('$24.56M')

    const boundaries = readFileSync(path.join(WEB, 'docs/runtime/FARMS_RUNTIME_BOUNDARIES.md'), 'utf8')
    expect(boundaries).toContain('One runtime')
    expect(boundaries).toContain('SOURCE OF TRUTH')
    expect(boundaries).toContain('FarmsActionHost')

    const deps = readFileSync(path.join(WEB, 'docs/runtime/FARMS_MODULE_DEPENDENCIES.md'), 'utf8')
    expect(deps).toContain('003 My Farms')
    expect(deps).toContain('006 Yield Advisor')
    expect(deps).toContain('010 Certification')

    const report = readFileSync(path.join(WEB, 'docs/runtime/FARMS_ARCHITECTURE_000_REPORT.md'), 'utf8')
    expect(report).toContain('Current legacy analysis')
    expect(report).toContain('Module decomposition')
    expect(report).toContain('Migration strategy')
    expect(report).toContain('Certification strategy')
    expect(report).toContain('FARMS_ARCHITECTURE_000_CERTIFIED')
  })

  it('keeps Architecture 000 freeze: no ArchitectureShell cutover; legacy body retained under modular stack', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/FarmsStudio/FarmsStudioScreen.tsx'), 'utf8')
    // Modules 001–006 may mount; Integration 009 owns full modular shell cutover.
    expect(screen).toContain('FarmsYieldAdvisorModule')
    expect(screen).not.toContain('AIYieldAdvisorPanel')
    expect(screen).toContain('FeaturedFarmPanel')
    expect(screen).toContain('FarmsMyFarmsModule')
    expect(screen).not.toContain('FarmsArchitectureShell')
    expect(screen).toContain('data-farms-module-003="mounted"')
    expect(screen).toContain('data-farms-module-006="mounted"')
    for (const id of ['007', '008', '009', '010']) {
      expect(screen).not.toContain(`data-farms-module="${id}"`)
    }
  })
})
