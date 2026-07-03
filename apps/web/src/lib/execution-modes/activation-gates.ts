import type { ExecutionInstruction } from '../execution-layer/types'
import { isExecutionGatewayEnabled } from '../execution-gateway/activation'
import { isInternalIngressEnabled } from '../execution-ingress/activation'
import type { SupportedInstructionType } from '../execution-ingress/constants'
import { SUPPORTED_INSTRUCTION_TYPES } from '../execution-ingress/constants'
import { lifecyclePermitsWalletSubmission } from './activation-lifecycle'
import {
  allObservationsSatisfied,
  getCivilizationObservations,
} from './civilization-observations'
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
  | 'supported_environment'
  | 'supported_chain'
  | 'testnet_only'
  | 'valid_instruction'
  | 'certified_handoff'
  | 'handoff_compatible'
  | 'wallet_available'
  | 'gateway_enabled'
  | 'ingress_enabled'
  | 'dry_run_disabled'
  | 'testnet_armed'
  | 'mainnet_forbidden'
  | 'civilization_authorization'
  | 'kerl_live_execution_authorized'
  | 'lifecycle_permits_execution'
  | 'supported_execution_type'
  | 'registry_published'
  | 'registry_compatibility_verified'
  | 'treasury_observation_available'
  | 'mission_director_observation_available'
  | 'kcis_observation_available'
  | 'economic_memory_observation_available'

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
  handoffCompatible?: boolean
  instructionType?: SupportedInstructionType
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

function evaluateObservationGates(): ActivationGateResult[] {
  const o = getCivilizationObservations()
  return [
    gate('registry_published', o.registryPublished, 'KERL registry must be published'),
    gate(
      'registry_compatibility_verified',
      o.registryCompatibilityVerified,
      'Registry cross-repository compatibility must be certified',
    ),
    gate(
      'treasury_observation_available',
      o.treasuryObservesKerlRegistry,
      'Treasury Runtime must observe KERL registry',
    ),
    gate(
      'mission_director_observation_available',
      o.missionDirectorObserved,
      'Mission Director must be observed',
    ),
    gate('kcis_observation_available', o.kcisObserved, 'KCIS must be observed'),
    gate(
      'economic_memory_observation_available',
      o.economicMemoryObserved,
      'Economic Memory must be observed',
    ),
  ]
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
    gate(
      'handoff_compatible',
      context.handoffCompatible !== false,
      'Handoff must be compatibility-certified',
    ),
    gate(
      'registry_published',
      getCivilizationObservations().registryPublished,
      'Registry must be published for KERL ingress',
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
 * All gates must pass — defaults fail closed; execution remains impossible after T1 arming.
 */
export function evaluateLiveExecutionGates(context: ActivationGateContext = {}): ActivationGateEvaluation {
  const config = getExecutionModeConfig()
  const mode = context.mode ?? getConfiguredExecutionMode()
  const chainId = context.chainId
  const instructionType = context.instructionType

  const gates: ActivationGateResult[] = [
    gate(
      'execution_mode_configured',
      mode === EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
      `Live testnet execution requires TESTNET_EXECUTION_ONLY (current: ${mode})`,
    ),
    gate(
      'environment_authorized',
      config.environmentAuthorized,
      'Environment is not authorized for live KERL execution',
    ),
    gate(
      'supported_environment',
      config.environmentAuthorized && mode === EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
      'Supported environment requires TESTNET_EXECUTION_ONLY with environment authorization',
    ),
    gate(
      'dry_run_disabled',
      mode !== EXECUTION_MODE_DRY_RUN && mode !== EXECUTION_MODE_OFF,
      'Dry-run mode must be disabled for live execution',
    ),
    gate(
      'civilization_authorization',
      config.kerlLiveExecutionAuthorized,
      'Civilization authorization is required — explicit authorization only, never env alone',
    ),
    gate(
      'kerl_live_execution_authorized',
      config.kerlLiveExecutionAuthorized,
      'KERL live execution is not authorized — T1 arming phase',
    ),
    gate(
      'lifecycle_permits_execution',
      lifecyclePermitsWalletSubmission(config.activationLifecycleState),
      `Activation lifecycle must be TESTNET_EXECUTION_ENABLED or ACTIVE (current: ${config.activationLifecycleState})`,
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
      'handoff_compatible',
      context.handoffCompatible === true,
      'Certified handoff must be compatibility-verified',
    ),
    gate(
      'mainnet_forbidden',
      mode !== EXECUTION_MODE_MAINNET_EXECUTION,
      'Mainnet execution is constitutionally forbidden',
    ),
    gate(
      'testnet_armed',
      config.testnetExecutionArmed,
      'Testnet execution arm is not engaged',
    ),
    gate(
      'testnet_only',
      isTestnetChainId(chainId),
      'TESTNET_EXECUTION_ONLY requires a testnet chainId',
    ),
    gate(
      'supported_chain',
      chainId !== undefined && isTestnetChainId(chainId),
      'Chain must be in supported testnet execution policy',
    ),
    gate(
      'supported_execution_type',
      instructionType !== undefined &&
        (SUPPORTED_INSTRUCTION_TYPES as readonly string[]).includes(instructionType),
      'Execution type must be SmartSwap, V2Swap, or BridgeBurn',
    ),
    gate('gateway_enabled', isExecutionGatewayEnabled(), 'Execution gateway must be enabled'),
    ...evaluateObservationGates(),
  ]

  if (mode === EXECUTION_MODE_MAINNET_EXECUTION) {
    gates.push(
      gate('mainnet_forbidden', false, 'MAINNET_EXECUTION is constitutionally disabled'),
    )
  }

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

  if (!allObservationsSatisfied() && blocking?.id.startsWith('registry') === false) {
    // Observation failures surface through their dedicated gates
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

export function listRequiredLiveGateIds(): readonly ActivationGateId[] {
  return [
    'execution_mode_configured',
    'environment_authorized',
    'supported_environment',
    'dry_run_disabled',
    'civilization_authorization',
    'kerl_live_execution_authorized',
    'lifecycle_permits_execution',
    'ingress_enabled',
    'wallet_available',
    'valid_instruction',
    'certified_handoff',
    'handoff_compatible',
    'mainnet_forbidden',
    'testnet_armed',
    'testnet_only',
    'supported_chain',
    'supported_execution_type',
    'gateway_enabled',
    'registry_published',
    'registry_compatibility_verified',
    'treasury_observation_available',
    'mission_director_observation_available',
    'kcis_observation_available',
    'economic_memory_observation_available',
  ]
}
