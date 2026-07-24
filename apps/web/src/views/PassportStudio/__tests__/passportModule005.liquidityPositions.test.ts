/**
 * PASSPORT_MODULE_005 — Liquidity Positions guards + Modules 001–004 freeze.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync, readdirSync } from 'fs'
import path from 'path'
import {
  buildPassportLiquidityPositionsViewModel,
  mergeLiquidityPositions,
  passportLiquidityModuleHeightPx,
  DOUBLE_COUNT_POLICY,
} from '../buildPassportLiquidityPositionsViewModel'
import {
  LIQUIDITY_ADD_HREF,
  LIQUIDITY_BUILDING_HREF,
  LIQUIDITY_UNAVAILABLE,
  LIQUIDITY_VIEW_ALL_HREF,
  type PassportLiquidityPosition,
} from '../passportLiquidityTypes'
import { passportOne, PASSPORT_MOCKUP } from '../passportTokens'

const ROOT = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function fixturePos(partial: Partial<PassportLiquidityPosition> & Pick<PassportLiquidityPosition, 'id' | 'type' | 'pairLabel'>): PassportLiquidityPosition {
  return {
    token0Symbol: 'MARCO',
    token1Symbol: 'WBNB',
    token0LogoUrl: null,
    token1LogoUrl: null,
    chainLabel: 'BNB Chain',
    supportingLine: '0xabc…def0',
    estimatedValue: LIQUIDITY_UNAVAILABLE,
    estimatedValueState: 'unavailable',
    sharePrimary: LIQUIDITY_UNAVAILABLE,
    shareSecondary: null,
    feesOrProgressLabel: 'Unavailable',
    feesOrProgressKind: 'unavailable',
    feesOrProgressValue: LIQUIDITY_UNAVAILABLE,
    status: 'Active',
    statusTone: 'active',
    actionLabel: 'Manage',
    actionHref: LIQUIDITY_VIEW_ALL_HREF,
    actionAriaLabel: 'Manage MARCO / WBNB manual liquidity position',
    destination: LIQUIDITY_VIEW_ALL_HREF,
    freshness: 'unavailable',
    source: 'fixture',
    dedupeKey: partial.id,
    ...partial,
  }
}

describe('PASSPORT_MODULE_005 Liquidity Positions', () => {
  it('keeps Founder mockup byte-identical', () => {
    const mockupPath = path.join(REPO, PASSPORT_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const bytes = readFileSync(mockupPath)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(PASSPORT_MOCKUP.sha256)
  })

  it('freezes MODULE 001–004 implementation files', () => {
    const freeze = JSON.parse(
      readFileSync(path.join(__dirname, 'passportModule001_002_003_004.freeze.sha256.json'), 'utf8'),
    )
    for (const [file, expected] of Object.entries(freeze.files as Record<string, string>)) {
      const sha = createHash('sha256').update(readFileSync(path.join(ROOT, file))).digest('hex')
      expect(sha).toBe(expected)
    }
  })

  it('locks Module 005 geometry without altering 001–004 sizes', () => {
    expect(passportOne.liquidityW).toBe('1376px')
    expect(passportOne.liquidityMinH).toBe('232px')
    expect(passportOne.liquidityTableW).toBe('1336px')
    expect(passportOne.liquidityColPair).toBe('300px')
    expect(passportOne.liquidityColType).toBe('160px')
    expect(passportOne.liquidityColValue).toBe('180px')
    expect(passportOne.liquidityColShare).toBe('180px')
    expect(passportOne.liquidityColFees).toBe('180px')
    expect(passportOne.liquidityColStatus).toBe('156px')
    expect(passportOne.liquidityColAction).toBe('180px')
    expect(passportOne.heroH).toBe('360px')
    expect(passportOne.portfolioH).toBe('176px')
    expect(passportOne.assetsH).toBe('176px')
    expect(passportOne.projectsH).toBe('176px')
    expect(passportLiquidityModuleHeightPx(0, true)).toBe(232)
    expect(passportLiquidityModuleHeightPx(3, false)).toBe(332)
  })

  it('disconnected state has zero positions', () => {
    const vm = buildPassportLiquidityPositionsViewModel({ forceDisconnected: true })
    expect(vm.walletConnected).toBe(false)
    expect(vm.positions).toHaveLength(0)
  })

  it('connected empty state routes to add + building', () => {
    const vm = buildPassportLiquidityPositionsViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      manualPositions: [],
      lbPrograms: [],
    })
    expect(vm.totalCount).toBe(0)
    expect(vm.emptyAddHref).toBe(LIQUIDITY_ADD_HREF)
    expect(vm.emptyBuildingHref).toBe(LIQUIDITY_BUILDING_HREF)
    expect(vm.viewAllLabel).toBe('Explore Liquidity')
  })

  it('maps manual and LB rows with factual unavailable values', () => {
    const vm = buildPassportLiquidityPositionsViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
      manualPositions: [
        {
          id: '0xpair1',
          pairLabel: 'MARCO / WBNB',
          token0Symbol: 'MARCO',
          token1Symbol: 'WBNB',
          pairAddress: '0xpair1',
        },
      ],
      lbPrograms: [
        {
          id: 'prog1',
          pairLabel: 'ALPHA / WBNB',
          status: 'ACTIVE',
          programAddress: '0xprog1',
          liquidityBuiltLabel: null,
        },
      ],
    })
    expect(vm.totalCount).toBe(2)
    expect(vm.positions[0].type).toBe('Manual')
    expect(vm.positions[0].estimatedValue).toBe(LIQUIDITY_UNAVAILABLE)
    expect(vm.positions[0].actionHref).toContain('view=positions')
    expect(vm.positions[0].actionHref).toContain('position=')
    expect(vm.positions[1].type).toBe('Liquidity Building')
    expect(vm.positions[1].status).toBe('Active')
    expect(vm.positions[1].actionHref).toContain('view=building')
  })

  it('maps LB statuses including Safety Paused without collapsing', () => {
    const vm = buildPassportLiquidityPositionsViewModel({
      address: '0xabc',
      lbPrograms: [{ id: '1', pairLabel: 'A / B', status: 'SAFETY_PAUSED', programAddress: '0x1' }],
    })
    expect(vm.positions[0].status).toBe('Paused for safety')
    expect(vm.positions[0].statusTone).toBe('danger')
  })

  it('prevents double-counting when LB and manual share pair key', () => {
    const manuals = [
      fixturePos({
        id: 'manual-1',
        type: 'Manual',
        pairLabel: 'MARCO / WBNB',
        dedupeKey: '0xpair',
        source: 'wallet-lp',
      }),
    ]
    const lbs = [
      fixturePos({
        id: 'lb-1',
        type: 'Liquidity Building',
        pairLabel: 'MARCO / WBNB',
        dedupeKey: '0xpair',
        source: 'liquidity-building',
        status: 'Active',
      }),
    ]
    const merged = mergeLiquidityPositions(manuals, lbs)
    expect(merged).toHaveLength(1)
    expect(merged[0].type).toBe('Liquidity Building')
    expect(DOUBLE_COUNT_POLICY).toMatch(/single Liquidity Building summary/i)
  })

  it('caps visible rows at 3 and exposes View All', () => {
    const positions = [1, 2, 3, 4].map((n) =>
      fixturePos({
        id: `p${n}`,
        type: 'Manual',
        pairLabel: `T${n} / WBNB`,
        dedupeKey: `k${n}`,
      }),
    )
    const vm = buildPassportLiquidityPositionsViewModel({ fixturePositions: positions })
    expect(vm.visiblePositions).toHaveLength(3)
    expect(vm.hasMore).toBe(true)
    expect(vm.viewAllHref).toBe(LIQUIDITY_VIEW_ALL_HREF)
    expect(vm.viewAllLabel).toBe('View All')
  })

  it('production builder without fixtures invents no mockup money', () => {
    const vm = buildPassportLiquidityPositionsViewModel({
      address: '0x8f1234567890abcdef1234567890abcdef7a3B',
    })
    expect(vm.positions).toHaveLength(0)
    const blob = ['PassportLiquidity.tsx', 'PassportLiquidityRow.tsx', 'buildPassportLiquidityPositionsViewModel.ts']
      .map(load)
      .join('\n')
    expect(blob).not.toContain('$12,480')
    expect(blob).not.toContain('Farm')
  })

  it('mounts Module 005 with prior modules preserved', () => {
    const screen = readFileSync(path.join(WEB, 'src/views/Passport/PassportScreen.tsx'), 'utf8')
    expect(screen).toContain('PassportHeroIdentityModule')
    expect(screen).toContain('PassportPortfolioOverview')
    expect(screen).toContain('PassportAssets')
    expect(screen).toContain('PassportProjects')
    expect(screen).toContain('PassportLiquidity')
    expect(screen).toContain('data-passport-module-005')
    expect(screen).toContain('CommandCenterScreen')
  })

  it('does not invent farms in Module 005 scope', () => {
    const blob = load('PassportLiquidity.tsx')
    expect(blob).not.toContain('Farm')
  })

  it('skips NOT_ACTIVE and STOPPED LB programs', () => {
    const vm = buildPassportLiquidityPositionsViewModel({
      address: '0xabc',
      lbPrograms: [
        { id: 'a', pairLabel: 'A / B', status: 'NOT_ACTIVE' },
        { id: 'b', pairLabel: 'C / D', status: 'STOPPED' },
        { id: 'c', pairLabel: 'E / F', status: 'READY', programAddress: '0xc' },
      ],
    })
    expect(vm.totalCount).toBe(1)
    expect(vm.positions[0].status).toBe('Ready')
  })
})
