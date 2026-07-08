import { Currency, CurrencyAmount, Fraction } from '@pancakeswap/sdk'
import type { TradeWithStableSwap } from '@pancakeswap/smart-router/evm'
import {
  FSC_01_POLICY_REF,
  D87_PRICING_CODEX_ID,
  getSwapProtocolFeeBps,
  getSwapProtocolFeeRate,
  isBuyMarcoSwap,
} from './d87PricingCodex'

export type SwapProtocolFeeContext = {
  codexId: typeof D87_PRICING_CODEX_ID
  feeSplitPolicyRef: typeof FSC_01_POLICY_REF
  protocolFeeBps: number
  protocolFeeRate: number
  buyMarcoApplied: boolean
  outputAddress?: string
  outputSymbol?: string
}

function outputAddress(currency: Currency): string | undefined {
  if (currency.isNative) return undefined
  return currency.wrapped.address
}

export function resolveSwapProtocolFeeContext(
  trade: {
    inputAmount: { currency: Currency }
    outputAmount: { currency: Currency }
  },
  chainId?: number,
): SwapProtocolFeeContext {
  const output = trade.outputAmount.currency
  const input = trade.inputAmount.currency
  const outputSymbol = output.symbol ?? undefined
  const outAddr = outputAddress(output)
  const inAddr = outputAddress(input)
  const buyMarcoApplied = isBuyMarcoSwap({ chainId, outputAddress: outAddr })
  const protocolFeeBps = getSwapProtocolFeeBps({
    chainId,
    inputAddress: inAddr,
    outputAddress: outAddr,
    outputSymbol,
  })

  return {
    codexId: D87_PRICING_CODEX_ID,
    feeSplitPolicyRef: FSC_01_POLICY_REF,
    protocolFeeBps,
    protocolFeeRate: protocolFeeBps / 10_000,
    buyMarcoApplied,
    outputAddress: outAddr,
    outputSymbol,
  }
}

export function computeGrossProtocolFeeAmount(
  trade: TradeWithStableSwap<Currency, Currency>,
): string {
  const ctx = resolveSwapProtocolFeeContext(trade)
  const feeFraction = new Fraction(Math.round(ctx.protocolFeeRate * 1_000_000), 1_000_000)
  const feeAmount = trade.inputAmount.multiply(feeFraction) as CurrencyAmount<Currency>
  return feeAmount.toSignificant(6)
}

export function resolveSwapProtocolFeeContextFromFields(input: {
  chainId?: number
  inputAddress?: string | null
  outputAddress?: string | null
  outputSymbol?: string | null
}): SwapProtocolFeeContext {
  const buyMarcoApplied = isBuyMarcoSwap(input)
  const protocolFeeBps = getSwapProtocolFeeBps(input)
  return {
    codexId: D87_PRICING_CODEX_ID,
    feeSplitPolicyRef: FSC_01_POLICY_REF,
    protocolFeeBps,
    protocolFeeRate: protocolFeeBps / 10_000,
    buyMarcoApplied,
    outputAddress: input.outputAddress ?? undefined,
    outputSymbol: input.outputSymbol ?? undefined,
  }
}
