import {
  evaluateTrendingCandidateReplacement,
  resolveTrendingItemsForDisplay,
} from '../durableTrendingSnapshot'
import type { MelegaTickerItem } from 'design-system/melega'

const item = (primary: string): MelegaTickerItem => ({
  id: `trade-asset-${primary.toLowerCase()}`,
  primary,
  accent: '+1.0%',
  accentPositive: true,
})

describe('durableTrendingSnapshot atomic replacement', () => {
  it('rejects sparse two-token collapse after a complete snapshot', () => {
    const last = ['MARCO', 'MM72', 'YD', 'EYED', 'BLION', 'LUCK'].map(item)
    const sparse = ['MARCO', 'MM72'].map(item)
    const decision = evaluateTrendingCandidateReplacement(sparse, last, Date.now() - 60_000)
    expect(decision.accept).toBe(false)
    expect(decision.reason).toBe('PARTIAL_SPARSE')
  })

  it('keeps last-good when live is partial', () => {
    const last = ['MARCO', 'MM72', 'YD', 'EYED', 'BLION'].map(item)
    const resolved = resolveTrendingItemsForDisplay(['MARCO', 'MM72'].map(item), last, Date.now() - 60_000)
    expect(resolved.fromDurable).toBe(true)
    expect(resolved.rejectedPartial).toBe(true)
    expect(resolved.items.map((i) => i.primary)).toEqual(last.map((i) => i.primary))
  })

  it('accepts a complete replacement', () => {
    const last = ['MARCO', 'MM72', 'YD', 'EYED'].map(item)
    const next = ['MARCO', 'MM72', 'YD', 'EYED', 'BLION'].map(item)
    const decision = evaluateTrendingCandidateReplacement(next, last, Date.now() - 60_000)
    expect(decision.accept).toBe(true)
  })

  it('holds non-material churn during tenure window', () => {
    const last = ['MARCO', 'MM72', 'YD', 'EYED', 'BLION'].map(item)
    const shuffled = ['BLION', 'MARCO', 'MM72', 'YD', 'EYED'].map(item)
    const decision = evaluateTrendingCandidateReplacement(shuffled, last, Date.now() - 1_000)
    expect(decision.accept).toBe(false)
    expect(decision.reason).toBe('TENURE_HOLD')
  })
})
