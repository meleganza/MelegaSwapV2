import type { SwapExecutionInstruction } from '../execution-layer/types'
import {
  resolveIngressCertifiedHandoff,
  toUserFacingExecutionError,
} from '../smart-swap-execution-handoff'
import { dispatchExecutionInstruction } from './dispatch'
import { isIngressDispatchActive } from './activation'
import type { IngressAdapterHandlers } from './types'

/**
 * Submits a swap through canonical execution-ingress when active.
 * Falls back to direct callback when ingress is disabled (rollback env).
 * Passes certified handoff from Smart Swap bridge (Instant = user confirm path).
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

  // User reached this path only after explicit Confirm Swap — never auto-sign.
  const handoff = resolveIngressCertifiedHandoff({ userConfirmedExecution: true })

  const result = await dispatchExecutionInstruction(instruction, {
    account: context.account,
    chainId: context.chainId,
    adapters,
    certifiedHandoff: handoff.certifiedHandoff,
  })

  if (!result.ok) {
    throw new Error(toUserFacingExecutionError(result.error?.message ?? 'Execution ingress dispatch failed'))
  }

  return (result.submitResult as string) ?? ''
}
