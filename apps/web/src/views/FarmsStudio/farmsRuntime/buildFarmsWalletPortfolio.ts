/**
 * Farms Studio wallet portfolio projection (R791E.3).
 *
 * Pure assembly: existing FarmPreviewCard[] (portfolioFarms) → WalletPortfolio.
 * No fetch. No second farm discovery. No invented positions.
 */

import { createWalletPortfolio } from 'lib/wallet-portfolio/portfolioService'
import type {
  PortfolioPosition,
  WalletPortfolio,
  WalletPortfolioSectionStatus,
} from 'lib/wallet-portfolio/contracts'
import { resolvePortfolioView } from 'lib/wallet-portfolio/viewEngine'
import { adaptStudioRowsToPortfolioPositions } from 'views/CommandCenter/commandCenterRuntime/commandCenterPortfolioCutover'
import type { FarmPreviewCard } from '../farmsStudioData'

export type FarmsPortfolioViewMode = 'ALL' | 'MY_FARMS'

export function buildFarmsStudioSectionStatus(input: {
  walletConnected: boolean
  positionsLoading: boolean
  farmCount: number
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
  const status = input.farmCount > 0 ? 'READY' : 'EMPTY'
  return {
    summary: { status, updatedAt: stamp, errorCode: null, message: null },
    positions: { status, updatedAt: stamp, errorCode: null, message: null },
    claimables: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    approvals: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    activity: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
  }
}

/**
 * Build WalletPortfolio for Farms Studio from portfolioFarms already loaded
 * by useFarmsStakingRuntime — no duplicate MasterChef scan.
 */
export function buildFarmsWalletPortfolio(input: {
  wallet: string | null
  chainId: number | null
  chainName: string
  generatedAt: string
  farmCards: readonly FarmPreviewCard[]
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
      sectionStatus: buildFarmsStudioSectionStatus({
        walletConnected: false,
        positionsLoading: false,
        farmCount: 0,
      }),
    })
  }

  const adapted = adaptStudioRowsToPortfolioPositions({
    wallet: input.wallet as string,
    chainId,
    chainName: input.chainName,
    liquidityRows: [],
    farmCards: input.farmCards,
    poolCards: [],
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
    farmPositions: adapted.farmPositions,
    poolPositions: [],
    claimables: [],
    approvals: [],
    recentActivity: [],
    quickActions: [],
    sectionStatus: buildFarmsStudioSectionStatus({
      walletConnected: true,
      positionsLoading: Boolean(input.positionsLoading),
      farmCount: adapted.farmPositions.length,
    }),
  })
}

/** View Engine FARM view — owned farm positions only. */
export function selectFarmPortfolioPositions(portfolio: WalletPortfolio): PortfolioPosition[] {
  return resolvePortfolioView(portfolio, 'FARM').positions
}

/** View Engine MY_POSITIONS ∩ FARM for My Farms view. */
export function selectMyFarmPortfolioPositions(portfolio: WalletPortfolio): PortfolioPosition[] {
  const mine = resolvePortfolioView(portfolio, 'MY_POSITIONS').positions
  return mine.filter((p) => p.positionType === 'FARM')
}
