import { TradeType } from '@pancakeswap/sdk'
import { buildExecutionManifestFromBlocked } from '../execution-manifest'
import { produceKerlExecutionRequest } from 'lib/kerl-constitutional/producer'
import { KRMP_TESTNET_REGISTRY } from 'lib/kerl-constitutional/registry'
import { prepareMelegaSmartRouterSwap } from '../smartRouterAdapter'
import { MELEGA_SMART_ROUTER_ARCHITECTURE } from '../types'
import { buildTreasuryHandoffPrepared } from './treasury-integration'
import {
  CIVILIZATION_ROUTER_SCHEMA,
  type CivilizationBlockCode,
  type CivilizationRouteBlocked,
  type CivilizationRouteInput,
  type CivilizationRoutePrepared,
  type CivilizationRouteResult,
} from './types'

function blocked(
  input: CivilizationRouteInput,
  code: CivilizationBlockCode,
  message: string,
): CivilizationRouteBlocked {
  return {
    ok: false,
    schema: CIVILIZATION_ROUTER_SCHEMA,
    routeType: input.routeType,
    chainId: input.chainId,
    code,
    message,
    executionManifest: buildExecutionManifestFromBlocked({ chainId: input.chainId, code, message }),
    events: {
      civilizationRouteSubmitted: {
        routeType: input.routeType,
        chainId: input.chainId,
        architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
        blocked: true,
        code,
        machineReadable: true,
      },
    },
  }
}

function preparedSwap(
  input: Extract<CivilizationRouteInput, { routeType: 'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO' }>,
): CivilizationRouteResult {
  const swapPlan = prepareMelegaSmartRouterSwap({
    chainId: input.chainId,
    user: input.user,
    tradeType: input.tradeType,
    inputAmount: input.inputAmount,
    outputAmount: input.outputAmount,
    feeOnTransfer: input.feeOnTransfer,
  })

  if (!swapPlan.ok) {
    return blocked(input, swapPlan.code as CivilizationBlockCode, swapPlan.message)
  }

  const treasuryHandoff = buildTreasuryHandoffPrepared({
    routeType: input.routeType,
    chainId: input.chainId,
    executionManifest: swapPlan.executionManifest,
    collectorAddress: swapPlan.treasuryCollector,
  })

  const result: CivilizationRoutePrepared = {
    ok: true,
    schema: CIVILIZATION_ROUTER_SCHEMA,
    routeType: input.routeType,
    chainId: input.chainId,
    architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
    swapPlan,
    executionManifest: swapPlan.executionManifest,
    treasuryHandoff,
    events: {
      civilizationRouteSubmitted: {
        routeType: input.routeType,
        chainId: input.chainId,
        architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
        machineReadable: true,
      },
      treasuryHandoffPrepared: treasuryHandoff,
    },
  }

  return result
}

function preparedKerlSwap(
  input: Extract<CivilizationRouteInput, { routeType: 'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO' }>,
): CivilizationRouteResult {
  const inputAddress = input.inputAmount.currency.isNative
    ? null
    : input.inputAmount.currency.wrapped.address
  const outputAddress = input.outputAmount.currency.wrapped.address

  const kerlRequest = produceKerlExecutionRequest({
    chainId: input.chainId,
    inputAddress,
    outputAddress,
    inputIsNative: input.inputAmount.currency.isNative,
    amountRaw: input.inputAmount.quotient.toString(),
    slippageBps: 50,
    recipient: input.user ?? null,
    tradeType: input.tradeType,
  })

  if (!kerlRequest.ok) {
    return blocked(input, kerlRequest.code as CivilizationBlockCode, kerlRequest.message)
  }

  const swapPlan = prepareMelegaSmartRouterSwap({
    chainId: input.chainId,
    user: input.user,
    tradeType: input.tradeType,
    inputAmount: input.inputAmount,
    outputAmount: input.outputAmount,
    feeOnTransfer: input.feeOnTransfer,
  })

  if (!swapPlan.ok) {
    return blocked(input, swapPlan.code as CivilizationBlockCode, swapPlan.message)
  }

  const treasuryHandoff = buildTreasuryHandoffPrepared({
    routeType: input.routeType,
    chainId: input.chainId,
    executionManifest: swapPlan.executionManifest,
    collectorAddress: KRMP_TESTNET_REGISTRY.treasuryCollector,
  })

  const result: CivilizationRoutePrepared = {
    ok: true,
    schema: CIVILIZATION_ROUTER_SCHEMA,
    routeType: input.routeType,
    chainId: input.chainId,
    architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
    swapPlan,
    executionManifest: swapPlan.executionManifest,
    treasuryHandoff,
    events: {
      civilizationRouteSubmitted: {
        routeType: input.routeType,
        chainId: input.chainId,
        architecture: MELEGA_SMART_ROUTER_ARCHITECTURE,
        machineReadable: true,
        kerlExecutionRequestRef: kerlRequest.request.requestId,
      },
      treasuryHandoffPrepared: treasuryHandoff,
    },
  }

  return result
}

/** Constitutional economic router entrypoint — no fake routing or execution. */
export function prepareCivilizationRoute(input: CivilizationRouteInput): CivilizationRouteResult {
  if (input.chainId === KRMP_TESTNET_REGISTRY.chainId) {
    switch (input.routeType) {
      case 'STANDARD_SWAP':
      case 'BUY_MARCO':
      case 'SELL_MARCO':
        return preparedKerlSwap(input)
      default:
        return blocked(
          input,
          'BLOCKED_WRAPPER_NOT_DEPLOYED',
          'Route type not executable on BNB Testnet without KERL-certified wrapper path.',
        )
    }
  }

  switch (input.routeType) {
    case 'STANDARD_SWAP':
    case 'BUY_MARCO':
    case 'SELL_MARCO':
      return preparedSwap(input)

    case 'NARRATIVE_TRADE':
      return blocked(
        input,
        'NARRATIVE_TRADE_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
        'Narrative trade requires deployed Melega Smart Router Wrapper and Treasury Runtime intake — not executable.',
      )

    case 'AI_SERVICE':
      return blocked(
        input,
        'AI_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
        'AI service routing requires deployed wrapper and Treasury Runtime settlement — not executable.',
      )

    case 'MARKETPLACE_SERVICE':
      return blocked(
        input,
        'MARKETPLACE_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
        'Marketplace service routing is not executable — no fake marketplace settlement.',
      )

    case 'MARKETPLACE_SETTLEMENT':
      return blocked(
        input,
        'MARKETPLACE_SETTLEMENT_BLOCKED_BY_MISSING_ROUTER_CONTRACT',
        'Marketplace settlement is owned by Treasury Runtime — Smart Router prepares handoff only.',
      )

    case 'TREASURY_TRANSFER':
      return blocked(
        input,
        'TREASURY_TRANSFER_BLOCKED_BY_MISSING_RUNTIME',
        'Treasury transfer settlement is owned by Treasury Runtime — no local execution.',
      )

    case 'REFERRAL':
      return blocked(
        input,
        'REFERRAL_BLOCKED_BY_MISSING_RUNTIME',
        'Referral settlement is owned by Treasury Runtime (SRD-01) — Smart Router never splits locally.',
      )

    case 'INTERNAL_ROUTING':
      return blocked(input, 'INTERNAL_ROUTING_BLOCKED_BY_MISSING_SCHEMA', 'Internal routing schema not published.')

    case 'PROPAGATION':
      return blocked(input, 'PROPAGATION_BLOCKED_BY_MISSING_SCHEMA', 'Propagation routing schema not published.')

    default:
      return blocked(input, 'BLOCKED_WRAPPER_NOT_DEPLOYED', 'Route type not executable without deployed wrapper.')
  }
}

/** Infer swap route type from token addresses — address-only MARCO detection. */
export function classifySwapRouteType(input: {
  chainId: number
  inputAddress?: string | null
  outputAddress?: string | null
}): 'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO' {
  const marco =
    input.chainId === 56 || input.chainId === 97
      ? '0x963556de0eb8138E97A85F0A86eE0acD159D210b'.toLowerCase()
      : null
  if (!marco) return 'STANDARD_SWAP'
  const inAddr = input.inputAddress?.toLowerCase()
  const outAddr = input.outputAddress?.toLowerCase()
  if (outAddr === marco) return 'BUY_MARCO'
  if (inAddr === marco && outAddr !== marco) return 'SELL_MARCO'
  return 'STANDARD_SWAP'
}

export function prepareCivilizationSwapRoute(input: Omit<
  Extract<CivilizationRouteInput, { routeType: 'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO' }>,
  'routeType'
> & {
  inputAddress?: string | null
  outputAddress?: string | null
}): CivilizationRouteResult {
  const routeType = classifySwapRouteType({
    chainId: input.chainId,
    inputAddress: input.inputAddress,
    outputAddress: input.outputAddress,
  })
  return prepareCivilizationRoute({
    ...input,
    routeType,
    tradeType: input.tradeType ?? TradeType.EXACT_INPUT,
  })
}
