import type { NextApiHandler } from 'next'
import { resetFeaturedPairCheckpoint } from 'lib/bsc-indexer/checkpointReset'

export const config = {
  maxDuration: 60,
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  const cronSecrets = [process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(Boolean)
  const vercelCron = req.headers['x-vercel-cron'] === '1'
  if (!vercelCron && !cronSecrets.some((secret) => auth === `Bearer ${secret}`)) {
    return res.status(401).json({ error: 'Unauthorized checkpoint reset' })
  }

  try {
    const reason =
      typeof req.body?.reason === 'string' ? req.body.reason : 'R772_MALFORMED_SWAP_TOPIC_CORRECTION'
    const result = await resetFeaturedPairCheckpoint(reason)
    return res.status(200).json({
      ok: true,
      resetReason: reason,
      checkpoint: result.checkpoint,
      previousCheckpoint: result.previousCheckpoint,
      note: 'Only v2 featured-pair checkpoint reset — legacy R768 and registry blobs preserved',
    })
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Checkpoint reset failed',
    })
  }
}

export default handler
