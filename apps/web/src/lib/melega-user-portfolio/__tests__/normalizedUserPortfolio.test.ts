import { describe, expect, it } from 'vitest'
import {
  PORTFOLIO_POSITION_SCHEMA,
  createEmptyWalletPortfolio,
  createNonePortfolioAction,
  type PortfolioPosition,
} from 'lib/wallet-portfolio/contracts'
import { buildNormalizedUserPortfolio, projectNormalizedSections } from '../buildNormalizedUserPortfolio'

function stub(
  overrides: Partial<PortfolioPosition> & Pick<PortfolioPosition, 'positionId' | 'positionType' | 'title' | 'status'>,
): PortfolioPosition {
  const none = createNonePortfolioAction()
  const withdraw = {
    type: 'WITHDRAW' as const,
    label: 'Withdraw',
    priority: 1,
    route: '/pools',
    enabled: true,
    reasonDisabled: null,
  }
  return {
    schema: PORTFOLIO_POSITION_SCHEMA,
    wallet: '0xabc',
    protocol: 'melega-v2',
    chain: { chainId: 56, name: 'BNB Chain' },
    contract: null,
    source: 'test',
    subtitle: null,
    icon: null,
    badges: [],
    tags: [],
    importance: 'NORMAL',
    requiresAttention: false,
    underlyingAssets: [],
    lpToken: null,
    stakeToken: null,
    rewardTokens: [],
    currentValueUsd: null,
    principalValueUsd: null,
    claimableValueUsd: null,
    pendingRewardsValueUsd: null,
    apr: null,
    apy: null,
    feesEarnedUsd: null,
    balance: null,
    poolShare: null,
    ownershipVerified: true,
    unlockState: 'unknown',
    approvals: [],
    startedAt: null,
    endsAt: null,
    updatedAt: null,
    recommendedAction: overrides.status === 'ENDED' ? withdraw : none,
    riskLevel: null,
    health: null,
    priority: 0,
    reason: null,
    actions: {
      primary: overrides.status === 'ENDED' ? withdraw : none,
      secondary: [],
      open: null,
      manage: null,
      analytics: null,
    },
    productRoute: null,
    openRoute: null,
    manageRoute: null,
    analyticsRoute: null,
    producer: 'test',
    observedAt: null,
    blockNumber: null,
    confidence: null,
    dataState: 'PARTIAL',
    ...overrides,
  }
}

describe('normalized user portfolio', () => {
  it('projects liquidity / pools / legacy / withdraw sections from one WalletPortfolio', () => {
    const portfolio = buildNormalizedUserPortfolio({
      wallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
      liquidityPositions: [
        stub({ positionId: 'lp-1', positionType: 'LIQUIDITY', title: 'MARCO/BNB', status: 'ACTIVE' }),
      ],
      poolPositions: [
        stub({ positionId: 'pool-ended', positionType: 'POOL', title: 'Ended Pool', status: 'ENDED' }),
      ],
      farmPositions: [],
    })

    expect(portfolio.schema).toBe('melega.normalized-user-portfolio.v1')
    expect(portfolio.sections.liquidity).toHaveLength(1)
    expect(portfolio.sections.pools).toHaveLength(1)
    expect(portfolio.sections.endedPositions).toHaveLength(1)
    expect(portfolio.sections.legacyPositions.length).toBeGreaterThanOrEqual(1)
    expect(portfolio.sections.withdrawOpportunities.length).toBeGreaterThanOrEqual(1)
    expect(portfolio.views.withdraw.count).toBeGreaterThanOrEqual(1)
    expect(portfolio.walletPortfolio.schema).toBe('melega.wallet-portfolio.v1')
  })

  it('keeps empty disconnected portfolios honest', () => {
    const empty = createEmptyWalletPortfolio({
      wallet: null,
      generatedAt: '2026-07-24T00:00:00.000Z',
    })
    const sections = projectNormalizedSections(empty)
    expect(sections.liquidity).toEqual([])
    expect(sections.withdrawOpportunities).toEqual([])
  })
})
