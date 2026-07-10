import { TradeType } from '@pancakeswap/sdk'
import {
  D87_PRICING_REF,
  FSC_01_POLICY_REF,
  MELEGA_SMART_ROUTER_ARCHITECTURE,
  type MelegaSmartRouterBlocked,
  type MelegaSmartRouterResult,
  type MelegaSmartRouterSwapPlan,
  type PrepareSmartRouterSwapInput,
  type ProtocolFeeCollectedEvent,
  type SmartRouterSwapRoutedEvent,
} from './types'
import { getMarcoRegistryEntry, normalizeTokenAddress } from './marcoRegistry'
import { getTreasuryCollectorEntry } from './treasuryCollectorRegistry'
import { resolveExecutionAdapterForSwap } from './execution-adapter'
import { getUnderlyingRouterEntry } from './underlyingRouterRegistry'
import { computeProtocolFeeAmounts, resolveProtocolFeeBps } from './protocolFee'
import {
  buildExecutionManifestFromBlocked,
  buildExecutionManifestFromPlan,
} from './execution-manifest'

function tokenRef(currency: { isNative: boolean; symbol?: string; wrapped: { address: string } }): string {
  if (currency.isNative) return 'native'
  return currency.wrapped.address
}

function routeHash(input: string, output: string, router: string): string {
  return `${normalizeTokenAddress(input) ?? input}:${normalizeTokenAddress(output) ?? output}:${router.toLowerCase()}`
}

function blocked(
  chainId: number,
  code: MelegaSmartRouterBlocked['code'],
  message: string,
  input?: { inputToken?: string; outputToken?: string; grossAmount?: string },
): MelegaSmartRouterBlocked {
  return {
    ok: false,
    architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
    code,
    message,
    chainId,
    executionManifest: buildExecutionManifestFromBlocked({ chainId, code, message }, input),
  }
}

export function prepareMelegaSmartRouterSwap(input: PrepareSmartRouterSwapInput): MelegaSmartRouterResult {
  const { chainId, tradeType, inputAmount, outputAmount } = input

  if (tradeType === TradeType.EXACT_OUTPUT) {
    const inputToken = tokenRef(inputAmount.currency)
    const outputToken = tokenRef(outputAmount.currency)
    return blocked(
      chainId,
      'SMART_ROUTER_EXACT_OUTPUT_UNSUPPORTED',
      'Exact-output swaps are not supported by Melega Smart Router D87 adapter.',
      { inputToken, outputToken, grossAmount: inputAmount.toSignificant(6) },
    )
  }

  if (input.feeOnTransfer) {
    const inputToken = tokenRef(inputAmount.currency)
    const outputToken = tokenRef(outputAmount.currency)
    return blocked(
      chainId,
      'SMART_ROUTER_FEE_ON_TRANSFER_UNSUPPORTED',
      'Fee-on-transfer tokens are not certified for Melega Smart Router D87 protocol fee routing.',
      { inputToken, outputToken, grossAmount: inputAmount.toSignificant(6) },
    )
  }

  const marcoRegistry = getMarcoRegistryEntry(chainId)
  if (marcoRegistry.status === 'missing') {
    const inputToken = tokenRef(inputAmount.currency)
    const outputToken = tokenRef(outputAmount.currency)
    return blocked(
      chainId,
      'BLOCKED_CONFIG_MARCO_TOKEN_MISSING',
      'MARCO token address missing for active chain.',
      { inputToken, outputToken, grossAmount: inputAmount.toSignificant(6) },
    )
  }

  const collectorRegistry = getTreasuryCollectorEntry(chainId)
  if (collectorRegistry.status === 'missing' || !collectorRegistry.collectorAddress) {
    const inputToken = tokenRef(inputAmount.currency)
    const outputToken = tokenRef(outputAmount.currency)
    return blocked(
      chainId,
      'BLOCKED_TREASURY_COLLECTOR_MISSING',
      'Treasury collector address missing for active chain.',
      { inputToken, outputToken, grossAmount: inputAmount.toSignificant(6) },
    )
  }

  const inputToken = tokenRef(inputAmount.currency)
  const outputToken = tokenRef(outputAmount.currency)
  const inputAddress = inputAmount.currency.isNative ? undefined : inputAmount.currency.wrapped.address
  const outputAddress = outputAmount.currency.isNative ? undefined : outputAmount.currency.wrapped.address

  const swapPath = [inputToken === 'native' ? 'native' : inputAddress!, outputToken === 'native' ? 'native' : outputAddress!]
  let underlyingRouter: string
  try {
    const resolved = resolveExecutionAdapterForSwap({
      chainId,
      preferSmartRouter: input.preferSmartRouter ?? false,
      inputIsNative: inputAmount.currency.isNative,
      path: swapPath.filter((t) => t !== 'native') as string[],
    })
    underlyingRouter = resolved.adapter.routerAddress()
  } catch {
    const routerRegistry = getUnderlyingRouterEntry(chainId)
    if (routerRegistry.status === 'missing' || !routerRegistry.routerAddress) {
      return blocked(
        chainId,
        'BLOCKED_UNDERLYING_ROUTER_MISSING',
        'Underlying execution router missing for active chain.',
        { inputToken, outputToken, grossAmount: inputAmount.toSignificant(6) },
      )
    }
    underlyingRouter = routerRegistry.routerAddress
  }

  const { bps: protocolFeeBps, buyMarcoIncentiveApplied } = resolveProtocolFeeBps({
    chainId,
    inputAddress,
    outputAddress,
  })

  const grossAmountIn = inputAmount.toSignificant(6)
  const { feeAmount, netAmountIn } = computeProtocolFeeAmounts(grossAmountIn, protocolFeeBps)
  const feeToken = inputToken
  const amountOut = outputAmount.toSignificant(6)
  const treasuryCollector = collectorRegistry.collectorAddress

  const protocolFeeCollected: Omit<ProtocolFeeCollectedEvent, 'user' | 'timestamp'> = {
    chainId,
    inputToken,
    outputToken,
    feeToken,
    grossAmountIn,
    netAmountIn,
    feeAmount,
    protocolFeeBps,
    buyMarcoIncentiveApplied,
    underlyingRouter,
    treasuryCollector,
    pricingRef: D87_PRICING_REF,
    treasuryPolicyRef: FSC_01_POLICY_REF,
  }

  const smartRouterSwapRouted: Omit<SmartRouterSwapRoutedEvent, 'user'> = {
    inputToken,
    outputToken,
    grossAmountIn,
    netAmountIn,
    amountOut,
    underlyingRouter,
    routeHash: routeHash(inputToken, outputToken, underlyingRouter),
    pricingRef: D87_PRICING_REF,
  }

  const planBase = {
    ok: true as const,
    architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
    chainId,
    protocolFeeBps,
    buyMarcoIncentiveApplied,
    grossAmountIn,
    netAmountIn,
    feeAmount,
    feeToken,
    inputToken,
    outputToken,
    underlyingRouter,
    treasuryCollector,
    marcoRegistry,
    collectorRegistry,
    events: { protocolFeeCollected, smartRouterSwapRouted },
  }

  const plan: MelegaSmartRouterSwapPlan = {
    ...planBase,
    executionManifest: buildExecutionManifestFromPlan(planBase),
  }

  return plan
}

export function buildProtocolFeeCollectedEvent(
  plan: MelegaSmartRouterSwapPlan,
  user: string,
  timestamp = new Date().toISOString(),
): ProtocolFeeCollectedEvent {
  return { ...plan.events.protocolFeeCollected, user, timestamp }
}

export function buildSmartRouterSwapRoutedEvent(
  plan: MelegaSmartRouterSwapPlan,
  user: string,
): SmartRouterSwapRoutedEvent {
  return { ...plan.events.smartRouterSwapRouted, user }
}
