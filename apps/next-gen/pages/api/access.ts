import type { NextApiRequest, NextApiResponse } from 'next'
import {
  betaSessionCookie,
  configuredBetaToken,
  cookieSecure,
  digestHex,
  presentationMatches,
  SECURITY_HEADERS,
} from '../../lib/betaGate'

function apply(res: NextApiResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}

function readPassword(req: NextApiRequest): string {
  const body = req.body as { password?: unknown } | undefined
  if (!body || typeof body !== 'object') return ''
  return typeof body.password === 'string' ? body.password : ''
}

export default async function access(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  apply(res)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false })
    return
  }

  const token = configuredBetaToken()
  const password = readPassword(req)
  const html = (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')
  if (!token || password.length > 256 || !(await presentationMatches(token, `Bearer ${password}`, null))) {
    if (html) {
      res.redirect(303, '/access?denied=1')
      return
    }
    res.status(401).json({ ok: false, closed: token === null })
    return
  }

  res.setHeader('Set-Cookie', betaSessionCookie(await digestHex(token), cookieSecure()))
  if (html) {
    res.redirect(303, '/')
    return
  }
  res.status(200).json({ ok: true })
}
