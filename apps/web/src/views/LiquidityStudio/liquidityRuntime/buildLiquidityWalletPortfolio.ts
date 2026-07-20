/**
 * Liquidity Studio wallet portfolio projection (R791E.2).
 *
 * Pure assembly: existing LiquidityPositionRow[] → WalletPortfolio.
 * No fetch. No second wallet scan. No invented positions.
 */

import { createWalletPortfolio } from 'lib/wallet-portfolio/portfolioService'
import type {
  PortfolioPosition,
  WalletPortfolio,
  WalletPortfolioSectionStatus,
} from 'lib/wallet-portfolio/contracts'
import { adaptStudioRowsToPortfolioPositions } from 'views/CommandCenter/commandCenterRuntime/commandCenterPortfolioCutover'
import type { LiquidityPositionRow } from './useLiquidityPositions'

export function buildLiquidityStudioSectionStatus(input: {
  walletConnected: boolean
  positionsLoading: boolean
  liquidityCount: number
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
  const status = input.liquidityCount > 0 ? 'READY' : 'EMPTY'
  return {
    summary: { status, updatedAt: stamp, errorCode: null, message: null },
    positions: { status, updatedAt: stamp, errorCode: null, message: null },
    claimables: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    approvals: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
    activity: { status: 'EMPTY', updatedAt: stamp, errorCode: null, message: null },
  }
}

/**
 * Build WalletPortfolio for Liquidity Studio from producer rows already loaded
 * by useLiquidityPositions (shared with mint runtime — no duplicate scan).
 */
export function buildLiquidityWalletPortfolio(input: {
  wallet: string | null
  chainId: number | null
  chainName: string
  generatedAt: string
  liquidityRows: readonly LiquidityPositionRow[]
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
      sectionStatus: buildLiquidityStudioSectionStatus({
        walletConnected: false,
        positionsLoading: false,
        liquidityCount: 0,
      }),
    })
  }

  const adapted = adaptStudioRowsToPortfolioPositions({
    wallet: input.wallet as string,
    chainId,
    chainName: input.chainName,
    liquidityRows: input.liquidityRows,
    farmCards: [],
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
    liquidityPositions: adapted.liquidityPositions,
    farmPositions: [],
    poolPositions: [],
    claimables: [],
    approvals: [],
    recentActivity: [],
    quickActions: [],
    sectionStatus: buildLiquidityStudioSectionStatus({
      walletConnected: true,
      positionsLoading: Boolean(input.positionsLoading),
      liquidityCount: adapted.liquidityPositions.length,
    }),
  })
}

/** Canonical LIQUIDITY filter over WalletPortfolio.positions — no local ownership math. */
export function selectLiquidityPortfolioPositions(
  portfolio: WalletPortfolio,
): PortfolioPosition[] {
  return portfolio.positions.filter((p) => p.positionType === 'LIQUIDITY')
}
