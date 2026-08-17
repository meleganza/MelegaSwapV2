import type { NextApiHandler } from 'next'
import { resolveDexManifest } from 'lib/dex-manifest'

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60')
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    return res.status(200).json(await resolveDexManifest())
  } catch {
    return res.status(503).json({ error: 'DEX_MANIFEST_UNAVAILABLE' })
  }
}

export default handler
