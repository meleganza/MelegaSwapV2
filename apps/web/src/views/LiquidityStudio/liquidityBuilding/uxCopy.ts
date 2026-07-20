/**
 * LB016 frozen UX copy — Liquidity Building production experience.
 * Do not expose infrastructure jargon (KMS, Treasury internals, BC003S).
 */

export const LB_UX = {
  productName: 'Liquidity Building',
  aiBadge: 'AI Powered',
  entryLead: 'Transform your available token supply into real liquidity on Melega DEX.',
  startCta: 'Start Building Liquidity',
  activationRequired: 'Activation Required',
  activationPendingTitle: 'Liquidity Building Ready',
  activationPendingBadge: 'Activation Pending',
  activationPendingBody:
    'The system is fully prepared. Production activation requirements are being completed.',
  activationRequiredBody:
    'Liquidity Building is prepared but unavailable until production activation requirements are completed. No fake liquidity, executions, APY, or simulated activity.',
  readinessContracts: 'Contracts Ready',
  readinessRuntime: 'Runtime Ready',
  readinessActivation: 'Activation Pending',
  budgetLabel: 'How many tokens do you want to dedicate?',
  budgetSupport: 'Only deposited tokens can be used. Unused tokens remain yours.',
  strategyFullAiTitle: 'Full AI',
  strategyFullAiTag: 'Recommended',
  strategyFullAiBody:
    'The system automatically determines when and how much liquidity to build based on real market demand and safety limits.',
  strategyRangeTitle: 'Dynamic Range',
  strategyRangeTag: 'Advanced',
  strategyRangeBody:
    'Define minimum and maximum execution intensity. The system chooses within your range.',
  decisionFrequencyLabel: 'Decision Frequency',
  decisionFrequencyHelp:
    'The system evaluates market conditions periodically and executes only when conditions are safe.',
  reviewTitle: 'Liquidity Building Program',
  reviewCta: 'Deposit Budget & Activate',
  safetyNoGuarantees: 'No price guarantees.',
  safetyNoManipulation: 'No market manipulation.',
  safetyNoOutcomes: 'No guaranteed outcomes.',
  activeHero: 'Building liquidity from real market demand.',
  metricLiquidityBuilt: 'Liquidity Built',
  metricBudgetRemaining: 'Budget Remaining',
  metricExecutions: 'Executions',
  metricLpPosition: 'LP Position',
  metricUnavailable: 'Unavailable',
  metricNoneYet: 'None yet',
  lpOwnedByOwner: 'Owned by project owner',
  activityTitle: 'Activity',
  manageTitle: 'Manage',
  technicalTitle: 'Technical Details',
  emptyNoProgram: 'No active program yet.',
  walletConnect: 'Connect Wallet',
  switchNetwork: 'Switch Network',
  continueSetup: 'Continue',
  back: 'Back',
  review: 'Review',
} as const

export const DECISION_FREQUENCY_OPTIONS = [
  { label: 'Every 5 minutes', seconds: 300 as const },
  { label: 'Every 15 minutes', seconds: 900 as const },
  { label: 'Every 30 minutes', seconds: 1800 as const },
  { label: 'Every hour', seconds: 3600 as const },
]

export type LbUxPhase = 'entry' | 'setup' | 'review' | 'active' | 'manage'

export type LbActivityKind = 'EXECUTION_COMPLETED' | 'EXECUTION_SKIPPED' | 'WAITING'

export type LbActivityItem = {
  id: string
  kind: LbActivityKind
  title: string
  detail?: string
  tokenSold?: string
  quoteAcquired?: string
  liquidityAdded?: string
  reason?: string
  at?: string
}

/** Translate skip/wait reasons — never dump raw infra errors. */
export function translateActivityReason(code: string | null | undefined): string {
  switch (code) {
    case 'SAFETY_PROTECTION':
    case 'SAFETY_PAUSED':
      return 'Safety protection'
    case 'INSUFFICIENT_ELIGIBLE_DEMAND':
    case 'NO_ELIGIBLE_FLOW':
      return 'Insufficient eligible demand'
    case 'CONDITIONS_NOT_FAVORABLE':
    case 'WAIT':
    case 'SKIP':
      return 'Conditions not favorable'
    case null:
    case undefined:
    case '':
      return 'Conditions not favorable'
    default:
      return 'Conditions not favorable'
  }
}

export type ProgramMetrics = {
  liquidityBuiltLabel: string | null
  budgetRemainingLabel: string | null
  executionCount: number | null
  lpPositionLabel: string | null
}

export const EMPTY_PROGRAM_METRICS: ProgramMetrics = {
  liquidityBuiltLabel: null,
  budgetRemainingLabel: null,
  executionCount: null,
  lpPositionLabel: null,
}

export type ManageAction =
  | 'ADD_BUDGET'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'CHANGE_STRATEGY'
  | 'CHANGE_FREQUENCY'
  | 'MANAGE_LP'

export function availableManageActions(status: string): ManageAction[] {
  switch (status) {
    case 'ACTIVE':
      return ['ADD_BUDGET', 'PAUSE', 'STOP', 'CHANGE_STRATEGY', 'CHANGE_FREQUENCY', 'MANAGE_LP']
    case 'PAUSED':
      return ['ADD_BUDGET', 'RESUME', 'STOP', 'CHANGE_STRATEGY', 'CHANGE_FREQUENCY', 'MANAGE_LP']
    case 'BUDGET_DEPLETED':
      return ['ADD_BUDGET', 'STOP', 'MANAGE_LP']
    case 'STOPPED':
      return ['MANAGE_LP']
    default:
      return []
  }
}

export const MANAGE_ACTION_LABEL: Record<ManageAction, string> = {
  ADD_BUDGET: 'Add Budget',
  PAUSE: 'Pause',
  RESUME: 'Resume',
  STOP: 'Stop',
  CHANGE_STRATEGY: 'Change Strategy',
  CHANGE_FREQUENCY: 'Change Decision Frequency',
  MANAGE_LP: 'Manage LP',
}
