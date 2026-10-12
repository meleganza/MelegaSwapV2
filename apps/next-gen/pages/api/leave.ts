import type { NextApiRequest, NextApiResponse } from 'next'
import { clearBetaSessionCookie, cookieSecure, SECURITY_HEADERS } from '../../lib/betaGate'

export default function leave(req: NextApiRequest, res: NextApiResponse): void {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false })
    return
  }
  res.setHeader('Set-Cookie', clearBetaSessionCookie(cookieSecure()))
  const html = (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')
  if (html) {
    res.redirect(303, '/access')
    return
  }
  res.status(200).json({ ok: true })
}
