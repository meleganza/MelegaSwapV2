/**
 * Command Center → WalletPortfolio cutover helpers (R791D.3B).
 *
 * Maps studio producer rows through product adapters into createWalletPortfolio.
 * Product-specific UI views must filter portfolio.positions — not rebuild roots.
 * Pure where possible; no React; no second aggregation after the service.
 */

import {
  createWalletPortfolio,
  type CreateWalletPortfolioInput,
} from 'lib/wallet-portfolio/portfolioService'
import {
  adaptLiquidityPositionToPortfolioPosition,
  type LiquidityPositionFacts,
} from 'lib/wallet-portfolio/adapters/liquidityPositionAdapter'
import {
  adaptFarmPositionToPortfolioPosition,
  type FarmPositionFacts,
} from 'lib/wallet-portfolio/adapters/farmPositionAdapter'
import {
  adaptPoolPositionToPortfolioPosition,
  type PoolPositionFacts,
} from 'lib/wallet-portfolio/adapters/poolPositionAdapter'
import type {
  PortfolioPosition,
  PortfolioSummary,
  WalletPortfolio,
  WalletPortfolioSectionStatus,
} from 'lib/wallet-portfolio/contracts'
import type { LiquidityPosition, FarmPosition, PoolPosition } from '../commandCenterData'
import type { LiquidityPositionRow } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'

export interface CommandCenterPortfolioBuildInput {
  wallet: string | null
  chainId: number | null
  chainName: string
  generatedAt: string
  liquidityRows: readonly LiquidityPositionRow[]
  farmCards: readonly FarmPreviewCard[]
  poolCards: readonly PoolPreviewCard[]
  sectionStatus: WalletPortfolioSectionStatus
  /** Passthrough summary — orchestration supplies counts; service does not recompute economics. */
  summary: PortfolioSummary
  claimables?: CreateWalletPortfolioInput['claimables']
  approvals?: CreateWalletPortfolioInput['approvals']
  recentActivity?: CreateWalletPortfolioInput['recentActivity']
  quickActions?: CreateWalletPortfolioInput['quickActions']
}

function bnRaw(value: { toFixed?: (d: number) => string; toString: () => string } | null | undefined): string | null {
  if (!value) return null
  try {
    if (typeof value.toFixed === 'function') return value.toFixed(0)
    return value.toString()
  } catch {
    return null
  }
}

function bnPositive(value: { gt?: (n: number) => boolean } | null | undefined): boolean {
  try {
    return Boolean(value?.gt?.(0))
  } catch {
    return false
  }
}

export function liquidityRowToFacts(
  row: LiquidityPositionRow,
  wallet: string,
  chainId: number,
  chainName: string,
): LiquidityPositionFacts | null {
  const pair = row.pair
  if (!pair?.token0 || !pair?.token1 || !row.lpBalance) return null
  const pairAddress = (row.pairAddress ?? pair.liquidityToken?.address ?? null)?.toLowerCase() ?? null
  let raw: string | null = null
  let formatted: string | null = null
  let decimals: number | null = null
  try {
    raw = row.lpBalance.quotient?.toString?.() ?? null
    formatted = row.lpBalance.toSignificant?.(8) ?? null
    decimals = row.lpBalance.currency?.decimals ?? null
  } catch {
    return null
  }
  if (!raw || raw === '0') return null

  return {
    wallet,
    chainId: row.chainId ?? chainId,
    chainName,
    protocolId: 'melega-v2',
    pairAddress,
    sourceId: row.ownershipSource ?? 'DIRECT_WALLET_LP',
    token0: {
      chainId: pair.token0.chainId ?? chainId,
      address: pair.token0.address ?? null,
      symbol: pair.token0.symbol ?? null,
      name: pair.token0.name ?? null,
      decimals: pair.token0.decimals ?? null,
      logoURI: null,
    },
    token1: {
      chainId: pair.token1.chainId ?? chainId,
      address: pair.token1.address ?? null,
      symbol: pair.token1.symbol ?? null,
      name: pair.token1.name ?? null,
      decimals: pair.token1.decimals ?? null,
      logoURI: null,
    },
    lpToken: pair.liquidityToken
      ? {
          chainId: pair.liquidityToken.chainId ?? chainId,
          address: pair.liquidityToken.address ?? null,
          symbol: pair.liquidityToken.symbol ?? null,
          name: pair.liquidityToken.name ?? null,
          decimals: pair.liquidityToken.decimals ?? null,
          logoURI: null,
        }
      : null,
    lpBalance: { raw, formatted, decimals },
    ownershipVerified: true,
    poolShare: null,
    underlyingAmount0: null,
    underlyingAmount1: null,
    currentValueUsd: null,
    unlockState: 'unlocked',
    productRoute: '/liquidity-studio',
    openRoute: '/liquidity-studio',
    manageRoute: '/liquidity-studio',
    removeRoute: '/liquidity-studio',
    addLiquidityRoute: '/liquidity-studio',
    analyticsRoute: null,
  }
}

export function farmCardToFacts(
  card: FarmPreviewCard,
  wallet: string,
  chainId: number,
  chainName: string,
): FarmPositionFacts | null {
  if (!bnPositive(card.userStaked)) return null
  const raw = bnRaw(card.userStaked)
  if (!raw || raw === '0') return null
  const pendingRaw = bnRaw(card.pendingReward)
  const hasClaimable = bnPositive(card.pendingReward)
  const stakeSymbol = card.lpLabel ?? card.tokens?.[0] ?? null
  const rewardSymbol = card.rewardToken ?? card.analyzePreview?.rewardToken ?? null

  return {
    wallet,
    chainId,
    chainName,
    protocolId: 'melega-v2',
    contractAddress: card.rawFarm?.lpAddress ?? card.id ?? null,
    pid: card.pid ?? null,
    sourceId: 'FARM_STAKE',
    farmName: card.pair ?? null,
    stakeToken: {
      chainId,
      address: card.rawFarm?.lpAddress ?? null,
      symbol: stakeSymbol,
      name: card.pair ?? null,
      decimals: 18,
      logoURI: null,
    },
    rewardTokens: rewardSymbol
      ? [
          {
            chainId,
            address: null,
            symbol: rewardSymbol,
            name: rewardSymbol,
            decimals: 18,
            logoURI: null,
          },
        ]
      : [],
    stakedBalance: { raw, formatted: card.userStaked?.toString() ?? null, decimals: 18 },
    ownershipVerified: true,
    pendingRewards: pendingRaw
      ? { raw: pendingRaw, formatted: card.pendingReward?.toString() ?? null, decimals: 18 }
      : null,
    hasClaimableRewards: hasClaimable,
    currentValueUsd: null,
    apr: card.apr ?? card.displayApr ?? null,
    isEnded: card.status === 'finished',
    isPaused: card.emissionState === 'paused',
    runtimeUnavailable: card.emissionState === 'unavailable' || card.status === 'indexing',
    unlockState: 'unlocked',
    productRoute: '/farms',
    openRoute: '/farms',
    manageRoute: '/farms',
    harvestRoute: '/farms',
    withdrawRoute: '/farms',
    analyticsRoute: null,
  }
}

export function poolCardToFacts(
  card: PoolPreviewCard,
  wallet: string,
  chainId: number,
  chainName: string,
): PoolPositionFacts | null {
  if (!bnPositive(card.userStaked)) return null
  const raw = bnRaw(card.userStaked)
  if (!raw || raw === '0') return null
  const pendingRaw = bnRaw(card.pendingReward)
  const hasClaimable = bnPositive(card.pendingReward)

  return {
    wallet,
    chainId,
    chainName,
    protocolId: 'melega-v2',
    contractAddress: card.contractAddress ?? null,
    sousId: card.sousId ?? null,
    sourceId: 'POOL_STAKE',
    poolName: card.name ?? null,
    stakeToken: {
      chainId,
      address: card.stakeContractAddress ?? null,
      symbol: card.stakeToken ?? card.tokens?.[0] ?? null,
      name: card.stakeToken ?? null,
      decimals: card.rawPool?.stakingToken?.decimals ?? 18,
      logoURI: null,
    },
    rewardTokens: card.rewardToken
      ? [
          {
            chainId,
            address: card.rewardContractAddress ?? null,
            symbol: card.rewardToken,
            name: card.rewardToken,
            decimals: card.rawPool?.earningToken?.decimals ?? 18,
            logoURI: null,
          },
        ]
      : [],
    stakedBalance: { raw, formatted: card.userStaked?.toString() ?? null, decimals: 18 },
    ownershipVerified: true,
    pendingRewards: pendingRaw
      ? { raw: pendingRaw, formatted: card.pendingReward?.toString() ?? null, decimals: 18 }
      : null,
    hasClaimableRewards: hasClaimable,
    currentValueUsd: null,
    apr: card.apr ?? card.sustainableAprDisplay ?? null,
    isEnded: card.status === 'ended' || card.displayStatus === 'ENDED',
    isPaused: false,
    runtimeUnavailable: card.status === 'indexing' || card.displayStatus === 'INDEXING',
    unlockState: 'unlocked',
    productRoute: '/pools',
    openRoute: '/pools',
    manageRoute: '/pools',
    claimRoute: '/pools',
    withdrawRoute: '/pools',
    analyticsRoute: null,
  }
}

/** Adapt studio rows → PortfolioPosition[] (nulls dropped). */
export function adaptStudioRowsToPortfolioPositions(input: {
  wallet: string
  chainId: number
  chainName: string
  liquidityRows: readonly LiquidityPositionRow[]
  farmCards: readonly FarmPreviewCard[]
  poolCards: readonly PoolPreviewCard[]
}): {
  liquidityPositions: PortfolioPosition[]
  farmPositions: PortfolioPosition[]
  poolPositions: PortfolioPosition[]
} {
  const liquidityPositions = input.liquidityRows
    .map((row) => {
      const facts = liquidityRowToFacts(row, input.wallet, input.chainId, input.chainName)
      return facts ? adaptLiquidityPositionToPortfolioPosition(facts) : null
    })
    .filter((p): p is PortfolioPosition => p != null)

  const farmPositions = input.farmCards
    .map((card) => {
      const facts = farmCardToFacts(card, input.wallet, input.chainId, input.chainName)
      return facts ? adaptFarmPositionToPortfolioPosition(facts) : null
    })
    .filter((p): p is PortfolioPosition => p != null)

  const poolPositions = input.poolCards
    .map((card) => {
      const facts = poolCardToFacts(card, input.wallet, input.chainId, input.chainName)
      return facts ? adaptPoolPositionToPortfolioPosition(facts) : null
    })
    .filter((p): p is PortfolioPosition => p != null)

  return { liquidityPositions, farmPositions, poolPositions }
}

function summaryFromPositions(
  positions: readonly PortfolioPosition[],
  base: PortfolioSummary,
): PortfolioSummary {
  return {
    netValueUsd: base.netValueUsd,
    claimableValueUsd: base.claimableValueUsd,
    activePositionCount: positions.filter((p) => p.status === 'ACTIVE').length,
    historicalPositionCount: positions.filter((p) => p.status === 'ENDED').length,
    attentionPositionCount: positions.filter((p) => p.requiresAttention).length,
    pendingActionCount: positions.filter((p) => p.recommendedAction.type !== 'NONE').length,
  }
}

/**
 * Single aggregation entry for Command Center.
 * Invokes createWalletPortfolio exactly once — no post-merge reordering.
 */
export function buildCommandCenterWalletPortfolio(input: CommandCenterPortfolioBuildInput): WalletPortfolio {
  const wallet = input.wallet
  const chainId = input.chainId

  if (!wallet || chainId == null) {
    return createWalletPortfolio({
      wallet,
      generatedAt: input.generatedAt,
      summary: summaryFromPositions([], input.summary),
      liquidityPositions: [],
      farmPositions: [],
      poolPositions: [],
      claimables: input.claimables ? [...input.claimables] : [],
      approvals: input.approvals ? [...input.approvals] : [],
      recentActivity: input.recentActivity ? [...input.recentActivity] : [],
      quickActions: input.quickActions ? [...input.quickActions] : [],
      sectionStatus: input.sectionStatus,
    })
  }

  const adapted = adaptStudioRowsToPortfolioPositions({
    wallet,
    chainId,
    chainName: input.chainName,
    liquidityRows: input.liquidityRows,
    farmCards: input.farmCards,
    poolCards: input.poolCards,
  })

  const mergedForCounts = [
    ...adapted.liquidityPositions,
    ...adapted.farmPositions,
    ...adapted.poolPositions,
  ]

  return createWalletPortfolio({
    wallet,
    generatedAt: input.generatedAt,
    summary: summaryFromPositions(mergedForCounts, input.summary),
    liquidityPositions: adapted.liquidityPositions,
    farmPositions: adapted.farmPositions,
    poolPositions: adapted.poolPositions,
    claimables: input.claimables ? [...input.claimables] : [],
    approvals: input.approvals ? [...input.approvals] : [],
    recentActivity: input.recentActivity ? [...input.recentActivity] : [],
    quickActions: input.quickActions ? [...input.quickActions] : [],
    sectionStatus: input.sectionStatus,
  })
}

export function filterPortfolioPositions(
  portfolio: WalletPortfolio,
  positionType: PortfolioPosition['positionType'],
): PortfolioPosition[] {
  return portfolio.positions.filter((p) => p.positionType === positionType)
}

/** Legacy display projection for existing cards — derived only from filtered PortfolioPosition. */
export function projectLiquidityView(positions: readonly PortfolioPosition[]): LiquidityPosition[] {
  return positions.map((p) => ({
    id: p.positionId,
    pair: p.title,
    apr: p.apr ?? 'Unavailable',
    tag: p.badges.includes('LOCKED') ? 'Locked' : 'V2 LP',
    impermanentLoss: 'Unavailable',
  }))
}

export function projectFarmView(positions: readonly PortfolioPosition[]): FarmPosition[] {
  return positions.map((p) => ({
    id: p.positionId,
    name: p.title,
    apr: p.apr ?? 'Unavailable',
    pending: p.claimableValueUsd ?? p.pendingRewardsValueUsd ?? 'Unavailable',
  }))
}

export function projectPoolView(positions: readonly PortfolioPosition[]): PoolPosition[] {
  return positions.map((p) => ({
    id: p.positionId,
    name: p.title,
    apr: p.apr ?? 'Unavailable',
    pending: p.claimableValueUsd ?? p.pendingRewardsValueUsd ?? 'Unavailable',
  }))
}
