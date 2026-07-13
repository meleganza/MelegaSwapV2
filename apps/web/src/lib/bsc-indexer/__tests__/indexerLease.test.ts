import { describe, expect, it } from 'vitest'
import { isLeaseActive } from '../indexer/indexerLeaseUtils'
import type { IndexerLease } from '../indexer/indexerLease'
import { isValidTopicHash } from '../indexer/masterchefTopics'

describe('indexerLease', () => {
  it('detects active lease by expiresAt', () => {
    const lease: IndexerLease = {
      ownerId: 'test:abc',
      acquiredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      heartbeatAt: new Date().toISOString(),
      runType: 'manual',
      deploymentSha: 'abc1234',
    }
    expect(isLeaseActive(lease)).toBe(true)
  })

  it('treats expired lease as inactive', () => {
    const lease: IndexerLease = {
      ownerId: 'test:abc',
      acquiredAt: new Date(Date.now() - 120_000).toISOString(),
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      heartbeatAt: new Date(Date.now() - 60_000).toISOString(),
      runType: 'manual',
      deploymentSha: 'abc1234',
    }
    expect(isLeaseActive(lease)).toBe(false)
  })
})

describe('masterchefTopics', () => {
  it('validates 32-byte topic hashes', () => {
    expect(isValidTopicHash('0x90890809c654f11f630942b0e6f67ee8cb438cbdfb1d1f45533e7576391dc195')).toBe(true)
    expect(isValidTopicHash('0xbad')).toBe(false)
  })
})
