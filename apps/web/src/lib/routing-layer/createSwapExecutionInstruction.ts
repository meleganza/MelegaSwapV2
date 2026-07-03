import type { Currency, TradeType } from '@pancakeswap/sdk'
import type { RouteType, TradeWithStableSwap } from '@pancakeswap/smart-router/evm'

import { createInstructionIdentity } from '../execution-contract/identity'
import type { SwapExecutionInstruction } from '../execution-layer/types'
import type { SmartSwapRoutingPlan, V2SwapRoutingPlan } from './types'

export interface CreateSmartSwapInstructionInput {
  trade: TradeWithStableSwap<Currency, Currency, TradeType>
  allowedSlippage: number
  recipient: string | null
  fallbackV2?: boolean
  routerAddress?: string
  routeType?: RouteType
  chainId?: number
}

/**
 * Converts a resolved smart-router trade (routing output) into an execution instruction.
 * Routing has already decided the path; this function only packages the decision.
 */
export function createSmartSwapExecutionInstruction(
  input: CreateSmartSwapInstructionInput,
): SwapExecutionInstruction {
  const plan: SmartSwapRoutingPlan = {
    domain: 'swap-smart',
    trade: input.trade,
    allowedSlippageBps: input.allowedSlippage,
    recipient: input.recipient,
    fallbackV2: input.fallbackV2 ?? false,
    routerAddress: input.routerAddress,
    routeType: input.routeType ?? input.trade.route.routeType,
  }

  const id = buildInstructionId(plan)
  const identity = createInstructionIdentity({ id })

  return {
    ...identity,
    domain: 'swap',
    adapter: 'smart-router',
    routingPlan: plan,
    allowedSlippageBps: input.allowedSlippage,
    recipient: input.recipient,
    createdAt: new Date().toISOString(),
    chainId: input.chainId,
  }
}

export interface CreateV2SwapInstructionInput {
  trade: unknown
  allowedSlippage: number
  recipient: string | null
  fallbackV2?: boolean
  routerAddress?: string
  chainId?: number
}

export function createV2SwapExecutionInstruction(input: CreateV2SwapInstructionInput): SwapExecutionInstruction {
  const plan: V2SwapRoutingPlan = {
    domain: 'swap-v2',
    trade: input.trade,
    allowedSlippageBps: input.allowedSlippage,
    recipient: input.recipient,
    fallbackV2: input.fallbackV2 ?? true,
    routerAddress: input.routerAddress,
  }

  const id = buildInstructionId(plan)
  const identity = createInstructionIdentity({ id })

  return {
    ...identity,
    domain: 'swap',
    adapter: 'v2-router',
    routingPlan: plan,
    allowedSlippageBps: input.allowedSlippage,
    recipient: input.recipient,
    createdAt: new Date().toISOString(),
    chainId: input.chainId,
  }
}

export function createBridgeExecutionInstruction(input: {
  pid: number
  isNative: boolean
  amount: string
  chainId?: number
}): import('../execution-layer/types').BridgeExecutionInstruction {
  const id = `bridge:${input.pid}:${input.amount}:${input.isNative ? 'native' : 'erc20'}`
  const identity = createInstructionIdentity({ id })

  return {
    ...identity,
    domain: 'bridge',
    adapter: 'kronoswap-bridge',
    routingPlan: {
      domain: 'bridge',
      pid: input.pid,
      isNative: input.isNative,
      amount: input.amount,
    },
    pid: input.pid,
    isNative: input.isNative,
    amount: input.amount,
    createdAt: new Date().toISOString(),
    chainId: input.chainId,
  }
}

function buildInstructionId(plan: SmartSwapRoutingPlan | V2SwapRoutingPlan): string {
  if (plan.domain === 'swap-smart') {
    const trade = plan.trade
    const inSym = trade?.inputAmount?.currency?.symbol ?? '?'
    const outSym = trade?.outputAmount?.currency?.symbol ?? '?'
    const inQty = trade?.inputAmount?.quotient?.toString?.() ?? '0'
    return `swap-smart:${inSym}:${outSym}:${inQty}:${plan.allowedSlippageBps}`
  }
  return `swap-v2:${plan.allowedSlippageBps}:${Date.now()}`
}
