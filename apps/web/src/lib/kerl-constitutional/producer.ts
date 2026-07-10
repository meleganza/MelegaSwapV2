import { TradeType } from '@pancakeswap/sdk'
import { ROUTES, type RouteId } from 'views/TestnetWrapperValidate/wrapperValidateConfig'
import { KRMP_TESTNET_REGISTRY } from './registry'
import type { ExecutionRequest, KerlRouteType } from './types'
import { EXECUTION_REQUEST_SCHEMA } from './types'

export interface ProduceExecutionRequestInput {
  chainId: number
  inputAddress: string | null
  outputAddress: string
  inputIsNative: boolean
  amountRaw: string
  slippageBps: number
  recipient: string | null
  tradeType?: TradeType
}

function normalizeAddress(address: string | null | undefined): string | null {
  if (!address) return null
  return address.toLowerCase()
}

/** KERL-owned route classification for chain 97. */
export function classifyKerlRouteType(input: {
  inputAddress: string | null
  outputAddress: string
  inputIsNative: boolean
}): KerlRouteType | null {
  const marco = KRMP_TESTNET_REGISTRY.marco.toLowerCase()
  const wbnb = KRMP_TESTNET_REGISTRY.wbnb.toLowerCase()
  const usdt = KRMP_TESTNET_REGISTRY.usdt.toLowerCase()
  const out = normalizeAddress(input.outputAddress)
  const inp = normalizeAddress(input.inputAddress)

  if (input.inputIsNative && out === marco) return 'BUY_MARCO'
  if (inp === marco && out === wbnb) return 'SELL_MARCO'
  if (input.inputIsNative && out === usdt) return 'STANDARD_SWAP'
  return null
}

function resolveRouteDef(routeType: KerlRouteType) {
  return ROUTES.find((r) => r.id === (routeType as RouteId))
}

function buildRequestId(routeType: KerlRouteType, amountRaw: string, slippageBps: number): string {
  return `kerl-exec:97:${routeType}:${amountRaw}:${slippageBps}`
}

/**
 * KERL routing producer — sole authority for path, adapter, and wrapper on chain 97.
 * DEX must consume the returned ExecutionRequest without re-routing.
 */
export function produceKerlExecutionRequest(
  input: ProduceExecutionRequestInput,
): { ok: true; request: ExecutionRequest } | { ok: false; code: string; message: string } {
  if (input.chainId !== KRMP_TESTNET_REGISTRY.chainId) {
    return { ok: false, code: 'CHAIN_NOT_KRMP', message: 'ExecutionRequest producer is chain 97 only' }
  }

  const routeType = classifyKerlRouteType({
    inputAddress: input.inputAddress,
    outputAddress: input.outputAddress,
    inputIsNative: input.inputIsNative,
  })

  if (!routeType) {
    return {
      ok: false,
      code: 'KERL_ROUTE_NOT_CERTIFIED',
      message: 'Token pair is not certified by KERL for BNB Testnet wrapper execution',
    }
  }

  const routeDef = resolveRouteDef(routeType)
  if (!routeDef) {
    return { ok: false, code: 'KERL_ROUTE_DEF_MISSING', message: 'Certified route definition missing' }
  }

  const tradeType = input.tradeType ?? TradeType.EXACT_INPUT
  if (tradeType !== TradeType.EXACT_INPUT) {
    return {
      ok: false,
      code: 'EXACT_OUTPUT_NOT_CERTIFIED',
      message: 'KERL testnet execution supports exact-input only',
    }
  }

  const request: ExecutionRequest = {
    schema: EXECUTION_REQUEST_SCHEMA,
    requestId: buildRequestId(routeType, input.amountRaw, input.slippageBps),
    chainId: KRMP_TESTNET_REGISTRY.chainId,
    producedAt: new Date().toISOString(),
    authority: 'kerl',
    routingDecisionSnapshotRef: KRMP_TESTNET_REGISTRY.routingDecisionSnapshotRef,
    kerlPackageId: KRMP_TESTNET_REGISTRY.kerlPackageId,
    correlationId: KRMP_TESTNET_REGISTRY.correlationId,
    wrapperAddress: KRMP_TESTNET_REGISTRY.wrapperAddress,
    treasuryCollector: KRMP_TESTNET_REGISTRY.treasuryCollector,
    underlyingRouter: KRMP_TESTNET_REGISTRY.underlyingRouter,
    adapter: 'v2-execution-adapter',
    routeType,
    tradeType,
    inputIsNative: routeDef.inputIsNative,
    inputToken: routeDef.inputToken,
    outputToken: routeDef.outputToken,
    path: routeDef.path,
    amountRaw: input.amountRaw,
    slippageBps: input.slippageBps,
    recipient: input.recipient,
    expectedFeeBps: routeDef.expectedFeeBps,
  }

  return { ok: true, request }
}
