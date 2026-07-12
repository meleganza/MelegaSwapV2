import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { runPairSyncEngine } from './pairSyncEngine'
import type { TierPairWatch } from './tierInventory'
import type { PairWatch } from './featuredPairSync'
import { getProviderHealthSnapshot } from '../rpc/chunkedLogs'

/** R786 — bounded sync for one tier pair (separate durable namespace, forward-priority). */
export async function runTierPairSync(watch: TierPairWatch) {
  const pair: PairWatch = {
    pairAddress: watch.pairAddress,
    token0: watch.token0,
    token1: watch.token1,
  }
  const bootstrapDays =
    watch.tier === 'TIER_1'
      ? INDEXER_TIER_DEFINITIONS.TIER_1.bootstrapDays
      : INDEXER_TIER_DEFINITIONS.TIER_2.bootstrapDays

  const result = await runPairSyncEngine({
    pair,
    slug: watch.slug,
    bootstrapDays,
  })

  return {
    slug: watch.slug,
    tier: watch.tier,
    addedEvents: result.addedEvents,
    checkpoint: result.checkpoint,
    health: { ...result.health, providerHealth: getProviderHealthSnapshot() },
  }
}
