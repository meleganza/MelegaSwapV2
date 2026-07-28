/**
 * POOLS_ARCHITECTURE_000 — mockup lock, contracts, ownership, legacy freeze.
 * Architecture only — does not assert UI redesign.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  POOLS_ARCHITECTURE_ID,
  POOLS_CANONICAL_STATUS,
  POOLS_FOUNDER_MOCKUP,
  POOLS_LEGACY_IMPLEMENTATION,
  POOLS_MODULE_PLAN,
  POOLS_PRIMARY_DOMAINS,
  POOLS_PRODUCT_MODEL,
} from '../poolsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

describe('POOLS_ARCHITECTURE_000 Mockup Lock', () => {
  it('archives Founder mockup with recorded SHA-256 and dimensions', () => {
    const meta = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/pools-architecture-000/mockup-integrity.json'), 'utf8'),
    )
    const mockupPath = path.join(REPO, meta.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    const sha = createHash('sha256').update(bytes).digest('hex')
    expect(sha).toBe(meta.sha256)
    expect(sha).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(bytes.length).toBe(meta.bytes)
    expect(meta.width).toBe(934)
    expect(meta.height).toBe(1024)
    expect(meta.byteIdenticalToSource).toBe(true)
  })

  it('locks product model, primary domains, and module plan order', () => {
    expect(POOLS_ARCHITECTURE_ID).toBe('POOLS_ARCHITECTURE_000')
    expect(POOLS_PRODUCT_MODEL.is).toBe('complete staking center')
    expect(POOLS_PRODUCT_MODEL.isNot).toBe('a list of cards')
    expect([...POOLS_PRIMARY_DOMAINS]).toEqual(['My Positions', 'Explore Pools', 'Finished'])
    expect(POOLS_MODULE_PLAN[0].id).toBe('000-architecture')
    expect(POOLS_MODULE_PLAN.map((m) => m.id)).toContain('003-my-positions')
    expect(POOLS_MODULE_PLAN.map((m) => m.id)).toContain('004-explore-pools')
    expect(POOLS_MODULE_PLAN.map((m) => m.id)).toContain('005-finished-pools')
    const idx = (id: string) => POOLS_MODULE_PLAN.findIndex((m) => m.id === id)
    expect(idx('001-hero')).toBeLessThan(idx('002-overview-kpis'))
    expect(idx('003-my-positions')).toBeLessThan(idx('004-explore-pools'))
    expect(idx('004-explore-pools')).toBeLessThan(idx('005-finished-pools'))
    expect(idx('008-visual-polish')).toBeLessThan(idx('009-integration'))
  })

  it('locks canonical pool status vocabulary', () => {
    expect([...POOLS_CANONICAL_STATUS]).toEqual([
      'ACTIVE',
      'ENDED',
      'WITHDRAW_ONLY',
      'EMERGENCY',
      'UNAVAILABLE',
      'PARTIAL',
      'LOADING',
    ])
    const statusDoc = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/pools-architecture-000/canonical-pool-status.json'), 'utf8'),
    )
    expect(statusDoc.vocabulary).toEqual([...POOLS_CANONICAL_STATUS])
  })

  it('freezes current /pools mount as LEGACY_IMPLEMENTATION without cutover', () => {
    expect(POOLS_LEGACY_IMPLEMENTATION.label).toBe('LEGACY_IMPLEMENTATION')
    const page = readFileSync(path.join(WEB, 'src/pages/pools/index.tsx'), 'utf8')
    expect(page).toContain('PoolsStudioScreen')
    expect(page).not.toContain('PoolsArchitectureShell')
    expect(page).not.toContain('modules/PoolsHero')

    const freeze = JSON.parse(
      readFileSync(path.join(WEB, 'docs/runtime/pools-architecture-000/legacy-implementation-freeze.json'), 'utf8'),
    )
    expect(freeze.label).toBe('LEGACY_IMPLEMENTATION')
    expect(freeze.policy.featureDevelopment).toBe('FORBIDDEN')
    expect(freeze.policy.criticalProductionBugfixes).toBe('ALLOWED')
  })

  it('validates ownership map and architecture report exist with required sections', () => {
    const map = readFileSync(path.join(WEB, 'docs/runtime/POOLS_MODULE_OWNERSHIP_MAP.md'), 'utf8')
    expect(map).toContain('MODULE 001')
    expect(map).toContain('MODULE 005')
    expect(map).toContain('My Positions')
    expect(map).toContain('Explore Pools')
    expect(map).toContain('Finished')
    expect(map).toContain('LEGACY_IMPLEMENTATION')
    expect(map).toContain('000 → 001 → 002')
    expect(map).toContain('exchange.ts')
    expect(map).not.toContain('$202.4K')

    const report = readFileSync(path.join(WEB, 'docs/runtime/POOLS_ARCHITECTURE_000_REPORT.md'), 'utf8')
    expect(report).toContain('Current legacy analysis')
    expect(report).toContain('Module decomposition')
    expect(report).toContain('Ownership map')
    expect(report).toContain('Shared runtime model')
    expect(report).toContain('Certification strategy')
    expect(report).toContain('Migration strategy')
    expect(report).toContain('POOLS_MODULE_001_HERO')
  })

  it('does not introduce mockup production KPI numbers into architecture contracts', () => {
    const contracts = readFileSync(path.join(WEB, 'src/views/PoolsStudio/poolsArchitecture000Contracts.ts'), 'utf8')
    expect(contracts).not.toContain('202.4')
    expect(contracts).not.toContain('128.45')
    expect(contracts).not.toContain('$53.21')
    expect(contracts).not.toContain('36.08')
  })
})
