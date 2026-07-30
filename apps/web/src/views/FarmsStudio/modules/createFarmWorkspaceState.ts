/**
 * Create Farm Workspace — pure state helpers.
 * Fee resolution consumes describeCreateFarmFee / resolveCreateFarmFeeBnb from
 * config/constants/feeSchedule.ts — priority rules are never duplicated here.
 */
import { describeCreateFarmFee, MELEGA_TREASURY_FEE_DESTINATION, type CreateFeeDisplay } from 'config/constants/feeSchedule'

export const FARM_TOKEN_OPTIONS = ['MARCO', 'BNB', 'USDT', 'CAKE', 'ETH'] as const

export type CreateFarmWorkspaceState = {
  lpTokenA: string
  lpTokenB: string
  rewardToken: string
  rewardBudget: string
  startMode: 'immediate' | 'scheduled'
  durationDays: string
  emissionRate: string
  farmOwner: string
}

export function createDefaultCreateFarmWorkspaceState(): CreateFarmWorkspaceState {
  return {
    lpTokenA: 'MARCO',
    lpTokenB: 'BNB',
    rewardToken: 'MARCO',
    rewardBudget: '',
    startMode: 'immediate',
    durationDays: '',
    emissionRate: '',
    farmOwner: '',
  }
}

export function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function pairContainsMarco(state: CreateFarmWorkspaceState): boolean {
  return state.lpTokenA === 'MARCO' || state.lpTokenB === 'MARCO'
}

export function hasCompleteFarmEstimateParams(state: CreateFarmWorkspaceState): boolean {
  return Boolean(
    state.lpTokenA &&
      state.lpTokenB &&
      state.rewardToken &&
      parseNum(state.rewardBudget) > 0 &&
      parseNum(state.emissionRate) > 0 &&
      parseNum(state.durationDays) > 0,
  )
}

/** Never a fabricated default — returns the honest "not yet configured" message. */
export function computeEstimatedFarmApr(state: CreateFarmWorkspaceState): string {
  if (!hasCompleteFarmEstimateParams(state)) return 'Calculated after reward configuration.'
  const budget = parseNum(state.rewardBudget)
  const daily = parseNum(state.emissionRate)
  const apr = (daily * 365 * 100) / budget
  if (!Number.isFinite(apr)) return 'Complete farm parameters to estimate APR'
  return `${apr.toFixed(1)}%`
}

/** Returns null until configuration is complete — never a fabricated default score. */
export function computeFarmHealthScore(state: CreateFarmWorkspaceState): number | null {
  if (!hasCompleteFarmEstimateParams(state)) return null
  let score = 70
  if (pairContainsMarco(state)) score += 8
  if (parseNum(state.durationDays) >= 30) score += 6
  if (state.farmOwner.trim().length > 0) score += 4
  return Math.min(97, Math.max(40, score))
}

export function describeFarmSchedule(state: CreateFarmWorkspaceState): { start: string; end: string } {
  const days = parseNum(state.durationDays)
  return {
    start: state.startMode === 'immediate' ? 'Starts on farm creation' : 'Starts at scheduled block height',
    end: days > 0 ? `Ends after ${state.durationDays} days` : 'Calculated after duration is set',
  }
}

/** Consumes describeCreateFarmFee — no duplicated fee literals or MARCO-comparison logic. */
export function describeCreateFarmWorkspaceFee(state: CreateFarmWorkspaceState): CreateFeeDisplay {
  return describeCreateFarmFee({
    rewardTokenIsMarco: state.rewardToken === 'MARCO',
    pairContainsMarco: pairContainsMarco(state),
  })
}

export const CREATE_FARM_TREASURY_RECIPIENT = MELEGA_TREASURY_FEE_DESTINATION

export function buildCreateFarmMachinePreviewJson(state: CreateFarmWorkspaceState): string {
  return JSON.stringify(
    {
      lpPair: `${state.lpTokenA} / ${state.lpTokenB}`,
      rewardToken: state.rewardToken,
      rewardBudget: state.rewardBudget,
      schedule: describeFarmSchedule(state),
      emissionRate: state.emissionRate,
      farmOwner: state.farmOwner,
      fee: describeCreateFarmWorkspaceFee(state),
      treasuryRecipient: CREATE_FARM_TREASURY_RECIPIENT,
      estimatedApr: computeEstimatedFarmApr(state),
      healthScore: computeFarmHealthScore(state),
    },
    null,
    2,
  )
}
