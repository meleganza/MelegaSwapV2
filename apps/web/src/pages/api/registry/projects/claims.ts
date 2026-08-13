import type { NextApiHandler } from 'next'
import { listProjectClaims, toPublicProjectClaim } from 'lib/project-claims'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'Method not allowed' })
  }

  const claims = await listProjectClaims()
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
  return res.status(200).json({ ok: true, claims: claims.map(toPublicProjectClaim) })
}

export default handler
