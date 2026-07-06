import type { ActivationGateEvaluation } from '../execution-modes'
import { isIngressDispatchActive } from './activation'
import type { SupportedInstructionType } from './constants'
import { SUPPORTED_INSTRUCTION_TYPES } from './constants'

export interface DexIngressGateContext {
  account?: string
  instructionValid?: boolean
  instructionType?: SupportedInstructionType
}

/**
 * Minimal gates for DEX canonical production ingress (mode OFF).
 * KERL live testnet gates are not applied — preserves existing swap behavior.
 */
export function evaluateDexCanonicalIngressGates(
  context: DexIngressGateContext = {},
): ActivationGateEvaluation {
  const gates = [
    {
      id: 'ingress_enabled' as const,
      satisfied: isIngressDispatchActive(),
      reason: 'Canonical execution ingress must be active',
    },
    {
      id: 'valid_instruction' as const,
      satisfied: context.instructionValid !== false,
      reason: 'Instruction must pass contract validation',
    },
    {
      id: 'supported_execution_type' as const,
      satisfied:
        context.instructionType !== undefined &&
        (SUPPORTED_INSTRUCTION_TYPES as readonly string[]).includes(context.instructionType),
      reason: 'Execution type must be SmartSwap, V2Swap, or BridgeBurn',
    },
    {
      id: 'wallet_available' as const,
      satisfied: Boolean(context.account),
      reason: 'Wallet account must be available for submission',
    },
  ]

  const blocking = gates.find((g) => !g.satisfied)
  return {
    allowed: !blocking,
    gates,
    blockingGate: blocking?.id,
  }
}
