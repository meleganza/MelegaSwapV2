/**
 * MELEGASWAP_V2_POOLS_FINAL_PRODUCT_CONSISTENCY — focused gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import BigNumber from 'bignumber.js'
import { buildPoolsWalletPositionsViewModel } from '../modules/buildPoolsWalletPositions'
import { cardToExploreModel } from '../modules/buildPoolsExplorePools'
import { poolsMyPositions } from '../modules/poolsMyPositionsTokens'
import type { PoolPreviewCard } from '../poolsStudioData'

const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
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

function stakedCard(id: string, sousId: number): PoolPreviewCard {
  return makeCard({
    id,
    sousId,
    userStaked: new BigNumber('1000000000000000000'),
    pendingReward: new BigNumber(0),
    status: 'live',
    displayStatus: 'LIVE',
    rawPool: {
      stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xmarco' },
      earningToken: { symbol: 'ASTER', decimals: 18, address: '0xaster' },
      userData: { stakedBalance: new BigNumber('1000000000000000000') },
    } as any,
  })
}

describe('Pools final product consistency', () => {
  it('hides My Positions module when zero positions (empty state returns null)', () => {
    const mod = load('modules/PoolsMyPositionsModule.tsx')
    expect(mod).toContain("vm.state === 'empty' || vm.state === 'disconnected'")
    expect(mod).toContain('return null')
    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xWallet',
      chainId: 56,
      portfolioPools: [
        makeCard({
          id: 'z',
          userStaked: new BigNumber(0),
          pendingReward: new BigNumber(0),
          rawPool: { userData: {} } as any,
        }),
      ],
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.state).toBe('empty')
  })

  it('preview max is 4 and View all my positions expands inline', () => {
    expect(poolsMyPositions.maxVisibleDesktop).toBe(4)
    const mod = load('modules/PoolsMyPositionsModule.tsx')
    expect(mod).toContain('View all my positions')
    expect(mod).not.toContain('View all positions')
    expect(mod).toContain('Show less')
    expect(mod).toContain("setExpanded((v) => !v)")
    expect(mod).not.toContain("setPortfolioViewMode('MY_POOLS')")
    expect(mod).toContain('Cards')
    expect(mod).toContain('List')
    expect(mod).toContain('pools-my-positions-list-header')
    expect(mod).toMatch(/Staked Value|Staked Value/)
    expect(mod).toContain('Participants')
    expect(mod).toContain('Remaining')
    expect(mod).toContain('Duration')
    expect(mod).toContain('Actions')

    const cards = [1, 2, 3, 4, 5].map((n) => stakedCard(`p${n}`, n))
    const vm = buildPoolsWalletPositionsViewModel({
      account: '0xWallet',
      chainId: 56,
      portfolioPools: cards,
      userDataLoaded: true,
      poolsLoading: false,
    })
    expect(vm.positions.length).toBeGreaterThanOrEqual(5)
    expect(vm.visiblePositions).toHaveLength(4)
    expect(vm.showViewAll).toBe(true)
  })

  it('Explore toolbar is compact Search + Filters + Cards|List', () => {
    const explore = load('modules/PoolsExplorePoolsModule.tsx')
    expect(explore).toContain('pools-explore-toolbar')
    expect(explore).toContain('Search pool / token / address')
    expect(explore).toContain('Filters')
    expect(explore).toContain('pools-explore-view-toggle')
    expect(explore).toContain('pools-explore-list-header')
    expect(explore).toContain('TVL')
    expect(explore).not.toContain('FilterRow')
  })

  it('removes Manage; retains Stake and View Pool; sparkline always reserved', () => {
    const card = load('modules/PoolsExplorePoolCard.tsx')
    expect(card).not.toContain('pools-explore-manage')
    expect(card).not.toMatch(/>\s*Manage\s*</)
    expect(card).toContain('pools-explore-stake')
    expect(card).toContain('pools-explore-view-pool')
    expect(card).toContain('YieldActivitySparkline')
    expect(card).toContain('pools-explore-activity-spark')
    const spark = readFileSync(
      path.resolve(STUDIO, '../../components/YieldActivitySparkline.tsx'),
      'utf8',
    )
    expect(spark).toContain('baseline')
    expect(spark).toContain('never invents oscillation')
  })

  it('participants stay unfabricated; remaining is duration; rewards left separate', () => {
    const model = cardToExploreModel(
      makeCard({
        id: 'x',
        estimatedDuration: '30 days',
        remainingRewards: '9K MARCO',
        participants: '999',
        status: 'live',
        displayStatus: 'LIVE',
        cta: 'stake',
        rawPool: {
          stakingToken: { symbol: 'MARCO', decimals: 18, address: '0xm' },
          earningToken: { symbol: 'ASTER', decimals: 18, address: '0xa' },
        } as any,
      }),
      56,
    )!
    expect(model.participantsDisplay).toBe('Indexing…')
    expect(model.remainingDisplay).toBe('30 days')
    expect(model.rewardsLeftDisplay).toBe('9K MARCO')
    expect(model.durationDisplay).toBeTruthy()
  })

  it('Create Pool token selector portals above overflow with canonical z-index', () => {
    const wizard = load('components/CreatePoolCta.tsx')
    expect(wizard).toContain('createPortal')
    expect(wizard).toContain('melegaZIndex.overlayStacked')
    expect(wizard).toContain('document.body')
    expect(wizard).toContain('data-ps-create-token-dropdown')
    expect(wizard).not.toMatch(/z-index:\s*20\b/)
  })
})
