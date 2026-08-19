/**
 * Factual latency percentiles. Null when sample size is insufficient.
 */

export interface LatencyPercentiles {
  n: number
  p50: number | null
  p95: number | null
  max: number | null
}

export function latencyPercentiles(samplesMs: number[]): LatencyPercentiles {
  if (samplesMs.length === 0) {
    return { n: 0, p50: null, p95: null, max: null }
  }
  const sorted = [...samplesMs].sort((a, b) => a - b)
  const at = (p: number) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]
  return {
    n: sorted.length,
    p50: at(50),
    p95: at(95),
    max: sorted[sorted.length - 1],
  }
}

export const INSUFFICIENT_SAMPLE = 'INSUFFICIENT_SAMPLE' as const
