import type { NextApiRequest, NextApiResponse } from 'next'
import { SECURITY_HEADERS } from '../../lib/betaGate'

export default function retiredAccess(_req: NextApiRequest, res: NextApiResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  res.setHeader('Cache-Control', 'private, no-store')
  res.status(410).json({ ok: false, retired: true })
}
