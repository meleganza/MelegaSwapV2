import type { ExecutionInstruction } from '../execution-layer/types'
import { isExecutionGatewayEnabled } from '../execution-gateway/activation'
import { isInternalIngressEnabled } from '../execution-ingress/activation'
import {
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  MODE_ERROR_CODES,
  type ExecutionMode,
} from './constants'
import {
  getConfiguredExecutionMode,
  getExecutionModeConfig,
  isTestnetChainId,
} from './config'

export type ActivationGateId =
  | 'execution_mode_configured'
  | 'environment_authorized'
  | 'supported_chain'
  | 'testnet_only'
  | 'valid_instruction'
  | 'certified_handoff'
  | 'wallet_available'
  | 'gateway_enabled'
  | 'ingress_enabled'
  | 'dry_run_disabled'
  | 'testnet_armed'
  | 'mainnet_forbidden'
  | 'kerl_live_execution_authorized'

export interface ActivationGateResult {
  id: ActivationGateId
  satisfied: boolean
  reason: string
}

export interface ActivationGateContext {
  mode?: ExecutionMode
  chainId?: number
  account?: string
  instructionValid?: boolean
  certifiedHandoff?: boolean
  /** When evaluating dry-run path, set false to require dry-run mode. */
  requireDryRun?: boolean
}

export interface ActivationGateEvaluation {
  allowed: boolean
  gates: ActivationGateResult[]
  blockingGate?: ActivationGateId
  errorCode?: (typeof MODE_ERROR_CODES)[keyof typeof MODE_ERROR_CODES]
}

function gate(
  id: ActivationGateId,
  satisfied: boolean,
  reason: string,
): ActivationGateResult {
  return { id, satisfied, reason }
}

/**
 * Evaluates whether dry-run execution may proceed.
 * Requires DRY_RUN mode + gateway enabled + valid instruction.
 */
export function evaluateDryRunGates(context: ActivationGateContext = {}): ActivationGateEvaluation {
  const mode = context.mode ?? getConfiguredExecutionMode()
  const gates: ActivationGateResult[] = [
    gate(
      'execution_mode_configured',
      mode === EXECUTION_MODE_DRY_RUN,
      `Execution mode must be DRY_RUN (current: ${mode})`,
    ),
    gate('gateway_enabled', isExecutionGatewayEnabled(), 'Execution gateway must be enabled'),
    gate(
      'valid_instruction',
      context.instructionValid !== false,
      'Instruction must pass contract validation',
    ),
    gate(
      'certified_handoff',
      context.certifiedHandoff !== false,
      'Certified handoff required when invoked from KERL pipeline',
    ),
  ]

  const blocking = gates.find((g) => !g.satisfied)
  return {
    allowed: !blocking,
    gates,
    blockingGate: blocking?.id,
    errorCode: blocking ? MODE_ERROR_CODES.MODE_NOT_DRY_RUN : undefined,
  }
}

/**
 * Evaluates whether live (testnet or mainnet) execution may proceed.
 * All gates must pass — defaults fail closed; TESTNET remains impossible after this mission.
 */
export function evaluateLiveExecutionGates(context: ActivationGateContext = {}): ActivationGateEvaluation {
  const config = getExecutionModeConfig()
  const mode = context.mode ?? getConfiguredExecutionMode()
  const chainId = context.chainId

  const gates: ActivationGateResult[] = [
    gate(
      'execution_mode_configured',
      mode === EXECUTION_MODE_TESTNET_EXECUTION_ONLY || mode === EXECUTION_MODE_MAINNET_EXECUTION,
      `Live execution requires TESTNET_EXECUTION_ONLY or MAINNET_EXECUTION (current: ${mode})`,
    ),
    gate(
      'environment_authorized',
      config.environmentAuthorized,
      'Environment is not authorized for live KERL execution',
    ),
    gate(
      'dry_run_disabled',
      mode !== EXECUTION_MODE_DRY_RUN && mode !== EXECUTION_MODE_OFF,
      'Dry-run mode must be disabled for live execution',
    ),
    gate(
      'kerl_live_execution_authorized',
      config.kerlLiveExecutionAuthorized,
      'KERL live execution is not authorized — preparation phase only',
    ),
    gate('ingress_enabled', isInternalIngressEnabled(), 'Internal ingress must be enabled'),
    gate(
      'wallet_available',
      Boolean(context.account),
      'Wallet account must be available for submission',
    ),
    gate(
      'valid_instruction',
      context.instructionValid !== false,
      'Instruction must pass contract validation',
    ),
    gate(
      'certified_handoff',
      context.certifiedHandoff === true,
      'Certified handoff is required before live execution',
    ),
    gate(
      'mainnet_forbidden',
      mode !== EXECUTION_MODE_MAINNET_EXECUTION,
      'Mainnet execution is forbidden',
    ),
    gate(
      'testnet_armed',
      mode !== EXECUTION_MODE_TESTNET_EXECUTION_ONLY || config.testnetExecutionArmed,
      'Testnet execution arm is not engaged',
    ),
    gate(
      'testnet_only',
      mode !== EXECUTION_MODE_TESTNET_EXECUTION_ONLY || isTestnetChainId(chainId),
      'TESTNET_EXECUTION_ONLY requires a testnet chainId',
    ),
    gate(
      'supported_chain',
      chainId !== undefined && (isTestnetChainId(chainId) || mode === EXECUTION_MODE_MAINNET_EXECUTION),
      'Chain must be in supported execution policy',
    ),
    gate('gateway_enabled', isExecutionGatewayEnabled(), 'Execution gateway must be enabled'),
  ]

  const blocking = gates.find((g) => !g.satisfied)
  let errorCode: ActivationGateEvaluation['errorCode']

  if (blocking) {
    if (mode === EXECUTION_MODE_MAINNET_EXECUTION) {
      errorCode = MODE_ERROR_CODES.MAINNET_FORBIDDEN
    } else if (mode === EXECUTION_MODE_TESTNET_EXECUTION_ONLY) {
      errorCode = MODE_ERROR_CODES.TESTNET_NOT_ACTIVATED
    } else {
      errorCode = MODE_ERROR_CODES.LIVE_GATES_NOT_SATISFIED
    }
  }

  return {
    allowed: !blocking,
    gates,
    blockingGate: blocking?.id,
    errorCode,
  }
}

export function canPerformDryRun(context: ActivationGateContext = {}): boolean {
  if (getConfiguredExecutionMode() === EXECUTION_MODE_OFF) {
    return false
  }
  return evaluateDryRunGates(context).allowed
}

export function canPerformLiveExecution(context: ActivationGateContext = {}): boolean {
  return evaluateLiveExecutionGates(context).allowed
}

export function assertModeAllowsKerlIngress(mode: ExecutionMode = getConfiguredExecutionMode()): void {
  if (mode === EXECUTION_MODE_OFF) {
    throw new Error(MODE_ERROR_CODES.MODE_OFF)
  }
  if (mode === EXECUTION_MODE_MAINNET_EXECUTION) {
    throw new Error(MODE_ERROR_CODES.MAINNET_FORBIDDEN)
  }
}

export function resolveKerlIngressRoute(
  mode: ExecutionMode = getConfiguredExecutionMode(),
): 'dry_run' | 'live_blocked' | 'off' {
  if (mode === EXECUTION_MODE_OFF) return 'off'
  if (mode === EXECUTION_MODE_DRY_RUN) return 'dry_run'
  if (mode === EXECUTION_MODE_TESTNET_EXECUTION_ONLY || mode === EXECUTION_MODE_MAINNET_EXECUTION) {
    return 'live_blocked'
  }
  return 'off'
}

export function buildGateFailureMessage(evaluation: ActivationGateEvaluation): string {
  const blocking = evaluation.gates.find((g) => !g.satisfied)
  return blocking?.reason ?? 'Execution activation gates not satisfied'
}

export function isInstructionContextValid(
  instruction: ExecutionInstruction,
  validationOk: boolean,
): ActivationGateContext {
  return {
    chainId: instruction.chainId,
    instructionValid: validationOk,
  }
}
