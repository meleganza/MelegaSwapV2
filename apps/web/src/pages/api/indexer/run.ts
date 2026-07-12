import type { NextApiHandler } from 'next'
import { LIVE_LAG_THRESHOLD_BLOCKS, FEATURED_PAIR_SLUG } from 'lib/bsc-indexer/constants'
import { runFeaturedPairSync } from 'lib/bsc-indexer/indexer/featuredPairSync'
import { loadTierPairInventory } from 'lib/bsc-indexer/indexer/tierInventory'
import { runTierPairSync } from 'lib/bsc-indexer/indexer/tierPairSync'

export const config = {
  maxDuration: 300,
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  const cronSecrets = [process.env.CRON_SECRET, process.env.INDEXER_CRON_SECRET].filter(Boolean)
  const vercelCron = req.headers['x-vercel-cron'] === '1'

  if (!vercelCron) {
    const authorized = cronSecrets.some((secret) => auth === `Bearer ${secret}`)
    if (!authorized) {
      return res.status(401).json({ error: 'Unauthorized indexer run' })
    }
  }

  try {
    const featured = await runFeaturedPairSync()
    let tier1Extra: Awaited<ReturnType<typeof runTierPairSync>> | null = null
    const lag = featured.health?.indexingLag ?? 0
    if (lag < LIVE_LAG_THRESHOLD_BLOCKS) {
      const inventory = await loadTierPairInventory()
      const nextTier1 = inventory.tier1.find((pair) => pair.slug !== FEATURED_PAIR_SLUG)
      if (nextTier1) {
        tier1Extra = await runTierPairSync(nextTier1)
      }
    }

    return res.status(200).json({
      ok: true,
      addedEvents: featured.addedEvents + (tier1Extra?.addedEvents ?? 0),
      featured,
      tier1Extra,
      checkpoint: featured.checkpoint,
      health: featured.health,
    })
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Indexer sync failed',
    })
  }
}

export default handler
