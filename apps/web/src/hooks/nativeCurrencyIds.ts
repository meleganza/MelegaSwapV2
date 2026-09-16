import { ChainId } from '@pancakeswap/sdk'
import { GELATO_NATIVE } from 'config/constants'
import { getMelegaChain } from 'config/melegaChainRegistry'

/** Polygon native rebrand: product/registry use POL; SDK Native.onChain still labels MATIC. */
const POLYGON_NATIVE_IDS = new Set(['POL', 'MATIC'])

/**
 * True when a swap URL / form currency id should bind to the active-chain native.
 * Does not treat wrapped natives (WMATIC, WBNB, WETH) as native.
 */
export function isNativeCurrencyId(
  currencyId: string | undefined,
  nativeSymbol: string | undefined,
  chainId?: number,
): boolean {
  if (!currencyId) return false
  const id = currencyId.trim()
  if (!id) return false
  if (id.toLowerCase() === GELATO_NATIVE) return true
  if (nativeSymbol && id.toUpperCase() === nativeSymbol.toUpperCase()) return true
  if (chainId === ChainId.POLYGON && POLYGON_NATIVE_IDS.has(id.toUpperCase())) return true
  const registrySymbol = chainId != null ? getMelegaChain(chainId)?.nativeCurrency.symbol : undefined
  return Boolean(registrySymbol && id.toUpperCase() === registrySymbol.toUpperCase())
}

/** URL/form default for the native input. Polygon uses POL to match the header/registry. */
export function resolveSwapDefaultNativeId(chainId: number, nativeSymbol: string): string {
  if (chainId === ChainId.POLYGON) return 'POL'
  return nativeSymbol
}
