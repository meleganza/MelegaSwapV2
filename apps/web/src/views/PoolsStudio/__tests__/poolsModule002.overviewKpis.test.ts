/**
 * POOLS_MODULE_002 — Overview KPIs factual rules + freeze guards.
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from '../modules/poolsHeroTokens'
import { POOLS_OVERVIEW_KPI_ORDER, poolsOverviewKpis } from '../modules/poolsOverviewKpisTokens'
import { buildPoolsOverviewKpisFromParts } from '../modules/usePoolsOverviewKpis'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')

function shaFile(relFromStudio: string) {
  return createHash('sha256').update(readFileSync(path.join(STUDIO, relFromStudio))).digest('hex')
}

describe('POOLS_MODULE_002 Overview KPIs', () => {
  it('keeps Architecture 000 mockup and Module 001 Hero sources frozen', () => {
    const mockupPath = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockupPath)).toBe(true)
    const mockSha = createHash('sha256').update(readFileSync(mockupPath)).digest('hex')
    expect(mockSha).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(poolsOverviewKpis.mockupSha256).toBe(mockSha)
    expect(poolsHero.mockupSha256).toBe(mockSha)

    // Hero owned files must not change in Module 002 missions (byte lock via presence + contracts).
    const hero = readFileSync(path.join(STUDIO, 'modules/PoolsHeroModule.tsx'), 'utf8')
    expect(hero).toContain('data-pools-module="001"')
    expect(hero).toContain('1376x260')
    expect(shaFile('modules/poolsHeroTokens.ts').length).toBe(64)
  })

  it('locks six-card order and desktop geometry contracts', () => {
    expect([...POOLS_OVERVIEW_KPI_ORDER]).toEqual([
      'tvl',
      'discovered',
      'rewarding',
      'rewards24h',
      'sustainableApr',
      'claimable',
    ])
    expect(poolsOverviewKpis.moduleW).toBe('1376px')
    expect(poolsOverviewKpis.moduleH).toBe('112px')
    expect(poolsOverviewKpis.cardW).toBe('216px')
    expect(poolsOverviewKpis.cardGap).toBe('16px')
    const sum = 216 * 6 + 16 * 5
    expect(sum).toBe(1376)
  })

  it('never uses Factory pair counts for Pools Discovered', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [],
      classification: {
        status: 'ready',
        counts: { discovered: 239, active: 40, ended: 180, rewarding: 12, funded: 20, verified: 200, invalid: 5 },
      },
      previewCards: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    const discovered = vm.cards.find((c) => c.id === 'discovered')!
    expect(discovered.value).toBe('239')
    expect(vm.diagnostics.factoryPairsNotUsed).toBe(true)
    expect(discovered.value).not.toBe('516')
  })

  it('shows unavailable discovered as em-dash not zero', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [],
      classification: { status: 'unavailable' },
      previewCards: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    expect(vm.cards.find((c) => c.id === 'discovered')!.value).toBe('—')
  })

  it('allows factual zero discovered when classification ready', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [],
      classification: {
        status: 'ready',
        counts: { discovered: 0, active: 0, ended: 0, rewarding: 0, funded: 0, verified: 0, invalid: 0 },
      },
      previewCards: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    expect(vm.cards.find((c) => c.id === 'discovered')!.value).toBe('0')
  })

  it('never fabricates 24H rewards from emission projections', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [
        {
          totalStaked: new BigNumber('1000000000000000000'),
          stakingToken: { decimals: 18 },
          stakingTokenPrice: 1,
          earningToken: { decimals: 18 },
          earningTokenPrice: 1,
        },
      ],
      classification: {
        status: 'ready',
        counts: { discovered: 1, active: 1, ended: 0, rewarding: 1, funded: 1, verified: 1, invalid: 0 },
      },
      previewCards: [],
      userDataLoaded: true,
      account: '0xabc',
      poolsLoading: false,
    })
    const r24 = vm.cards.find((c) => c.id === 'rewards24h')!
    expect(r24.value).toBe('—')
    expect(r24.supporting).toContain('24H reward data unavailable')
    expect(vm.diagnostics.rewards24hSource).toBe('unavailable_no_indexed_distribution')
  })

  it('discloses partial TVL and never treats missing price as zero TVL', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [
        {
          totalStaked: new BigNumber('1000000000000000000'),
          stakingToken: { decimals: 18 },
          stakingTokenPrice: 2,
        },
        {
          totalStaked: new BigNumber('5000000000000000000'),
          stakingToken: { decimals: 18 },
          stakingTokenPrice: 0,
        },
      ],
      classification: { status: 'unavailable' },
      previewCards: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    const tvl = vm.cards.find((c) => c.id === 'tvl')!
    expect(tvl.state).toBe('partial')
    expect(tvl.value).not.toBe('$0.00')
    expect(tvl.supporting).toMatch(/Partial/)
  })

  it('shows TVL unavailable when stake exists but no prices', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [
        {
          totalStaked: new BigNumber('1000000000000000000'),
          stakingToken: { decimals: 18 },
          stakingTokenPrice: 0,
        },
      ],
      classification: { status: 'unavailable' },
      previewCards: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    const tvl = vm.cards.find((c) => c.id === 'tvl')!
    expect(tvl.value).toBe('—')
    expect(tvl.supporting).toBe('Valuation unavailable')
  })

  it('excludes forbidden/ended APR and reports sustainable APR unavailable when none qualify', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [],
      classification: { status: 'ready', counts: { discovered: 2, active: 0, ended: 2, rewarding: 0, funded: 0, verified: 2, invalid: 0 } },
      previewCards: [
        { name: 'Ended', status: 'ended', sustainableAprDisplay: '40.00%', lifecycle: { rewarding: false } },
        { name: 'Spike', status: 'live', sustainableAprDisplay: '0%', lifecycle: { rewarding: true } },
      ],
      userDataLoaded: false,
      poolsLoading: false,
    })
    expect(vm.cards.find((c) => c.id === 'sustainableApr')!.value).toBe('—')
  })

  it('picks highest sustainable APR among rewarding pools', () => {
    const vm = buildPoolsOverviewKpisFromParts({
      poolRows: [],
      classification: { status: 'ready', counts: { discovered: 2, active: 2, ended: 0, rewarding: 2, funded: 2, verified: 2, invalid: 0 } },
      previewCards: [
        { name: 'A', status: 'live', sustainableAprDisplay: '12.00%', lifecycle: { rewarding: true } },
        { name: 'B', status: 'live', sustainableAprDisplay: '28.50%', lifecycle: { rewarding: true } },
      ],
      userDataLoaded: false,
      poolsLoading: false,
    })
    const apr = vm.cards.find((c) => c.id === 'sustainableApr')!
    expect(apr.value).toBe('28.50%')
    expect(apr.supporting).toBe('B')
  })

  it('handles claimable disconnected / zero / valued', () => {
    const disconnected = buildPoolsOverviewKpisFromParts({
      poolRows: [],
      classification: { status: 'unavailable' },
      previewCards: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    expect(disconnected.cards.find((c) => c.id === 'claimable')!.supporting).toBe('Connect wallet to view')

    const zero = buildPoolsOverviewKpisFromParts({
      poolRows: [{ stakingToken: { decimals: 18 }, stakingTokenPrice: 1, totalStaked: new BigNumber(0), earningToken: { decimals: 18 }, earningTokenPrice: 1 }],
      classification: { status: 'unavailable' },
      previewCards: [],
      account: '0x1',
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(zero.cards.find((c) => c.id === 'claimable')!.value).toBe('$0.00')

    const valued = buildPoolsOverviewKpisFromParts({
      poolRows: [
        {
          stakingToken: { decimals: 18 },
          stakingTokenPrice: 1,
          totalStaked: new BigNumber(0),
          earningToken: { decimals: 18 },
          earningTokenPrice: 2,
          userData: { pendingReward: new BigNumber('1000000000000000000') },
        },
      ],
      classification: { status: 'unavailable' },
      previewCards: [],
      account: '0x1',
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(valued.cards.find((c) => c.id === 'claimable')!.value).not.toBe('—')
    expect(valued.cards.find((c) => c.id === 'claimable')!.supporting).toContain('1 claimable')
  })

  it('mounts Module 002 after Hero; Modules 003–006 may follow; Modules 007–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('PoolsHeroModule')
    expect(screen).toContain('PoolsOverviewKpisModule')
    expect(screen.indexOf('PoolsHeroModule')).toBeLessThan(screen.indexOf('PoolsOverviewKpisModule'))
    expect(screen).not.toContain('PoolsKpiRow')
    expect(screen).not.toContain('data-pools-module="007"')
    expect(screen).not.toContain('PoolsAnalyticsModule')
  })

  it('does not ship mock KPI dollar fixtures in Module 002 sources', () => {
    const src = [
      readFileSync(path.join(STUDIO, 'modules/PoolsOverviewKpisModule.tsx'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/usePoolsOverviewKpis.ts'), 'utf8'),
      readFileSync(path.join(STUDIO, 'modules/poolsOverviewKpisTokens.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('202.4')
    expect(src).not.toContain('128.45')
    expect(src).not.toContain('$53.21')
  })
})
