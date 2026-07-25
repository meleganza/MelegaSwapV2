/**
 * FARMS_MODULE_005 — Finished Farms focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import {
  FARMS_ARCHITECTURE_000_TIP,
  FARMS_MODULE_001_FREEZE_SHA256,
  FARMS_MODULE_002_FREEZE_SHA256,
  FARMS_MODULE_003_FREEZE_SHA256,
  FARMS_MODULE_004_FREEZE_SHA256,
  farmsFinished,
} from '../modules/farmsFinishedFarmsTokens'
import {
  buildFarmsFinishedFarmsViewModel,
  cardToFinishedFarmPosition,
  compareFinishedFarmPositions,
  isFinishedFarmCard,
  resolveFinishedFarmStatus,
} from '../modules/buildFarmsFinishedFarms'
import type { FarmPreviewCard } from '../farmsStudioData'
import type { FinishedFarmPosition } from '../modules/farmsFinishedFarmsTypes'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')
const sha = (rel: string) => createHash('sha256').update(readFileSync(path.join(WEB, rel))).digest('hex')

function makeCard(partial: Partial<FarmPreviewCard> & { pid?: number } = {}): FarmPreviewCard {
  const pid = partial.pid ?? 1
  const rawPartial = (partial.rawFarm ?? {}) as Record<string, unknown>
  const userPartial = (rawPartial.userData ?? {}) as Record<string, unknown>
  const { rawFarm: _drop, ...rest } = partial
  return {
    id: `farm-${pid}`,
    pair: 'MARCO / ASTER',
    tokens: ['MARCO', 'ASTER'],
    status: 'finished',
    tvl: '—',
    dailyRewards: '—',
    multiplier: '0x',
    liquidity: '—',
    cta: 'none',
    emissionState: 'zero',
    rewardToken: 'MXMX',
    ...rest,
    pid,
    rawFarm: {
      pid,
      multiplier: '0X',
      lpAddress: '0x1111111111111111111111111111111111111111',
      token: { symbol: 'MARCO', decimals: 18, address: '0x2222222222222222222222222222222222222222' },
      quoteToken: { symbol: 'ASTER', decimals: 18, address: '0x3333333333333333333333333333333333333333' },
      earningToken: { symbol: 'MXMX', decimals: 18, address: '0x4444444444444444444444444444444444444444' },
      ...rawPartial,
      userData: {
        tokenBalance: new BigNumber(0),
        allowance: new BigNumber(0),
        stakedBalance: new BigNumber(0),
        earnings: new BigNumber(0),
        ...userPartial,
      },
    } as any,
    userStaked: partial.userStaked ?? new BigNumber(0),
    pendingReward: partial.pendingReward ?? new BigNumber(0),
  }
}

describe('FARMS_MODULE_005 Finished Farms', () => {
  it('freezes Architecture tip, Founder mockup, and Modules 001–004 sources', () => {
    expect(FARMS_ARCHITECTURE_000_TIP.startsWith('8edd68d4')).toBe(true)
    const mock = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mock)).toBe(true)
    expect(createHash('sha256').update(readFileSync(mock)).digest('hex')).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(farmsFinished.mockupSha256).toBe(FARMS_FOUNDER_MOCKUP.sha256)

    expect(sha('src/views/FarmsStudio/modules/FarmsHeroModule.tsx')).toBe(FARMS_MODULE_001_FREEZE_SHA256.FarmsHeroModule)
    expect(sha('src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx')).toBe(
      FARMS_MODULE_002_FREEZE_SHA256.FarmsOverviewKpisModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsMyFarmsModule.tsx')).toBe(FARMS_MODULE_003_FREEZE_SHA256.FarmsMyFarmsModule)
    expect(sha('src/views/FarmsStudio/modules/buildFarmsWalletPositions.ts')).toBe(
      FARMS_MODULE_003_FREEZE_SHA256.buildFarmsWalletPositions,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmsModule,
    )
    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmCard,
    )
    expect(sha('src/views/FarmsStudio/modules/buildFarmsExploreFarms.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.buildFarmsExploreFarms,
    )
    expect(sha('src/views/FarmsStudio/modules/useFarmsExploreFarms.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.useFarmsExploreFarms,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsExploreFarmsTokens.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.farmsExploreFarmsTokens,
    )
    expect(sha('src/views/FarmsStudio/modules/farmsExploreFarmsTypes.ts')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.farmsExploreFarmsTypes,
    )
  })

  it('locks desktop card geometry 446×250 with 19px gaps filling 1376', () => {
    expect(446 * 3 + 19 * 2).toBe(1376)
    expect(farmsFinished.cardW).toBe('446px')
    expect(farmsFinished.cardH).toBe('250px')
    expect(farmsFinished.cardGapX).toBe('19px')
    expect(farmsFinished.historyHref).toBe('/farms/history')
  })

  it('mounts Module 005 after Explore without Modules 006–008', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('FarmsFinishedFarmsModule')
    expect(screen).toContain('data-farms-module-005="mounted"')
    expect(screen.indexOf('FarmsExploreFarmsModule')).toBeLessThan(screen.indexOf('FarmsFinishedFarmsModule'))
    expect(screen).not.toContain('data-farms-module="006"')
    expect(screen).not.toContain('FarmsYieldAdvisorModule')
    expect(screen).not.toContain('FarmsAnalyticsModule')
  })

  it('includes only wallet-owned finished/recovery farms; excludes active and closed zero', () => {
    const withdraw = makeCard({
      pid: 1,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber(0),
    })
    const active = makeCard({
      pid: 2,
      status: 'live',
      cta: 'stake',
      emissionState: 'active',
      multiplier: '1x',
      userStaked: new BigNumber('1000000000000000000'),
      rawFarm: { pid: 2, multiplier: '1X', lpAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } as any,
    })
    const closed = makeCard({ pid: 3, userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })
    const configOnly = makeCard({
      pid: 4,
      userStaked: undefined,
      pendingReward: undefined,
      rawFarm: { pid: 4, multiplier: '0X', userData: undefined } as any,
    })
    const rewardOnly = makeCard({
      pid: 5,
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber('500000000000000000'),
    })
    const emergency = makeCard({
      pid: 6,
      userStaked: new BigNumber('2000000000000000000'),
      rawFarm: {
        pid: 6,
        enableEmergencyWithdraw: true,
        multiplier: '0X',
        lpAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      } as any,
    })

    expect(isFinishedFarmCard(withdraw)).toBe(true)
    expect(isFinishedFarmCard(active)).toBe(false)
    expect(isFinishedFarmCard(closed)).toBe(false)
    expect(isFinishedFarmCard(configOnly)).toBe(false)
    expect(isFinishedFarmCard(rewardOnly)).toBe(true)
    expect(isFinishedFarmCard(emergency)).toBe(true)

    expect(resolveFinishedFarmStatus(withdraw)?.status).toBe('WITHDRAW_ONLY')
    expect(resolveFinishedFarmStatus(emergency)?.status).toBe('EMERGENCY')
    expect(resolveFinishedFarmStatus(rewardOnly)?.status).toBe('ENDED')
    expect(resolveFinishedFarmStatus(active)).toBeNull()
  })

  it('orders EMERGENCY before WITHDRAW+reward before WITHDRAW before ENDED reward', () => {
    const emergency = cardToFinishedFarmPosition(
      makeCard({
        pid: 1,
        userStaked: new BigNumber(1),
        rawFarm: { pid: 1, enableEmergencyWithdraw: true, multiplier: '0X' } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const withdrawReward = cardToFinishedFarmPosition(
      makeCard({
        pid: 2,
        userStaked: new BigNumber('2000000000000000000'),
        pendingReward: new BigNumber('1000000000000000000'),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const withdrawOnly = cardToFinishedFarmPosition(
      makeCard({ pid: 3, userStaked: new BigNumber('1000000000000000000'), pendingReward: new BigNumber(0) }),
      { wallet: '0x1', chainId: 56 },
    )!
    const endedReward = cardToFinishedFarmPosition(
      makeCard({ pid: 4, userStaked: new BigNumber(0), pendingReward: new BigNumber('1000000000000000000') }),
      { wallet: '0x1', chainId: 56 },
    )!
    const ordered = [endedReward, withdrawOnly, withdrawReward, emergency].sort(compareFinishedFarmPositions)
    expect(ordered.map((p) => p.positionStatus)).toEqual(['EMERGENCY', 'WITHDRAW_ONLY', 'WITHDRAW_ONLY', 'ENDED'])
    expect(ordered[1].pid).toBe(2)
  })

  it('models disconnected, loading, empty, unavailable, and stale retention', () => {
    expect(
      buildFarmsFinishedFarmsViewModel({
        portfolioFarms: [],
        userDataLoaded: false,
        farmsLoading: false,
      }).state,
    ).toBe('disconnected')

    expect(
      buildFarmsFinishedFarmsViewModel({
        account: '0x1',
        chainId: 56,
        portfolioFarms: [],
        userDataLoaded: false,
        farmsLoading: true,
      }).state,
    ).toBe('loading')

    expect(
      buildFarmsFinishedFarmsViewModel({
        account: '0x1',
        chainId: 56,
        portfolioFarms: [makeCard({ userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })],
        userDataLoaded: true,
        farmsLoading: false,
      }).state,
    ).toBe('empty')

    expect(
      buildFarmsFinishedFarmsViewModel({
        account: '0x1',
        chainId: 56,
        portfolioFarms: [],
        userDataLoaded: true,
        farmsLoading: false,
        sourcesFailed: true,
      }).state,
    ).toBe('unavailable')

    const prior = cardToFinishedFarmPosition(
      makeCard({ userStaked: new BigNumber('1000000000000000000') }),
      { wallet: '0x1', chainId: 56 },
    )!
    const stale = buildFarmsFinishedFarmsViewModel({
      account: '0x1',
      chainId: 56,
      portfolioFarms: [],
      userDataLoaded: true,
      farmsLoading: false,
      sourcesFailed: true,
      previous: [prior],
      previousWallet: '0x1',
      previousChainId: 56,
    })
    expect(stale.state).toBe('stale')
    expect(stale.positions).toHaveLength(1)
    expect(stale.moduleDisclosure).toMatch(/temporarily unavailable/i)
  })

  it('never shows ACTIVE status and never formats raw uint256', () => {
    const position = cardToFinishedFarmPosition(
      makeCard({
        userStaked: new BigNumber('1250450000000000000000'),
        pendingReward: new BigNumber('18420000000000000000'),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(position.positionStatus).not.toBe('ACTIVE' as any)
    expect(position.stakedFormatted).not.toContain('1250450000000000000000')
    expect(position.pendingFormatted).not.toContain('18420000000000000000')
    expect(position.stakedFormatted).toMatch(/LP/)
    expect(position.pendingFormatted).toMatch(/MXMX/)
  })

  it('wires Withdraw / Harvest / Emergency via modal actions and omits unsupported', () => {
    const withdraw = cardToFinishedFarmPosition(
      makeCard({
        userStaked: new BigNumber(1),
        pendingReward: new BigNumber(1),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(withdraw.actions.map((a) => a.label)).toEqual(['Withdraw LP', 'Harvest'])
    expect(withdraw.actions.every((a) => a.modalAction === 'unstake' || a.modalAction === 'claim')).toBe(true)

    const emergency = cardToFinishedFarmPosition(
      makeCard({
        userStaked: new BigNumber(1),
        pendingReward: new BigNumber(1),
        rawFarm: { pid: 1, enableEmergencyWithdraw: true, multiplier: '0X' } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(emergency.actions).toHaveLength(1)
    expect(emergency.actions[0].label).toBe('Emergency Withdraw')
    expect(emergency.withdrawSupported).toBe(false)

    const rewardOnly = cardToFinishedFarmPosition(
      makeCard({ userStaked: new BigNumber(0), pendingReward: new BigNumber(1) }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(rewardOnly.actions.map((a) => a.label)).toEqual(['Harvest'])
  })

  it('ships no production mock positions and keeps Explore frozen', () => {
    const src = [
      'FarmsFinishedFarmsModule.tsx',
      'FarmsFinishedFarmCard.tsx',
      'buildFarmsFinishedFarms.ts',
      'useFarmsFinishedFarms.ts',
    ]
      .map((f) => readFileSync(path.join(MODULES, f), 'utf8'))
      .join('\n')
    expect(src).not.toContain('mockPositions')
    expect(src).not.toContain('SAMPLE_FINISHED')
    expect(src).not.toContain('fixtureFinished')
    // Ensure we did not mutate Explore source (freeze already asserted above)
    expect(sha('src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx')).toBe(
      FARMS_MODULE_004_FREEZE_SHA256.FarmsExploreFarmsModule,
    )
  })
})
