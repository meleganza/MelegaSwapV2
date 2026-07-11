import type { NextApiHandler } from 'next'
import { runFeaturedPairSync } from 'lib/bsc-indexer/indexer/featuredPairSync'
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
    let tierResult: Awaited<ReturnType<typeof runTierPairSync>> | undefined
    try {
      const inventory = await loadTierPairInventory()
      const storage = resolveIndexerStorage()
      const checkpoint = await storage.loadCheckpoint()
      const cursor = checkpoint?.cursorPairIndex ?? 0
      const tierBatch = 3
      const tierResults: Array<{ slug: string; tier: string; addedEvents: number }> = []
      for (let i = 0; i < tierBatch; i += 1) {
        const idx = (cursor + i) % Math.max(inventory.tier2.length, 1)
        const target = selectTier2PairForSync(inventory.tier2, idx)
        if (!target) break
        const result = await runTierPairSync(target)
        tierResults.push({ slug: result.slug, tier: result.tier, addedEvents: result.addedEvents })
      }
      if (checkpoint && inventory.tier2.length > 0) {
        await storage.saveCheckpoint({
          ...checkpoint,
          cursorPairIndex: (cursor + tierBatch) % inventory.tier2.length,
        })
      }
      tierResult = tierResults[tierResults.length - 1]
        ? ({
            slug: tierResults.map((t) => t.slug).join(','),
            tier: 'TIER_2',
            addedEvents: tierResults.reduce((s, t) => s + t.addedEvents, 0),
          } as Awaited<ReturnType<typeof runTierPairSync>>)
        : undefined
    } catch (tierErr) {
      console.warn('[indexer/run] tier-2 sync skipped:', tierErr)
    }
    return res.status(200).json({
      ok: true,
      addedEvents: featured.addedEvents,
      checkpoint: featured.checkpoint,
      health: featured.health,
      tierSync: tierResult
        ? { slug: tierResult.slug, tier: tierResult.tier, addedEvents: tierResult.addedEvents }
        : null,
    })
  } catch (e) {
    return res.status(502).json({
      ok: false,
      reason: e instanceof Error ? e.message : 'Indexer sync failed',
    })
  }
}

export default handler
