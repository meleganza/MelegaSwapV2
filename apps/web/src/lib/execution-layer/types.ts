import type { SerializableTransactionReceipt } from 'state/transactions/reducer'

import type {
  ExecutionAdapter,
  ExecutionDomain,
  ExecutionError,
  ExecutionErrorCategory,
  ExecutionEvidence,
  ExecutionInstructionBase,
  ExecutionReport,
  ExecutionStatus,
  InstructionIdentity,
  InstructionSource,
  ReceiptReference,
} from '../execution-contract'

export type {
  ExecutionDomain,
  ExecutionAdapter,
  ExecutionStatus,
  InstructionSource,
  InstructionIdentity,
  ExecutionError,
  ExecutionErrorCategory,
  ReceiptReference,
  ExecutionInstructionBase,
  ExecutionEvidence,
  ExecutionReport,
}

import type { SmartSwapRoutingPlan, V2SwapRoutingPlan, BridgeRoutingPlan } from '../routing-layer/types'

export interface SwapExecutionInstruction extends ExecutionInstructionBase {
  domain: 'swap'
  adapter: 'smart-router' | 'v2-router'
  routingPlan: SmartSwapRoutingPlan | V2SwapRoutingPlan
  allowedSlippageBps: number
  recipient: string | null
}

export interface BridgeExecutionInstruction extends ExecutionInstructionBase {
  domain: 'bridge'
  adapter: 'kronoswap-bridge'
  routingPlan: BridgeRoutingPlan
  pid: number
  isNative: boolean
  amount: string
}

export type ExecutionInstruction = SwapExecutionInstruction | BridgeExecutionInstruction

export interface SwapExecutionResult {
  state: import('views/Swap/SmartSwap/hooks/useSwapCallback').SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
  instructionId: string
}

/** @deprecated use ExecutionEvidence from execution-contract */
export type { SerializableTransactionReceipt }
