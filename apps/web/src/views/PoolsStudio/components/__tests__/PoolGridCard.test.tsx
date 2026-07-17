import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { PoolPreviewCard } from '../../poolsStudioData'
import PoolGridCard from '../PoolGridCard'

vi.mock('hooks/useActiveChainId', () => ({
  useActiveChainId: () => ({ chainId: 56 }),
}))

vi.mock('../../poolsRuntime/PoolsRuntimeContext', () => ({
  usePoolsRuntime: () => ({
    requestModal: vi.fn(),
  }),
}))

vi.mock('../../poolsRuntime/formatPoolPresentation', () => ({
  buildPoolMachineV2: () => ({ schema: 'melega.pool.v2', poolId: 'test' }),
}))

function basePool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return {
    id: 'sous-0',
    name: 'MARCO Staking',
    tokens: ['MARCO', 'MARCO'],
    stakeToken: 'MARCO',
    rewardToken: 'MARCO',
    status: 'live',
    displayStatus: 'ENDED',
    rewardBadge: 'Official',
    visualType: 'Official',
    healthScore: 22,
    sustainabilityScore: 22,
    apr: '—',
    tvl: '—',
    dailyRewards: '—',
    participants: '—',
    lockPeriod: 'Flexible',
    cooldown: 'None',
    contractAddress: '0x41D5487836452d23f2c467070244E5842B412794',
    lifecycle: {
      contractVerified: true,
      started: true,
      ended: true,
      rewardBalancePositive: false,
      rewardPerBlockPositive: false,
      stakeTokenResolved: true,
      rewardTokenResolved: true,
      totalStakedPositive: false,
      active: false,
      funded: false,
      rewarding: false,
      finished: false,
      eligibleForDisplay: true,
    },
    analyzePreview: {
      rewardBudget: '—',
      remainingRewards: '—',
      dailyEmission: '—',
      emissionEndEstimate: '—',
      aprHistory: '—',
      rewardSustainability: 'Ended',
      risk: 'Low',
      contractAddress: '0x41D5487836452d23f2c467070244E5842B412794',
      contractExplorerUrl: 'https://bscscan.com/address/0x41D5487836452d23f2c467070244E5842B412794',
      sousChefAddress: '0x41D5...2794',
      depositFee: '0%',
      withdrawFee: '0%',
      harvestInterval: 'Manual',
      autoCompound: 'Manual',
      poolVersion: 'SousChef #0',
      created: '—',
      lastUpdated: '—',
      rewardToken: 'MARCO',
      emission: '—',
      contract: '0x41D5...2794',
      rewardContract: '—',
      stakeContract: '—',
      tokenExplorerUrl: 'https://bscscan.com',
      estimatedRoi: '—',
      duration: '—',
      poolHistory: 'https://bscscan.com',
      transactions: 'https://bscscan.com',
    },
    ...overrides,
  }
}

describe('PoolGridCard ended lifecycle presentation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TEST 1 — Ended card shows exactly one ENDED lifecycle badge', () => {
    render(<PoolGridCard pool={basePool({ displayStatus: 'ENDED' })} />)
    const lifecycleBadges = within(document.querySelector('[data-ps-lifecycle-badges]') as HTMLElement).getAllByText(
      'ENDED',
    )
    expect(lifecycleBadges).toHaveLength(1)
    expect(lifecycleBadges[0].textContent).toBe('ENDED')
  })

  it('TEST 2 — Ended card suppresses Official badge; metadata unchanged', () => {
    const pool = basePool({ displayStatus: 'ENDED', rewardBadge: 'Official' })
    const { container } = render(<PoolGridCard pool={pool} />)
    const primary = container.querySelector('[data-ps-pool-card]')!
    expect(within(primary as HTMLElement).queryByText('Official')).toBeNull()
    expect(pool.rewardBadge).toBe('Official')
  })

  it('TEST 3 — Ended card suppresses Pool Health', () => {
    const { container } = render(<PoolGridCard pool={basePool({ displayStatus: 'ENDED', healthScore: 22 })} />)
    const primary = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(within(primary).queryByText('Pool Health')).toBeNull()
    expect(within(primary).queryByText('22/100')).toBeNull()
    expect(primary.querySelector('[data-ps-pool-health]')).toBeNull()
  })

  it('TEST 4 — Ended card has no health placeholder', () => {
    const { container } = render(<PoolGridCard pool={basePool({ displayStatus: 'ENDED', healthScore: 22 })} />)
    const primary = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(within(primary).queryByText('0/100')).toBeNull()
    expect(within(primary).queryByText('Unavailable')).toBeNull()
    expect(primary.querySelector('[data-ps-pool-health]')).toBeNull()
  })

  it('TEST 5 — Non-ended Official badge still renders', () => {
    render(
      <PoolGridCard
        pool={basePool({
          displayStatus: 'LIVE',
          status: 'live',
          rewardBadge: 'Official',
          lifecycle: {
            ...basePool().lifecycle!,
            finished: false,
            ended: false,
            rewarding: true,
            active: true,
            rewardPerBlockPositive: true,
            rewardBalancePositive: true,
          },
          sustainableAprDisplay: '12.00%',
        })}
      />,
    )
    expect(screen.getByText('Official')).toBeTruthy()
  })

  it('TEST 6 — Non-ended Pool Health still renders', () => {
    render(
      <PoolGridCard
        pool={basePool({
          displayStatus: 'LIVE',
          status: 'live',
          healthScore: 48,
          rewardBadge: 'Official',
          lifecycle: {
            ...basePool().lifecycle!,
            finished: false,
            ended: false,
            rewarding: true,
            active: true,
            rewardPerBlockPositive: true,
            rewardBalancePositive: true,
          },
          sustainableAprDisplay: '12.00%',
        })}
      />,
    )
    expect(screen.getByText('Pool Health')).toBeTruthy()
    expect(screen.getByText('48/100')).toBeTruthy()
    expect(document.querySelector('[data-ps-pool-health]')).toBeTruthy()
  })

  it('TEST 7 — Ended CTA remains disabled Ended', () => {
    render(<PoolGridCard pool={basePool({ displayStatus: 'ENDED' })} />)
    const footer = document.querySelector('[data-ps-card-footer]') as HTMLElement
    const cta = within(footer).getByRole('button', { name: 'Ended' })
    expect(cta).toBeTruthy()
    expect((cta as HTMLButtonElement).disabled).toBe(true)
  })

  it('TEST 8 — No simultaneous ENDED + Official + Pool Health', () => {
    const { container } = render(
      <PoolGridCard pool={basePool({ displayStatus: 'ENDED', rewardBadge: 'Official', healthScore: 22 })} />,
    )
    const primary = container.querySelector('[data-ps-pool-card]') as HTMLElement
    const text = primary.textContent ?? ''
    expect(text).toMatch(/ENDED/)
    expect(within(primary).queryByText('Official')).toBeNull()
    expect(within(primary).queryByText('Pool Health')).toBeNull()
  })
})
