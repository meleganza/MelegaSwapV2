import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
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
  buildPoolMachineV2: (card: { id?: string; displayStatus?: string }) => ({
    schema: 'melega.pool.v2',
    poolId: card?.id ?? 'test',
    status: card?.displayStatus,
    recommendedAction: card?.displayStatus === 'ENDED' ? 'none' : 'stake',
  }),
  resolvePoolMachineRecommendedAction: (card: { displayStatus?: string; status?: string; cta?: string }) => {
    if (card.displayStatus === 'ENDED' || card.status === 'ended') return 'none'
    if (card.cta === 'stake') return 'stake'
    if (card.cta === 'analyze') return 'analyze'
    return 'none'
  },
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

  it('TEST 7 — Ended CTA is View Details, not Ended', () => {
    render(<PoolGridCard pool={basePool({ displayStatus: 'ENDED', cta: 'stake' })} />)
    const footer = document.querySelector('[data-ps-card-footer]') as HTMLElement
    expect(within(footer).queryByRole('button', { name: 'Ended' })).toBeNull()
    const cta = within(footer).getByRole('button', { name: 'View Details' })
    expect(cta).toBeTruthy()
    expect((cta as HTMLButtonElement).disabled).toBe(false)
    expect(screen.getByText('ENDED')).toBeTruthy()
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

  it('TEST 9 — ACTIVE CTA unchanged (Stake + Analyze)', () => {
    render(
      <PoolGridCard
        pool={basePool({
          displayStatus: 'LIVE',
          status: 'live',
          cta: 'stake',
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
    const footer = document.querySelector('[data-ps-card-footer]') as HTMLElement
    expect(within(footer).getByRole('button', { name: 'Stake' })).toBeTruthy()
    expect(within(footer).getByRole('button', { name: 'Analyze' })).toBeTruthy()
    expect(within(footer).queryByRole('button', { name: 'View Details' })).toBeNull()
  })

  it('TEST 10 — FUTURE CTA unchanged (disabled Ended)', () => {
    render(
      <PoolGridCard
        pool={basePool({
          displayStatus: 'INDEXING',
          status: 'indexing',
          cta: 'analyze',
          lifecycle: {
            ...basePool().lifecycle!,
            finished: false,
            ended: false,
            rewarding: false,
            active: false,
          },
        })}
      />,
    )
    const footer = document.querySelector('[data-ps-card-footer]') as HTMLElement
    const cta = within(footer).getByRole('button', { name: 'Ended' })
    expect((cta as HTMLButtonElement).disabled).toBe(true)
    expect(within(footer).queryByRole('button', { name: 'View Details' })).toBeNull()
  })

  it('TEST 11 — UNAVAILABLE CTA unchanged (disabled Ended)', () => {
    render(
      <PoolGridCard
        pool={basePool({
          displayStatus: 'LIVE',
          status: 'live',
          cta: 'none',
          visibilityStatus: 'HIDDEN',
          lifecycle: {
            ...basePool().lifecycle!,
            finished: false,
            ended: false,
            rewarding: false,
            active: false,
          },
        })}
      />,
    )
    const footer = document.querySelector('[data-ps-card-footer]') as HTMLElement
    const cta = within(footer).getByRole('button', { name: 'Ended' })
    expect((cta as HTMLButtonElement).disabled).toBe(true)
    expect(within(footer).queryByRole('button', { name: 'View Details' })).toBeNull()
  })
})

const EXPLORER_URL = 'https://bscscan.com/address/0x41D5487836452d23f2c467070244E5842B412794'
const EMISSION_VALUE = '1,240 / day'

function rewardRatePool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return basePool({
    displayStatus: 'ENDED',
    dailyRewards: EMISSION_VALUE,
    estimatedDailyReward: EMISSION_VALUE,
    analyzePreview: {
      ...basePool().analyzePreview!,
      dailyEmission: EMISSION_VALUE,
      emission: EMISSION_VALUE,
      estimatedRoi: '12.00%',
      contractExplorerUrl: EXPLORER_URL,
    },
    ...overrides,
  })
}

describe('PoolGridCard analysis panel duplicate information', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TEST 1 — Expanded card explorer count is exactly one', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    const explorers = card.querySelectorAll('[data-ps-bscscan-btn]')
    expect(explorers).toHaveLength(1)
  })

  it('TEST 2 — Explorer destination preserved', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    const btn = card.querySelector('[data-ps-bscscan-btn]') as HTMLElement
    expect(btn.getAttribute('data-ps-explorer-url')).toBe(EXPLORER_URL)
  })

  it('TEST 3 — Collapsed card primary explorer remains present', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(card.querySelector('[data-ps-primary-explorer]')).toBeTruthy()
    expect(card.querySelectorAll('[data-ps-bscscan-btn]')).toHaveLength(1)
    expect(within(card).queryByText('Hide Analysis')).toBeNull()
  })

  it('TEST 4 — Duplicate reward-rate fields: Emission once, no Daily Rewards', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    const panel = card.querySelector('[data-ps-pool-analyze-panel]') as HTMLElement
    expect(within(panel).queryByText('Daily Rewards')).toBeNull()
    expect(within(panel).getAllByText('Emission/day')).toHaveLength(1)
  })

  it('TEST 5 — Retained Emission value preserved', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(card.querySelector('[data-ps-emission-value]')?.textContent).toBe(EMISSION_VALUE)
  })

  it('TEST 6 — No empty analysis rows after duplicate removal', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    const panel = card.querySelector('[data-ps-pool-analyze-panel]') as HTMLElement
    expect(within(panel).queryByText('Daily Rewards')).toBeNull()
    expect(panel.querySelector('[data-ps-bscscan-btn]')).toBeNull()
    const blankRows = [...panel.querySelectorAll('div')].filter((el) => {
      const t = el.textContent?.trim() ?? ''
      return el.children.length === 0 && t === ''
    })
    expect(blankRows).toHaveLength(0)
  })

  it('TEST 7 — Ended CTA regression View Details / Hide Analysis', () => {
    const { container } = render(<PoolGridCard pool={rewardRatePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    const footer = card.querySelector('[data-ps-card-footer]') as HTMLElement
    const details = within(footer).getByRole('button', { name: 'View Details' })
    expect(details).toBeTruthy()
    fireEvent.click(details)
    expect(within(footer).getByRole('button', { name: 'Hide Analysis' })).toBeTruthy()
  })

  it('TEST 8 — Ended lifecycle regression', () => {
    const { container } = render(
      <PoolGridCard pool={rewardRatePool({ rewardBadge: 'Official', healthScore: 22 })} />,
    )
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(within(card).getByText('ENDED')).toBeTruthy()
    expect(within(card).queryByText('Official')).toBeNull()
    expect(within(card).queryByText('Pool Health')).toBeNull()
  })

  it('TEST 9 — Non-ended regression: analysis expands, unique fields and explorer remain', () => {
    const { container } = render(
      <PoolGridCard
        pool={rewardRatePool({
          displayStatus: 'LIVE',
          status: 'live',
          cta: 'stake',
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
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(card.querySelectorAll('[data-ps-bscscan-btn]')).toHaveLength(1)
    fireEvent.click(within(card).getByRole('button', { name: 'Analyze' }))
    const panel = card.querySelector('[data-ps-pool-analyze-panel]') as HTMLElement
    expect(panel).toBeTruthy()
    expect(within(panel).getByText('Emission/day')).toBeTruthy()
    expect(within(panel).queryByText('Daily Rewards')).toBeNull()
    expect(within(panel).getByText('Contract')).toBeTruthy()
    expect(card.querySelectorAll('[data-ps-bscscan-btn]')).toHaveLength(1)
  })
})

function roiProjectionPool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  const base = rewardRatePool()
  return rewardRatePool({
    analyzePreview: {
      ...base.analyzePreview!,
      estimatedRoi: '28.45%',
    },
    ...overrides,
  })
}

function liveRewardingPool(overrides: Partial<PoolPreviewCard> = {}): PoolPreviewCard {
  return roiProjectionPool({
    displayStatus: 'LIVE',
    status: 'live',
    cta: 'stake',
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
    sustainableAprDisplay: '28.45%',
    ...overrides,
  })
}

describe('PoolGridCard ended analysis ROI semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TEST 1 — Ended card suppresses ROI heading', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(within(card).queryByText('Estimated ROI')).toBeNull()
    expect(within(card).queryByText(/^ROI$/)).toBeNull()
    expect(card.querySelector('[data-ps-estimated-roi]')).toBeNull()
  })

  it('TEST 2 — Ended card suppresses period projections', () => {
    const { container } = render(
      <PoolGridCard
        pool={roiProjectionPool({
          analyzePreview: {
            ...roiProjectionPool().analyzePreview!,
            estimatedRoi: '1D 0.08% · 7D 0.54% · 30D 2.3% · 365D 28.45%',
          },
        })}
      />,
    )
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    const text = card.textContent || ''
    expect(text).not.toMatch(/\b1D\b/)
    expect(text).not.toMatch(/\b7D\b/)
    expect(text).not.toMatch(/\b30D\b/)
    expect(text).not.toMatch(/\b365D\b/)
    expect(within(card).queryByText('Estimated ROI')).toBeNull()
  })

  it('TEST 3 — ROI absent from hidden DOM before and after expand', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(within(card).queryByText('Estimated ROI')).toBeNull()
    expect(card.querySelector('[data-ps-estimated-roi]')).toBeNull()
    expect(card.textContent || '').not.toContain('28.45%')
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(within(card).queryByText('Estimated ROI')).toBeNull()
    expect(card.querySelector('[data-ps-estimated-roi]')).toBeNull()
    expect(card.textContent || '').not.toContain('28.45%')
  })

  it('TEST 4 — No replacement ROI state', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(within(card).queryByText('Estimated ROI')).toBeNull()
    expect(card.querySelector('[data-ps-estimated-roi]')).toBeNull()
    const panel = card.querySelector('[data-ps-pool-analyze-panel]') as HTMLElement
    expect(within(panel).queryByText('0%')).toBeNull()
    expect(within(panel).queryByText('0.00%')).toBeNull()
    expect(within(panel).queryByText('N/A')).toBeNull()
    expect(within(panel).queryByText('Unavailable')).toBeNull()
  })

  it('TEST 5 — Active ROI preserved', () => {
    const { container } = render(<PoolGridCard pool={liveRewardingPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'Analyze' }))
    const roi = card.querySelector('[data-ps-estimated-roi]') as HTMLElement
    expect(roi).toBeTruthy()
    expect(within(roi).getByText('Estimated ROI')).toBeTruthy()
    expect(within(roi).getByText('28.45%')).toBeTruthy()
  })

  it('TEST 6 — Future regression', () => {
    const { container } = render(
      <PoolGridCard
        pool={roiProjectionPool({
          displayStatus: 'INDEXING',
          status: 'indexing',
          cta: 'analyze',
          lifecycle: {
            ...basePool().lifecycle!,
            finished: false,
            ended: false,
            rewarding: false,
            active: false,
          },
        })}
      />,
    )
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    // FUTURE non-ended: Estimated ROI still renders in analysis DOM
    expect(card.querySelector('[data-ps-estimated-roi]')).toBeTruthy()
    expect(within(card).getByText('Estimated ROI')).toBeTruthy()
  })

  it('TEST 7 — Unavailable regression', () => {
    const { container } = render(
      <PoolGridCard
        pool={roiProjectionPool({
          displayStatus: 'LIVE',
          status: 'live',
          cta: 'none',
          visibilityStatus: 'HIDDEN',
          lifecycle: {
            ...basePool().lifecycle!,
            finished: false,
            ended: false,
            rewarding: false,
            active: false,
          },
        })}
      />,
    )
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(card.querySelector('[data-ps-estimated-roi]')).toBeTruthy()
    expect(within(card).getByText('Estimated ROI')).toBeTruthy()
  })

  it('TEST 8 — Emission regression', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(within(card).getAllByText('Emission/day')).toHaveLength(1)
    expect(card.querySelector('[data-ps-emission-value]')?.textContent).toBe(EMISSION_VALUE)
  })

  it('TEST 9 — Explorer regression', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(card.querySelectorAll('[data-ps-bscscan-btn]')).toHaveLength(1)
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(card.querySelectorAll('[data-ps-bscscan-btn]')).toHaveLength(1)
  })

  it('TEST 10 — CTA and lifecycle regression', () => {
    const { container } = render(
      <PoolGridCard pool={roiProjectionPool({ rewardBadge: 'Official', healthScore: 22 })} />,
    )
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(within(card).getByText('ENDED')).toBeTruthy()
    expect(within(card).queryByText('Official')).toBeNull()
    expect(within(card).queryByText('Pool Health')).toBeNull()
    const footer = card.querySelector('[data-ps-card-footer]') as HTMLElement
    fireEvent.click(within(footer).getByRole('button', { name: 'View Details' }))
    expect(within(footer).getByRole('button', { name: 'Hide Analysis' })).toBeTruthy()
  })

  it('TEST 11 — No empty analysis structure', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    const panel = card.querySelector('[data-ps-pool-analyze-panel]') as HTMLElement
    expect(panel.querySelector('[data-ps-estimated-roi]')).toBeNull()
    expect(within(panel).queryByText('Estimated ROI')).toBeNull()
    const blankRows = [...panel.querySelectorAll('div')].filter((el) => {
      const t = el.textContent?.trim() ?? ''
      return el.children.length === 0 && t === ''
    })
    expect(blankRows).toHaveLength(0)
  })
})

describe('PoolGridCard reward token label responsive clipping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('TEST 1 — Exact Reward Token label', () => {
    const { container } = render(<PoolGridCard pool={basePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    const labels = card.querySelectorAll('[data-ps-reward-token-label]')
    expect(labels).toHaveLength(1)
    expect(labels[0].textContent?.trim()).toBe('Reward Token')
    expect(labels[0].textContent).not.toMatch(/REWARD TOK[^E]/)
    expect(within(card).queryByText('REWARD TOK')).toBeNull()
  })

  it('TEST 2 — Stake Token regression', () => {
    const { container } = render(<PoolGridCard pool={basePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    const labels = card.querySelectorAll('[data-ps-stake-token-label]')
    expect(labels).toHaveLength(1)
    expect(labels[0].textContent?.trim()).toBe('Stake Token')
    expect(card.querySelector('[data-ps-stake-token-value]')?.textContent?.trim()).toBe('MARCO')
  })

  it('TEST 3 — Ended lifecycle regression', () => {
    const { container } = render(<PoolGridCard pool={basePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(within(card).getByText('ENDED')).toBeTruthy()
    expect(within(card).queryByText('Official')).toBeNull()
    expect(within(card).queryByText('Pool Health')).toBeNull()
  })

  it('TEST 4 — CTA regression', () => {
    const { container } = render(<PoolGridCard pool={basePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    const footer = card.querySelector('[data-ps-card-footer]') as HTMLElement
    fireEvent.click(within(footer).getByRole('button', { name: 'View Details' }))
    expect(within(footer).getByRole('button', { name: 'Hide Analysis' })).toBeTruthy()
  })

  it('TEST 5 — Analysis regression', () => {
    const { container } = render(<PoolGridCard pool={roiProjectionPool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    fireEvent.click(within(card).getByRole('button', { name: 'View Details' }))
    expect(within(card).getAllByText('Emission/day')).toHaveLength(1)
    expect(within(card).queryByText('Estimated ROI')).toBeNull()
    expect(card.querySelectorAll('[data-ps-primary-explorer]')).toHaveLength(1)
  })

  it('TEST 6 — Token identity regression', () => {
    const { container } = render(<PoolGridCard pool={basePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(card.querySelector('[data-ps-reward-token-value]')?.textContent?.trim()).toBe('MARCO')
    expect(card.querySelector('[data-ps-stake-token-value]')?.textContent?.trim()).toBe('MARCO')
  })

  it('TEST 7 — No duplicated labels', () => {
    const { container } = render(<PoolGridCard pool={basePool()} />)
    const card = container.querySelector('[data-ps-pool-card]') as HTMLElement
    expect(card.querySelectorAll('[data-ps-reward-token-label]')).toHaveLength(1)
    expect(card.querySelectorAll('[data-ps-stake-token-label]')).toHaveLength(1)
    expect(within(card).getAllByText('Reward Token')).toHaveLength(1)
    expect(within(card).getAllByText('Stake Token')).toHaveLength(1)
  })
})
