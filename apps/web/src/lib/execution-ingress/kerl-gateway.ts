import { dryRunExecutionInstruction } from '../execution-gateway/dry-run'
import type { DryRunGatewayContext, DryRunGatewayResult } from '../execution-gateway/types'
import type { ExecutionInstruction } from '../execution-layer/types'
import {
  buildGateFailureMessage,
  evaluateLiveExecutionGates,
  MODE_ERROR_CODES,
  resolveKerlIngressRoute,
} from '../execution-modes'

/**
 * KERL internal ingress entry — routes by configured execution mode.
 *
 * DRY_RUN → dry-run gateway (suppression manifest).
 * TESTNET_EXECUTION_ONLY / MAINNET_EXECUTION → blocked until all live gates pass (never in this mission).
 * OFF → rejected.
 */
export function acceptKerlExecutionInstruction(
  instruction: ExecutionInstruction,
  context: DryRunGatewayContext = {},
): DryRunGatewayResult {
  const route = resolveKerlIngressRoute()

  if (route === 'off') {
    return {
      ok: false,
      error: {
        code: MODE_ERROR_CODES.MODE_OFF,
        category: 'adapter_error',
        message: 'Execution mode is OFF — KERL ingress rejected',
      },
    }
  }

  if (route === 'live_blocked') {
    const evaluation = evaluateLiveExecutionGates({
      chainId: context.chainId ?? instruction.chainId,
      account: context.account,
      instructionValid: true,
      certifiedHandoff: context.certifiedHandoff ?? false,
      handoffCompatible: context.certifiedHandoff ?? false,
      instructionType: 'SmartSwap',
    })
    return {
      ok: false,
      error: {
        code: evaluation.errorCode ?? MODE_ERROR_CODES.LIVE_GATES_NOT_SATISFIED,
        category: 'adapter_error',
        message: buildGateFailureMessage(evaluation),
      },
    }
  }

  return dryRunExecutionInstruction(instruction, { ...context, certifiedHandoff: context.certifiedHandoff ?? true })
}
