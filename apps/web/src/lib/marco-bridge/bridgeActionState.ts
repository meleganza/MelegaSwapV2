import { CANONICAL_BNB_SOLANA_GATE } from './canonicalBnbSolanaGate'
import {
  hasBroadcastSourceTx,
  MARCO_BRIDGE_DELIVERED_COPY,
  MARCO_BRIDGE_PROGRESS,
  MARCO_BRIDGE_SUBMITTED_COPY,
} from './lifecycle'
import { INSUFFICIENT_BNB_REASON, type NativeFundsReadState } from './nativeFunds'
import type { MarcoBridgeNetworkId, MarcoBridgeQuote, MarcoBridgeTracking } from './types'

export const LIVE_QUOTE_TTL_MS = 60_000

export type MarcoBridgeSubmissionPhase = 'idle' | 'approving' | 'confirming-wallet'

export const BRIDGE_COPY = {
  getLiveQuote: 'GET LIVE QUOTE',
  refreshLiveQuote: 'REFRESH LIVE QUOTE',
  approveMarco: 'APPROVE MARCO',
  approvingMarco: 'APPROVING MARCO',
  confirmBridgeInWallet: 'CONFIRM BRIDGE IN WALLET',
  bridgeMarco: 'BRIDGE MARCO',
  bridgeInProgress: 'BRIDGE IN PROGRESS',
  bridgeComplete: 'BRIDGE COMPLETE',
  switchToBnb: 'SWITCH TO BNB',
  submitted: MARCO_BRIDGE_SUBMITTED_COPY,
  delivered: MARCO_BRIDGE_DELIVERED_COPY,
  quoteExpired: 'The live quote expired. Refresh the quote before sending.',
  quoteFailed: 'The live quote failed. Refresh the quote before sending.',
  insufficientBnb: INSUFFICIENT_BNB_REASON,
} as const

export const layerZeroScanTxUrl = (sourceTx: string) => `https://layerzeroscan.com/tx/${sourceTx}`

export type ProgressStepState = 'completed' | 'current' | 'pending'

export { hasBroadcastSourceTx }

export function isCompletedDelivery(tracking: Pick<MarcoBridgeTracking, 'status' | 'sourceTx'>): boolean {
  return tracking.status === 'delivered' && hasBroadcastSourceTx(tracking)
}

export function shouldShowCompletedDeliveryCard(tracking: Pick<MarcoBridgeTracking, 'status' | 'sourceTx'>): boolean {
  return isCompletedDelivery(tracking)
}

/** Fail-closed lock for an unresolved broadcast source tx. Delivered and source-failed do not lock. */
export function sourceSubmissionLocksControls(tracking: Pick<MarcoBridgeTracking, 'status' | 'sourceTx'>): boolean {
  if (tracking.status === 'source-failed') return false
  if (isCompletedDelivery(tracking)) return false
  return hasBroadcastSourceTx(tracking)
}

export type NewBridgeTransferState = {
  from: MarcoBridgeNetworkId
  to: MarcoBridgeNetworkId
  destination: ''
  quote: null
  quoteLoading: false
  review: false
  allowanceLD: null
  nativeBalanceWei: null
  gasPriceWei: null
  nativeReadState: NativeFundsReadState
  error: ''
  submitting: false
  submissionPhase: MarcoBridgeSubmissionPhase
  tracking: { status: 'idle' }
}

export function beginNewBridgeTransfer(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): NewBridgeTransferState {
  return {
    from,
    to,
    destination: '',
    quote: null,
    quoteLoading: false,
    review: false,
    allowanceLD: null,
    nativeBalanceWei: null,
    gasPriceWei: null,
    nativeReadState: 'idle',
    error: '',
    submitting: false,
    submissionPhase: 'idle',
    tracking: { status: 'idle' },
  }
}

export type BridgeRouteSelection =
  | (NewBridgeTransferState & { resetCompletedTransfer: true })
  | {
      from: MarcoBridgeNetworkId
      to: MarcoBridgeNetworkId
      destination: ''
      quote: null
      quoteLoading: false
      review: false
      resetCompletedTransfer: false
      tracking: Pick<MarcoBridgeTracking, 'status' | 'sourceTx'>
    }

export function applyBridgeRouteSelection(input: {
  tracking: Pick<MarcoBridgeTracking, 'status' | 'sourceTx'>
  nextFrom: MarcoBridgeNetworkId
  nextTo: MarcoBridgeNetworkId
}): BridgeRouteSelection {
  const next = beginNewBridgeTransfer(input.nextFrom, input.nextTo)
  if (isCompletedDelivery(input.tracking)) {
    return { ...next, resetCompletedTransfer: true }
  }
  return {
    from: next.from,
    to: next.to,
    destination: next.destination,
    quote: next.quote,
    quoteLoading: next.quoteLoading,
    review: next.review,
    resetCompletedTransfer: false,
    tracking: input.tracking,
  }
}

function resolveSubmissionPhase(input: {
  submissionPhase?: MarcoBridgeSubmissionPhase
  submitting?: boolean
  approvalRequired: boolean
}): MarcoBridgeSubmissionPhase {
  if (input.submissionPhase && input.submissionPhase !== 'idle') return input.submissionPhase
  if (input.submitting) return input.approvalRequired ? 'approving' : 'confirming-wallet'
  return input.submissionPhase ?? 'idle'
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
  submissionPhase?: MarcoBridgeSubmissionPhase
  quote: MarcoBridgeQuote | null
  tracking: MarcoBridgeTracking
  nowMs?: number
  nativeBlockReason?: string | null
}): { label: string; disabled: boolean; reason: string | null } {
  if (input.tracking.status === 'delivered' && hasBroadcastSourceTx(input.tracking)) {
    return { label: BRIDGE_COPY.bridgeComplete, disabled: true, reason: null }
  }
  if (sourceSubmissionLocksControls(input.tracking)) {
    return { label: BRIDGE_COPY.bridgeInProgress, disabled: true, reason: null }
  }
  const phase = resolveSubmissionPhase(input)
  if (phase === 'approving') {
    return { label: BRIDGE_COPY.approvingMarco, disabled: true, reason: null }
  }
  if (phase === 'confirming-wallet') {
    return { label: BRIDGE_COPY.confirmBridgeInWallet, disabled: true, reason: null }
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
    if (!hasBroadcastSourceTx(tracking)) return MARCO_BRIDGE_PROGRESS.map(() => 'pending')
    return MARCO_BRIDGE_PROGRESS.map(() => 'completed')
  }
  const currentIndex = MARCO_BRIDGE_PROGRESS.findIndex((step) => step.status === tracking.status)
  if (currentIndex < 0) return MARCO_BRIDGE_PROGRESS.map(() => 'pending')
  return MARCO_BRIDGE_PROGRESS.map((_, index) =>
    index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
  )
}

export function operationalCopyMustNotRequireUnpause(text: string): boolean {
  return !/set_pause|\bunpause\b|recovery[- ]required/i.test(text)
}
