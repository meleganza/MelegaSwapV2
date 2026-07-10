import { Currency, CurrencyAmount, Percent, Price, Token, TradeType } from '@pancakeswap/sdk'
import { RouteType, TradeWithStableSwap } from '@pancakeswap/smart-router/evm'
import { formatUnits } from '@ethersproject/units'
import type { SwapHandoffContext } from '../treasury-handoff/types'
import { previewKerlExecutionFee } from './wrapperExecutor'
import type { ExecutionRequest } from './types'

/** Synthetic trade facade from KERL ExecutionRequest — display only, not routing. */
export function buildKerlTradeFacade(
  request: ExecutionRequest,
  inputCurrency: Currency,
  outputCurrency: Currency,
): TradeWithStableSwap<Currency, Currency, TradeType> {
  const inputAmount = CurrencyAmount.fromRawAmount(inputCurrency, request.amountRaw)
  const preview = previewKerlExecutionFee(inputAmount.toExact(), request.expectedFeeBps)
  const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency, preview.net)

  const route = {
    routeType: RouteType.V2,
    input: inputCurrency,
    output: outputCurrency,
    path: request.path.map((addr) => {
      if (addr.toLowerCase() === (inputCurrency.isToken ? inputCurrency.wrapped.address : '').toLowerCase()) {
        return inputCurrency.wrapped
      }
      return outputCurrency.isToken && outputCurrency.wrapped.address.toLowerCase() === addr.toLowerCase()
        ? outputCurrency.wrapped
        : new Token(request.chainId, addr, 18)
    }),
    pairs: [],
    percent: new Percent(100, 100),
  }

  const executionPrice = new Price({
    baseAmount: inputAmount,
    quoteAmount: outputAmount,
  })

  return {
    tradeType: request.tradeType,
    inputAmount,
    outputAmount,
    route,
    executionPrice,
  } as TradeWithStableSwap<Currency, Currency, TradeType>
}

export function buildKerlConstitutionalSwapHandoffContext(
  request: ExecutionRequest,
  inputCurrency: Currency,
): SwapHandoffContext {
  const amountHuman = CurrencyAmount.fromRawAmount(inputCurrency, request.amountRaw).toSignificant(6)
  const preview = previewKerlExecutionFee(amountHuman, request.expectedFeeBps)

  const assetAddress = inputCurrency.isNative ? 'native' : inputCurrency.wrapped.address

  return {
    schema: 'melega.dex-swap-handoff-context.v1',
    asset: {
      symbol: inputCurrency.symbol ?? 'UNKNOWN',
      address: assetAddress,
      decimals: inputCurrency.decimals,
    },
    amount: amountHuman,
    fee: formatUnits(preview.fee, inputCurrency.decimals),
    originProject: request.routeType === 'BUY_MARCO' || request.routeType === 'SELL_MARCO' ? 'melega-dex' : undefined,
    kerlConstitutional: {
      executionRequestRef: request.requestId,
      routingDecisionSnapshotRef: request.routingDecisionSnapshotRef,
      kerlPackageId: request.kerlPackageId,
      correlationId: request.correlationId,
      wrapperAddress: request.wrapperAddress,
      routeType: request.routeType,
    },
    smartRouter: {
      architecture: 'ADAPTER',
      protocolFeeBps: request.expectedFeeBps,
      buyMarcoIncentiveApplied: request.routeType === 'BUY_MARCO',
      treasuryCollector: request.treasuryCollector,
      underlyingRouter: request.underlyingRouter,
      pricingRef: 'D87_DEX_PRICING_RATIFIED',
      treasuryPolicyRef: 'FSC-01',
    },
  }
}
