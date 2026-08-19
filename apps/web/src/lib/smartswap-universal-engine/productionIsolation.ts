/**
 * M3 production isolation. Shadow never mutates the live quote or wallet path.
 */

import {
  V2_EXTERNAL_ADAPTER_WALLET_FORBIDDEN,
  V2_M3_FEE_COLLECTION_FORBIDDEN,
  V2_SHADOW_EXECUTION_FORBIDDEN,
  V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION,
  assertV2CannotExecute,
} from './operatingMode'
import type { NormalizedQuote } from './quote'

export function assertNoWalletRequest(context: unknown): void {
  if (!context || typeof context !== 'object') return
  const record = context as Record<string, unknown>
  const forbidden = ['signer', 'walletClient', 'provider', 'connector', 'account', 'windowEthereum']
  for (const key of forbidden) {
    if (record[key] != null) throw new Error(`${V2_EXTERNAL_ADAPTER_WALLET_FORBIDDEN}:${key}`)
  }
}

export function applyShadowWinnerToProduction(): never {
  throw new Error(V2_SHADOW_WINNER_CANNOT_REPLACE_PRODUCTION)
}

export function assertV2CannotCollectFeeInM3(): never {
  throw new Error(V2_M3_FEE_COLLECTION_FORBIDDEN)
}

export function cloneProductionQuote(quote: NormalizedQuote | null): NormalizedQuote | null {
  if (!quote) return null
  return JSON.parse(JSON.stringify(quote)) as NormalizedQuote
}

export function assertShadowCannotExecute(): never {
  assertV2CannotExecute()
  throw new Error(V2_SHADOW_EXECUTION_FORBIDDEN)
}
