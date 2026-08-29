import type { NextApiRequest, NextApiResponse } from 'next'
import type { MarcoBridgeTracking } from 'lib/marco-bridge/types'

const LAYERZERO_SCAN_API = 'https://scan.layerzero-api.com/v1/messages/tx/'
const txPattern = /^(0x[0-9a-fA-F]{64}|[1-9A-HJ-NP-Za-km-z]{64,100})$/

type ScanMessage = {
  guid?: string
  status?: { name?: string }
  source?: { status?: string; tx?: { txHash?: string } }
  destination?: { status?: string; tx?: { txHash?: string } }
}

function mapMessage(message: ScanMessage, sourceTx: string): MarcoBridgeTracking {
  const status = message.status?.name?.toUpperCase() ?? ''
  const sourceStatus = message.source?.status?.toUpperCase() ?? ''
  const destinationStatus = message.destination?.status?.toUpperCase() ?? ''
  const base = {
    sourceTx,
    guid: message.guid,
    destinationTx: message.destination?.tx?.txHash,
  }
  if (status === 'DELIVERED' || destinationStatus === 'SUCCEEDED') return { ...base, status: 'delivered' }
  if (sourceStatus === 'FAILED' || status === 'FAILED') return { ...base, status: 'source-failed' }
  if (destinationStatus && destinationStatus !== 'WAITING') return { ...base, status: 'destination-executing' }
  if (sourceStatus === 'SUCCEEDED') return { ...base, status: 'verifying' }
  return { ...base, status: 'submitted' }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' })
  }
  const sourceTx = Array.isArray(req.query.sourceTx) ? req.query.sourceTx[0] : req.query.sourceTx
  if (!sourceTx || !txPattern.test(sourceTx)) return res.status(400).json({ error: 'INVALID_SOURCE_TX' })
  try {
    const response = await fetch(`${LAYERZERO_SCAN_API}${encodeURIComponent(sourceTx)}`, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`LayerZero Scan returned HTTP ${response.status}.`)
    const payload = (await response.json()) as { data?: ScanMessage[] }
    res.setHeader('Cache-Control', 'no-store')
    return res
      .status(200)
      .json(payload.data?.length ? mapMessage(payload.data[0], sourceTx) : { status: 'submitted', sourceTx })
  } catch (cause) {
    return res.status(503).json({
      error: 'TRACKING_UNAVAILABLE',
      message: cause instanceof Error ? cause.message : 'LayerZero tracking is temporarily unavailable.',
    })
  }
}
