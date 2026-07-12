import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
import { STAKING_TEMPLATES } from 'views/BuildStudio/buildStudioData'

export type WizardStep = 1 | 2 | 3 | 4 | 5

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
  depositFee: string
  autoCompound: string
  poolType: string
  minStake: string
  maxStake: string
  visibility: string
}

const template = STAKING_TEMPLATES[0]

export const WIZARD_STEP_LABELS = ['Reward', 'Budget', 'Emission', 'Lock', 'Review'] as const

export const TOKEN_OPTIONS = ['MARCO', 'BNB', 'USDT', 'CAKE', 'ETH'] as const

export function createDefaultWizardState(): CreatePoolWizardState {
  return {
    rewardToken: 'MARCO',
    stakeToken: premiumUiValue(template.stakeToken),
    rewardBudget: '100000',
    emissionDuration: '90',
    dailyRewards: '420',
    lockType: 'Flexible',
    lockPeriod: '90d',
    cooldown: 'None',
    withdrawalFee: '0%',
    depositFee: '0%',
    autoCompound: 'Optional',
    poolType: 'Official',
    minStake: '10',
    maxStake: '1000000',
    visibility: 'Public',
  }
}

export function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function hasCompletePoolEstimateParams(state: CreatePoolWizardState): boolean {
  return Boolean(
    state.rewardToken &&
      state.stakeToken &&
      parseNum(state.rewardBudget) > 0 &&
      parseNum(state.dailyRewards) > 0 &&
      parseNum(state.emissionDuration) > 0,
  )
}

export function computeEstimatedApr(state: CreatePoolWizardState): string {
  if (!hasCompletePoolEstimateParams(state)) return 'Complete pool parameters to estimate APR'
  const budget = parseNum(state.rewardBudget)
  const daily = parseNum(state.dailyRewards)
  const apr = (daily * 365 * 100) / budget
  if (!Number.isFinite(apr)) return 'Complete pool parameters to estimate APR'
  return `${apr.toFixed(1)}%`
}

export function computeHealthScore(state: CreatePoolWizardState): number {
  let score = 72
  if (state.autoCompound === 'Enabled') score += 8
  if (state.lockType === 'Fixed') score += 6
  if (parseNum(state.withdrawalFee) === 0) score += 4
  if (state.poolType === 'Official') score += 5
  return Math.min(98, Math.max(42, score))
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
        depositFee: state.depositFee,
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
