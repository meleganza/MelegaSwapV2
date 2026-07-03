import { dryRunExecutionInstruction } from '../execution-gateway/dry-run'
import type { DryRunGatewayContext, DryRunGatewayResult } from '../execution-gateway/types'
import type { ExecutionInstruction } from '../execution-layer/types'
import { EXECUTION_MODE_DRY_RUN_ONLY } from '../execution-gateway/constants'

/**
 * KERL internal ingress entry — Phase 1 routes all KERL-originated instructions
 * through the execution gateway in DRY_RUN_ONLY mode.
 *
 * No adapter dispatch. No wallet submission. No settlement.
 */
export function acceptKerlExecutionInstruction(
  instruction: ExecutionInstruction,
  context: DryRunGatewayContext = {},
): DryRunGatewayResult {
  if (EXECUTION_MODE_DRY_RUN_ONLY !== 'DRY_RUN_ONLY') {
    throw new Error('KERL execution mode must remain DRY_RUN_ONLY in Phase 1')
  }

  return dryRunExecutionInstruction(instruction, context)
}
