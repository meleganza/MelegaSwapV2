import type { Currency, TradeType } from '@pancakeswap/sdk'
import type { RouteType, TradeWithStableSwap } from '@pancakeswap/smart-router/evm'

import { buildMelegaExecutionV1 } from '../dex-gravity/buildExecutionMachineV1'
import type { MelegaExecutionV1Payload } from '../dex-gravity/schemas/types'
import type { SwapExecutionInstruction } from '../execution-layer/types'
import {
  createSmartSwapExecutionInstruction,
  createV2SwapExecutionInstruction,
  type CreateSmartSwapInstructionInput,
  type CreateV2SwapInstructionInput,
} from './createSwapExecutionInstruction'
import { ROUTING_LAYER_OWNERSHIP } from './ownership'

/** Marker proving quote path passed through routing-layer facade. */
export const ROUTING_FACADE_MARKER = 'routing-layer-facade' as const

export interface RoutedSwapQuote {
  marker: typeof ROUTING_FACADE_MARKER
  quoteOwner: 'routing-layer'
  instruction: SwapExecutionInstruction
  executionMachine: MelegaExecutionV1Payload
}

export interface RoutedLiquidityInstruction {
  marker: typeof ROUTING_FACADE_MARKER
  quoteOwner: 'routing-layer'
  domain: 'liquidity'
  operation: 'mint' | 'burn'
  currencyA?: string
  currencyB?: string
  chainId?: number
  /** Routing packages instructions only — never submits execution. */
  submitsExecution: false
}

/**
 * Canonical routing facade for smart-router swap quotes.
 * smart-router remains computation engine; routing-layer owns the packaged instruction.
 */
export function routeSmartSwapQuote(input: CreateSmartSwapInstructionInput): RoutedSwapQuote {
  const instruction = createSmartSwapExecutionInstruction(input)
  return packageRoutedSwapQuote(instruction)
}

/**
 * Canonical routing facade for V2 / stable swap quotes.
 */
export function routeV2SwapQuote(input: CreateV2SwapInstructionInput): RoutedSwapQuote {
  const instruction = createV2SwapExecutionInstruction(input)
  return packageRoutedSwapQuote(instruction)
}

export function routeSmartSwapQuoteFromTrade(input: {
  trade: TradeWithStableSwap<Currency, Currency, TradeType>
  allowedSlippage: number
  recipient: string | null
  fallbackV2?: boolean
  routerAddress?: string
  routeType?: RouteType
  chainId?: number
}): RoutedSwapQuote {
  return routeSmartSwapQuote(input)
}

function packageRoutedSwapQuote(instruction: SwapExecutionInstruction): RoutedSwapQuote {
  return {
    marker: ROUTING_FACADE_MARKER,
    quoteOwner: 'routing-layer',
    instruction,
    executionMachine: buildMelegaExecutionV1({
      lifecycle: 'instruction_packaged',
      instruction,
    }),
  }
}

/**
 * Canonical LP instruction packaging — quotes/instructions only, no wallet submit.
 */
export function routeLiquidityInstruction(input: {
  operation: 'mint' | 'burn'
  currencyA?: string
  currencyB?: string
  chainId?: number
}): RoutedLiquidityInstruction {
  return {
    marker: ROUTING_FACADE_MARKER,
    quoteOwner: 'routing-layer',
    domain: 'liquidity',
    operation: input.operation,
    currencyA: input.currencyA,
    currencyB: input.currencyB,
    chainId: input.chainId,
    submitsExecution: false,
  }
}

export function assertRoutingFacadeOwnership(): typeof ROUTING_LAYER_OWNERSHIP {
  return ROUTING_LAYER_OWNERSHIP
}
