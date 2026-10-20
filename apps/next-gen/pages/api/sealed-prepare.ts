import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'

const CLOSED = {
  ok: false as const,
  code: 'PREVIEW_READ_ONLY' as const,
  unsignedTx: null,
  approvalTx: null,
  broadcast: false as const,
  signed: false as const,
  executable: false as const,
}

export default async function sealedPrepare(_req: NextApiRequest, res: NextApiResponse): Promise<void> {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  res.status(403).json(CLOSED)
}
