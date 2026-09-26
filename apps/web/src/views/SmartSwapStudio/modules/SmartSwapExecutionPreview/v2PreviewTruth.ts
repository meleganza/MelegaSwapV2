/**
 * Execution preview under the BSC SmartSwap V2 public path: a pure presentation of the SAME canonical execution
 * display the form, the Swap CTA and the V2 confirmation modal use (SmartSwapV2ExecutionDisplay, #101).
 * No quote, no recalculation of V2 economics, no venue competition, never the legacy Melega trade:
 * - venue / router / path: the plan's factual winner (intent.router, winner quote hops);
 * - Expected output: winnerQuote.grossOutputRaw, formatted exactly like the form's To (estimated) (toSignificant(6));
 * - Minimum received: intent.minUserOut;
 * - Price impact: only the winner quote's factual impact, otherwise neutral '—';
 * - Protocol fee: the exact SmartSwap input-side fee and plan feeBps (same string as the V2 details/modal row);
 * - V2_PENDING (initial resolve / same-request re-quote): neutral values, never stale V2, never legacy.
 * LEGACY (cutover off, other chains incl. Ethereum, V2 not the active public path) returns null: legacy preview.
 */

import type { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import {
  classifyImpactSeverity,
  formatImpactLabel,
  type SmartSwapRouteHopDisplay,
} from 'lib/smart-swap-execution-preview'
import {
  SMARTSWAP_DISPLAY_MODE,
  type SmartSwapExecutionDisplay,
  type SmartSwapV2ExecutionDisplay,
} from 'views/Swap/SmartSwap/utils/v2ExecutionDisplay'

export const PREVIEW_TRUTH = {
  LEGACY: 'LEGACY',
  V2_PENDING: 'V2_PENDING',
  V2: 'V2',
} as const
export type PreviewTruth = (typeof PREVIEW_TRUTH)[keyof typeof PREVIEW_TRUTH]

export interface V2PreviewMetric {
  label: string
  value: string
  sub?: string
  tone?: 'ok' | 'warn' | 'neutral'
}

export interface V2ExecutionPreviewView {
  truth: typeof PREVIEW_TRUTH.V2 | typeof PREVIEW_TRUTH.V2_PENDING
  sourceLabel: string
  sourceDetail: string
  hops: SmartSwapRouteHopDisplay[]
  metrics: V2PreviewMetric[]
  venueId: string | null
  router: string | null
  expectedOutputRaw: string | null
  minimumReceivedRaw: string | null
}

export const V2_PREVIEW_PENDING_LABEL = 'Refreshing quote…'

/** Same short form as the V2 details / confirmation Router row. */
export function shortV2Router(router: string): string {
  return `${router.slice(0, 6)}…${router.slice(-4)}`
}

/** Same string as the V2 details / confirmation "SmartSwap fee" row. */
export function formatV2SmartSwapFee(feeAmount: CurrencyAmount<Currency>, feeBps: number): string {
  return `${feeAmount.toSignificant(4)} ${feeAmount.currency.symbol} (${(feeBps / 100).toFixed(2)}%)`
}

function pathHop(currency: Currency): SmartSwapRouteHopDisplay {
  const token = currency.wrapped
  return { kind: 'token', label: currency.symbol ?? token.symbol ?? '', address: token.address, chainId: token.chainId }
}

function pendingView(): V2ExecutionPreviewView {
  return {
    truth: PREVIEW_TRUTH.V2_PENDING,
    sourceLabel: V2_PREVIEW_PENDING_LABEL,
    sourceDetail: '',
    hops: [],
    metrics: [
      { label: 'Expected output', value: '—' },
      { label: 'Minimum received', value: '—' },
      { label: 'Price impact', value: '—', tone: 'neutral' },
      { label: 'Estimated gas', value: '—' },
      { label: 'Protocol fee', value: '—' },
    ],
    venueId: null,
    router: null,
    expectedOutputRaw: null,
    minimumReceivedRaw: null,
  }
}

function executeView(d: SmartSwapV2ExecutionDisplay): V2ExecutionPreviewView {
  const outSymbol = d.outputAmount.currency.symbol ?? ''
  const impactPercent = d.priceImpact ? Number(d.priceImpact.toFixed(2)) : null
  const severity = classifyImpactSeverity(impactPercent, impactPercent == null ? 'unavailable' : 'available')
  const hopCount = Math.max(1, d.path.length - 1)
  return {
    truth: PREVIEW_TRUTH.V2,
    sourceLabel: d.venueLabel,
    sourceDetail: `${hopCount === 1 ? 'Direct pool' : `${hopCount} hops`} · Router ${shortV2Router(d.router)}`,
    hops: d.path.map(pathHop),
    metrics: [
      { label: 'Expected output', value: `${d.outputAmount.toSignificant(6)} ${outSymbol}` },
      { label: 'Minimum received', value: `${d.minimumReceived.toSignificant(6)} ${outSymbol}` },
      {
        label: 'Price impact',
        value: formatImpactLabel(impactPercent, severity),
        tone: severity === 'HIGH' ? 'warn' : severity === 'LOW' ? 'ok' : 'neutral',
      },
      { label: 'Estimated gas', value: '—', sub: 'Estimated by your wallet at confirmation' },
      {
        label: 'Protocol fee',
        value: formatV2SmartSwapFee(d.feeAmount, d.feeBps),
        sub: `SmartSwap fee · ${d.feeBps} bps · input side`,
      },
    ],
    venueId: d.venueId,
    router: d.router,
    expectedOutputRaw: d.outputAmount.quotient.toString(),
    minimumReceivedRaw: d.minimumReceived.quotient.toString(),
  }
}

/** null => the existing legacy preview (display LEGACY or no SmartSwap form providing a display). */
export function buildV2ExecutionPreviewView(
  display: SmartSwapExecutionDisplay | null | undefined,
): V2ExecutionPreviewView | null {
  if (!display || display.mode === SMARTSWAP_DISPLAY_MODE.LEGACY) return null
  if (display.mode === SMARTSWAP_DISPLAY_MODE.V2_PENDING) return pendingView()
  return executeView(display)
}
