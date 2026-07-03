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
  resetExecutionModeConfig,
  isTestnetChainId,
  isMainnetChainId,
  isLiveExecutionMode,
  isDryRunMode,
  isModeOff,
  type ExecutionModeConfig,
} from './config'

export {
  evaluateDryRunGates,
  evaluateLiveExecutionGates,
  canPerformDryRun,
  canPerformLiveExecution,
  assertModeAllowsKerlIngress,
  resolveKerlIngressRoute,
  buildGateFailureMessage,
  isInstructionContextValid,
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

export { enableKerlDryRunHarness, resetKerlExecutionHarness } from './harness'
