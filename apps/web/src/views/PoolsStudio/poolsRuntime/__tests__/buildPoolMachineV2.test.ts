import { describe, expect, it, vi } from 'vitest'
import type { PoolPreviewCard } from '../../poolsStudioData'

vi.mock('state/types', () => ({
  VaultKey: {
    CakeVaultV1: 'cakeVaultV1',
    CakeVault: 'cakeVault',
    CakeFlexibleSideVault: 'cakeFlexibleSideVault',
    IfoPool: 'ifo',
  },
}))

vi.mock('config/constants/pools', () => ({
  __esModule: true,
  default: [],
  vaultPoolConfig: {
    cakeVaultV1: {},
    cakeVault: {},
    cakeFlexibleSideVault: {},
    ifo: {},
  },
  livePools56: [],
  livePools1: [],
  livePools8453: [],
  livePools137: [],
  MAX_LOCK_DURATION: 0,
}))

vi.mock('utils/addressHelpers', () => ({
  getAddress: (value: unknown) => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && typeof (value as Record<number, string>)[56] === 'string') {
      return (value as Record<number, string>)[56]
    }
    return ''
  },
}))

vi.mock('utils/blockExplorer', () => ({
  getAddressExplorerUrl: (address: string) => `https://bscscan.com/address/${address}`,
  getBlockExplorerBaseUrl: () => 'https://bscscan.com',
  getTokenExplorerUrl: (address: string) => `https://bscscan.com/token/${address}`,
}))

vi.mock('views/Pools/helpers', () => ({
  getPoolBlockInfo: () => ({ hasPoolStarted: true, shouldShowCountdown: false }),
}))

vi.mock('state/pools', () => ({}))
vi.mock('state/index', () => ({ __esModule: true, default: {}, store: { getState: () => ({}) } }))

import { buildPoolMachineV2, resolvePoolMachineRecommendedAction } from '../formatPoolPresentation'

function makeCard(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return {
    id: 'sous-0',
    name: 'MARCO Staking',
    tokens: ['MARCO', 'MARCO'],
    stakeToken: 'MARCO',
    rewardToken: 'MARCO',
    status: 'live',
    displayStatus: 'LIVE',
    cta: 'stake',
    tvl: '—',
    dailyRewards: '—',
    participants: '—',
    contractAddress: '0x41D5487836452d23f2c467070244E5842B412794',
    ...overrides,
  }
}

describe('buildPoolMachineV2 recommendedAction', () => {
  it('TEST 1 — ENDED recommendedAction is not stake', () => {
    const machine = buildPoolMachineV2(
      makeCard({
        displayStatus: 'ENDED',
        status: 'live',
        cta: 'stake',
      }),
    )
    expect(machine.recommendedAction).not.toBe('stake')
  })

  it('TEST 2 — ENDED uses neutral recommendation only', () => {
    const machine = buildPoolMachineV2(
      makeCard({
        displayStatus: 'ENDED',
        status: 'live',
        cta: 'stake',
      }),
    )
    expect(machine.recommendedAction).toBe('none')
    expect(resolvePoolMachineRecommendedAction(makeCard({ displayStatus: 'ENDED', cta: 'stake' }))).toBe('none')
    expect(['stake', 'deposit', 'earn', 'join', 'provideLiquidity']).not.toContain(machine.recommendedAction)
  })

  it('TEST 3 — ACTIVE recommendation unchanged', () => {
    const machine = buildPoolMachineV2(
      makeCard({
        displayStatus: 'LIVE',
        status: 'live',
        cta: 'stake',
      }),
    )
    expect(machine.recommendedAction).toBe('stake')
  })

  it('TEST 4 — FUTURE recommendation unchanged', () => {
    const machine = buildPoolMachineV2(
      makeCard({
        displayStatus: 'INDEXING',
        status: 'indexing',
        cta: 'analyze',
      }),
    )
    expect(machine.recommendedAction).toBe('analyze')
  })

  it('TEST 5 — UNAVAILABLE recommendation unchanged', () => {
    const machine = buildPoolMachineV2(
      makeCard({
        displayStatus: 'LIVE',
        status: 'live',
        cta: 'none',
        visibilityStatus: 'HIDDEN',
      }),
    )
    expect(machine.recommendedAction).toBe('none')
  })

  it('TEST 6 — Regression: only ENDED path changes; other lifecycles stable', () => {
    const active = buildPoolMachineV2(makeCard({ displayStatus: 'LIVE', status: 'live', cta: 'stake' }))
    const future = buildPoolMachineV2(makeCard({ displayStatus: 'INDEXING', status: 'indexing', cta: 'analyze' }))
    const unavailable = buildPoolMachineV2(makeCard({ displayStatus: 'LIVE', status: 'live', cta: 'none' }))
    const endedByStatus = buildPoolMachineV2(makeCard({ displayStatus: 'ENDED', status: 'ended', cta: 'none' }))
    const endedByDisplayOnly = buildPoolMachineV2(makeCard({ displayStatus: 'ENDED', status: 'live', cta: 'stake' }))

    expect(active.recommendedAction).toBe('stake')
    expect(future.recommendedAction).toBe('analyze')
    expect(unavailable.recommendedAction).toBe('none')
    expect(endedByStatus.recommendedAction).toBe('none')
    expect(endedByDisplayOnly.recommendedAction).toBe('none')
  })
})
