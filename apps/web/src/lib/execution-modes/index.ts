export {
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODES,
  EXECUTION_MODE_DRY_RUN_ONLY_LEGACY,
  TESTNET_CHAIN_IDS,
  MAINNET_CHAIN_IDS,
  MODE_ERROR_CODES,
  type ExecutionMode,
} from './constants'

export {
  getExecutionModeConfig,
  getConfiguredExecutionMode,
  setExecutionModeForHarness,
  setEnvironmentAuthorizedForHarness,
  setTestnetExecutionArmedForHarness,
  setCivilizationAuthorizationForHarness,
  setActivationLifecycleForHarness,
  resetExecutionModeConfig,
  isTestnetChainId,
  isMainnetChainId,
  isLiveExecutionMode,
  isDryRunMode,
  isModeOff,
  type ExecutionModeConfig,
} from './config'

export {
  ACTIVATION_LIFECYCLE_STATES,
  ACTIVATION_LIFECYCLE_OFF,
  ACTIVATION_LIFECYCLE_DRY_RUN,
  ACTIVATION_LIFECYCLE_TESTNET_ARMED,
  ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED,
  ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ACTIVE,
  ACTIVATION_LIFECYCLE_TESTNET_RECEIPT_CAPTURE,
  ACTIVATION_LIFECYCLE_EXECUTION_EVIDENCE,
  ACTIVATION_LIFECYCLE_SETTLEMENT_EVENT_READY,
  lifecyclePermitsWalletSubmission,
  lifecycleIsPreExecution,
  canTransitionLifecycle,
  type ActivationLifecycleState,
} from './activation-lifecycle'

export {
  getCivilizationObservations,
  allObservationsSatisfied,
  observationsBlockingReasons,
  setCivilizationObservationsForHarness,
  resetCivilizationObservations,
  type CivilizationObservationStatus,
} from './civilization-observations'

export {
  evaluateDryRunGates,
  evaluateLiveExecutionGates,
  canPerformDryRun,
  canPerformLiveExecution,
  assertModeAllowsKerlIngress,
  resolveKerlIngressRoute,
  buildGateFailureMessage,
  isInstructionContextValid,
  listRequiredLiveGateIds,
  type ActivationGateId,
  type ActivationGateResult,
  type ActivationGateContext,
  type ActivationGateEvaluation,
} from './activation-gates'

export {
  RECEIPT_PIPELINE_STAGES,
  RECEIPT_PIPELINE_MAP,
  isSettlementStage,
  type ReceiptPipelineStage,
  type ReceiptPipelineStageDescriptor,
} from './receipt-pipeline'

export { enableKerlDryRunHarness, armTestnetLifecycleForHarness, resetKerlExecutionHarness } from './harness'

export { rollbackActivationToDryRun, rollbackToOff, type RollbackResult } from './rollback'

export { runTestnetArmingValidation, type ArmingValidationReport } from './testnet-arming-validator'
