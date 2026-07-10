export {
  EXECUTION_ADAPTER_SCHEMA,
  type ExecutionAdapterType,
  type RouterType,
  type ExecutionPlan,
  type IExecutionAdapter,
  type ResolvedExecutionAdapter,
  type ExactInputExecutionRequest,
  type ExecutionQuoteRequest,
  type ExecutionQuoteResult,
} from './types'

export {
  V2ExecutionAdapter,
  SmartRouterExecutionAdapter,
  createV2ExecutionAdapter,
  createSmartRouterExecutionAdapter,
  buildExecutionPlan,
  resolveRequiredAdapterType,
  getV2RouterAddress,
  getSmartRouterAddress,
} from './adapters'

export {
  AdapterResolutionError,
  resolveExecutionAdapter,
  resolveExecutionAdapterForSwap,
} from './AdapterResolver'

export {
  EXECUTION_ADAPTER_MATRIX,
  EXECUTION_ADAPTER_COMPATIBILITY,
  getAdapterMatrixForChain,
  type AdapterMatrixRow,
  type CompatibilityMatrixRow,
} from './adapter-matrix'
