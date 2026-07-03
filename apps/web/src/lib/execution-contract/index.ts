export {
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  EXECUTION_CONTRACT_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
  INSTRUCTION_SOURCE_KERL_PREVIEW,
  INSTRUCTION_SOURCE_MANUAL,
  SETTLEMENT_FORBIDDEN_FIELDS,
} from './constants'

export type {
  ExecutionDomain,
  ExecutionAdapter,
  ExecutionStatus,
  InstructionSource,
  InstructionSchemaVersion,
  ExecutionContractVersion,
  InstructionIdentity,
  ExecutionError,
  ExecutionErrorCategory,
  ReceiptReference,
  ExecutionInstructionBase,
  ExecutionEvidence,
  ExecutionReport,
} from './types'

export {
  createInstructionIdentity,
  buildCorrelationId,
  createExecutionId,
} from './identity'
export type { CreateInstructionIdentityInput } from './identity'

export { classifyExecutionError } from './errors'

export {
  mapTransactionToExecutionEvidence,
  buildDryRunExecutionEvidence,
  assertEvidenceIntegrity,
} from './evidence'
export type { InstructionForEvidence } from './evidence'

export { buildExecutionReport, assertReportDoesNotImplySettlement } from './report'

export {
  EXECUTION_STATUS_TRANSITIONS,
  isValidStatusTransition,
  TERMINAL_EXECUTION_STATUSES,
} from './lifecycle'

export {
  EXECUTION_CONTRACT_OWNERSHIP,
  EXECUTION_FORBIDDEN_ROUTING_IMPORTS,
  EXECUTION_FORBIDDEN_TREASURY_IMPORTS,
} from './ownership'
