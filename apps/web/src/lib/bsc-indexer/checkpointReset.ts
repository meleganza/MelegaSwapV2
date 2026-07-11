import {
  BOOTSTRAP_DAYS_FALLBACK,
  BOOTSTRAP_DAYS_PRIMARY,
  DEFAULT_CHUNK_SIZE,
  FEATURED_PAIR_SLUG,
  INDEXER_SCHEMA_VERSION,
  MELEGA_CHAIN_ID,
  REORG_SAFETY_BLOCKS,
} from './constants'
import { getBlockNumber } from './rpc/chunkedLogs'
import { resolveIndexerStorage } from './storage'
import type { IndexerCheckpoint } from './types'
import { LEGACY_INDEXER_NOTE } from './v2/paths'
import { estimateBootstrapStartBlock } from './rpc/scanBlockRange'

export const CHECKPOINT_RESET_REASON_R772 = 'R772_MALFORMED_SWAP_TOPIC_CORRECTION'

export async function createFreshFeaturedPairCheckpoint(
  chainHead: number,
  resetReason: string,
): Promise<IndexerCheckpoint> {
  let bootstrapDays = BOOTSTRAP_DAYS_PRIMARY
  let { bootstrapStartBlock } = await estimateBootstrapStartBlock(bootstrapDays)
  if (chainHead - bootstrapStartBlock > 500_000) {
    bootstrapDays = BOOTSTRAP_DAYS_FALLBACK
    ;({ bootstrapStartBlock } = await estimateBootstrapStartBlock(bootstrapDays))
  }

  return {
    schemaVersion: INDEXER_SCHEMA_VERSION,
    phase: 'bootstrap',
    featuredPairSlug: FEATURED_PAIR_SLUG,
    bootstrapStartBlock,
    bootstrapDays,
    chainId: MELEGA_CHAIN_ID,
    lastIndexedBlock: chainHead,
    chainHeadAtSync: chainHead,
    reorgSafetyBlocks: REORG_SAFETY_BLOCKS,
    lastSuccessfulSync: new Date(0).toISOString(),
    chunkSize: DEFAULT_CHUNK_SIZE,
    cursorPairIndex: 0,
    legacyNote: LEGACY_INDEXER_NOTE,
    resetReason,
    resetAt: new Date().toISOString(),
  }
}

/** Reset only v2 featured-pair namespace checkpoint — preserves legacy R768 and registry blobs. */
export async function resetFeaturedPairCheckpoint(resetReason = CHECKPOINT_RESET_REASON_R772): Promise<{
  checkpoint: IndexerCheckpoint
  previousCheckpoint: IndexerCheckpoint | null
}> {
  const storage = resolveIndexerStorage()
  const previousCheckpoint = await storage.loadCheckpoint()
  const chainHead = await getBlockNumber()
  const checkpoint = await createFreshFeaturedPairCheckpoint(chainHead, resetReason)
  await storage.saveCheckpoint(checkpoint)
  return { checkpoint, previousCheckpoint }
}
