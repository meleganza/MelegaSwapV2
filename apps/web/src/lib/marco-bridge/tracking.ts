import { BRIDGE_COPY } from './bridgeActionState'
import type { MarcoBridgeProgress, MarcoBridgeTracking } from './types'

type LayerZeroMessage = {
  guid?: string
  status?: { name?: string; message?: string }
  source?: { tx?: { txHash?: string } }
  destination?: { tx?: { txHash?: string } }
}

export const LAYERZERO_DESTINATION_ATTENTION_COPY =
  'Destination execution needs attention. Keep tracking this transfer and do not resend from BNB.'

const DESTINATION_ATTENTION_STATUSES = new Set(['FAILED', 'BLOCKED'])

// LayerZero V2 Scan: top-level FAILED means the message reached destination but
// destination execution failed and is retryable there. It is not a BNB source
// revert and must never invite a new source send. BLOCKED likewise needs
// intervention on the already-broadcast transfer. source-failed is reserved for
// independently proven source-transaction reversion, never synthesized from this API.
const STATUS_MAP: Record<string, MarcoBridgeProgress> = {
  INFLIGHT: 'verifying',
  CONFIRMING: 'source-confirmed',
  PENDING: 'verifying',
  DELIVERED: 'delivered',
  FAILED: 'action-required',
  BLOCKED: 'action-required',
  PAYLOAD_STORED: 'destination-executing',
}

export function submittedTracking(sourceTx: string): MarcoBridgeTracking {
  return {
    status: 'submitted',
    sourceTx,
    message: BRIDGE_COPY.submitted,
  }
}

export function trackingFromLayerZeroMessages(
  sourceTx: string,
  messages: LayerZeroMessage[],
): MarcoBridgeTracking {
  const message = messages[0]
  if (!message) return submittedTracking(sourceTx)
  const name = (message.status?.name ?? '').toUpperCase()
  const mapped = STATUS_MAP[name]
  if (!mapped) return submittedTracking(sourceTx)
  return {
    status: mapped,
    sourceTx,
    guid: message.guid,
    destinationTx: message.destination?.tx?.txHash,
    message:
      mapped === 'delivered'
        ? BRIDGE_COPY.delivered
        : DESTINATION_ATTENTION_STATUSES.has(name)
        ? LAYERZERO_DESTINATION_ATTENTION_COPY
        : BRIDGE_COPY.submitted,
  }
}

export async function fetchLayerZeroTracking(
  sourceTx: string,
  fetcher: typeof fetch = fetch,
): Promise<MarcoBridgeTracking> {
  try {
    const response = await fetcher(`https://scan.layerzero-api.com/v1/messages/tx/${sourceTx}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) return submittedTracking(sourceTx)
    const payload = (await response.json()) as { data?: LayerZeroMessage[] } | LayerZeroMessage[]
    const messages = Array.isArray(payload) ? payload : payload.data ?? []
    return trackingFromLayerZeroMessages(sourceTx, messages)
  } catch {
    return submittedTracking(sourceTx)
  }
}
