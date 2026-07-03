export type {
  ExecutionDomain,
  ExecutionAdapter,
  ExecutionStatus,
  ExecutionInstruction,
  ExecutionInstructionBase,
  SwapExecutionInstruction,
  BridgeExecutionInstruction,
  ExecutionEvidence,
  ExecutionReport,
  InstructionIdentity,
  InstructionSource,
  ExecutionError,
  ExecutionErrorCategory,
  ReceiptReference,
  SwapExecutionResult,
} from './types'

export { EXECUTION_LAYER_OWNERSHIP } from './ownership'
export { mapTransactionToExecutionEvidence, createExecutionId, assertEvidenceIntegrity } from './evidence'

export {
  useSmartSwapExecution,
  useV2SwapExecution,
  SmartSwapCallbackState,
  V2SwapCallbackState,
} from './useSwapExecution'
export type { SmartSwapCall } from './useSwapExecution'

export { useBridgeExecution } from './useBridgeExecution'

export {
  buildExecutionReport,
  assertReportDoesNotImplySettlement,
  classifyExecutionError,
  EXECUTION_CONTRACT_VERSION,
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
} from '../execution-contract'
