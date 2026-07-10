import type { PoolPreviewCard } from '../poolsStudioData'
import { isForbiddenAprDisplay } from './poolsAprRules'

export type PoolGateCategory =
  | 'valid_live'
  | 'ended'
  | 'needs_funding'
  | 'missing_apr'
  | 'missing_reward_budget'
  | 'hidden_by_policy'
  | 'indexing'

export interface PoolGateAuditEntry {
  poolId: string
  contract: string
  stakingToken: string
  rewardToken: string
  rewardBalance: string
  emissionRate: string
  startBlock: string | number | null
  endBlock: string | number | null
  currentBlock: string | number | null
  tvl: string
  rawApr: string | number | null
  displayApr: string
  status: string
  hiddenReason: string | null
  category: PoolGateCategory
  displayable: boolean
  bscscanUrl: string
}

export interface PoolGateSummary {
  discovered: number
  validLive: number
  ended: number
  needsFunding: number
  missingApr: number
  missingRewardBudget: number
  hiddenByPolicy: number
  indexing: number
  displayable: number
  emptyStateReason: string
}

function isPoolDisplayable(card: PoolPreviewCard): boolean {
  return (
    card.visibilityStatus === 'VISIBLE' &&
    card.status === 'live' &&
    card.displayStatus === 'LIVE' &&
    Boolean(card.sustainableAprDisplay) &&
    !isForbiddenAprDisplay(card.sustainableAprDisplay)
  )
}

function categorizePoolGate(card: PoolPreviewCard): PoolGateCategory {
  if (isPoolDisplayable(card)) return 'valid_live'
  const reason = card.hiddenReason
  if (reason === 'POOL_ENDED') return 'ended'
  if (reason === 'NEEDS_FUNDING') return 'needs_funding'
  if (reason === 'INVALID_APR') return 'missing_apr'
  if (reason === 'INSUFFICIENT_REWARD_BUDGET') return 'missing_reward_budget'
  if (reason === 'INDEXING') return 'indexing'
  return 'hidden_by_policy'
}

function poolContract(card: PoolPreviewCard): string {
  return card.contractAddress ?? card.analyzePreview?.contractAddress ?? ''
}

function poolBscscanUrl(contract: string): string {
  if (!contract || contract.length < 10) return 'https://bscscan.com'
  return `https://bscscan.com/address/${contract}`
}

export function buildPoolGateAuditEntry(
  card: PoolPreviewCard,
  currentBlock?: number,
): PoolGateAuditEntry {
  const contract = poolContract(card)
  const pool = card.rawPool
  return {
    poolId: card.id,
    contract,
    stakingToken: card.stakeToken ?? card.tokens[0] ?? '',
    rewardToken: card.rewardToken,
    rewardBalance: card.remainingRewards ?? card.rewardBudgetUsd ?? '—',
    emissionRate: card.dailyRewards ?? card.estimatedDailyReward ?? '—',
    startBlock: pool?.startBlock ?? null,
    endBlock: pool?.bonusEndBlock ?? null,
    currentBlock: currentBlock ?? null,
    tvl: card.tvl ?? '—',
    rawApr: card.rawApr ?? card.aprExact ?? null,
    displayApr: card.sustainableAprDisplay ?? card.apr ?? '—',
    status: card.status,
    hiddenReason: card.hiddenReason ?? null,
    category: categorizePoolGate(card),
    displayable: isPoolDisplayable(card),
    bscscanUrl: card.explorerUrl ?? poolBscscanUrl(contract),
  }
}

export function buildPoolGateReport(
  cards: PoolPreviewCard[],
  currentBlock?: number,
): {
  gateAudit: PoolGateAuditEntry[]
  gateSummary: PoolGateSummary
} {
  const gateAudit = cards.map((card) => buildPoolGateAuditEntry(card, currentBlock))
  const summary = {
    discovered: gateAudit.length,
    validLive: gateAudit.filter((e) => e.category === 'valid_live').length,
    ended: gateAudit.filter((e) => e.category === 'ended').length,
    needsFunding: gateAudit.filter((e) => e.category === 'needs_funding').length,
    missingApr: gateAudit.filter((e) => e.category === 'missing_apr').length,
    missingRewardBudget: gateAudit.filter((e) => e.category === 'missing_reward_budget').length,
    hiddenByPolicy: gateAudit.filter((e) => e.category === 'hidden_by_policy').length,
    indexing: gateAudit.filter((e) => e.category === 'indexing').length,
    displayable: gateAudit.filter((e) => e.displayable).length,
  }

  const blockers = [
    summary.needsFunding ? `${summary.needsFunding} needs funding` : '',
    summary.missingApr ? `${summary.missingApr} missing APR` : '',
    summary.missingRewardBudget ? `${summary.missingRewardBudget} missing reward budget` : '',
    summary.hiddenByPolicy ? `${summary.hiddenByPolicy} hidden by policy` : '',
    summary.ended ? `${summary.ended} ended` : '',
    summary.indexing ? `${summary.indexing} indexing` : '',
  ].filter(Boolean)

  const emptyStateReason =
    summary.displayable > 0
      ? `${summary.displayable} pool(s) pass visibility gates`
      : blockers.length
        ? `No displayable pools — ${blockers.join(', ')}`
        : 'No pools discovered on-chain'

  return {
    gateAudit,
    gateSummary: { ...summary, emptyStateReason },
  }
}

/** Proposed policy relaxation — not applied unless infra confirms safe. */
export const POOL_GATE_POLICY_NOTE =
  'If on-chain pools with active emission but zero TVL should surface, relax evaluatePoolVisibility INVALID_APR gate to allow estimated emission APR when raw APR is zero.'
