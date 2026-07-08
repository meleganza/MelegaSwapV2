import { Currency, CurrencyAmount, Fraction } from '@pancakeswap/sdk'
import { TradeWithStableSwap } from '@pancakeswap/smart-router/evm'
import { computeGrossProtocolFeeAmount as computeD87GrossFee } from 'lib/d87-pricing/swapProtocolFee'
import {
  buildProtocolFeeCollectedEvent,
  buildSmartRouterSwapRoutedEvent,
  prepareMelegaSmartRouterSwap,
} from 'lib/melega-smart-router'
import type { SwapHandoffContext } from './types'

const MELEGA_DEX_SLUG = 'melega-dex'

function tokenAddress(currency: Currency): string {
  if (currency.isNative) return 'native'
  return currency.wrapped.address.toLowerCase()
}

function resolveOriginProject(input: Currency, output: Currency): string | undefined {
  const inputAddr = tokenAddress(input)
  const outputAddr = tokenAddress(output)
  const marcoAddresses = new Set(
    [
      '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
      '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
      '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
    ].map((a) => a.toLowerCase()),
  )
  if (marcoAddresses.has(inputAddr) || marcoAddresses.has(outputAddr)) {
    return MELEGA_DEX_SLUG
  }
  return undefined
}

/**
 * Captures swap execution context at submit time.
 * D87 protocol fee is economic metadata — Treasury Runtime owns FSC-01 settlement.
 */
export function buildSwapHandoffContext(
  trade: TradeWithStableSwap<Currency, Currency>,
  chainId: number,
  user?: string,
): SwapHandoffContext {
  const input = trade.inputAmount.currency
  const assetAddress = input.isNative ? 'native' : input.wrapped.address
  const plan = prepareMelegaSmartRouterSwap({
    chainId,
    user,
    tradeType: trade.tradeType,
    inputAmount: trade.inputAmount,
    outputAmount: trade.outputAmount,
  })

  const fee = plan.ok ? plan.feeAmount : computeD87GrossFee(trade)

  return {
    schema: 'melega.dex-swap-handoff-context.v1',
    asset: {
      symbol: input.symbol ?? 'UNKNOWN',
      address: assetAddress,
      decimals: input.decimals,
    },
    amount: trade.inputAmount.toSignificant(6),
    fee,
    originProject: resolveOriginProject(trade.inputAmount.currency, trade.outputAmount.currency),
    smartRouter: plan.ok
      ? {
          architecture: plan.architecture,
          protocolFeeBps: plan.protocolFeeBps,
          buyMarcoIncentiveApplied: plan.buyMarcoIncentiveApplied,
          treasuryCollector: plan.treasuryCollector,
          underlyingRouter: plan.underlyingRouter,
          pricingRef: 'D87_DEX_PRICING_RATIFIED',
          treasuryPolicyRef: 'FSC-01',
          protocolFeeCollected: user
            ? buildProtocolFeeCollectedEvent(plan, user)
            : undefined,
          smartRouterSwapRouted: user ? buildSmartRouterSwapRoutedEvent(plan, user) : undefined,
        }
      : {
          architecture: 'ADAPTER',
          pricingRef: 'D87_DEX_PRICING_RATIFIED',
          treasuryPolicyRef: 'FSC-01',
          blocked: plan.code,
        },
  }
}
