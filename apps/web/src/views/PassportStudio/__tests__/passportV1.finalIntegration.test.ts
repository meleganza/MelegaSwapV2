/**
 * PASSPORT_V1_FINAL — integration seal: freeze 001–007, mount order, deep links, honesty.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { PASSPORT_MOCKUP, PASSPORT_MODULE_ORDER, passportOne } from '../passportTokens'
import { DOUBLE_COUNT_POLICY } from '../buildPassportLiquidityPositionsViewModel'
import { ACTIVITY_SOURCE_CATALOG } from '../buildPassportRecentActivityViewModel'
import { PROJECTS_CREATE_HREF } from '../passportProjectsTypes'
import {
  LIQUIDITY_ADD_HREF,
  LIQUIDITY_BUILDING_HREF,
  LIQUIDITY_VIEW_ALL_HREF,
} from '../passportLiquidityTypes'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

describe('PASSPORT_V1 Final Integration', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes all Module 001–007 owned implementation files + shared screen/tokens', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportV1.final.freeze.sha256.json'), 'utf8'),
    )
    expect(Object.keys(freeze.files)).toHaveLength(46)
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
    for (const [rel, expected] of Object.entries(freeze.shared as Record<string, string>)) {
      const abs = rel.startsWith('views/')
        ? path.join(WEB, 'src', rel)
        : path.join(ROOT, rel)
      const sha = createHash('sha256').update(readFileSync(abs)).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks module order and desktop geometry contracts', () => {
    expect([...PASSPORT_MODULE_ORDER]).toEqual([
      '001-hero-identity',
      '002-portfolio',
      '003-assets',
      '004-projects',
      '005-liquidity',
      '006-activity',
      '007-security',
      '008-mobile',
      '009-polish',
    ])
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.assetsH).toBe('176px')
    expect(passportOne.projectsH).toBe('176px')
    expect(passportOne.liquidityMinH).toBe('232px')
    expect(passportOne.activityH).toBe('360px')
    expect(passportOne.securityH).toBe('360px')
    expect(passportOne.bottomColW).toBe('680px')
    expect(passportOne.bottomGap).toBe('16px')
    expect(passportOne.moduleGap).toBe('16px')
    expect(passportOne.contentMax).toBe('1376px')
  })

  it('mounts modules 001–007 in PassportScreen with independent failure isolation', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    const order = [
      'PassportHeroIdentityModule',
      'PassportPortfolioOverview',
      'PassportAssets',
      'PassportProjects',
      'PassportLiquidity',
      'PassportBottomGrid',
    ]
    let last = -1
    for (const name of order) {
      const idx = screen.indexOf(name)
      expect(idx).toBeGreaterThan(last)
      last = idx
    }
    for (const n of ['001', '002', '003', '004', '005', '006', '007']) {
      expect(screen).toContain(`data-passport-module-${n}`)
    }
    expect(screen).toContain('CommandCenterScreen')
    expect(screen).not.toContain('PassportArchitectureShell')
  })

  it('validates production deep-link destinations exist as pages', () => {
    const routes = [
      ['/', 'src/pages/index.tsx'],
      ['/passport', 'src/pages/passport/index.tsx'],
      ['/list', 'src/pages/list/index.tsx'],
      ['/swap', 'src/pages/swap/index.tsx'],
      ['/liquidity-studio', 'src/pages/liquidity-studio.tsx'],
      ['/command-center', 'src/pages/command-center/index.tsx'],
    ] as const
    for (const [, rel] of routes) {
      expect(existsSync(path.join(WEB, rel))).toBe(true)
    }
    expect(PROJECTS_CREATE_HREF).toBe('/list?intent=create-project')
    expect(LIQUIDITY_VIEW_ALL_HREF).toContain('/liquidity-studio?view=positions')
    expect(LIQUIDITY_ADD_HREF).toContain('view=add')
    expect(LIQUIDITY_BUILDING_HREF).toContain('view=building')
  })

  it('documents data integrity policies (no double-count, M-Credits distinct, activity honesty)', () => {
    expect(DOUBLE_COUNT_POLICY).toMatch(/single Liquidity Building summary/i)
    expect(ACTIVITY_SOURCE_CATALOG.every((s) => !s.available)).toBe(true)
    const assets = readFileSync(path.join(ROOT, 'buildPassportAssetsViewModel.ts'), 'utf8')
    expect(assets).toMatch(/M-Credits/)
    expect(assets).not.toMatch(/ERC-20 token balance for M-Credits/i)
    const projects = readFileSync(path.join(ROOT, 'buildPassportProjectsViewModel.ts'), 'utf8')
    expect(projects).toMatch(/never inferred/i)
  })

  it('does not ship production mock money or invent Verified identity defaults', () => {
    const hero = readFileSync(path.join(ROOT, 'buildPassportHeroIdentityViewModel.ts'), 'utf8')
    expect(hero).toMatch(/never.*verified|not_verified|unavailable/i)
    const studioBlob = [
      'buildPassportPortfolioOverviewViewModel.ts',
      'buildPassportAssetsViewModel.ts',
      'buildPassportProjectsViewModel.ts',
      'buildPassportRecentActivityViewModel.ts',
      'buildPassportSecurityViewModel.ts',
    ]
      .map((f) => readFileSync(path.join(ROOT, f), 'utf8'))
      .join('\n')
    expect(studioBlob).not.toContain('28450')
    expect(studioBlob).not.toContain('$12,480')
    expect(studioBlob).not.toContain('98/100')
  })
})
