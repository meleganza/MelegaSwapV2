import type { MarcoBridgeProgress, MarcoBridgeTracking } from './types'
import { MarcoBridgeError } from './errors'

const ORDER: MarcoBridgeProgress[] = [
  'TRANSACTION_SUBMITTED',
  'SOURCE_CONFIRMED',
  'CROSS_CHAIN_VERIFICATION',
  'DESTINATION_EXECUTION',
  'MARCO_DELIVERED',
]

export function advanceBridgeTracking(
  current: MarcoBridgeTracking,
  next: Pick<MarcoBridgeTracking, 'guid' | 'status' | 'destinationTransactionHash'>,
  now = Date.now(),
): MarcoBridgeTracking {
  if (next.guid !== current.guid) {
    throw new MarcoBridgeError('SOURCE_FAILED', 'Bridge tracking GUID changed unexpectedly.')
  }
  if (ORDER.indexOf(next.status) < ORDER.indexOf(current.status)) return current
  return {
    ...current,
    status: next.status,
    destinationTransactionHash: next.destinationTransactionHash ?? current.destinationTransactionHash,
    updatedAt: now,
  }
}

export function bridgeStatusMessage(tracking: MarcoBridgeTracking): string {
  switch (tracking.status) {
    case 'TRANSACTION_SUBMITTED':
      return 'Transaction submitted. Waiting for source confirmation.'
    case 'SOURCE_CONFIRMED':
      return 'Source confirmed. Do not resend; cross-chain delivery is continuing.'
    case 'CROSS_CHAIN_VERIFICATION':
      return 'Cross-chain verification in progress. Do not resend.'
    case 'DESTINATION_EXECUTION':
      return 'Destination execution in progress. Do not resend.'
    case 'MARCO_DELIVERED':
      return 'MARCO delivered.'
    default:
      return 'Bridge status unavailable.'
  }
}
