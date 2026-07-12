import { INDEXER_TIER_DEFINITIONS } from 'lib/data-truth/ontology'
import { runPairSyncEngine } from './pairSyncEngine'
import type { TierPairWatch } from './tierInventory'
import type { PairWatch } from './featuredPairSync'
import { getProviderHealthSnapshot } from '../rpc/chunkedLogs'
import type { IndexerDeadline } from './indexerDeadline'

/** R787 — bounded sync for one tier pair under invocation deadline. */
export async function runTierPairSync(watch: TierPairWatch, deadline?: IndexerDeadline) {
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
    deadline,
  })

  return {
    slug: watch.slug,
    tier: watch.tier,
    addedEvents: result.addedEvents,
    checkpoint: result.checkpoint,
    health: { ...result.health, providerHealth: getProviderHealthSnapshot() },
  }
}
