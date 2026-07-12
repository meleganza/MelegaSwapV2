import type { NextApiHandler } from 'next'
import { runFeaturedPairSync } from 'lib/bsc-indexer/indexer/featuredPairSync'
import { loadTierPairInventory, selectTier2PairForSync } from 'lib/bsc-indexer/indexer/tierInventory'
import { FEATURED_PAIR_SLUG, MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { runTierPairSync } from 'lib/bsc-indexer/indexer/tierPairSync'
import { resolveIndexerStorage } from 'lib/bsc-indexer/storage'

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
    const inventory = await loadTierPairInventory()
    const storage = resolveIndexerStorage()
    const checkpoint = await storage.loadCheckpoint()
    const cursor = checkpoint?.cursorPairIndex ?? 0

    let tier2Result: { slug: string; tier: string; addedEvents: number } | null = null
    if (featured.addedEvents === 0 && inventory.tier2.length > 0) {
      const target = selectTier2PairForSync(inventory.tier2, cursor)
      if (target) {
        const result = await runTierPairSync(target)
        tier2Result = { slug: result.slug, tier: result.tier, addedEvents: result.addedEvents }
        if (checkpoint) {
          await storage.saveCheckpoint({
            ...checkpoint,
            cursorPairIndex: (cursor + 1) % inventory.tier2.length,
          })
        }
      }
    }

    const tier1Extra = inventory.tier1.filter(
      (w) => w.slug !== FEATURED_PAIR_SLUG && w.pairAddress !== MARCO_WBNB_PAIR_BSC.toLowerCase(),
    )

    return res.status(200).json({
      ok: true,
      addedEvents: featured.addedEvents + (tier2Result?.addedEvents ?? 0),
      checkpoint: featured.checkpoint,
      health: featured.health,
      tier2Sync: tier2Result,
      inventory: {
        tier1: inventory.tier1.length,
        tier2: inventory.tier2.length,
        tier3: inventory.tier3Count,
        tier1Slugs: tier1Extra.map((w) => w.slug),
      },
    })
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Indexer sync failed',
    })
  }
}

export default handler
