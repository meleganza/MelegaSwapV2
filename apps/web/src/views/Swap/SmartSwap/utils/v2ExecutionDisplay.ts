/**
 * One execution truth, one display truth.
 * While the BSC V2 CTA is V2_EXECUTE, the Swap form's visible economics (To (estimated), Minimum received, Price,
 * Price Impact, Details/route, venue) derive ONLY from the certified plan's own facts: its bound factual winner quote,
 * intent.minUserOut, intent fee and path. No requote, no second minimum, never the legacy Melega trade.
 * While V2 is pending (initial resolve or a same-request refresh) numbers are hidden (no stale V2, no legacy).
 * Anything else (cutover off, other chains incl. Ethereum, V2 unavailable before submission) keeps the legacy display.
 */

import { Currency, CurrencyAmount, Percent, Price, Token, TradeType } from '@pancakeswap/sdk'
import { getAddress } from '@ethersproject/address'
import { BSC_V2_PUBLIC_CUTOVER_CHAIN_ID } from 'lib/smartswap-universal-engine/operatingMode'
import {
  V2_PUBLIC_ACTION,
  type V2CtaDecisionResult,
  type V2UserExecutionPlan,
} from 'lib/smartswap-universal-engine/v2UserExecutionPlan'
import type { CanonicalAssetId } from 'lib/smartswap-universal-engine/assetIdentity'

export const SMARTSWAP_DISPLAY_MODE = {
  LEGACY: 'LEGACY',
  V2_PENDING: 'V2_PENDING',
  V2: 'V2',
} as const

export interface SmartSwapV2ExecutionDisplay {
  mode: typeof SMARTSWAP_DISPLAY_MODE.V2
  venueId: string
  venueLabel: string
  router: string
  inputAmount: CurrencyAmount<Currency>
  /** Factual winner quoted output (the output the plan was bound to). */
  outputAmount: CurrencyAmount<Currency>
  /** Exactly the plan's intent.minUserOut (enforced on-chain). */
  minimumReceived: CurrencyAmount<Currency>
  executionPrice: Price<Currency, Currency>
  /** Only when the winning venue quote factually reported one; otherwise undefined (never the legacy impact). */
  priceImpact: Percent | undefined
  feeAmount: CurrencyAmount<Currency>
  feeBps: number
  path: Currency[]
  freshUntilIso: string | null
  tradeType: TradeType.EXACT_INPUT
}

export type SmartSwapExecutionDisplay =
  | { mode: typeof SMARTSWAP_DISPLAY_MODE.LEGACY }
  | { mode: typeof SMARTSWAP_DISPLAY_MODE.V2_PENDING }
  | SmartSwapV2ExecutionDisplay

const LEGACY_DISPLAY = { mode: SMARTSWAP_DISPLAY_MODE.LEGACY } as const
const PENDING_DISPLAY = { mode: SMARTSWAP_DISPLAY_MODE.V2_PENDING } as const

function sameAsset(currency: Currency, native: boolean, encoded: string): boolean {
  if (native) return currency.isNative === true
  if (currency.isNative) return false
  try {
    return getAddress((currency as Token).address) === getAddress(encoded)
  } catch {
    return false
  }
}

function hopCurrency(asset: CanonicalAssetId, chainId: number): Currency | null {
  if (asset.location.kind !== 'contract') return null
  const address = getAddress(asset.location.address)
  return new Token(chainId, address, asset.decimals ?? 18, asset.symbol ?? `${address.slice(0, 6)}…${address.slice(-4)}`)
}

export function resolveSmartSwapExecutionDisplay(input: {
  decision: Pick<V2CtaDecisionResult, 'publicAction'>
  plan: V2UserExecutionPlan
  v2Pending: boolean
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
}): SmartSwapExecutionDisplay {
  if (input.v2Pending) return PENDING_DISPLAY
  const { plan } = input
  if (input.decision.publicAction !== V2_PUBLIC_ACTION.V2_EXECUTE || !plan.ok) return LEGACY_DISPLAY
  const intent = plan.binding?.intent
  const quote = plan.winnerQuote
  // Chain-scoped: the BSC V2 display override never applies to Ethereum or any other chain.
  if (!intent || intent.chainId !== BSC_V2_PUBLIC_CUTOVER_CHAIN_ID) return LEGACY_DISPLAY
  // V2 is the execution path: if its facts cannot be rendered exactly, hide numbers rather than show legacy ones.
  const { inputCurrency, outputCurrency } = input
  if (!quote || !inputCurrency || !outputCurrency) return PENDING_DISPLAY
  if (!sameAsset(inputCurrency, intent.nativeIn, intent.inputAsset)) return PENDING_DISPLAY
  if (!sameAsset(outputCurrency, intent.nativeOut, intent.outputAsset)) return PENDING_DISPLAY
  try {
    const inputAmount = CurrencyAmount.fromRawAmount(inputCurrency, intent.inputAmount)
    const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency, quote.grossOutputRaw)
    const minimumReceived = CurrencyAmount.fromRawAmount(outputCurrency, intent.minUserOut)
    const executionPrice = new Price(inputCurrency, outputCurrency, intent.inputAmount, quote.grossOutputRaw)
    const impact = plan.winnerPriceImpactPercent
    const priceImpact =
      impact != null && Number.isFinite(impact) && impact >= 0
        ? new Percent(Math.round(impact * 100).toString(), '10000')
        : undefined
    const middle = quote.hops.slice(0, -1).map((hop) => hopCurrency(hop.tokenOut, intent.chainId))
    if (middle.some((currency) => !currency)) return PENDING_DISPLAY
    return {
      mode: SMARTSWAP_DISPLAY_MODE.V2,
      venueId: plan.winnerVenueId ?? quote.venueId,
      venueLabel: quote.venueLabel,
      router: intent.router,
      inputAmount,
      outputAmount,
      minimumReceived,
      executionPrice,
      priceImpact,
      feeAmount: CurrencyAmount.fromRawAmount(inputCurrency, intent.feeAmount),
      feeBps: intent.feeBps,
      path: [inputCurrency, ...(middle as Currency[]), outputCurrency],
      freshUntilIso: plan.freshUntilIso,
      tradeType: TradeType.EXACT_INPUT,
    }
  } catch {
    return PENDING_DISPLAY
  }
}
