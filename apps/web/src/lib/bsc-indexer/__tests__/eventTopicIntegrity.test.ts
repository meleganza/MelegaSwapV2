import { describe, expect, it } from 'vitest'
import { id } from '@ethersproject/hash'
import {
  BURN_TOPIC,
  MINT_TOPIC,
  PAIR_CREATED_TOPIC,
  SWAP_TOPIC,
  SYNC_TOPIC,
  SWAP_EVENT_SIGNATURE,
  MALFORMED_SWAP_TOPIC_HISTORICAL,
} from '../eventTopics'
import {
  assertIndexerEventTopicsValid,
  EventTopicIntegrityError,
  validateTopicHash,
} from '../eventTopicIntegrity'

describe('canonical event topics (R773)', () => {
  it('SWAP_TOPIC matches keccak256 canonical signature', () => {
    expect(SWAP_TOPIC).toBe(id(SWAP_EVENT_SIGNATURE))
    expect(SWAP_TOPIC).toBe('0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822')
  })

  it('all active topics are exactly 32-byte hashes', () => {
    for (const topic of [SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC, SYNC_TOPIC, PAIR_CREATED_TOPIC]) {
      expect(topic).toMatch(/^0x[0-9a-fA-F]{64}$/)
    }
  })

  it('rejects historical malformed 63-nibble Swap topic', () => {
    expect(() => validateTopicHash('SWAP_TOPIC', MALFORMED_SWAP_TOPIC_HISTORICAL)).toThrow(
      EventTopicIntegrityError,
    )
    expect(() => validateTopicHash('SWAP_TOPIC', MALFORMED_SWAP_TOPIC_HISTORICAL)).toThrow(
      /exactly 64 hex characters/,
    )
  })

  it('assertIndexerEventTopicsValid passes for canonical constants', () => {
    expect(() => assertIndexerEventTopicsValid()).not.toThrow()
  })
})
