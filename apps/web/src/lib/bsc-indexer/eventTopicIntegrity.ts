import { id } from '@ethersproject/hash'
import { CANONICAL_EVENT_TOPICS } from './eventTopics'

export class EventTopicIntegrityError extends Error {
  readonly constantName: string
  readonly topic: string
  readonly reason: string

  constructor(constantName: string, topic: string, reason: string) {
    super(`Event topic integrity failed for ${constantName}: ${reason}`)
    this.name = 'EventTopicIntegrityError'
    this.constantName = constantName
    this.topic = topic
    this.reason = reason
  }
}

const HEX_TOPIC = /^0x[0-9a-fA-F]{64}$/

export function validateTopicHash(constantName: string, topic: string): void {
  if (!topic.startsWith('0x')) {
    throw new EventTopicIntegrityError(constantName, topic, 'topic must start with 0x')
  }
  const hex = topic.slice(2)
  if (hex.length !== 64) {
    throw new EventTopicIntegrityError(
      constantName,
      topic,
      `topic must have exactly 64 hex characters after 0x (got ${hex.length})`,
    )
  }
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new EventTopicIntegrityError(constantName, topic, 'topic contains non-hexadecimal characters')
  }
  if (!HEX_TOPIC.test(topic)) {
    throw new EventTopicIntegrityError(constantName, topic, 'topic failed 32-byte hash validation')
  }
}

export function validateCanonicalEventTopic(entry: {
  name: string
  signature: string
  topic: string
}): void {
  validateTopicHash(entry.name, entry.topic)
  const expected = id(entry.signature)
  if (entry.topic.toLowerCase() !== expected.toLowerCase()) {
    throw new EventTopicIntegrityError(
      entry.name,
      entry.topic,
      `topic does not match keccak256("${entry.signature}") — expected ${expected}`,
    )
  }
}

/** Fail fast before any eth_getLogs when configured topics are malformed (R773). */
export function assertIndexerEventTopicsValid(): void {
  for (const entry of Object.values(CANONICAL_EVENT_TOPICS)) {
    validateCanonicalEventTopic(entry)
  }
}
