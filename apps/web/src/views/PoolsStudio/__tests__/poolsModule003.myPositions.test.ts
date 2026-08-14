/**
 * POOLS_MODULE_003 — My Positions focused certification tests.
 */
import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import {
  buildPoolsWalletPositionsViewModel,
  cardToPoolsWalletPosition,
  comparePoolsWalletPositions,
  formatPositionTokenAmount,
  positionInclusionEligible,
  userDataPresence,
} from '../modules/buildPoolsWalletPositions'
import {
  POOLS_MODULE_001_FREEZE_SHA256,
  POOLS_MODULE_002_FREEZE_SHA256,
  poolsMyPositions,
} from '../modules/poolsMyPositionsTokens'
import { POOLS_FOUNDER_MOCKUP, POOLS_CANONICAL_STATUS } from '../poolsArchitecture000Contracts'
import type { PoolPreviewCard } from '../poolsStudioData'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(__dirname, '../../../../../../')
const STUDIO = path.resolve(__dirname, '..')
const MODULES = path.join(STUDIO, 'modules')

function sha256File(relFromWeb: string): string {
  const abs = path.join(WEB, relFromWeb)
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

function makeCard(partial: Partial<PoolPreviewCard> & { id: string }): PoolPreviewCard {
  return {
    name: partial.name ?? 'Pool',
    tokens: partial.tokens ?? ['MARCO'],
    stakeToken: partial.stakeToken ?? 'MARCO',
    rewardToken: partial.rewardToken ?? 'ASTER',
    tvl: partial.tvl ?? '$0',
    dailyRewards: partial.dailyRewards ?? '—',
    participants: partial.participants ?? '—',
    status: partial.status ?? 'live',
    displayStatus: partial.displayStatus ?? 'LIVE',
    ...partial,
  }
}

describe('POOLS_MODULE_003 My Positions', () => {
  it('freezes Architecture 000 mockup SHA', () => {
    const mockup = path.join(REPO, POOLS_FOUNDER_MOCKUP.relativePath)
    expect(existsSync(mockup)).toBe(true)
    const hash = createHash('sha256').update(readFileSync(mockup)).digest('hex')
    expect(hash).toBe(POOLS_FOUNDER_MOCKUP.sha256)
    expect(hash).toBe(poolsMyPositions.mockupSha256)
  })

  it('freezes Module 001 sources byte-identically', () => {
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroModule.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroArtwork.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroArtwork,
    )
    expect(sha256File('src/views/PoolsStudio/modules/PoolsHeroTrustPanel.tsx')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.PoolsHeroTrustPanel,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsHeroTokens.ts')).toBe(
      POOLS_MODULE_001_FREEZE_SHA256.poolsHeroTokens,
    )
  })

  it('freezes Module 002 sources byte-identically', () => {
    expect(sha256File('src/views/PoolsStudio/modules/PoolsOverviewKpisModule.tsx')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.PoolsOverviewKpisModule,
    )
    expect(sha256File('src/views/PoolsStudio/modules/usePoolsOverviewKpis.ts')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.usePoolsOverviewKpis,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsOverviewKpisTokens.ts')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.poolsOverviewKpisTokens,
    )
    expect(sha256File('src/views/PoolsStudio/modules/poolsOverviewKpisTypes.ts')).toBe(
      POOLS_MODULE_002_FREEZE_SHA256.poolsOverviewKpisTypes,
    )
  })

  it('mounts Module 003 after KPIs; Modules 004–008 may follow; Modules 009–010 stay unmounted', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('PoolsMyPositionsModule')
    expect(screen).toContain('data-pools-module-003="mounted"')
    expect(screen.indexOf('PoolsOverviewKpisModule')).toBeLessThan(screen.indexOf('PoolsMyPositionsModule'))
    expect(screen).not.toContain('YourPoolsSection')
    expect(screen).not.toContain('data-pools-module="009"')
    expect(screen).not.toContain('PoolsIntegrationModule')
  })

  it('uses Architecture 000 status vocabulary', () => {
    for (const s of ['ACTIVE', 'ENDED', 'WITHDRAW_ONLY', 'EMERGENCY', 'UNAVAILABLE', 'PARTIAL', 'LOADING']) {
      expect(POOLS_CANONICAL_STATUS).toContain(s)
    }
  })

  it('disconnected state has no count and no sample cards', () => {
    const vm = buildPoolsWalletPositionsViewModel({
      account: null,
      chainId: 56,
      portfolioPools: [],
      userDataLoaded: false,
      poolsLoading: false,
    })
    expect(vm.state).toBe('disconnected')
    expect(vm.showCountBadge).toBe(false)
    expect(vm.totalCount).toBeNull()
    expect(vm.positions).toHaveLength(0)
  })

  it('loading state does not render factual zero', () => {
    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [],
      userDataLoaded: false,
      poolsLoading: true,
    })
    expect(vm.state).toBe('loading')
    expect(vm.showCountBadge).toBe(false)
    expect(vm.authoritativeEmpty).toBe(false)
  })

  it('factual zero positions when userData loaded and no economic residue', () => {
    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [
        makeCard({
          id: 'p0',
          userStaked: new BigNumber(0),
          pendingReward: new BigNumber(0),
          rawPool: { userData: { stakedBalance: new BigNumber(0), pendingReward: new BigNumber(0) } } as any,
        }),
      ],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.state).toBe('empty')
    expect(vm.authoritativeEmpty).toBe(true)
    expect(vm.showCountBadge).toBe(false)
  })

  it('includes active, claimable-only, withdraw-only, emergency; excludes zero residue', () => {
    const active = makeCard({
      id: 'a',
      sousId: 1,
      userStaked: new BigNumber('1000000000000000000'),
      pendingReward: new BigNumber('0'),
      rawPool: {
        stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
        earningToken: { symbol: 'ASTER', decimals: 18, address: '0xaster' },
        stakingTokenPrice: 2,
        userData: {},
      } as any,
    })
    const claimableOnly = makeCard({
      id: 'c',
      sousId: 2,
      status: 'ended',
      displayStatus: 'ENDED',
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber('500000000000000000'),
      rawPool: {
        stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
        earningToken: { symbol: 'MXMX', decimals: 18, address: '0xmx' },
        earningTokenPrice: 1,
        userData: {},
        isFinished: true,
      } as any,
    })
    const withdraw = makeCard({
      id: 'w',
      sousId: 3,
      status: 'ended',
      displayStatus: 'ENDED',
      userStaked: new BigNumber('2000000000000000000'),
      pendingReward: new BigNumber(0),
      rawPool: {
        stakingToken: { symbol: 'RARI', decimals: 18, address: '0xrari' },
        earningToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
        userData: {},
        isFinished: true,
      } as any,
    })
    const emergency = makeCard({
      id: 'e',
      sousId: 4,
      status: 'ended',
      displayStatus: 'ENDED',
      userStaked: new BigNumber('3000000000000000000'),
      pendingReward: new BigNumber(0),
      rawPool: {
        stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
        earningToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
        enableEmergencyWithdraw: true,
        userData: {},
        isFinished: true,
      } as any,
    })
    const zero = makeCard({
      id: 'z',
      sousId: 5,
      userStaked: new BigNumber(0),
      pendingReward: new BigNumber(0),
      rawPool: { userData: {} } as any,
    })

    expect(positionInclusionEligible(active)).toBe(true)
    expect(positionInclusionEligible(claimableOnly)).toBe(true)
    expect(positionInclusionEligible(withdraw)).toBe(true)
    expect(positionInclusionEligible(emergency)).toBe(true)
    expect(positionInclusionEligible(zero)).toBe(false)

    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xWallet',
      chainId: 56,
      portfolioPools: [zero, active, claimableOnly, withdraw, emergency],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.positions).toHaveLength(4)
    expect(vm.positions[0].positionStatus).toBe('EMERGENCY')
    expect(vm.positions[1].positionStatus).toBe('WITHDRAW_ONLY')
    expect(vm.visiblePositions).toHaveLength(4)
    expect(vm.showViewAll).toBe(false)
    expect(vm.showCountBadge).toBe(true)
    expect(vm.totalCount).toBe(4)
  })

  it('maps ACTIVE with/without claimable actions', () => {
    const withClaim = cardToPoolsWalletPosition(
      makeCard({
        id: '1',
        sousId: 10,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber('2'),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0x1' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0x2' },
          userData: {},
        } as any,
      }),
      { wallet: '0xabc', chainId: 56 },
    )!
    expect(withClaim.actions[0].kind).toBe('claim')
    expect(withClaim.actions.some((a) => a.kind === 'manage')).toBe(true)

    const noClaim = cardToPoolsWalletPosition(
      makeCard({
        id: '2',
        sousId: 11,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0x1' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0x2' },
          userData: {},
        } as any,
      }),
      { wallet: '0xabc', chainId: 56 },
    )!
    expect(noClaim.actions[0].kind).toBe('manage')
    expect(noClaim.actions.some((a) => a.kind === 'claim')).toBe(false)
  })

  it('ended pool with principal is WITHDRAW_ONLY not Active', () => {
    const pos = cardToPoolsWalletPosition(
      makeCard({
        id: 'ended',
        sousId: 9,
        status: 'ended',
        displayStatus: 'ENDED',
        userStaked: new BigNumber('5'),
        pendingReward: new BigNumber('1'),
        rawPool: {
          stakingToken: { symbol: 'RARI', decimals: 18, address: '0xr' },
          earningToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          userData: {},
          isFinished: true,
        } as any,
      }),
      { wallet: '0xabc', chainId: 56 },
    )!
    expect(pos.poolStatus).toBe('ENDED')
    expect(pos.positionStatus).toBe('WITHDRAW_ONLY')
    expect(pos.statusLabel).toBe('Withdraw')
    expect(pos.actions[0].kind).toBe('withdraw')
  })

  it('formats decimals 18 and non-18; never exposes raw uint256 in formatted fields', () => {
    const d18 = formatPositionTokenAmount(new BigNumber('1250450000000000000000'), 18, 'MARCO', {
      allowZero: true,
    })
    expect(d18.formatted).toContain('MARCO')
    expect(d18.formatted).not.toMatch(/1250450000000000000000/)

    const d8 = formatPositionTokenAmount(new BigNumber('123456789'), 8, 'BTCB', { allowZero: true })
    expect(d8.formatted).toContain('BTCB')
    expect(d8.formatted).not.toContain('123456789')

    const zero = formatPositionTokenAmount(new BigNumber(0), 18, 'ASTER', { allowZero: true })
    expect(zero.formatted).toBe('0 ASTER')
  })

  it('same vs different stake/reward titles', () => {
    const same = cardToPoolsWalletPosition(
      makeCard({
        id: 's',
        sousId: 1,
        stakeToken: 'MARCO',
        rewardToken: 'MARCO',
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          userData: {},
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(same.title).toBe('MARCO')

    const diff = cardToPoolsWalletPosition(
      makeCard({
        id: 'd',
        sousId: 2,
        stakeToken: 'MARCO',
        rewardToken: 'ASTER',
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          userData: {},
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(diff.title).toBe('MARCO → ASTER')
  })

  it('omits USD when valuation unavailable; never $0.00 fallback', () => {
    const pos = cardToPoolsWalletPosition(
      makeCard({
        id: 'v',
        sousId: 1,
        userStaked: new BigNumber('1000000000000000000'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          stakingTokenPrice: 0,
          userData: {},
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(pos.stakedValue).toBeNull()
    expect(pos.partialReasons).toContain('Valuation unavailable')
  })

  it('retains last-good on failed refresh; empty wipe does not become zero', () => {
    const prior = cardToPoolsWalletPosition(
      makeCard({
        id: 'keep',
        sousId: 7,
        userStaked: new BigNumber('1000000000000000000'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          userData: {},
        } as any,
      }),
      { wallet: '0xabc', chainId: 56 },
    )!

    const failed = buildPoolsWalletPositionsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [makeCard({ id: 'wiped', sousId: 7 })],
      userDataLoaded: true,
      poolsLoading: false,
      previous: [prior],
      previousWallet: '0xabc',
      previousChainId: 56,
    })
    expect(userDataPresence([makeCard({ id: 'wiped', sousId: 7 })])).toBe('absent')
    expect(failed.state).toBe('stale')
    expect(failed.positions).toHaveLength(1)
    expect(failed.moduleDisclosure).toBeTruthy()

    const sourcesFailed = buildPoolsWalletPositionsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [],
      userDataLoaded: true,
      poolsLoading: false,
      sourcesFailed: true,
      previous: [prior],
      previousWallet: '0xabc',
      previousChainId: 56,
    })
    expect(sourcesFailed.state).toBe('stale')
    expect(sourcesFailed.authoritativeEmpty).toBe(false)

    const unavailable = buildPoolsWalletPositionsViewModel({
      account: '0xabc',
      chainId: 56,
      portfolioPools: [],
      userDataLoaded: true,
      poolsLoading: false,
      sourcesFailed: true,
    })
    expect(unavailable.state).toBe('unavailable')
    expect(unavailable.showCountBadge).toBe(false)
  })

  it('wallet change clears prior positions (no previous reuse across wallets)', () => {
    const prior = cardToPoolsWalletPosition(
      makeCard({
        id: 'w1',
        sousId: 1,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
          userData: {},
        } as any,
      }),
      { wallet: '0xold', chainId: 56 },
    )!
    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xnew',
      chainId: 56,
      portfolioPools: [],
      userDataLoaded: false,
      poolsLoading: false,
      previous: [prior],
      previousWallet: '0xold',
      previousChainId: 56,
    })
    expect(vm.state).toBe('loading')
    expect(vm.positions).toHaveLength(0)
  })

  it('stable deterministic ordering with claimable-first within ACTIVE', () => {
    const a = cardToPoolsWalletPosition(
      makeCard({
        id: 'a',
        sousId: 1,
        userStaked: new BigNumber('100'),
        pendingReward: new BigNumber(0),
        rawPool: {
          stakingToken: { symbol: 'A', decimals: 18, address: '0xa' },
          earningToken: { symbol: 'R', decimals: 18, address: '0xr' },
          stakingTokenPrice: 1,
          userData: {},
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const b = cardToPoolsWalletPosition(
      makeCard({
        id: 'b',
        sousId: 2,
        userStaked: new BigNumber('50'),
        pendingReward: new BigNumber('10'),
        rawPool: {
          stakingToken: { symbol: 'B', decimals: 18, address: '0xb' },
          earningToken: { symbol: 'R', decimals: 18, address: '0xr' },
          stakingTokenPrice: 1,
          earningTokenPrice: 1,
          userData: {},
        } as any,
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    const sorted = [a, b].sort(comparePoolsWalletPositions)
    expect(sorted[0].poolId).toBe('2')
    const again = [b, a].sort(comparePoolsWalletPositions)
    expect(again.map((p) => p.positionId)).toEqual(sorted.map((p) => p.positionId))
  })

  it('desktop geometry tokens match Architecture 000 row math', () => {
    expect(poolsMyPositions.leftW).toBe('936px')
    expect(poolsMyPositions.columnGap).toBe('16px')
    expect(poolsMyPositions.rightSlotW).toBe('424px')
    expect(poolsMyPositions.moduleH).toBe('360px')
    expect(poolsMyPositions.cardW).toBe('288px')
    expect(poolsMyPositions.cardH).toBe('276px')
    expect(poolsMyPositions.cardGap).toBe('18px')
    expect(poolsMyPositions.headerH).toBe('60px')
    expect(poolsMyPositions.contentW).toBe('900px')
    expect(poolsMyPositions.maxVisibleDesktop).toBe(4)
  })

  it('module sources avoid production mock position fixtures', () => {
    const src = [
      readFileSync(path.join(MODULES, 'PoolsMyPositionsModule.tsx'), 'utf8'),
      readFileSync(path.join(MODULES, 'buildPoolsWalletPositions.ts'), 'utf8'),
      readFileSync(path.join(MODULES, 'usePoolsWalletPositions.ts'), 'utf8'),
    ].join('\n')
    expect(src).not.toContain('mockPositions')
    expect(src).not.toContain('SAMPLE_POSITION')
    expect(src).not.toContain('fixturePosition')
  })

  it('reserved advisor slot present for Module 006 portal mount', () => {
    const mod = readFileSync(path.join(MODULES, 'PoolsMyPositionsModule.tsx'), 'utf8')
    expect(mod).toContain('data-pools-module-006-slot="reserved"')
    expect(existsSync(path.join(MODULES, 'PoolsRewardAdvisorModule.tsx'))).toBe(true)
  })

  it('actions require rawPool capability; unsupported actions hidden', () => {
    const noRaw = cardToPoolsWalletPosition(
      makeCard({
        id: 'nr',
        sousId: 99,
        userStaked: new BigNumber('1'),
        pendingReward: new BigNumber('1'),
      }),
      { wallet: '0x1', chainId: 56 },
    )!
    expect(noRaw.actions).toHaveLength(0)
  })
})
