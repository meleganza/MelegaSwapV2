import { BSC_AVG_BLOCK_SECONDS, MAX_BLOCKS_PER_SYNC } from '../constants'

export const RECENT_PROTOCOL_ACTIVITY_BLOCKS = Math.floor((7 * 86_400) / BSC_AVG_BLOCK_SECONDS)

/** Compute bounded MasterChef scan window for one orchestrator invocation. */
export function resolveProtocolActivityScanWindow(params: {
  chainHead: number
  storedCursor: number | null
  recentBlocks?: number
  maxBlocksPerRun?: number
}): { fromBlock: number; toBlock: number; caughtUp: boolean } {
  const recentBlocks = params.recentBlocks ?? RECENT_PROTOCOL_ACTIVITY_BLOCKS
  const maxBlocksPerRun = params.maxBlocksPerRun ?? MAX_BLOCKS_PER_SYNC
  const windowFloor = Math.max(0, params.chainHead - recentBlocks)
  const resumeFrom =
    params.storedCursor !== null ? Math.max(windowFloor, params.storedCursor + 1) : windowFloor
  if (resumeFrom > params.chainHead) {
    return { fromBlock: params.chainHead, toBlock: params.chainHead, caughtUp: true }
  }
  const toBlock = Math.min(params.chainHead, resumeFrom + maxBlocksPerRun - 1)
  return { fromBlock: resumeFrom, toBlock, caughtUp: false }
}
