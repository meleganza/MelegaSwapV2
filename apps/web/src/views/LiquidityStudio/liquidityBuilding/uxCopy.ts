/**
 * LB016 / Product UX V2 — founder-facing Liquidity Builder copy.
 * Do not expose infrastructure jargon (KMS, Treasury internals, BC003S).
 */

export const LB_UX = {
  productName: 'Liquidity Builder',
  aiBadge: 'AI Powered',
  /** Founder UX — plain language product entry */
  entryTitle: 'Create an automated liquidity growth program for your token.',
  entryLead: 'Create an automated liquidity growth program for your token.',
  entrySupport:
    'I deposit my tokens and the Liquidity Builder automatically creates and improves market liquidity.',
  startCta: 'Create Liquidity Program',
  openDashboardCta: 'Open Dashboard',
  viewActivationCta: 'View Program Status',
  activationRequired: 'Activation Required',
  activationPendingTitle: 'Liquidity Builder Ready',
  activationPendingBadge: 'Almost ready',
  activationPendingBody:
    'Liquidity Builder is prepared. Finish setup and activate when you are ready.',
  activationRequiredBody:
    'Liquidity Builder is prepared but unavailable until production requirements are completed. No fake liquidity, executions, APY, or simulated activity.',
  activationAvailableTitle: 'Liquidity Builder Ready',
  activationAvailableBody: 'Liquidity Builder is available.',
  activationBlockedTitle: 'Liquidity Builder Ready',
  activationBlockedBadge: 'Almost ready',
  activationBlockedBody: 'A few activation requirements are still incomplete.',
  activationWaitingBody: 'Liquidity Builder is prepared and waiting for activation.',
  readinessContracts: 'Contracts',
  readinessRuntime: 'Runtime',
  readinessActivation: 'Activation',
  readinessReady: 'Ready',
  readinessPending: 'Pending',
  tokenToGrowLabel: 'Token to Grow',
  tokenToGrowSupport: 'Search a listed token or paste a contract address.',
  tokenSearchCta: 'Search token',
  tokenPastePlaceholder: 'Paste contract address',
  tokenDetectedLabel: 'Token detected',
  listingStatusLabel: 'Listing status',
  marketStatusLabel: 'Market status',
  listingListed: 'Listed on Melega',
  listingExternal: 'External / unlisted',
  listingUserAdded: 'Added by you',
  listingNone: 'Not selected',
  marketPoolFound: 'Melega pool found',
  marketPoolMissing: 'No Melega pool yet',
  marketPoolLoading: 'Looking for pool…',
  quoteAssetLabel: 'Create Market Against',
  quoteAssetSupport: 'The quote side of your market (WBNB, USDT, or USDC).',
  reserveLabel: 'Token Reserve',
  reserveSupport: 'This reserve is used by AI Liquidity Builder to grow liquidity.',
  budgetLabel: 'Token Reserve',
  budgetSupport: 'This reserve is used by AI Liquidity Builder to grow liquidity. Unused tokens remain yours.',
  liquidityGoalLabel: 'Liquidity Goal',
  strategyFullAiTitle: 'AI Optimized',
  strategyFullAiTag: 'Recommended',
  strategyFullAiBody:
    'Melega automatically decides when and how much liquidity to build from real market demand.',
  strategyRangeTitle: 'Custom range',
  strategyRangeTag: 'Advanced',
  strategyRangeBody: 'Set a minimum and maximum intensity. The system chooses within your range.',
  decisionFrequencyLabel: 'Check frequency',
  decisionFrequencyHelp:
    'How often Melega reviews the market. It only acts when conditions are safe.',
  reviewTitle: 'Review your liquidity program',
  reviewCta: 'Activate Liquidity Program',
  safetyNoGuarantees: 'No price guarantees.',
  safetyNoManipulation: 'No market manipulation.',
  safetyNoOutcomes: 'No guaranteed outcomes.',
  activeHero: 'Building liquidity from real market demand.',
  metricLiquidityBuilt: 'Liquidity Built',
  metricBudgetRemaining: 'Reserve Remaining',
  metricExecutions: 'Growth steps',
  metricLpPosition: 'LP Position',
  metricUnavailable: 'Unavailable',
  metricNoneYet: 'None yet',
  lpOwnedByOwner: 'Owned by you',
  activityTitle: 'Activity',
  manageTitle: 'Manage',
  technicalTitle: 'Advanced / Technical Details',
  emptyNoProgram: 'No liquidity growth yet.',
  noActiveProgramTitle: 'Create your first AI Liquidity Program',
  noActiveProgramBody:
    'Choose Token to Grow, Create Market Against, Token Reserve, goal, and strategy — then activate.',
  noActiveProgramCta: 'Create Liquidity Program',
  docsTokenReserve: '/docs/liquidity-builder/token-reserve',
  docsStrategies: '/docs/liquidity-builder/strategies',
  docsExecution: '/docs/liquidity-builder/execution',
  docsFees: '/docs/liquidity-builder/fees',
  pairNotDetected: 'No Melega pool found for this token and quote yet.',
  pairDetected: 'Melega pool found',
  pairLoading: 'Looking for Melega pool…',
  programUnavailable: 'Liquidity Builder contracts are not ready on BNB Smart Chain yet.',
  quoteNotEnabled:
    'This quote is not enabled on Liquidity Builder yet. Choose WBNB to continue, or wait for quote activation.',
  walletConnect: 'Connect Wallet',
  switchNetwork: 'Switch Network',
  continueSetup: 'Continue',
  back: 'Back',
  review: 'Review',
} as const

export const DECISION_FREQUENCY_OPTIONS = [
  { label: '5 minutes', seconds: 300 as const },
  { label: '15 minutes', seconds: 900 as const },
  { label: '30 minutes', seconds: 1800 as const },
  { label: '1 hour', seconds: 3600 as const },
]

export type { LbUxPhase } from './liquidityBuildingStep'
export type { LbProductStep } from './liquidityBuildingStep'

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
  ADD_BUDGET: 'Add Reserve',
  PAUSE: 'Pause',
  RESUME: 'Resume',
  STOP: 'Stop',
  CHANGE_STRATEGY: 'Change Strategy',
  CHANGE_FREQUENCY: 'Change Decision Frequency',
  MANAGE_LP: 'Manage LP',
}
