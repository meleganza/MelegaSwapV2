import type { MarcoBridgeProgress, MarcoBridgeTracking } from './types'
import { sourceSucceeded } from './lifecycle'

type LayerZeroMessage = {
  guid?: string
  status?: { name?: string; message?: string }
  source?: { tx?: { txHash?: string } }
  destination?: { tx?: { txHash?: string } }
}

const STATUS_MAP: Record<string, MarcoBridgeProgress> = {
  INFLIGHT: 'verifying',
  CONFIRMING: 'source-confirmed',
  PENDING: 'verifying',
  DELIVERED: 'delivered',
  FAILED: 'source-failed',
  BLOCKED: 'action-required',
  PAYLOAD_STORED: 'destination-executing',
}

export function trackingFromLayerZeroMessages(
  sourceTx: string,
  messages: LayerZeroMessage[],
): MarcoBridgeTracking {
  const message = messages[0]
  if (!message) {
    return {
      status: 'source-confirmed',
      sourceTx,
      message:
        "Your transaction was submitted successfully. We're tracking delivery across chains. Do not resend this transfer.",
    }
  }
  const name = (message.status?.name ?? '').toUpperCase()
  const status = STATUS_MAP[name] ?? 'verifying'
  const guid = message.guid
  const destinationTx = message.destination?.tx?.txHash
  const tracking: MarcoBridgeTracking = {
    status,
    sourceTx,
    guid,
    destinationTx,
    message:
      status === 'delivered'
        ? 'MARCO was delivered successfully to the destination wallet.'
        : status === 'source-failed'
        ? 'The source transaction failed and no cross-chain delivery started.'
        : "Your transaction was submitted successfully. We're tracking delivery across chains. Do not resend this transfer.",
  }
  if (sourceSucceeded(tracking) && tracking.status !== 'delivered' && tracking.status !== 'source-failed') {
    tracking.status = tracking.status === 'source-confirmed' ? 'source-confirmed' : tracking.status
  }
  return tracking
}

export async function fetchLayerZeroTracking(
  sourceTx: string,
  fetcher: typeof fetch = fetch,
): Promise<MarcoBridgeTracking> {
  const response = await fetcher(`https://scan.layerzero-api.com/v1/messages/tx/${sourceTx}`, {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) {
    return {
      status: 'source-confirmed',
      sourceTx,
      message:
        "Your transaction was submitted successfully. We're tracking delivery across chains. Do not resend this transfer.",
    }
  }
  const payload = (await response.json()) as { data?: LayerZeroMessage[] } | LayerZeroMessage[]
  const messages = Array.isArray(payload) ? payload : payload.data ?? []
  return trackingFromLayerZeroMessages(sourceTx, messages)
}
