import {
  buildDryRunExecutionEvidence,
  buildExecutionReport,
  createExecutionId,
} from '../execution-contract'
import type { ExecutionError } from '../execution-contract/types'
import type { ExecutionInstruction } from '../execution-layer/types'
import { validateExecutionInstruction } from '../execution-ingress/validate'
import { getExecutionTracker } from '../execution-tracker/tracker'
import {
  buildGateFailureMessage,
  canPerformDryRun,
  evaluateDryRunGates,
} from '../execution-modes'
import { isExecutionGatewayEnabled } from './activation'
import {
  DRY_RUN_SUPPRESSION_REASON,
  EXECUTION_AUTHORITY_DEX,
  EXECUTION_MODE_DRY_RUN_ONLY,
  GATEWAY_ERROR_CODES,
} from './constants'
import type { DryRunGatewayContext, DryRunGatewayResult } from './types'

function inactiveError(): ExecutionError {
  return {
    code: GATEWAY_ERROR_CODES.INACTIVE,
    category: 'adapter_error',
    message: 'Execution gateway is inactive',
  }
}

/**
 * Internal KERL execution gateway — dry-run only.
 *
 * Accepts ExecutionInstruction, validates contract integrity, records tracker
 * lifecycle, and returns suppression manifest. Stops before adapter dispatch,
 * wallet interaction, transaction submission, and receipt polling.
 */
export function dryRunExecutionInstruction(
  instruction: ExecutionInstruction,
  context: DryRunGatewayContext = {},
): DryRunGatewayResult {
  if (!isExecutionGatewayEnabled()) {
    return { ok: false, error: inactiveError() }
  }

  const dryRunGateContext = {
    instructionValid: true,
    certifiedHandoff: context.certifiedHandoff,
  }
  if (!canPerformDryRun(dryRunGateContext)) {
    const evaluation = evaluateDryRunGates(dryRunGateContext)
    return {
      ok: false,
      error: {
        code: evaluation.errorCode ?? GATEWAY_ERROR_CODES.INACTIVE,
        category: 'adapter_error',
        message: buildGateFailureMessage(evaluation),
      },
    }
  }

  const validation = validateExecutionInstruction(instruction)
  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  const executionId = createExecutionId(instruction.id)
  const tracker = getExecutionTracker(context.account, context.chainId)

  try {
    tracker.registerInstruction(instruction, executionId)
    const report = tracker.completeDryRun(executionId, instruction, context.chainId ?? instruction.chainId)

    const evidence = buildDryRunExecutionEvidence(
      instruction,
      executionId,
      context.chainId ?? instruction.chainId,
      instruction.createdAt,
    )

    // Report from tracker is authoritative; rebuild check for consistency
    const deterministicReport = buildExecutionReport(evidence)
    if (deterministicReport.instructionId !== report.instructionId) {
      throw new Error('Dry-run report instructionId mismatch')
    }

    return {
      ok: true,
      executionId,
      instructionType: validation.instructionType,
      evidence,
      report: deterministicReport,
      dryRun: {
        executionMode: EXECUTION_MODE_DRY_RUN_ONLY,
        executionStatus: 'dry_run_completed',
        executionAuthority: EXECUTION_AUTHORITY_DEX,
        executionPerformed: false,
        walletInteraction: 'none',
        transactionHash: null,
        receipt: null,
        settlement: null,
        executionSuppressed: true,
        suppressionReason: DRY_RUN_SUPPRESSION_REASON,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      ok: false,
      executionId,
      error: {
        code: GATEWAY_ERROR_CODES.DRY_RUN_FAILED,
        category: 'adapter_error',
        message,
      },
    }
  }
}
