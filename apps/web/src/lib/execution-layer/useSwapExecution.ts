import { useCallback, useMemo } from 'react'
import type { V2TradeAndStableSwap } from 'config/constants/types'
import { useWeb3React } from '@pancakeswap/wagmi'

import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  useSwapCallArguments as useSmartSwapCallArguments,
  type SwapCall as SmartSwapCall,
} from 'views/Swap/SmartSwap/hooks/useSwapCallArguments'
import {
  useSwapCallback as useSmartSwapCallback,
  SwapCallbackState as SmartSwapCallbackState,
} from 'views/Swap/SmartSwap/hooks/useSwapCallback'

import { useSwapCallArguments as useV2SwapCallArguments } from 'hooks/useSwapCallArguments'
import { useSwapCallback as useV2SwapCallback, SwapCallbackState as V2SwapCallbackState } from 'hooks/useSwapCallback'

import type { SmartSwapRoutingPlan, V2SwapRoutingPlan } from '../routing-layer/types'
import { trackExecutionSubmission } from '../execution-tracker/trackExecution'
import { useExecutionTrackerReceiptSync } from '../execution-tracker/useExecutionTrackerReceiptSync'
import type { SwapExecutionInstruction, SwapExecutionResult } from './types'

export type { SmartSwapCall }

function isSmartPlan(
  plan: SmartSwapRoutingPlan | V2SwapRoutingPlan,
): plan is SmartSwapRoutingPlan {
  return plan.domain === 'swap-smart'
}

function wrapSwapCallback(
  instruction: SwapExecutionInstruction,
  callback: (() => Promise<string>) | null,
  context: { account?: string; chainId?: number },
): (() => Promise<string>) | null {
  if (!callback) {
    return null
  }

  return () => trackExecutionSubmission(instruction, callback, context)
}

/**
 * Execution boundary for smart-router swaps.
 * Delegates to existing hooks — behaviour unchanged.
 */
export function useSmartSwapExecution(instruction: SwapExecutionInstruction | null): SwapExecutionResult {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const plan = instruction?.routingPlan
  const smartPlan = plan && isSmartPlan(plan) ? plan : null
  const trade = smartPlan?.trade

  useExecutionTrackerReceiptSync(instruction)

  const swapCalls = useSmartSwapCallArguments(
    trade as Parameters<typeof useSmartSwapCallArguments>[0],
    instruction?.allowedSlippageBps,
    instruction?.recipient ?? null,
  )

  const { state, callback, error } = useSmartSwapCallback(
    trade as Parameters<typeof useSmartSwapCallback>[0],
    instruction?.allowedSlippageBps,
    instruction?.recipient ?? null,
    swapCalls,
  )

  const trackedCallback = useMemo(
    () =>
      instruction
        ? wrapSwapCallback(instruction, callback, { account: account ?? undefined, chainId })
        : callback,
    [instruction, callback, account, chainId],
  )

  return useMemo(
    () => ({
      state,
      callback: trackedCallback,
      error,
      instructionId: instruction?.id ?? '',
    }),
    [state, trackedCallback, error, instruction?.id],
  )
}

/**
 * Execution boundary for V2 / stable-swap swaps.
 * Delegates to existing hooks — behaviour unchanged.
 */
export function useV2SwapExecution(instruction: SwapExecutionInstruction | null): SwapExecutionResult {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const plan = instruction?.routingPlan
  const v2Plan = plan && !isSmartPlan(plan) ? plan : null
  const trade = v2Plan?.trade as V2TradeAndStableSwap | undefined

  useExecutionTrackerReceiptSync(instruction)

  const swapCalls = useV2SwapCallArguments(trade, instruction?.allowedSlippageBps, instruction?.recipient ?? null)

  const { state, callback, error } = useV2SwapCallback(
    trade as V2TradeAndStableSwap,
    instruction?.allowedSlippageBps,
    instruction?.recipient ?? null,
    swapCalls,
  )

  const trackedCallback = useMemo(
    () =>
      instruction
        ? wrapSwapCallback(instruction, callback, { account: account ?? undefined, chainId })
        : callback,
    [instruction, callback, account, chainId],
  )

  return useMemo(
    () => ({
      state: state as SmartSwapCallbackState,
      callback: trackedCallback,
      error,
      instructionId: instruction?.id ?? '',
    }),
    [state, trackedCallback, error, instruction?.id],
  )
}

export { SmartSwapCallbackState, V2SwapCallbackState }
