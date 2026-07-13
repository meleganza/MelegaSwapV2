/** R790 — deadline-primary adaptive gap scan sizing and telemetry. */

export const VERCEL_HARD_TIMEOUT_RESERVE_MS = 10_000
export const ADAPTIVE_MIN_BLOCK_SPAN = 200
export const ADAPTIVE_MAX_BLOCK_SPAN = 50_000
export const ADAPTIVE_DEFAULT_BLOCKS_PER_SECOND = 8

export interface AdaptiveScanTelemetry {
  requestedBlockCount: number
  scannedBlockCount: number
  successfulChunkCount: number
  failedChunkCount: number
  adaptiveChunkSizeStart: number
  adaptiveChunkSizeEnd: number
  averageRpcLatencyMs: number
  maximumRpcLatencyMs: number
  effectiveBlocksPerSecond: number
  deadlineRemainingMs: number
  blocksRemaining: number
  estimatedRunsRemaining: number
  estimatedCompletionTimestamp: string
}

export interface AdaptiveSpanInput {
  remainingMs: number
  blocksRemaining: number
  currentChunkSize: number
  recentBlocksPerSecond?: number
  recentAverageLatencyMs?: number
}

export function computeAdaptiveBlockSpan(input: AdaptiveSpanInput): number {
  const bps = Math.max(
    ADAPTIVE_DEFAULT_BLOCKS_PER_SECOND,
    input.recentBlocksPerSecond ?? ADAPTIVE_DEFAULT_BLOCKS_PER_SECOND,
  )
  const usableMs = Math.max(0, input.remainingMs - VERCEL_HARD_TIMEOUT_RESERVE_MS - 3_000)
  const latencyPenalty =
    input.recentAverageLatencyMs && input.recentAverageLatencyMs > 2_000 ? 0.65 : 1
  const estimated = Math.floor((usableMs / 1000) * bps * latencyPenalty)
  const span = Math.max(
    ADAPTIVE_MIN_BLOCK_SPAN,
    Math.min(ADAPTIVE_MAX_BLOCK_SPAN, estimated, input.blocksRemaining),
  )
  return span
}

export function createEmptyAdaptiveTelemetry(chunkSize: number, blocksRemaining: number, remainingMs: number): AdaptiveScanTelemetry {
  return {
    requestedBlockCount: 0,
    scannedBlockCount: 0,
    successfulChunkCount: 0,
    failedChunkCount: 0,
    adaptiveChunkSizeStart: chunkSize,
    adaptiveChunkSizeEnd: chunkSize,
    averageRpcLatencyMs: 0,
    maximumRpcLatencyMs: 0,
    effectiveBlocksPerSecond: 0,
    deadlineRemainingMs: remainingMs,
    blocksRemaining,
    estimatedRunsRemaining: 0,
    estimatedCompletionTimestamp: new Date().toISOString(),
  }
}

export function finalizeAdaptiveTelemetry(
  telemetry: AdaptiveScanTelemetry,
  samples: { latencyMs: number; blocks: number; failed?: boolean }[],
  remainingMs: number,
  blocksRemaining: number,
): AdaptiveScanTelemetry {
  const successful = samples.filter((s) => !s.failed)
  const failed = samples.filter((s) => s.failed)
  const totalBlocks = successful.reduce((sum, s) => sum + s.blocks, 0)
  const totalLatency = successful.reduce((sum, s) => sum + s.latencyMs, 0)
  const maxLatency = successful.reduce((max, s) => Math.max(max, s.latencyMs), 0)
  const totalSeconds = totalLatency > 0 ? totalLatency / 1000 : 0
  const bps = totalSeconds > 0 ? totalBlocks / totalSeconds : ADAPTIVE_DEFAULT_BLOCKS_PER_SECOND
  const avgBlocksPerRun = Math.max(totalBlocks, ADAPTIVE_MIN_BLOCK_SPAN)
  const estimatedRuns = blocksRemaining > 0 ? Math.ceil(blocksRemaining / avgBlocksPerRun) : 0
  const etaMs = estimatedRuns * Math.max(totalLatency, 45_000)
  return {
    ...telemetry,
    scannedBlockCount: totalBlocks,
    successfulChunkCount: successful.length,
    failedChunkCount: failed.length,
    averageRpcLatencyMs: successful.length ? totalLatency / successful.length : 0,
    maximumRpcLatencyMs: maxLatency,
    effectiveBlocksPerSecond: bps,
    deadlineRemainingMs: remainingMs,
    blocksRemaining,
    estimatedRunsRemaining: estimatedRuns,
    estimatedCompletionTimestamp: new Date(Date.now() + etaMs).toISOString(),
  }
}
