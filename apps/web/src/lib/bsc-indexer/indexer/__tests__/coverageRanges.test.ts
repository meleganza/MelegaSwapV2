import { describe, expect, it } from 'vitest'
import {
  addCoverageRange,
  bootstrapWindowSummary,
  findCoverageGaps,
  mergeCoverageRanges,
  selectNextGap,
} from '../coverageRanges'

describe('coverageRanges', () => {
  it('merges adjacent and overlapping ranges', () => {
    expect(mergeCoverageRanges([{ fromBlock: 10, toBlock: 20 }, { fromBlock: 21, toBlock: 30 }])).toEqual([
      { fromBlock: 10, toBlock: 30 },
    ])
    expect(mergeCoverageRanges([{ fromBlock: 10, toBlock: 25 }, { fromBlock: 20, toBlock: 30 }])).toEqual([
      { fromBlock: 10, toBlock: 30 },
    ])
  })

  it('finds interior gaps', () => {
    const gaps = findCoverageGaps(
      [
        { fromBlock: 100, toBlock: 150 },
        { fromBlock: 200, toBlock: 250 },
      ],
      100,
      250,
    )
    expect(gaps).toEqual([{ fromBlock: 151, toBlock: 199 }])
  })

  it('selects newest gap toward head', () => {
    const gaps = [
      { fromBlock: 100, toBlock: 120 },
      { fromBlock: 180, toBlock: 200 },
    ]
    expect(selectNextGap(gaps)).toEqual({ fromBlock: 180, toBlock: 200 })
  })

  it('reports bootstrap completeness', () => {
    const summary = bootstrapWindowSummary([{ fromBlock: 100, toBlock: 200 }], 100, 200)
    expect(summary.complete).toBe(true)
    expect(summary.uncoveredBlocks).toBe(0)
  })

  it('adds scanned interval without duplication', () => {
    const merged = addCoverageRange([{ fromBlock: 100, toBlock: 120 }], { fromBlock: 121, toBlock: 140 })
    expect(merged).toEqual([{ fromBlock: 100, toBlock: 140 }])
  })
})
