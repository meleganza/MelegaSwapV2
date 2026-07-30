/**
 * POOLS_MODULE_005 — Finished Pools focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  buildPoolsFinishedPoolsViewModel,
  cardToFinishedPoolModel,
  compareFinishedPools,
  isFinishedPoolCard,
  isFinishedWalletOwnership,
  resolveFinishedStatus,
} from '../modules/buildPoolsFinishedPools'
import {
  POOLS_MODULE_001_FREEZE_SHA256,
  POOLS_MODULE_002_FREEZE_SHA256,
  POOLS_MODULE_003_FREEZE_SHA256,
  POOLS_MODULE_004_FREEZE_SHA256,
  poolsFinished,
} from '../modules/poolsFinishedPoolsTokens'
import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import type { PoolPreviewCard } from '../poolsStudioData'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')

function sha256File(relFromWeb: string): string {
  return createHash('sha256').update(readFileSync(path.join(WEB, relFromWeb))).digest('hex')
}

function makeCard(partial: Partial<PoolPreviewCard> & { id: string }): PoolPreviewCard {
  return {
    name: partial.name ?? 'Ended Pool',
    tokens: partial.tokens ?? ['MARCO', 'ASTER'],
    stakeToken: partial.stakeToken ?? 'MARCO',
    rewardToken: partial.rewardToken ?? 'ASTER',
    tvl: partial.tvl ?? '—',
    dailyRewards: partial.dailyRewards ?? '—',
    participants: partial.participants ?? '—',
    status: partial.status ?? 'ended',
    displayStatus: partial.displayStatus ?? 'ENDED',
    cta: partial.cta ?? 'none',
    sousId: partial.sousId ?? 1,
    estimatedDuration: partial.estimatedDuration ?? 'Ended',
    rawPool: partial.rawPool ?? ({
      stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
      earningToken: { symbol: 'ASTER', decimals: 18, address: '0xaster' },
      isFinished: true,
    } as any),
    ...partial,
  }
}

describe('POOLS_MODULE_005 Finished Pools', () => {
  it('freezes Architecture 000 mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(poolsFinished.mockupSha256)
  })

  it('retains Module 005 builder sources while demoting standalone Finished section', () => {
    // Economics repair: Finished positions stay in My Positions; standalone section removed.
    expect(existsSync(path.join(STUDIO, 'modules/PoolsFinishedPoolsModule.tsx'))).toBe(true)
    expect(existsSync(path.join(STUDIO, 'modules/buildPoolsFinishedPools.ts'))).toBe(true)
    expect(sha256File('src/views/PoolsStudio/modules/PoolsOverviewKpisModule.tsx')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.PoolsOverviewKpisModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx')).toBe(
      POOLS_MODULE_004_FREEZE_SHA256.PoolsExplorePoolsModule,
    )
  })

  it('does not mount standalone Finished section on economics-repair IA', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).not.toContain('<PoolsFinishedPoolsModule')
    expect(screen).toContain('founder-economics-repair-v1')
    expect(screen).not.toContain('data-pools-module="009"')
    expect(screen).not.toContain('PoolsIntegrationModule')
  })

  it('includes only ended wallet-owned pools; excludes active and unowned historical', () => {
    const withdraw = makeCard({
      id: 'w',
      sousId: 1,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber(0),
    })
    const emergency = makeCard({
      id: 'e',
      sousId: 2,
      userStaked: new BigNumber('2000000000000000000'),
      pendingReward: new BigNumber(0),
      rawPool: {
        stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
        earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
        enableEmergencyWithdraw: true,
        isFinished: true,
      } as any,
    })
    const claimableOnly = makeCard({
      id: 'c',
      sousId: 3,
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber('500000000000000000'),
    })
    const active = makeCard({
      id: 'a',
      sousId: 4,
      status: 'live',
      displayStatus: 'LIVE',
      cta: 'stake',
      userStaked: new BigNumber('1'),
      pendingReward: new BigNumber(0),
    })
    const unownedEnded = makeCard({
      id: 'u',
      sousId: 5,
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber(0),
    })

    expect(isFinishedPoolCard(withdraw)).toBe(true)
    expect(isFinishedWalletOwnership(withdraw)).toBe(true)
    expect(isFinishedWalletOwnership(unownedEnded)).toBe(false)
    expect(resolveFinishedStatus(active)).toBeNull()
    expect(resolveFinishedStatus(unownedEnded)).toBeNull()
    expect(resolveFinishedStatus(emergency)?.status).toBe('EMERGENCY')
    expect(resolveFinishedStatus(withdraw)?.status).toBe('WITHDRAW_ONLY')
    expect(resolveFinishedStatus(claimableOnly)?.status).toBe('ENDED')

    const vm = buildPoolsFinishedPoolsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [unownedEnded, active, claimableOnly, withdraw, emergency],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.pools).toHaveLength(3)
    expect(vm.pools[0].status).toBe('EMERGENCY')
    expect(vm.pools[1].status).toBe('WITHDRAW_ONLY')
    expect(vm.pools[2].status).toBe('ENDED')
  })

  it('orders Emergency → Withdrawable → Ended', () => {
    const ended = cardToFinishedPoolModel(
      makeCard({
        id: 'ended',
        sousId: 3,
        userStaked: new BigNumber(0),
        pendingReward: new BigNumber('1'),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const withdraw = cardToFinishedPoolModel(
      makeCard({
        id: 'wd',
        sousId: 2,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const emergency = cardToFinishedPoolModel(
      makeCard({
        id: 'em',
        sousId: 1,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          enableEmergencyWithdraw: true,
          isFinished: true,
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const sorted = [ended, withdraw, emergency].sort(compareFinishedPools)
    expect(sorted.map((p) => p.status)).toEqual(['EMERGENCY', 'WITHDRAW_ONLY', 'ENDED'])
  })

  it('Withdraw primary; Emergency secondary only when supported; no dead Withdraw', () => {
    const wd = cardToFinishedPoolModel(
      makeCard({
        id: 'wd',
        sousId: 1,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'RARI', decimals: 18, address: '0xr' },
          earningToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          enableEmergencyWithdraw: true,
          isFinished: true,
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(wd.actions[0].kind).toBe('withdraw')
    expect(wd.actions[0].label).toBe('Withdraw')
    expect(wd.actions.some((a) => a.kind === 'emergency_withdraw')).toBe(true)

    const claimOnly = cardToFinishedPoolModel(
      makeCard({
        id: 'cl',
        sousId: 2,
        userStaked: new BigNumber(0),
        pendingReward: new BigNumber('1'),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(claimOnly.actions[0].kind).toBe('claim')
    expect(claimOnly.actions.some((a) => a.kind === 'withdraw')).toBe(false)
  })

  it('wallet zero / disconnected / loading states', () => {
    expect(
      buildPoolsFinishedPoolsViewModel({
        account: null,
        chainId: 56,
        portfolioPools: [],
        userDataLoaded: false,
        poolsLoading: false,
      }).state,
    ).toBe('disconnected')

    expect(
      buildPoolsFinishedPoolsViewModel({
        account: '0x1',
        chainId: 56,
        portfolioPools: [],
        userDataLoaded: false,
        poolsLoading: true,
      }).state,
    ).toBe('loading')

    expect(
      buildPoolsFinishedPoolsViewModel({
        account: '0x1',
        chainId: 56,
        portfolioPools: [makeCard({ id: 'z', userStaked: new BigNumber(0), pendingReward: new BigNumber(0) })],
        userDataLoaded: true,
        poolsLoading: false,
      }).state,
    ).toBe('empty')
  })

  it('desktop geometry tokens match 430×240 / 18 gap', () => {
    expect(poolsFinished.cardW).toBe('430px')
    expect(poolsFinished.cardH).toBe('240px')
    expect(poolsFinished.cardGap).toBe('18px')
    expect(poolsFinished.contentMax).toBe('1376px')
  })

  it('module sources avoid production mock finished pools', () => {
    const src = [
      readFileSync(path.join(MODULES, 'PoolsFinishedPoolsModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildPoolsFinishedPools.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'usePoolsFinishedPools.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('mockFinished')
    expect(src).not.toContain('SAMPLE_FINISHED')
    expect(src).not.toContain('getPoolsUxFixtureCards')
  })
})
