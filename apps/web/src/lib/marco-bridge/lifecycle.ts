import type { MarcoBridgeProgress, MarcoBridgeTracking } from './types'

export const MARCO_BRIDGE_PROGRESS: Array<{ status: MarcoBridgeProgress; label: string }> = [
  { status: 'submitted', label: 'Transaction submitted' },
  { status: 'source-confirmed', label: 'Source confirmed' },
  { status: 'verifying', label: 'Cross-chain verification' },
  { status: 'destination-executing', label: 'Destination execution' },
  { status: 'delivered', label: 'MARCO delivered' },
]

const TRACKED_PROGRESS: MarcoBridgeProgress[] = MARCO_BRIDGE_PROGRESS.map((step) => step.status)

export const LIVE_QUOTE_CTA = 'GET LIVE QUOTE'
export const REFRESH_LIVE_QUOTE_CTA = 'REFRESH LIVE QUOTE'
export const FETCHING_LIVE_QUOTE_CTA = 'FETCHING LIVE QUOTE'
export const BRIDGE_IN_PROGRESS_HEADLINE = 'BRIDGE IN PROGRESS'
export const BRIDGE_IN_PROGRESS_COPY =
  "Your transaction was submitted successfully. We're tracking delivery across chains. Do not resend this transfer."
export const BRIDGE_COMPLETE_HEADLINE = 'BRIDGE COMPLETE'
export const BRIDGE_COMPLETE_COPY = 'MARCO was delivered successfully to the destination wallet.'

export type DeliveryStepPhase = 'pending' | 'current' | 'complete'

export type DeliveryStepVisual = {
  status: MarcoBridgeProgress
  label: string
  phase: DeliveryStepPhase
}

export function sourceSucceeded(tracking: MarcoBridgeTracking): boolean {
  return ['source-confirmed', 'verifying', 'destination-executing', 'delivered', 'action-required'].includes(
    tracking.status,
  )
}

export function resolveLiveQuoteCtaLabel(quoteLive: boolean, quoteLoading: boolean): string {
  if (quoteLoading) return FETCHING_LIVE_QUOTE_CTA
  return quoteLive ? REFRESH_LIVE_QUOTE_CTA : LIVE_QUOTE_CTA
}

export function isTrackedBridgeTransfer(tracking: MarcoBridgeTracking): boolean {
  if (tracking.status === 'delivered') return true
  return Boolean(tracking.sourceTx) && TRACKED_PROGRESS.includes(tracking.status)
}

export function showConfirmBridgeControls(review: boolean, tracking: MarcoBridgeTracking): boolean {
  return review && !isTrackedBridgeTransfer(tracking)
}

export function bridgeProgressRank(status: MarcoBridgeProgress): number {
  return TRACKED_PROGRESS.indexOf(status)
}

export function monotonicBridgeProgress(
  previous: MarcoBridgeProgress,
  incoming: MarcoBridgeProgress,
): MarcoBridgeProgress {
  if (incoming === 'source-failed') return 'source-failed'
  const prevRank = bridgeProgressRank(previous)
  const nextRank = bridgeProgressRank(incoming)
  if (nextRank < 0) {
    if (prevRank >= 0) return previous
    return incoming
  }
  if (prevRank >= 0 && nextRank < prevRank) return previous
  return incoming
}

export function mergeBridgeTracking(
  previous: MarcoBridgeTracking,
  incoming: MarcoBridgeTracking,
): MarcoBridgeTracking {
  const status = monotonicBridgeProgress(previous.status, incoming.status)
  return {
    status,
    sourceTx: incoming.sourceTx ?? previous.sourceTx,
    guid: incoming.guid ?? previous.guid,
    destinationTx: incoming.destinationTx ?? previous.destinationTx,
    message: status === incoming.status ? incoming.message ?? previous.message : previous.message,
  }
}

export function deliveryStepPhases(status: MarcoBridgeProgress): DeliveryStepVisual[] {
  if (status === 'delivered') {
    return MARCO_BRIDGE_PROGRESS.map((step) => ({ ...step, phase: 'complete' as const }))
  }

  const rank = bridgeProgressRank(status)

  return MARCO_BRIDGE_PROGRESS.map((step, index) => {
    if (rank < 0) {
      if (status === 'confirming' && index === 0) {
        return { ...step, phase: 'current' as const }
      }
      return { ...step, phase: 'pending' as const }
    }

    if (status === 'submitted' || status === 'source-confirmed') {
      if (index <= rank) return { ...step, phase: 'complete' as const }
      if (index === rank + 1) return { ...step, phase: 'current' as const }
      return { ...step, phase: 'pending' as const }
    }

    if (index < rank) return { ...step, phase: 'complete' as const }
    if (index === rank) return { ...step, phase: 'current' as const }
    return { ...step, phase: 'pending' as const }
  })
}

export function bridgeUxHeadline(tracking: MarcoBridgeTracking): string | null {
  if (tracking.status === 'delivered') return BRIDGE_COMPLETE_HEADLINE
  if (isTrackedBridgeTransfer(tracking)) return BRIDGE_IN_PROGRESS_HEADLINE
  return null
}

/** A delayed destination is the same transfer. Never advise a second send after source success. */
export function bridgeRecoveryMessage(tracking: MarcoBridgeTracking): string {
  if (tracking.status === 'delivered') return BRIDGE_COMPLETE_COPY
  if (tracking.status === 'source-failed') return 'The source transaction failed and no cross-chain delivery started.'
  if (isTrackedBridgeTransfer(tracking) || sourceSucceeded(tracking)) {
    return BRIDGE_IN_PROGRESS_COPY
  }
  return tracking.message ?? 'Your bridge transfer will appear here after submission.'
}
