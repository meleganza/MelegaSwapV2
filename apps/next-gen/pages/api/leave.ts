import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'

export default function retiredLeave(_req: NextApiRequest, res: NextApiResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  res.status(410).json({ ok: false, retired: true })
}
