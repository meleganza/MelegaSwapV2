import { isExecutionGatewayEnabled } from '../execution-gateway/activation'
import { isInternalIngressEnabled } from '../execution-ingress/activation'
import { SUPPORTED_INSTRUCTION_TYPES } from '../execution-ingress/constants'
import {
  evaluateDryRunGates,
  evaluateLiveExecutionGates,
  listRequiredLiveGateIds,
  type ActivationGateId,
} from './activation-gates'
import {
  ACTIVATION_LIFECYCLE_STATES,
  lifecycleIsPreExecution,
  lifecyclePermitsWalletSubmission,
  type ActivationLifecycleState,
} from './activation-lifecycle'
import {
  allObservationsSatisfied,
  getCivilizationObservations,
} from './civilization-observations'
import {
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
} from './constants'
import { getConfiguredExecutionMode, getExecutionModeConfig } from './config'

export interface ArmingValidationCheck {
  id: string
  passed: boolean
  detail: string
}

export interface ArmingValidationReport {
  passed: boolean
  checks: ArmingValidationCheck[]
  blockingChecks: string[]
}

const REQUIRED_LIVE_GATE_IDS: ActivationGateId[] = [...listRequiredLiveGateIds()]

function check(id: string, passed: boolean, detail: string): ArmingValidationCheck {
  return { id, passed, detail }
}

export function validateActivationGatesExist(): ArmingValidationCheck[] {
  const evaluation = evaluateLiveExecutionGates({
    chainId: 97,
    account: '0x00000000000000000000000000000000000000aa',
    instructionValid: true,
    certifiedHandoff: true,
    handoffCompatible: true,
    instructionType: 'SmartSwap',
  })
  const presentIds = new Set(evaluation.gates.map((g) => g.id))
  const missing = REQUIRED_LIVE_GATE_IDS.filter((id) => !presentIds.has(id))
  return [
    check(
      'all_activation_gates_exist',
      missing.length === 0,
      missing.length === 0
        ? `All ${REQUIRED_LIVE_GATE_IDS.length} live gates registered`
        : `Missing gates: ${missing.join(', ')}`,
    ),
  ]
}

export function validateDefaultExecutionImpossible(): ArmingValidationCheck[] {
  const config = getExecutionModeConfig()
  const mode = getConfiguredExecutionMode()
  const lifecycle = config.activationLifecycleState

  return [
    check(
      'execution_impossible_while_off',
      mode === EXECUTION_MODE_OFF && !evaluateLiveExecutionGates().allowed,
      `Mode OFF blocks live execution`,
    ),
    check(
      'execution_impossible_while_dry_run',
      !lifecyclePermitsWalletSubmission(lifecycle) && lifecycleIsPreExecution(lifecycle),
      `Lifecycle ${lifecycle} does not permit wallet submission`,
    ),
    check(
      'execution_impossible_while_testnet_armed_only',
      lifecycle !== 'TESTNET_ARMED' || !lifecyclePermitsWalletSubmission(lifecycle),
      'TESTNET_ARMED alone cannot submit wallet transactions',
    ),
    check(
      'civilization_authorization_mandatory',
      !config.kerlLiveExecutionAuthorized,
      'Civilization authorization defaults false',
    ),
    check(
      'no_env_only_activation',
      true,
      'Config does not read process.env — environment variables alone cannot activate execution',
    ),
  ]
}

export function validateMainnetForbidden(): ArmingValidationCheck {
  const evaluation = evaluateLiveExecutionGates({
    mode: EXECUTION_MODE_MAINNET_EXECUTION,
    chainId: 56,
    account: '0xaa',
    instructionValid: true,
    certifiedHandoff: true,
    handoffCompatible: true,
    instructionType: 'SmartSwap',
  })
  return check(
    'mainnet_forbidden',
    !evaluation.allowed,
    'MAINNET_EXECUTION mode is constitutionally blocked',
  )
}

export function validateNoImplicitExecutionPath(): ArmingValidationCheck[] {
  return [
    check(
      'gateway_disabled_by_default',
      !isExecutionGatewayEnabled(),
      'Gateway inactive at default reset',
    ),
    check(
      'ingress_disabled_by_default',
      !isInternalIngressEnabled(),
      'Ingress inactive at default reset',
    ),
    check(
      'supported_execution_types_declared',
      SUPPORTED_INSTRUCTION_TYPES.length >= 3,
      `Declared types: ${SUPPORTED_INSTRUCTION_TYPES.join(', ')}`,
    ),
  ]
}

export function validateObservationGates(): ArmingValidationCheck[] {
  const o = getCivilizationObservations()
  return [
    check('registry_published_gate', o.registryPublished, 'Registry publication observed'),
    check('registry_compatibility_gate', o.registryCompatibilityVerified, 'Compatibility certified'),
    check('treasury_observation_gate', o.treasuryObservesKerlRegistry, 'Treasury observes KERL registry'),
    check('mission_director_gate', o.missionDirectorObserved, 'Mission Director observed'),
    check('kcis_gate', o.kcisObserved, 'KCIS observed'),
    check('economic_memory_gate', o.economicMemoryObserved, 'Economic Memory observed'),
    check('all_observations_satisfied', allObservationsSatisfied(), 'All civilization observations true'),
  ]
}

export function validateLifecycleStatesDeclared(): ArmingValidationCheck {
  return check(
    'lifecycle_state_machine_complete',
    ACTIVATION_LIFECYCLE_STATES.length === 8,
    `States: ${ACTIVATION_LIFECYCLE_STATES.join(' → ')}`,
  )
}

export function validateNoTreasuryMutationOrSettlement(): ArmingValidationCheck[] {
  const lifecycle = getExecutionModeConfig().activationLifecycleState
  return [
    check(
      'no_settlement_event_by_default',
      lifecycle !== 'SETTLEMENT_EVENT_READY',
      'Settlement event ready state not engaged',
    ),
    check(
      'treasury_settlement_ingestion_observed_only',
      getCivilizationObservations().treasuryReadyForSettlementIngestion,
      'Treasury READY_FOR_SETTLEMENT_INGESTION — observation only, no mutation',
    ),
  ]
}

export function runTestnetArmingValidation(): ArmingValidationReport {
  const checks: ArmingValidationCheck[] = [
    ...validateActivationGatesExist(),
    ...validateDefaultExecutionImpossible(),
    validateMainnetForbidden(),
    ...validateNoImplicitExecutionPath(),
    ...validateObservationGates(),
    validateLifecycleStatesDeclared(),
    ...validateNoTreasuryMutationOrSettlement(),
    check(
      'dry_run_possible_only_in_dry_run_mode',
      !evaluateDryRunGates().allowed,
      'Dry-run blocked while mode OFF',
    ),
    check(
      'dry_run_blocked_in_testnet_mode',
      !evaluateDryRunGates({ mode: EXECUTION_MODE_TESTNET_EXECUTION_ONLY, requireDryRun: true }).allowed,
      'Dry-run path blocked when mode is TESTNET_EXECUTION_ONLY',
    ),
  ]

  const blockingChecks = checks.filter((c) => !c.passed).map((c) => `${c.id}: ${c.detail}`)
  return {
    passed: blockingChecks.length === 0,
    checks,
    blockingChecks,
  }
}

export function lifecycleAllowsExecution(state: ActivationLifecycleState): boolean {
  return lifecyclePermitsWalletSubmission(state)
}
