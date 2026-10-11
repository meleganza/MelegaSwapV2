import { ChainId } from '@pancakeswap/sdk'
import { CAKE, USDT } from '@pancakeswap/tokens'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { resolveSwapDefaultNativeId } from 'hooks/nativeCurrencyIds'
import {
  POLYGON_CANONICAL_MARCO_ADDRESS,
  POLYGON_CHAIN_ID,
} from 'lib/melega-smart-router/marcoRegistry'

/**
 * Same-chain default output for the Trade URL binder.
 * BSC stays canonical MARCO. Polygon's new default is the canonical OFT.
 * CAKE[chainId] remains the legacy farm token on Polygon and is not this default.
 * Other LIVE chains use that chain's MARCO/CAKE map, then USDT.
 */
export function resolveSwapDefaultOutputCurrencyId(chainId: number): string | undefined {
  if (chainId === ChainId.BSC) return MARCO_BSC_ADDRESS
  if (chainId === POLYGON_CHAIN_ID) return POLYGON_CANONICAL_MARCO_ADDRESS
  return CAKE[chainId]?.address ?? USDT[chainId]?.address
}

export function resolveSwapDefaultInputCurrencyId(chainId: number, nativeSymbol: string): string {
  return resolveSwapDefaultNativeId(chainId, nativeSymbol)
}

export { resolveSwapDefaultNativeId }
