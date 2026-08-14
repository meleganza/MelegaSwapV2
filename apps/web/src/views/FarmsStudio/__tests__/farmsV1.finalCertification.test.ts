/**
 * FARMS_V1_FINAL — integration & certification guards (no redesign).
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  FARMS_CANONICAL_STATUS,
  FARMS_FOUNDER_MOCKUP,
  FARMS_MODULE_PLAN,
  FARMS_PRIMARY_DOMAINS,
} from '../farmsArchitecture000Contracts'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const FREEZE = path.join(__dirname, 'farmsV1.final.freeze.sha256.json')

function sha256File(abs: string): string {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

describe('FARMS_V1 Final Integration & Certification', () => {
  it('locks Founder mockup SHA + Architecture tip', () => {
    const mockup = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    expect(sha256File(mockup)).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(sha256File(mockup)).toBe(
      'a19e506f7d7a5194050d52481f0b220bad30e4a774e3fde2529b37e830db848a',
    )
    const lock = JSON.parse(readFileSync(FREEZE, 'utf8'))
    expect(lock.baseTip).toBe('cc04442d')
    expect(lock.architectureTip).toBe('8edd68d4')
    expect(lock.mission008).toBe('77c277e0')
  })

  it('freezes Modules 001–008 + shared screen byte-identically', () => {
    const lock = JSON.parse(readFileSync(FREEZE, 'utf8'))
    for (const [rel, expected] of Object.entries(lock.files as Record<string, string>)) {
      const actual = sha256File(path.join(STUDIO, rel))
      expect(actual, rel).toBe(expected)
    }
    for (const [rel, expected] of Object.entries(lock.shared as Record<string, string>)) {
      const actual = sha256File(path.join(STUDIO, rel))
      expect(actual, `shared:${rel}`).toBe(expected)
    }
  })

  it('mounts Modules 001–004, 006–008 + Create Farm in certified order on FarmsStudioScreen (Module 005 Finished Farms unmounted — folded into My Farms)', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    const order = ['FarmsHeroModule','FarmsOverviewKpisModule','FarmsMyFarmsModule','FarmsExploreFarmsModule']
    let prev = -1
    for (const name of order) {
      const idx = screen.indexOf(name)
      expect(idx, name).toBeGreaterThan(-1)
      expect(idx).toBeGreaterThan(prev)
      prev = idx
    }
    expect(screen).not.toContain('FarmsFinishedFarmsModule')
    for (const n of [1, 2, 3, 4, 8]) {
      const id = String(n).padStart(3, '0')
      expect(screen).toContain(`data-farms-module-${id}="mounted"`)
    }
    expect(screen).toContain('data-farms-module-006="unmounted"')
    expect(screen).toContain('data-farms-module-007="unmounted"')
    expect(screen).toContain('data-farms-module-005="unmounted"')
    expect(screen).toContain('data-farms-create-farm="modal"')
    expect(screen).toContain('FarmsRuntimeProvider')
    expect(screen).toContain('FarmsActionHost')
    expect(screen.match(/<FarmsActionHost/g)?.length).toBe(1)
    expect(screen.match(/<FarmsRuntimeProvider/g)?.length).toBe(1)
  })

  it('architecture plan includes Modules 001–008 and primary LP domains', () => {
    const ids = FARMS_MODULE_PLAN.map((m) => m.id)
    expect(ids).toContain('000-architecture')
    expect(ids).toContain('001-hero')
    expect(ids).toContain('006-yield-advisor')
    expect(ids).toContain('007-analytics')
    expect(ids).toContain('008-visual-polish')
    expect(ids).toContain('010-certification')
    expect(FARMS_PRIMARY_DOMAINS).toEqual(['My Farms', 'Explore Farms', 'Finished Farms'])
  })

  it('canonical status vocabulary is complete and contradiction-free', () => {
    expect([...FARMS_CANONICAL_STATUS]).toEqual([
      'ACTIVE',
      'ENDED',
      'WITHDRAW_ONLY',
      'EMERGENCY',
      'PARTIAL',
      'UNAVAILABLE',
      'LOADING',
    ])
    expect(new Set(FARMS_CANONICAL_STATUS).size).toBe(FARMS_CANONICAL_STATUS.length)
  })

  it('shared runtime boundaries remain single-owner (no duplicate action hosts in modules)', () => {
    const moduleFiles = [
      'FarmsMyFarmsModule.tsx',
      'FarmsExploreFarmsModule.tsx',
      'FarmsFinishedFarmsModule.tsx',
      'FarmsYieldAdvisorModule.tsx',
      'FarmsAnalyticsModule.tsx',
      'FarmsVisualPolishModule.tsx',
    ]
    for (const f of moduleFiles) {
      const src = readFileSync(path.join(STUDIO, 'modules', f), 'utf8')
      expect(src).not.toContain('<FarmsActionHost')
      expect(src).not.toContain('FarmsRuntimeProvider')
    }
  })

  it('integration flow contracts are present (wallet / advisor / analytics / actions)', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
            expect(screen).toContain('FarmsActionHost')

    const advisor = readFileSync(path.join(STUDIO, 'modules/buildFarmsYieldAdvisor.ts'), 'utf8')
    expect(advisor).toContain('emergency_withdraw')
    expect(advisor).toContain('Everything looks good')
    expect(advisor.toLowerCase()).not.toContain('openai')
    expect(advisor).not.toContain('predictedApr')

    const analytics = readFileSync(path.join(STUDIO, 'modules/buildFarmsAnalytics.ts'), 'utf8')
    expect(analytics).toContain('Farm Distribution')
    expect(analytics).toContain('Reward Distribution')
    expect(analytics).toContain('Participation')
    expect(analytics).toContain('Farm Health')
    expect(analytics).not.toContain('projectedTvl')
    expect(analytics).not.toContain('estimatedFarmers')

    const actionHost = readFileSync(path.join(STUDIO, 'farmsRuntime/FarmsActionHost.tsx'), 'utf8')
    expect(actionHost).toMatch(/stake|unstake|claim/i)
  })

  it('production mock audit — module builders avoid fixture producers', () => {
    const src = [
      readFileSync(path.join(STUDIO, 'modules/buildFarmsWalletPositions.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildFarmsExploreFarms.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildFarmsFinishedFarms.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildFarmsYieldAdvisor.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildFarmsAnalytics.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/buildFarmsOverviewKpis.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('mockPositions')
    expect(src).not.toContain('mockAnalytics')
    expect(src).not.toContain('mockFinished')
    expect(src).not.toContain('SAMPLE_POSITION')
    expect(src).not.toContain('fakeApr')
    expect(src).not.toContain('fakeTvl')
    expect(src).not.toContain('getFarmsUxFixture')
  })

  it('production mock audit — modules directory has no production fixture producers', () => {
    const dir = path.join(STUDIO, 'modules')
    const files = readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f))
    const banned = [
      'mockPositions',
      'mockAnalytics',
      'fixtureFarm',
      'SAMPLE_FARM',
      'fakeRewards',
      'fakeWallets',
      'demoFarms',
    ]
    for (const f of files) {
      const src = readFileSync(path.join(dir, f), 'utf8')
      for (const b of banned) {
        expect(src.includes(b), `${f} contains ${b}`).toBe(false)
      }
    }
  })

  it('evidence pack path exists for certification artifacts', () => {
    const evidence = path.join(WEB, 'docs/runtime/farms-v1-final-certification')
    expect(existsSync(path.join(evidence, 'certify.mjs'))).toBe(true)
  })
})
