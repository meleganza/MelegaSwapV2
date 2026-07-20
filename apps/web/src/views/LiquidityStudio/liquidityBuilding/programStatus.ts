/**
 * Liquidity Building V1 program status — LB002 frozen contract (LB014 UI).
 * TransactionPhase is intentionally separate and never stored as ProgramStatus.
 */

export const PROGRAM_STATUSES = [
  'NOT_ACTIVE',
  'SETUP_REQUIRED',
  'AWAITING_APPROVAL',
  'AWAITING_DEPOSIT',
  'READY',
  'ACTIVE',
  'PAUSED',
  'SAFETY_PAUSED',
  'BUDGET_DEPLETED',
  'STOPPED',
  'ERROR',
] as const

export type ProgramStatus = (typeof PROGRAM_STATUSES)[number]

/** User-facing labels required by LB014 §3 / LB002 §12. */
export const PROGRAM_STATUS_LABEL: Record<ProgramStatus, string> = {
  NOT_ACTIVE: 'Not Active',
  SETUP_REQUIRED: 'Setup Required',
  AWAITING_APPROVAL: 'Awaiting Approval',
  AWAITING_DEPOSIT: 'Awaiting Deposit',
  READY: 'Ready',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  SAFETY_PAUSED: 'Paused for safety',
  BUDGET_DEPLETED: 'Budget Depleted',
  STOPPED: 'Stopped',
  ERROR: 'Error',
}

export type StrategyMode = 'FULL_AI' | 'DYNAMIC_RANGE'

export type EpochSeconds = 300 | 900 | 1800 | 3600

export const EPOCH_OPTIONS: { label: string; seconds: EpochSeconds; default?: boolean }[] = [
  { label: '5 minutes', seconds: 300, default: true },
  { label: '15 minutes', seconds: 900 },
  { label: '30 minutes', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
]

export type SetupDraft = {
  tokenAddress: string | null
  tokenSymbol: string | null
  tokenBudget: string
  strategy: StrategyMode
  minimumRateBps: string
  maximumRateBps: string
  epochSeconds: EpochSeconds
}

export const EMPTY_SETUP_DRAFT: SetupDraft = {
  tokenAddress: null,
  tokenSymbol: null,
  tokenBudget: '',
  strategy: 'FULL_AI',
  minimumRateBps: '',
  maximumRateBps: '',
  epochSeconds: 300,
}

export type ActivationGateSummary = {
  activationAuthorized: boolean
  mainnetCycleAuthorized: boolean
  contractsDeployed: boolean
  deploymentInputsValid: boolean
  runtimeReady: boolean
  blockers: string[]
}

export const BLOCKED_ACTIVATION_GATES: ActivationGateSummary = {
  activationAuthorized: false,
  mainnetCycleAuthorized: false,
  contractsDeployed: false,
  deploymentInputsValid: false,
  runtimeReady: false,
  blockers: ['DEPLOYMENT_INPUTS_BLOCKED'],
}

/**
 * Pure transition helper for owner setup path.
 * Mutating on-chain transitions require receipts — never invent ACTIVE metrics.
 */
export function transitionProgramStatus(
  current: ProgramStatus,
  trigger:
    | 'START_SETUP'
    | 'CONTINUE_SETUP'
    | 'REQUEST_APPROVAL'
    | 'APPROVAL_CONFIRMED'
    | 'DEPOSIT_CONFIRMED'
    | 'ACTIVATE'
    | 'PAUSE'
    | 'RESUME'
    | 'BUDGET_DEPLETED'
    | 'STOP'
    | 'ERROR'
    | 'CANCEL_TO_SETUP'
    | 'RESET',
): ProgramStatus {
  switch (trigger) {
    case 'RESET':
      return 'NOT_ACTIVE'
    case 'START_SETUP':
      return current === 'NOT_ACTIVE' || current === 'STOPPED' ? 'SETUP_REQUIRED' : current
    case 'CONTINUE_SETUP':
      return current === 'SETUP_REQUIRED' ? 'SETUP_REQUIRED' : current
    case 'REQUEST_APPROVAL':
      return current === 'SETUP_REQUIRED' ? 'AWAITING_APPROVAL' : current
    case 'APPROVAL_CONFIRMED':
      return current === 'AWAITING_APPROVAL' ? 'AWAITING_DEPOSIT' : current
    case 'DEPOSIT_CONFIRMED':
      return current === 'AWAITING_DEPOSIT' ? 'READY' : current
    case 'ACTIVATE':
      return current === 'READY' ? 'ACTIVE' : current
    case 'PAUSE':
      return current === 'ACTIVE' ? 'PAUSED' : current
    case 'RESUME':
      return current === 'PAUSED' ? 'ACTIVE' : current
    case 'BUDGET_DEPLETED':
      return current === 'ACTIVE' ? 'BUDGET_DEPLETED' : current
    case 'STOP':
      return current === 'NOT_ACTIVE' ? current : 'STOPPED'
    case 'ERROR':
      return 'ERROR'
    case 'CANCEL_TO_SETUP':
      return current === 'AWAITING_APPROVAL' ? 'SETUP_REQUIRED' : current
    default:
      return current
  }
}

/** Mutating CTAs require wallet + chain + production activation authority. */
export function canSubmitMutatingAction(input: {
  walletConnected: boolean
  correctChain: boolean
  gates: ActivationGateSummary
}): { ok: boolean; reason: string | null } {
  if (!input.walletConnected) return { ok: false, reason: 'WALLET_NOT_CONNECTED' }
  if (!input.correctChain) return { ok: false, reason: 'WRONG_CHAIN' }
  if (!input.gates.deploymentInputsValid || !input.gates.contractsDeployed) {
    return { ok: false, reason: 'DEPLOYMENT_INPUTS_BLOCKED' }
  }
  if (!input.gates.activationAuthorized || !input.gates.runtimeReady) {
    return { ok: false, reason: 'ACTIVATION_NOT_AUTHORIZED' }
  }
  return { ok: true, reason: null }
}

export function setupDraftReadyForReview(draft: SetupDraft): boolean {
  if (!draft.tokenAddress || !draft.tokenSymbol) return false
  const budget = Number(draft.tokenBudget)
  if (!Number.isFinite(budget) || budget <= 0) return false
  if (draft.strategy === 'DYNAMIC_RANGE') {
    const min = Number(draft.minimumRateBps)
    const max = Number(draft.maximumRateBps)
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min) return false
  }
  return true
}
