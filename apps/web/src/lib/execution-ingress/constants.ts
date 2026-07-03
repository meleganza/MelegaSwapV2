import type { ExecutionAdapter } from '../execution-contract/types'

/** Instruction types produced internally by the routing layer. */
export type SupportedInstructionType = 'SmartSwap' | 'V2Swap' | 'BridgeBurn'

export const SUPPORTED_INSTRUCTION_TYPES: readonly SupportedInstructionType[] = [
  'SmartSwap',
  'V2Swap',
  'BridgeBurn',
] as const

export const SUPPORTED_INGRESS_ADAPTERS: readonly ExecutionAdapter[] = [
  'smart-router',
  'v2-router',
  'kronoswap-bridge',
] as const

export const INGRESS_ERROR_CODES = {
  INACTIVE: 'INGRESS_INACTIVE',
  VALIDATION_FAILED: 'INGRESS_VALIDATION_FAILED',
  UNSUPPORTED_TYPE: 'INGRESS_UNSUPPORTED_TYPE',
  ADAPTER_MISSING: 'INGRESS_ADAPTER_MISSING',
  DISPATCH_FAILED: 'INGRESS_DISPATCH_FAILED',
  GATES_NOT_SATISFIED: 'INGRESS_GATES_NOT_SATISFIED',
} as const
