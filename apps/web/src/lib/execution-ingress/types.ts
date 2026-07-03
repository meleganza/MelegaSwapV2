import type { ExecutionError, ExecutionReport } from '../execution-contract/types'
import type {
  BridgeExecutionInstruction,
  ExecutionInstruction,
  SwapExecutionInstruction,
} from '../execution-layer/types'
import type { SupportedInstructionType } from './constants'

export interface IngressAdapterSubmitContext {
  account?: string
  chainId?: number
}

export interface IngressAdapterHandlers {
  smartSwap: (instruction: SwapExecutionInstruction, context: IngressAdapterSubmitContext) => Promise<unknown>
  v2Swap: (instruction: SwapExecutionInstruction, context: IngressAdapterSubmitContext) => Promise<unknown>
  bridgeBurn: (instruction: BridgeExecutionInstruction, context: IngressAdapterSubmitContext) => Promise<unknown>
}

export interface IngressDispatchContext {
  account?: string
  chainId?: number
  certifiedHandoff?: boolean
  adapters: IngressAdapterHandlers
}

export interface IngressValidationResult {
  ok: true
  instructionType: SupportedInstructionType
}

export interface IngressValidationFailure {
  ok: false
  error: ExecutionError
}

export type IngressValidateResult = IngressValidationResult | IngressValidationFailure

export interface IngressDispatchSuccess {
  ok: true
  instructionType: SupportedInstructionType
  executionId: string
  report?: ExecutionReport
  submitResult?: unknown
}

export interface IngressDispatchFailure {
  ok: false
  error: ExecutionError
  executionId?: string
  report?: ExecutionReport
}

export type IngressDispatchResult = IngressDispatchSuccess | IngressDispatchFailure

export type { ExecutionInstruction }
