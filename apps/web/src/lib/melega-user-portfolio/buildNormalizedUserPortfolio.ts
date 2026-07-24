/**
 * Normalized user portfolio — single WalletPortfolio schema consumed by
 * Passport, Pools, and Liquidity adapters. Pure assembly; no fetch.
 */

import { createWalletPortfolio } from 'lib/wallet-portfolio/portfolioService'
import {
  createEmptyWalletPortfolio,
  type PortfolioPosition,
  type PortfolioSummary,
  type WalletPortfolio,
  type WalletPortfolioSectionStatus,
} from 'lib/wallet-portfolio/contracts'
import { resolvePortfolioView, type PortfolioViewResult, type PortfolioViewType } from 'lib/wallet-portfolio/viewEngine'

export type NormalizedUserPortfolioSections = {
  tokens: PortfolioPosition[]
  liquidity: PortfolioPosition[]
  pools: PortfolioPosition[]
  farms: PortfolioPosition[]
  legacyPositions: PortfolioPosition[]
  endedPositions: PortfolioPosition[]
  withdrawOpportunities: PortfolioPosition[]
}

export type NormalizedUserPortfolio = {
  schema: 'melega.normalized-user-portfolio.v1'
  wallet: string | null
  generatedAt: string
  /** Canonical WalletPortfolio — shared by Passport / Pools / Liquidity. */
  walletPortfolio: WalletPortfolio
  sections: NormalizedUserPortfolioSections
  views: {
    all: PortfolioViewResult
    liquidity: PortfolioViewResult
    pools: PortfolioViewResult
    farms: PortfolioViewResult
    historical: PortfolioViewResult
    legacy: PortfolioViewResult
    withdraw: PortfolioViewResult
  }
}

function isWithdrawOpportunity(position: PortfolioPosition): boolean {
  const actions = [
    position.recommendedAction,
    position.actions?.primary,
    ...(position.actions?.secondary ?? []),
  ].filter(Boolean)
  return actions.some(
    (a) => a && a.enabled && (a.type === 'WITHDRAW' || a.type === 'UNSTAKE' || a.type === 'REMOVE_LIQUIDITY'),
  )
}

function isLegacyPosition(position: PortfolioPosition): boolean {
  if (position.status === 'ENDED' || position.status === 'UNAVAILABLE') return true
  if (position.importance === 'ARCHIVED') return true
  const title = `${position.title} ${position.subtitle ?? ''}`.toLowerCase()
  return title.includes('legacy') || title.includes('ended') || title.includes('withdraw-only')
}

export function projectNormalizedSections(portfolio: WalletPortfolio): NormalizedUserPortfolioSections {
  const positions = portfolio.positions ?? []
  return {
    tokens: [],
    liquidity: positions.filter((p) => p.positionType === 'LIQUIDITY'),
    pools: positions.filter((p) => p.positionType === 'POOL'),
    farms: positions.filter((p) => p.positionType === 'FARM'),
    legacyPositions: positions.filter(isLegacyPosition),
    endedPositions: positions.filter((p) => p.status === 'ENDED'),
    withdrawOpportunities: positions.filter(isWithdrawOpportunity),
  }
}

export function buildNormalizedUserPortfolio(input: {
  wallet: string | null
  generatedAt?: string
  summary?: PortfolioSummary
  liquidityPositions?: readonly PortfolioPosition[]
  farmPositions?: readonly PortfolioPosition[]
  poolPositions?: readonly PortfolioPosition[]
  sectionStatus?: WalletPortfolioSectionStatus
}): NormalizedUserPortfolio {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const empty = createEmptyWalletPortfolio({
    wallet: input.wallet,
    generatedAt,
  })

  const walletPortfolio = createWalletPortfolio({
    wallet: input.wallet,
    generatedAt,
    summary: input.summary ?? empty.summary,
    liquidityPositions: input.liquidityPositions ?? [],
    farmPositions: input.farmPositions ?? [],
    poolPositions: input.poolPositions ?? [],
    claimables: empty.claimables,
    approvals: empty.approvals,
    recentActivity: empty.recentActivity,
    quickActions: empty.quickActions,
    sectionStatus: input.sectionStatus ?? empty.sectionStatus,
  })

  const sections = projectNormalizedSections(walletPortfolio)
  const view = (v: PortfolioViewType) => resolvePortfolioView(walletPortfolio, v)

  return {
    schema: 'melega.normalized-user-portfolio.v1',
    wallet: walletPortfolio.wallet,
    generatedAt: walletPortfolio.generatedAt,
    walletPortfolio,
    sections,
    views: {
      all: view('ALL'),
      liquidity: view('LIQUIDITY'),
      pools: view('POOL'),
      farms: view('FARM'),
      historical: view('HISTORICAL'),
      legacy: view('LEGACY'),
      withdraw: view('WITHDRAW_OPPORTUNITIES'),
    },
  }
}

/** Wrap an existing WalletPortfolio (from Liquidity/Pools builders) into the normalized model. */
export function normalizeExistingWalletPortfolio(portfolio: WalletPortfolio): NormalizedUserPortfolio {
  const sections = projectNormalizedSections(portfolio)
  const view = (v: PortfolioViewType) => resolvePortfolioView(portfolio, v)
  return {
    schema: 'melega.normalized-user-portfolio.v1',
    wallet: portfolio.wallet,
    generatedAt: portfolio.generatedAt,
    walletPortfolio: portfolio,
    sections,
    views: {
      all: view('ALL'),
      liquidity: view('LIQUIDITY'),
      pools: view('POOL'),
      farms: view('FARM'),
      historical: view('HISTORICAL'),
      legacy: view('LEGACY'),
      withdraw: view('WITHDRAW_OPPORTUNITIES'),
    },
  }
}
