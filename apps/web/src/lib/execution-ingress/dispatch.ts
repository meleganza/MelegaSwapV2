import { createExecutionId } from '../execution-contract'
import type { ExecutionError } from '../execution-contract/types'
import type {
  BridgeExecutionInstruction,
  ExecutionInstruction,
  SwapExecutionInstruction,
} from '../execution-layer/types'
import { getExecutionTracker } from '../execution-tracker/tracker'
import { trackExecutionSubmission } from '../execution-tracker/trackExecution'
import {
  buildGateFailureMessage,
  evaluateLiveExecutionGates,
  getConfiguredExecutionMode,
  EXECUTION_MODE_OFF,
} from '../execution-modes'
import { isCanonicalIngressEnabled, isIngressDispatchActive } from './activation'
import { evaluateDexCanonicalIngressGates } from './dexCanonicalGates'
import { INGRESS_ERROR_CODES } from './constants'
import type { IngressDispatchContext, IngressDispatchResult } from './types'
import type { SupportedInstructionType } from './constants'
import { validateExecutionInstruction } from './validate'

function inactiveError(): ExecutionError {
  return {
    code: INGRESS_ERROR_CODES.INACTIVE,
    category: 'adapter_error',
    message: 'Execution ingress is inactive',
  }
}

function adapterMissingError(instructionType: SupportedInstructionType): ExecutionError {
  return {
    code: INGRESS_ERROR_CODES.ADAPTER_MISSING,
    category: 'adapter_error',
    message: `No adapter handler registered for ${instructionType}`,
  }
}

function selectSubmit(
  instructionType: SupportedInstructionType,
  instruction: ExecutionInstruction,
  context: IngressDispatchContext,
): (() => Promise<unknown>) | null {
  const submitContext = { account: context.account, chainId: context.chainId }

  switch (instructionType) {
    case 'SmartSwap':
      return context.adapters.smartSwap
        ? () => context.adapters.smartSwap(instruction as SwapExecutionInstruction, submitContext)
        : null
    case 'V2Swap':
      return context.adapters.v2Swap
        ? () => context.adapters.v2Swap(instruction as SwapExecutionInstruction, submitContext)
        : null
    case 'BridgeBurn':
      return context.adapters.bridgeBurn
        ? () => context.adapters.bridgeBurn(instruction as BridgeExecutionInstruction, submitContext)
        : null
    default:
      return null
  }
}

function resolveReport(account: string | undefined, chainId: number | undefined, instructionId: string) {
  const tracker = getExecutionTracker(account, chainId)
  const record = tracker.getByInstructionId(instructionId)
  return record ? tracker.getExecutionReport(record.executionId) : undefined
}

/**
 * Canonical instruction dispatcher — KAP-006C submit owner.
 * Active via canonical ingress (default) or internal harness flag.
 */
export async function dispatchExecutionInstruction(
  instruction: ExecutionInstruction,
  context: IngressDispatchContext,
): Promise<IngressDispatchResult> {
  if (!isIngressDispatchActive()) {
    return { ok: false, error: inactiveError() }
  }

  const validation = validateExecutionInstruction(instruction)
  if (!validation.ok) {
    return { ok: false, error: validation.error }
  }

  const mode = getConfiguredExecutionMode()
  const useDexCanonicalGates = mode === EXECUTION_MODE_OFF && isCanonicalIngressEnabled()

  const liveGates = useDexCanonicalGates
    ? evaluateDexCanonicalIngressGates({
        account: context.account,
        instructionValid: true,
        instructionType: validation.instructionType,
      })
    : evaluateLiveExecutionGates({
        chainId: context.chainId ?? instruction.chainId,
        account: context.account,
        instructionValid: true,
        certifiedHandoff: context.certifiedHandoff ?? false,
        handoffCompatible: context.certifiedHandoff ?? false,
        instructionType: validation.instructionType,
      })
  if (!liveGates.allowed) {
    return {
      ok: false,
      error: {
        code: INGRESS_ERROR_CODES.GATES_NOT_SATISFIED,
        category: 'adapter_error',
        message: buildGateFailureMessage(liveGates),
      },
    }
  }

  const submit = selectSubmit(validation.instructionType, instruction, context)
  if (!submit) {
    return { ok: false, error: adapterMissingError(validation.instructionType) }
  }

  const executionId = createExecutionId(instruction.id)

  try {
    const submitResult = await trackExecutionSubmission(instruction, submit, {
      account: context.account,
      chainId: context.chainId,
    })

    const report = resolveReport(context.account, context.chainId, instruction.id)

    return {
      ok: true,
      instructionType: validation.instructionType,
      executionId,
      report,
      submitResult,
    }
  } catch (error) {
    const report = resolveReport(context.account, context.chainId, instruction.id)
    const message = error instanceof Error ? error.message : String(error)

    return {
      ok: false,
      executionId,
      report,
      error: {
        code: INGRESS_ERROR_CODES.DISPATCH_FAILED,
        category: 'submission_failed',
        message,
      },
    }
  }
}
