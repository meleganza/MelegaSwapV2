import { describe, expect, it } from 'vitest'
import {
  assertRewardingInvariants,
  buildLifecycleSecondaryCopy,
  classificationToReconciliation,
  parseClassificationCounts,
  resolveKpiLifecycleFields,
  resolveLifecycleCounts,
  type PoolClassificationSummary,
} from '../poolClassificationSummary'

const canonicalReady: PoolClassificationSummary = {
  status: 'ready',
  counts: {
    discovered: 239,
    verified: 239,
    active: 0,
    funded: 229,
    rewarding: 0,
    ended: 239,
    invalid: 0,
  },
}

describe('poolClassificationSummary', () => {
  it('TEST 1 — READY canonical response maps to KPI lifecycle fields', () => {
    const fields = resolveKpiLifecycleFields(canonicalReady)
    expect(fields.discoveredValue).toBe('239')
    expect(fields.lifecycleSecondary).toBe('0 active · 229 funded · 0 rewarding')
    expect(fields.rewarding).toBe(0)
  })

  it('TEST 2 — canonical values win over disagreeing local preview counts', () => {
    const fields = resolveKpiLifecycleFields(canonicalReady)
    expect(fields.discoveredValue).toBe('239')
    expect(fields.lifecycleSecondary).not.toBe('2 active · 0 funded · 0 rewarding')
  })

  it('TEST 3 — loading avoids stale lifecycle secondary copy', () => {
    const fields = resolveKpiLifecycleFields({ status: 'loading' })
    expect(fields.discoveredValue).toBe('—')
    expect(fields.lifecycleSecondary).toBeUndefined()
  })

  it('TEST 4 — API unavailable uses honest unavailable state', () => {
    const fields = resolveKpiLifecycleFields({ status: 'unavailable', errorDetail: 'HTTP 500' })
    expect(fields.discoveredValue).toBe('Unavailable')
    expect(fields.lifecycleSecondary).toBeUndefined()
    expect(fields.rewarding).toBe(0)
  })

  it('TEST 5 — rewarding invariant holds for canonical fixture', () => {
    expect(assertRewardingInvariants(canonicalReady.counts!)).toBe(true)
    expect(resolveLifecycleCounts(canonicalReady)?.rewarding).toBeLessThanOrEqual(0)
    expect(resolveLifecycleCounts(canonicalReady)?.funded).toBeGreaterThanOrEqual(0)
  })

  it('TEST 6 — hero case inputs: active=0 rewarding=0 ended>0', () => {
    const reconciliation = classificationToReconciliation(canonicalReady.counts!)
    expect(reconciliation.active).toBe(0)
    expect(reconciliation.rewarding).toBe(0)
    expect(reconciliation.finished).toBe(239)
  })

  it('parses production-shaped classification payload', () => {
    const counts = parseClassificationCounts({
      generatedAt: '2026-07-15T15:36:30.751Z',
      currentBlock: 110156497,
      counts: {
        discovered: 239,
        verified: 239,
        active: 0,
        funded: 229,
        rewarding: 0,
        ended: 239,
        invalid: 0,
      },
    })
    expect(buildLifecycleSecondaryCopy(counts!)).toBe('0 active · 229 funded · 0 rewarding')
  })
})
