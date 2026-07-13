import { describe, expect, it } from 'vitest'
import {
  classifyLeaseHealth,
  isLeaseActive,
  isLeaseHealthy,
  isLeaseStale,
} from '../indexer/indexerLeaseUtils'
import { INDEXER_LEASE_TTL_MS } from '../indexer/indexerLease'
import type { IndexerLease } from '../indexer/indexerLease'
import { isValidTopicHash } from '../indexer/masterchefTopics'
import { SAFE_EXECUTION_BUDGET_MS } from '../indexer/indexerDeadline'

function sampleLease(overrides: Partial<IndexerLease> = {}): IndexerLease {
  const now = Date.now()
  return {
    ownerId: 'manual:abc1234:iad1:1700000000000',
    acquiredAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 60_000).toISOString(),
    heartbeatAt: new Date(now).toISOString(),
    runType: 'manual',
    deploymentSha: 'abc1234',
    ...overrides,
  }
}

describe('indexerLease', () => {
  it('detects active lease by expiresAt', () => {
    expect(isLeaseActive(sampleLease())).toBe(true)
    expect(isLeaseHealthy(sampleLease())).toBe(true)
    expect(classifyLeaseHealth(sampleLease())).toBe('healthy')
  })

  it('treats expired lease as stale and inactive', () => {
    const lease = sampleLease({
      acquiredAt: new Date(Date.now() - 120_000).toISOString(),
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      heartbeatAt: new Date(Date.now() - 60_000).toISOString(),
    })
    expect(isLeaseActive(lease)).toBe(false)
    expect(isLeaseStale(lease)).toBe(true)
    expect(classifyLeaseHealth(lease)).toBe('stale')
  })

  it('treats released marker as free', () => {
    const lease = sampleLease({ released: true })
    expect(classifyLeaseHealth(lease)).toBe('free')
  })

  it('covers full orchestrator budget in lease ttl', () => {
    expect(INDEXER_LEASE_TTL_MS).toBeGreaterThan(SAFE_EXECUTION_BUDGET_MS)
  })
})

describe('masterchefTopics', () => {
  it('validates 32-byte topic hashes', () => {
    expect(isValidTopicHash('0x90890809c654f11f630942b0e6f67ee8cb438cbdfb1d1f45533e7576391dc195')).toBe(true)
    expect(isValidTopicHash('0xbad')).toBe(false)
  })
})
