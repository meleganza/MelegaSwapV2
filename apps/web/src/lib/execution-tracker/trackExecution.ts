import type { InstructionForEvidence } from '../execution-contract/evidence'
import { createExecutionId } from '../execution-contract'
import { getExecutionTracker, extractTransactionHash, toExecutionError } from './tracker'

export async function trackExecutionSubmission<T>(
  instruction: InstructionForEvidence,
  submit: () => Promise<T>,
  context: { account?: string; chainId?: number },
): Promise<T> {
  const tracker = getExecutionTracker(context.account, context.chainId)
  const executionId = createExecutionId(instruction.id)

  tracker.registerInstruction(instruction, executionId)
  tracker.markWalletSubmissionStarted(executionId)
  tracker.markTransactionSubmitted(executionId)

  try {
    const result = await submit()
    const txHash = extractTransactionHash(result)
    if (txHash) {
      tracker.captureTransactionHash(executionId, txHash, context.chainId ?? instruction.chainId)
    }
    return result
  } catch (error) {
    tracker.markExecutionFailed(executionId, toExecutionError(error))
    throw error
  }
}
