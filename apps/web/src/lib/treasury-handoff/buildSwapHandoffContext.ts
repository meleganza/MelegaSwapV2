import { Currency, CurrencyAmount, Fraction } from '@pancakeswap/sdk'
import { TradeWithStableSwap } from '@pancakeswap/smart-router/evm'
import { TOTAL_FEE } from 'config/constants/info'
import type { SwapHandoffContext } from './types'

const MELEGA_DEX_SLUG = 'melega-dex'

/** MARCO token addresses across supported chains — registry canonical asset. */
const MARCO_ADDRESSES = new Set(
  [
    '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76',
    '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2',
    '0x56e46bE7714550A4Cb7bD0863BaB2680c099d8d7',
  ].map((a) => a.toLowerCase()),
)

function tokenAddress(currency: Currency): string {
  if (currency.isNative) return 'native'
  return currency.wrapped.address.toLowerCase()
}

function resolveOriginProject(input: Currency, output: Currency): string | undefined {
  const inputAddr = tokenAddress(input)
  const outputAddr = tokenAddress(output)
  if (MARCO_ADDRESSES.has(inputAddr) || MARCO_ADDRESSES.has(outputAddr)) {
    return MELEGA_DEX_SLUG
  }
  return undefined
}

function grossProtocolFeeOnInput(trade: TradeWithStableSwap<Currency, Currency>): string {
  const feeFraction = new Fraction(Math.round(TOTAL_FEE * 1_000_000), 1_000_000)
  const feeAmount = trade.inputAmount.multiply(feeFraction) as CurrencyAmount<Currency>
  return feeAmount.toSignificant(6)
}

/**
 * Captures swap execution context at submit time.
 * Gross fee is execution metadata (same basis as swap UI) — not treasury waterfall.
 */
export function buildSwapHandoffContext(
  trade: TradeWithStableSwap<Currency, Currency>,
): SwapHandoffContext {
  const input = trade.inputAmount.currency
  const assetAddress = input.isNative ? 'native' : input.wrapped.address

  return {
    schema: 'melega.dex-swap-handoff-context.v1',
    asset: {
      symbol: input.symbol ?? 'UNKNOWN',
      address: assetAddress,
      decimals: input.decimals,
    },
    amount: trade.inputAmount.toSignificant(6),
    fee: grossProtocolFeeOnInput(trade),
    originProject: resolveOriginProject(trade.inputAmount.currency, trade.outputAmount.currency),
  }
}
