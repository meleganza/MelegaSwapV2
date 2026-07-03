import type { ExecutionError, ExecutionErrorCategory, ExecutionStatus } from './types'

export function classifyExecutionError(
  input: string | null | undefined,
  status?: ExecutionStatus,
): ExecutionError | undefined {
  if (!input && status !== 'reverted' && status !== 'failed') {
    return undefined
  }

  if (status === 'reverted') {
    return {
      code: 'EVM_REVERTED',
      category: 'reverted',
      message: input ?? 'Transaction reverted',
      revertReason: input ?? undefined,
    }
  }

  const message = input ?? 'Execution failed'
  const lowered = message.toLowerCase()

  let category: ExecutionErrorCategory = 'unknown'
  if (lowered.includes('user rejected') || lowered.includes('denied')) {
    category = 'wallet_rejected'
  } else if (lowered.includes('simulation') || lowered.includes('estimate')) {
    category = 'simulation_failed'
  } else if (lowered.includes('timeout')) {
    category = 'timeout'
  } else if (lowered.includes('submit')) {
    category = 'submission_failed'
  } else if (status === 'failed') {
    category = 'adapter_error'
  }

  return {
    code: `EXEC_${category.toUpperCase()}`,
    category,
    message,
  }
}
