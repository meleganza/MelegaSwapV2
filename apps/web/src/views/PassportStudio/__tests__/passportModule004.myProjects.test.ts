/**
 * PASSPORT_MODULE_004 — My Projects guards + Modules 001–003 freeze.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import { buildPassportProjectsViewModel } from '../buildPassportProjectsViewModel'
import { PROJECTS_CREATE_HREF, PROJECTS_KPI_UNAVAILABLE } from '../passportProjectsTypes'
import { passportOne, PASSPORT_MOCKUP } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('PASSPORT_MODULE_004 My Projects', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes MODULE 001–003 implementation files', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportModule001_002_003.freeze.sha256.json'), 'utf8'),
    )
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks Module 004 geometry without altering 001–003 sizes', () => {
    expect(passportOne.projectsW).toBe('1376px')
    expect(passportOne.projectsH).toBe('176px')
    expect(passportOne.projectsCardW).toBe('256px')
    expect(passportOne.projectsCardH).toBe('144px')
    expect(passportOne.projectsCardGap).toBe('16px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.assetsH).toBe('176px')
    expect(passportOne.assetsCardW).toBe('320px')
  })

  it('empty production state shows create route and no invented projects', () => {
    const vm = buildPassportProjectsViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(vm.projects).toHaveLength(0)
    expect(vm.createHref).toBe(PROJECTS_CREATE_HREF)
    expect(vm.emptyExplanation).toMatch(/never inferred/i)
  })

  it('fixture projects keep factual fields without inventing defaults in production builder', () => {
    const vm = buildPassportProjectsViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      fixtureProjects: [
        {
          id: 'p1',
          name: 'Alpha',
          category: 'DeFi',
          status: 'Live',
          role: 'Owner',
          kpiKind: 'holders',
          kpiLabel: 'Holders',
          kpiValue: PROJECTS_KPI_UNAVAILABLE,
          logoLabel: 'AL',
          actionKind: 'manage',
          actionLabel: 'Manage',
          actionHref: '/list',
        },
      ],
    })
    expect(vm.projects).toHaveLength(1)
    expect(vm.projects[0].kpiValue).toBe(PROJECTS_KPI_UNAVAILABLE)
    const live = buildPassportProjectsViewModel({ address: '0x8f1234567890abcdef1234567890abcdef7a3B' })
    expect(live.projects).toHaveLength(0)
  })

  it('create card routes to List create-project intent', () => {
    const create = load('PassportCreateProjectCard.tsx')
    expect(create).toContain(PROJECTS_CREATE_HREF)
    expect(create).toContain('Create Project')
    expect(create).toContain('dashed')
  })

  it('mounts Module 004 with prior modules preserved', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportHeroIdentityModule')
    expect(screen).toContain('PassportPortfolioOverview')
    expect(screen).toContain('PassportAssets')
    expect(screen).toContain('PassportProjects')
    expect(screen).toContain('CommandCenterScreen')
    expect(screen).toContain('data-passport-module-004')
  })

  it('does not invent mockup project counts; Modules 007–009 remain unimplemented', () => {
    const files = readdirSync(ROOT)
    expect(files.some((f) => /PassportSecurity/.test(f))).toBe(false)
    const blob = readdirSync(ROOT)
      .filter((f) => /Project|project/.test(f))
      .map((f) => load(f))
      .join('\n')
    expect(blob).not.toContain('7 Active')
    expect(blob).not.toContain('28450')
  })
})
