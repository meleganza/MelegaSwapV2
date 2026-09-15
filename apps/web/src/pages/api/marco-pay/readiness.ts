import type { NextApiHandler } from 'next'
import { resolveMarcoPayReadiness } from 'lib/marco-pay/readiness'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  res.setHeader('Cache-Control', 'private, no-store')
  try {
    return res.status(200).json(await resolveMarcoPayReadiness())
  } catch {
    return res.status(503).json({
      executable: false,
      reason: 'MARCO Pay is temporarily unavailable.',
      applicationRef: null,
      secretConfigured: false,
      signedTestVerified: false,
      machineLive: false,
    })
  }
}

export default handler
