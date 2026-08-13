import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
import { STAKING_TEMPLATES } from 'views/BuildStudio/buildStudioData'
import { describeCreatePoolFee, type CreateFeeDisplay } from 'config/constants/feeSchedule'

export type WizardStep = 1 | 2 | 3 | 4

export type CreatePoolWizardState = {
  rewardToken: string
  stakeToken: string
  rewardBudget: string
  emissionDuration: string
  dailyRewards: string
  lockType: string
  lockPeriod: string
  cooldown: string
  withdrawalFee: string
  autoCompound: string
  poolType: string
  minStake: string
  maxStake: string
  visibility: string
}

const template = STAKING_TEMPLATES[0]

/** Compact stepper labels (maps to required product sections). */
export const WIZARD_STEP_LABELS = ['Tokens', 'Rewards', 'Safety', 'Review'] as const

/** Required Create Pool product sections (stake→create). */
export const CREATE_POOL_FLOW_SECTIONS = [
  'Stake Token',
  'Reward Token',
  'Reward Budget',
  'Emission Schedule',
  'Lock/Safety',
  'Review',
  'Create',
] as const

export const TOKEN_OPTIONS = ['MARCO', 'BNB', 'USDT', 'CAKE', 'ETH'] as const

export function createDefaultWizardState(): CreatePoolWizardState {
  // Empty budget/emission until the user configures — never seed fabricated APR (e.g. 153.3%).
  return {
    rewardToken: 'MARCO',
    stakeToken: premiumUiValue(template.stakeToken),
    rewardBudget: '',
    emissionDuration: '',
    dailyRewards: '',
    lockType: 'Flexible',
    lockPeriod: '',
    cooldown: 'None',
    withdrawalFee: '0%',
    autoCompound: 'Optional',
    poolType: 'Official',
    minStake: '',
    maxStake: '',
    visibility: 'Public',
  }
}

export function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** Daily emission is a derived value: budget ÷ duration. */
export function deriveDailyRewards(state: Pick<CreatePoolWizardState, 'rewardBudget' | 'emissionDuration'>): string {
  const budget = parseNum(state.rewardBudget)
  const days = parseNum(state.emissionDuration)
  if (budget <= 0 || days <= 0) return ''
  const daily = budget / days
  return daily.toLocaleString('en-US', {
    useGrouping: false,
    maximumFractionDigits: 8,
  })
}

export function hasCompletePoolEstimateParams(state: CreatePoolWizardState): boolean {
  return Boolean(
    state.rewardToken &&
      state.stakeToken &&
      parseNum(state.rewardBudget) > 0 &&
      parseNum(state.emissionDuration) > 0,
  )
}

export function computeEstimatedApr(state: CreatePoolWizardState): string {
  if (!hasCompletePoolEstimateParams(state)) return 'Calculated after reward configuration.'
  // A genuine staking APR needs current TVL and both token USD prices. Budget ÷
  // duration only determines emission and must never be presented as APR.
  return 'Live after first stake'
}

/** Returns null until configuration is complete — never a fabricated default score. */
export function computeHealthScore(state: CreatePoolWizardState): number | null {
  if (!hasCompletePoolEstimateParams(state)) return null
  let score = 72
  if (state.autoCompound === 'Enabled') score += 8
  if (state.lockType === 'Fixed') score += 6
  if (parseNum(state.withdrawalFee) === 0) score += 4
  if (state.poolType === 'Official') score += 5
  return Math.min(98, Math.max(42, score))
}

/** Reward budget consumed as a percentage over the emission window — null until configured. */
export function computeRewardConsumptionPct(state: CreatePoolWizardState): number | null {
  if (!hasCompletePoolEstimateParams(state)) return null
  const budget = parseNum(state.rewardBudget)
  const daily = parseNum(state.dailyRewards) || parseNum(deriveDailyRewards(state))
  const days = parseNum(state.emissionDuration)
  if (budget <= 0) return null
  const projected = daily * (days || 30)
  return Math.min(96, Math.max(8, Math.round((projected / budget) * 100)))
}

/** Start/End schedule summary — derived from emission duration, never a fabricated calendar date. */
export function describePoolSchedule(state: CreatePoolWizardState): { start: string; end: string } {
  const days = parseNum(state.emissionDuration)
  return {
    start: 'Starts on pool creation',
    end: days > 0 ? `Ends after ${state.emissionDuration} days` : 'Calculated after reward duration is set',
  }
}

/**
 * Create Pool fee display for the wizard — consumes describeCreatePoolFee from the
 * Founder fee schedule (no duplicated fee literals or MARCO-comparison logic).
 */
export function describeWizardCreatePoolFee(state: CreatePoolWizardState): CreateFeeDisplay {
  return describeCreatePoolFee(state.stakeToken === 'MARCO')
}

export function buildMachinePreviewJson(state: CreatePoolWizardState): string {
  return JSON.stringify(
    {
      rewardToken: state.rewardToken,
      stakeToken: state.stakeToken,
      rewardBudget: state.rewardBudget,
      emissionDurationDays: state.emissionDuration,
      dailyRewards: state.dailyRewards,
      lock: {
        type: state.lockType,
        period: state.lockPeriod,
        cooldown: state.cooldown,
        withdrawalFee: state.withdrawalFee,
        autoCompound: state.autoCompound,
      },
      pool: {
        type: state.poolType,
        minStake: state.minStake,
        maxStake: state.maxStake,
        visibility: state.visibility,
      },
      estimatedApr: computeEstimatedApr(state),
      healthScore: computeHealthScore(state),
    },
    null,
    2,
  )
}
