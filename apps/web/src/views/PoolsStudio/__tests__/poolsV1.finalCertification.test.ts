/**
 * POOLS_V1_FINAL — integration & certification guards (no redesign).
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { POOLS_FOUNDER_MOCKUP, POOLS_MODULE_PLAN } from '../poolsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const FREEZE = path.join(__dirname, 'poolsV1.final.freeze.sha256.json')

function sha256File(abs: string): string {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

describe('POOLS_V1 Final Integration & Certification', () => {
  it('locks Founder mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    expect(sha256File(mockup)).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(sha256File(mockup)).toBe(
      '549ca3bb663315730945de4ada9bc36559399cf3e9ce72a59de4d10f89558d4f',
    )
  })

  it('freezes Modules 001–008 + shared screen byte-identically', () => {
    const lock = JSON.parse(readFileSync(FREEZE, 'utf8'))
    expect(lock.baseTip).toBe('e62bdea2')
    expect(lock.architectureTip).toBe('f1d1fd11')
    for (const [rel, expected] of Object.entries(lock.files as Record<string, string>)) {
      const actual = sha256File(path.join(STUDIO, rel))
      expect(actual, rel).toBe(expected)
    }
    for (const [rel, expected] of Object.entries(lock.shared as Record<string, string>)) {
      const actual = sha256File(path.join(STUDIO, rel))
      expect(actual, `shared:${rel}`).toBe(expected)
    }
  })

  it('mounts Modules 001–008 in certified order on PoolsStudioScreen', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    const order = [
      'PoolsHeroModule',
      'PoolsOverviewKpisModule',
      'PoolsMyPositionsModule',
      'PoolsExplorePoolsModule',
      'PoolsFinishedPoolsModule',
      'PoolsRewardAdvisorModule',
      'PoolsAnalyticsModule',
      'PoolsVisualPolishModule',
    ]
    let prev = -1
    for (const name of order) {
      const idx = screen.indexOf(name)
      expect(idx, name).toBeGreaterThan(-1)
      expect(idx).toBeGreaterThan(prev)
      prev = idx
    }
    for (let n = 1; n <= 8; n++) {
      const id = String(n).padStart(3, '0')
      expect(screen).toContain(`data-pools-module-${id}="mounted"`)
    }
    expect(screen).toContain('PoolsRuntimeProvider')
    expect(screen).toContain('PoolsActionHost')
    // Single action host string occurrence as component mount
    expect(screen.match(/<PoolsActionHost/g)?.length).toBe(1)
  })

  it('architecture plan includes Modules 001–008', () => {
    const ids = POOLS_MODULE_PLAN.map((m) => m.id)
    expect(ids).toContain('001-hero')
    expect(ids).toContain('007-analytics')
    expect(ids).toContain('008-visual-polish')
    expect(ids).toContain('010-certification')
  })

  it('shared runtime boundaries remain single-owner (no duplicate action hosts in modules)', () => {
    const moduleFiles = [
      'PoolsMyPositionsModule.tsx',
      'PoolsExplorePoolsModule.tsx',
      'PoolsFinishedPoolsModule.tsx',
      'PoolsRewardAdvisorModule.tsx',
      'PoolsAnalyticsModule.tsx',
    ]
    for (const f of moduleFiles) {
      const src = readFileSync(path.join(STUDIO, 'modules', f), 'utf8')
      expect(src).not.toContain('<PoolsActionHost')
      expect(src).not.toContain('PoolsRuntimeProvider')
    }
  })

  it('production mock audit — module builders avoid fixture producers', () => {
    const src = [
      readFileSync(path.join(STUDIO, 'modules/buildPoolsWalletPositions.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildPoolsExplorePools.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildPoolsFinishedPools.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildPoolsRewardAdvisor.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildPoolsAnalytics.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('getPoolsUxFixtureCards')
    expect(src).not.toContain('mockAnalytics')
    expect(src).not.toContain('mockFinished')
    expect(src).not.toContain('mockPositions')
  })

  it('evidence pack path exists for certification artifacts', () => {
    const evidence = path.join(WEB, 'docs/runtime/pools-v1-final-certification')
    expect(existsSync(path.join(evidence, 'certify.mjs'))).toBe(true)
  })
})
