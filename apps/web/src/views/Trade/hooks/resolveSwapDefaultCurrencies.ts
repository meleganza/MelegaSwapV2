import { ChainId } from '@pancakeswap/sdk'
import { CAKE, USDT } from '@pancakeswap/tokens'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { resolveSwapDefaultNativeId } from 'hooks/nativeCurrencyIds'

/**
 * Same-chain default output for the Trade URL binder.
 * BSC stays canonical MARCO. Other LIVE chains use that chain's MARCO/CAKE map,
 * then USDT. Never bind a BSC token address onto Polygon/Base/ETH.
 */
export function resolveSwapDefaultOutputCurrencyId(chainId: number): string | undefined {
  if (chainId === ChainId.BSC) return MARCO_BSC_ADDRESS
  return CAKE[chainId]?.address ?? USDT[chainId]?.address
}

export function resolveSwapDefaultInputCurrencyId(chainId: number, nativeSymbol: string): string {
  return resolveSwapDefaultNativeId(chainId, nativeSymbol)
}

export { resolveSwapDefaultNativeId }
