export interface CoverageRange {
  fromBlock: number
  toBlock: number
}

export function mergeCoverageRanges(ranges: CoverageRange[]): CoverageRange[] {
  if (!ranges.length) return []
  const sorted = [...ranges]
    .filter((r) => r.fromBlock <= r.toBlock)
    .sort((a, b) => a.fromBlock - b.fromBlock)
  const merged: CoverageRange[] = []
  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (!last || range.fromBlock > last.toBlock + 1) {
      merged.push({ ...range })
    } else {
      last.toBlock = Math.max(last.toBlock, range.toBlock)
    }
  }
  return merged
}

export function addCoverageRange(existing: CoverageRange[], scanned: CoverageRange): CoverageRange[] {
  return mergeCoverageRanges([...existing, scanned])
}

/** Uncovered intervals inside [windowFrom, windowTo], newest gap last. */
export function findCoverageGaps(
  ranges: CoverageRange[],
  windowFrom: number,
  windowTo: number,
): CoverageRange[] {
  if (windowTo < windowFrom) return []
  const merged = mergeCoverageRanges(ranges)
  const gaps: CoverageRange[] = []
  let cursor = windowFrom
  for (const range of merged) {
    if (range.toBlock < windowFrom) continue
    if (range.fromBlock > windowTo) break
    const coveredFrom = Math.max(range.fromBlock, windowFrom)
    const coveredTo = Math.min(range.toBlock, windowTo)
    if (coveredFrom > cursor) {
      gaps.push({ fromBlock: cursor, toBlock: coveredFrom - 1 })
    }
    cursor = Math.max(cursor, coveredTo + 1)
    if (cursor > windowTo) break
  }
  if (cursor <= windowTo) {
    gaps.push({ fromBlock: cursor, toBlock: windowTo })
  }
  return gaps
}

/** Prefer newest uncovered gap (toward head) after forward live sync. */
export function selectNextGap(gaps: CoverageRange[]): CoverageRange | null {
  if (!gaps.length) return null
  return gaps[gaps.length - 1]!
}

export function countCoveredBlocks(ranges: CoverageRange[], windowFrom: number, windowTo: number): number {
  const merged = mergeCoverageRanges(ranges)
  let covered = 0
  for (const range of merged) {
    const from = Math.max(range.fromBlock, windowFrom)
    const to = Math.min(range.toBlock, windowTo)
    if (from <= to) covered += to - from + 1
  }
  return covered
}

export function bootstrapWindowSummary(
  ranges: CoverageRange[],
  windowFrom: number,
  windowTo: number,
) {
  const windowBlocks = Math.max(0, windowTo - windowFrom + 1)
  const coveredBlocks = countCoveredBlocks(ranges, windowFrom, windowTo)
  const gaps = findCoverageGaps(ranges, windowFrom, windowTo)
  const uncoveredBlocks = Math.max(0, windowBlocks - coveredBlocks)
  const coveragePercent = windowBlocks > 0 ? (coveredBlocks / windowBlocks) * 100 : 0
  return {
    fromBlock: windowFrom,
    toBlock: windowTo,
    coveredBlocks,
    uncoveredBlocks,
    coveragePercent,
    gaps,
    complete: gaps.length === 0 && windowBlocks > 0,
  }
}
