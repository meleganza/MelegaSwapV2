import type { SwapExecutionInstruction } from '../execution-layer/types'
import { dispatchExecutionInstruction } from './dispatch'
import { isIngressDispatchActive } from './activation'
import type { IngressAdapterHandlers } from './types'

/**
 * Submits a swap through canonical execution-ingress when active.
 * Falls back to direct callback when ingress is disabled (rollback env).
 */
export async function submitSwapViaIngress(
  instruction: SwapExecutionInstruction,
  legacyCallback: () => Promise<string>,
  context: { account?: string; chainId?: number },
): Promise<string> {
  if (!isIngressDispatchActive()) {
    return legacyCallback()
  }

  const adapters: IngressAdapterHandlers = {
    smartSwap: async () => legacyCallback(),
    v2Swap: async () => legacyCallback(),
  }

  const result = await dispatchExecutionInstruction(instruction, {
    account: context.account,
    chainId: context.chainId,
    adapters,
  })

  if (!result.ok) {
    throw new Error(result.error?.message ?? 'Execution ingress dispatch failed')
  }

  return (result.submitResult as string) ?? ''
}
