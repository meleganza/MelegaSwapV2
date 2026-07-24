/**
 * Pools Studio wallet portfolio projection (R791E.4).
 *
 * Pure assembly: existing PoolPreviewCard[] (portfolioPools) → WalletPortfolio.
 * No fetch. No second pool discovery. No invented positions.
 * Ended owned positions are preserved (adapter marks isEnded).
 */

import { createWalletPortfolio } from 'lib/wallet-portfolio/portfolioService'
import type {
  PortfolioPosition,
  WalletPortfolio,
  WalletPortfolioSectionStatus,
} from 'lib/wallet-portfolio/contracts'
import { resolvePortfolioView } from 'lib/wallet-portfolio/viewEngine'
import {
  normalizeExistingWalletPortfolio,
  type NormalizedUserPortfolio,
} from 'lib/melega-user-portfolio'
import { adaptStudioRowsToPortfolioPositions } from 'views/CommandCenter/commandCenterRuntime/commandCenterPortfolioCutover'
import type { PoolPreviewCard } from '../poolsStudioData'

export type PoolsPortfolioViewMode = 'ALL' | 'MY_POOLS'

export function buildPoolsStudioSectionStatus(input: {
  walletConnected: boolean
  positionsLoading: boolean
  poolCount: number
}): WalletPortfolioSectionStatus {
  const stamp = null
  if (!input.walletConnected) {
    const status = 'WALLET_NOT_CONNECTED' as const
    return {
      summary: { status, updatedAt: stamp, errorCode: null, message: null },
      positions: { status, updatedAt: stamp, errorCode: null, message: null },
      claimables: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
      approvals: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
      activity: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    }
  }
  if (input.positionsLoading) {
    return {
      summary: { status: 'LOADING', updatedAt: stamp, errorCode: null, message: null },
      positions: { status: 'LOADING', updatedAt: stamp, errorCode: null, message: null },
      claimables: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
      approvals: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
      activity: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    }
  }
  const status = input.poolCount > 0 ? 'READY' : 'EMPTY'
  return {
    summary: { status, updatedAt: stamp, errorCode: null, message: null },
    positions: { status, updatedAt: stamp, errorCode: null, message: null },
    claimables: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    approvals: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    activity: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
  }
}

/**
 * Build WalletPortfolio for Pools Studio from portfolioPools already loaded
 * by usePoolsStakingRuntime — no duplicate SmartChef scan.
 */
export function buildPoolsWalletPortfolio(input: {
  wallet: string | null
  chainId: number | null
  chainName: string
  generatedAt: string
  poolCards: readonly PoolPreviewCard[]
  positionsLoading?: boolean
}): WalletPortfolio {
  const walletConnected = Boolean(input.wallet)
  const chainId = input.chainId

  if (!walletConnected || chainId == null) {
    return createWalletPortfolio({
      wallet: input.wallet,
      generatedAt: input.generatedAt,
      summary: {
        netValueUsd: null,
        claimableValueUsd: null,
        activePositionCount: 0,
        historicalPositionCount: 0,
        attentionPositionCount: 0,
        pendingActionCount: 0,
      },
      liquidityPositions: [],
      farmPositions: [],
      poolPositions: [],
      claimables: [],
      approvals: [],
      recentActivity: [],
      quickActions: [],
      sectionStatus: buildPoolsStudioSectionStatus({
        walletConnected: false,
        positionsLoading: false,
        poolCount: 0,
      }),
    })
  }

  const adapted = adaptStudioRowsToPortfolioPositions({
    wallet: input.wallet as string,
    chainId,
    chainName: input.chainName,
    liquidityRows: [],
    farmCards: [],
    poolCards: input.poolCards,
  })

  return createWalletPortfolio({
    wallet: input.wallet,
    generatedAt: input.generatedAt,
    summary: {
      netValueUsd: null,
      claimableValueUsd: null,
      activePositionCount: 0,
      historicalPositionCount: 0,
      attentionPositionCount: 0,
      pendingActionCount: 0,
    },
    liquidityPositions: [],
    farmPositions: [],
    poolPositions: adapted.poolPositions,
    claimables: [],
    approvals: [],
    recentActivity: [],
    quickActions: [],
    sectionStatus: buildPoolsStudioSectionStatus({
      walletConnected: true,
      positionsLoading: Boolean(input.positionsLoading),
      poolCount: adapted.poolPositions.length,
    }),
  })
}

/** View Engine POOL view — owned pool positions including ended. */
export function selectPoolPortfolioPositions(portfolio: WalletPortfolio): PortfolioPosition[] {
  return resolvePortfolioView(portfolio, 'POOL').positions
}

/** View Engine MY_POSITIONS ∩ POOL for My Pools view (includes historical ownership). */
export function selectMyPoolPortfolioPositions(portfolio: WalletPortfolio): PortfolioPosition[] {
  const mine = resolvePortfolioView(portfolio, 'MY_POSITIONS').positions
  return mine.filter((p) => p.positionType === 'POOL')
}

/** View Engine HISTORICAL ∩ POOL — ended owned positions preserved. */
export function selectHistoricalPoolPortfolioPositions(portfolio: WalletPortfolio): PortfolioPosition[] {
  const historical = resolvePortfolioView(portfolio, 'HISTORICAL').positions
  return historical.filter((p) => p.positionType === 'POOL')
}

/** Same normalized model Liquidity / Passport consume. */
export function selectNormalizedPoolsPortfolio(portfolio: WalletPortfolio): NormalizedUserPortfolio {
  return normalizeExistingWalletPortfolio(portfolio)
}

/** Withdraw-capable pool positions (ended / withdraw-only included when action enabled). */
export function selectWithdrawPoolPortfolioPositions(portfolio: WalletPortfolio): PortfolioPosition[] {
  return resolvePortfolioView(portfolio, 'WITHDRAW_OPPORTUNITIES').positions.filter(
    (p) => p.positionType === 'POOL',
  )
}
