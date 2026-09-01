import { CANONICAL_BNB_SOLANA_GATE } from './canonicalBnbSolanaGate'
import { MARCO_BRIDGE_PROGRESS } from './lifecycle'
import { INSUFFICIENT_BNB_REASON } from './nativeFunds'
import type { MarcoBridgeNetworkId, MarcoBridgeProgress, MarcoBridgeQuote, MarcoBridgeTracking } from './types'

export const LIVE_QUOTE_TTL_MS = 60_000

export const BRIDGE_COPY = {
  getLiveQuote: 'GET LIVE QUOTE',
  refreshLiveQuote: 'REFRESH LIVE QUOTE',
  approveMarco: 'APPROVE MARCO',
  bridgeMarco: 'BRIDGE MARCO',
  bridgeInProgress: 'BRIDGE IN PROGRESS',
  bridgeComplete: 'BRIDGE COMPLETE',
  switchToBnb: 'SWITCH TO BNB',
  submitted:
    "Your transaction was submitted successfully. We're tracking delivery across chains. Do not resend this transfer.",
  delivered: 'MARCO was delivered successfully to the destination wallet.',
  quoteExpired: 'The live quote expired. Refresh the quote before sending.',
  quoteFailed: 'The live quote failed. Refresh the quote before sending.',
  insufficientBnb: INSUFFICIENT_BNB_REASON,
} as const

export const layerZeroScanTxUrl = (sourceTx: string) => `https://layerzeroscan.com/tx/${sourceTx}`

export type ProgressStepState = 'completed' | 'current' | 'pending'

const LOCKED_SOURCE_STATUSES: MarcoBridgeProgress[] = [
  'submitted',
  'source-confirmed',
  'verifying',
  'destination-executing',
  'delivered',
]

export function sourceSubmissionLocksControls(status: MarcoBridgeProgress): boolean {
  return LOCKED_SOURCE_STATUSES.includes(status)
}

export function isLiveQuoteFresh(quote: MarcoBridgeQuote | null, nowMs = Date.now()): boolean {
  if (!quote?.live || !quote.quotedAt) return false
  const age = nowMs - Date.parse(quote.quotedAt)
  return Number.isFinite(age) && age >= 0 && age <= LIVE_QUOTE_TTL_MS
}

export function liveQuoteBlockReason(quote: MarcoBridgeQuote | null, nowMs = Date.now()): string | null {
  if (!quote) return BRIDGE_COPY.quoteFailed
  if (!quote.live) return BRIDGE_COPY.quoteFailed
  if (!isLiveQuoteFresh(quote, nowMs)) return BRIDGE_COPY.quoteExpired
  return null
}

export function resolveQuoteCta(input: {
  hasLiveQuote: boolean
  sourceSubmitted: boolean
}): { label: string; disabled: boolean } {
  if (input.sourceSubmitted) {
    return { label: input.hasLiveQuote ? BRIDGE_COPY.refreshLiveQuote : BRIDGE_COPY.getLiveQuote, disabled: true }
  }
  return {
    label: input.hasLiveQuote ? BRIDGE_COPY.refreshLiveQuote : BRIDGE_COPY.getLiveQuote,
    disabled: false,
  }
}

export function resolveSubmitCta(input: {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  connectedChainId: number | null | undefined
  executable: boolean
  approvalRequired: boolean
  submitting: boolean
  quote: MarcoBridgeQuote | null
  tracking: MarcoBridgeTracking
  nowMs?: number
  nativeBlockReason?: string | null
}): { label: string; disabled: boolean; reason: string | null } {
  if (input.tracking.status === 'delivered') {
    return { label: BRIDGE_COPY.bridgeComplete, disabled: true, reason: null }
  }
  if (sourceSubmissionLocksControls(input.tracking.status) || input.submitting) {
    return { label: BRIDGE_COPY.bridgeInProgress, disabled: true, reason: null }
  }
  if (input.from === 'bnb' && input.connectedChainId !== CANONICAL_BNB_SOLANA_GATE.srcChainId) {
    return { label: BRIDGE_COPY.switchToBnb, disabled: false, reason: 'Switch your wallet to BNB Smart Chain.' }
  }
  const quoteReason = liveQuoteBlockReason(input.quote, input.nowMs)
  if (quoteReason) {
    return { label: BRIDGE_COPY.bridgeMarco, disabled: true, reason: quoteReason }
  }
  if (!input.executable) {
    return { label: 'SUBMISSION DISABLED', disabled: true, reason: 'This route is not publicly executable.' }
  }
  if (input.nativeBlockReason) {
    return {
      label: input.approvalRequired ? BRIDGE_COPY.approveMarco : BRIDGE_COPY.bridgeMarco,
      disabled: true,
      reason: input.nativeBlockReason,
    }
  }
  if (input.approvalRequired) {
    return { label: BRIDGE_COPY.approveMarco, disabled: false, reason: null }
  }
  return { label: BRIDGE_COPY.bridgeMarco, disabled: false, reason: null }
}

export function marcoBridgeStepStates(tracking: MarcoBridgeTracking): ProgressStepState[] {
  if (tracking.status === 'delivered') {
    return MARCO_BRIDGE_PROGRESS.map(() => 'completed')
  }
  const currentIndex = MARCO_BRIDGE_PROGRESS.findIndex((step) => step.status === tracking.status)
  if (currentIndex < 0) return MARCO_BRIDGE_PROGRESS.map(() => 'pending')
  return MARCO_BRIDGE_PROGRESS.map((_, index) =>
    index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
  )
}

export function operationalCopyMustNotRequireUnpause(text: string): boolean {
  return !/set_pause|recovery required|unpause the certified/i.test(text)
}
