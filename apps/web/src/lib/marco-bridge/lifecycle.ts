import type { MarcoBridgeProgress, MarcoBridgeTracking } from './types'

export const MARCO_BRIDGE_PROGRESS: Array<{ status: MarcoBridgeProgress; label: string }> = [
  { status: 'submitted', label: 'Transaction submitted' },
  { status: 'source-confirmed', label: 'Source confirmed' },
  { status: 'verifying', label: 'Cross-chain verification' },
  { status: 'destination-executing', label: 'Destination execution' },
  { status: 'delivered', label: 'MARCO delivered' },
]

const SOURCE_SUCCESS_STATUSES: MarcoBridgeProgress[] = [
  'submitted',
  'source-confirmed',
  'verifying',
  'destination-executing',
  'delivered',
  'action-required',
]

export const MARCO_BRIDGE_SUBMITTED_COPY =
  'Your transaction was submitted successfully. We\u2019re tracking delivery across chains. Do not resend this transfer.'
export const MARCO_BRIDGE_DELIVERED_COPY = 'MARCO was delivered successfully to the destination wallet.'

export function hasBroadcastSourceTx(tracking: Pick<MarcoBridgeTracking, 'sourceTx'>): boolean {
  return typeof tracking.sourceTx === 'string' && tracking.sourceTx.length > 0
}

export function sourceSucceeded(tracking: MarcoBridgeTracking): boolean {
  if (!hasBroadcastSourceTx(tracking) || tracking.status === 'source-failed') return false
  return SOURCE_SUCCESS_STATUSES.includes(tracking.status)
}

/** A delayed destination is the same transfer. Never advise a second send after source success. */
export function bridgeRecoveryMessage(tracking: MarcoBridgeTracking): string {
  if (hasBroadcastSourceTx(tracking) && tracking.status !== 'delivered' && tracking.status !== 'source-failed') {
    return tracking.message ?? MARCO_BRIDGE_SUBMITTED_COPY
  }
  if (tracking.status === 'source-failed') return 'The source transaction failed and no cross-chain delivery started.'
  if (tracking.status === 'delivered' && hasBroadcastSourceTx(tracking)) return MARCO_BRIDGE_DELIVERED_COPY
  return tracking.message ?? 'Your bridge transfer will appear here after submission.'
}
