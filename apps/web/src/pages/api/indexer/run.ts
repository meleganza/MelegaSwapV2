import type { NextApiHandler } from 'next'
import { runFeaturedPairSync } from 'lib/bsc-indexer/indexer/featuredPairSync'
import { FEATURED_PAIR_SLUG, MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { loadTierPairInventory, selectTier2PairForSync } from 'lib/bsc-indexer/indexer/tierInventory'
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

    const tier1Extra = inventory.tier1.filter(
      (w) => w.slug !== FEATURED_PAIR_SLUG && w.pairAddress !== MARCO_WBNB_PAIR_BSC.toLowerCase(),
    )
    const tier1Results: Array<{ slug: string; tier: string; addedEvents: number }> = []
    for (const watch of tier1Extra.slice(0, 2)) {
      const result = await runTierPairSync(watch)
      tier1Results.push({ slug: result.slug, tier: result.tier, addedEvents: result.addedEvents })
    }

    const tierBatch = 2
    const tier2Results: Array<{ slug: string; tier: string; addedEvents: number }> = []
    for (let i = 0; i < tierBatch; i += 1) {
      const idx = (cursor + i) % Math.max(inventory.tier2.length, 1)
      const target = selectTier2PairForSync(inventory.tier2, idx)
      if (!target) break
      const result = await runTierPairSync(target)
      tier2Results.push({ slug: result.slug, tier: result.tier, addedEvents: result.addedEvents })
    }

    if (checkpoint && inventory.tier2.length > 0) {
      await storage.saveCheckpoint({
        ...checkpoint,
        cursorPairIndex: (cursor + tierBatch) % inventory.tier2.length,
      })
    }

    return res.status(200).json({
      ok: true,
      addedEvents: featured.addedEvents,
      checkpoint: featured.checkpoint,
      health: featured.health,
      tier1Sync: tier1Results,
      tier2Sync: tier2Results,
      inventory: {
        tier1: inventory.tier1.length,
        tier2: inventory.tier2.length,
        tier3: inventory.tier3Count,
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
