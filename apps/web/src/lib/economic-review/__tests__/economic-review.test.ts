import { describe, expect, it } from 'vitest'
import { REVIEW_DECISION_EXAMPLES, REVIEW_DECISION_RULES } from '../review-decision'
import { REVIEW_PRIORITY_ORDER } from '../review-priority'
import { REVIEW_STATUS_ORDER } from '../review-status'
import {
  SCHEMA_EXAMPLE_QUEUE_ITEMS,
  assertReviewSubmissionLinkage,
  resolveEconomicReviewReadModel,
} from '../review-read-model'
import { serializeEconomicReviewManifest } from '../review-serializer'

describe('economic review queue', () => {
  it('defines all review statuses', () => {
    expect(REVIEW_STATUS_ORDER).toEqual([
      'draft',
      'submitted',
      'queued',
      'under_review',
      'approved',
      'rejected',
      'blocked',
      'not_indexed',
    ])
  })

  it('defines priority ordering', () => {
    expect(REVIEW_PRIORITY_ORDER).toEqual(['critical', 'high', 'normal', 'low'])
  })

  it('defines five queue groups with schema examples', () => {
    const model = resolveEconomicReviewReadModel()
    expect(model.groups).toHaveLength(5)
    expect(model.groups.map((group) => group.id)).toEqual([
      'waiting_review',
      'needs_information',
      'blocked',
      'future_review',
      'completed',
    ])
    model.groups.forEach((group) => {
      expect(group.items.length).toBeGreaterThan(0)
      group.items.forEach((item) => {
        expect(item.sampleKind).toBe('schema_example')
        expect(item.queueGroup).toBe(group.id)
      })
    })
  })

  it('has liveReviewQueue zero and no persistence', () => {
    const model = resolveEconomicReviewReadModel()
    expect(model.liveReviewQueue).toBe(0)
    expect(model.persistenceEnabled).toBe(false)
    expect(model.executionEnabled).toBe(false)
    expect(model.readOnly).toBe(true)
  })

  it('includes required queue item fields', () => {
    SCHEMA_EXAMPLE_QUEUE_ITEMS.forEach((item) => {
      expect(item.submissionId).toBeTruthy()
      expect(item.submissionCategory).toBeTruthy()
      expect(item.status).toBeTruthy()
      expect(item.priority).toBeTruthy()
      expect(item.reviewType).toBeTruthy()
      expect(item.requiredReviewer).toBeTruthy()
      expect(item.requiredEvidence.length).toBeGreaterThan(0)
      expect(item.targetRegistry).toBeTruthy()
      expect(item.targetSurface.startsWith('/')).toBe(true)
      expect(item.linkedSubmission).toBe('/submit')
      expect(item.linkedPipeline).toBe('/pipeline')
    })
  })

  it('does not execute decisions or mutate registry', () => {
    REVIEW_DECISION_EXAMPLES.forEach((decision) => {
      expect(decision.executesRegistryMutation).toBe(false)
      expect(decision.executesOnChain).toBe(false)
    })
    expect(REVIEW_DECISION_RULES.some((rule) => rule.includes('no execution'))).toBe(true)
  })

  it('completed group items are schema examples only', () => {
    const model = resolveEconomicReviewReadModel()
    const completed = model.groups.find((group) => group.id === 'completed')!
    completed.items.forEach((item) => {
      expect(item.sampleKind).toBe('schema_example')
    })
    expect(model.liveReviewQueue).toBe(0)
  })

  it('links queue items to submission schema examples where applicable', () => {
    expect(() => assertReviewSubmissionLinkage()).not.toThrow()
  })

  it('serializes public review manifest', () => {
    const manifest = serializeEconomicReviewManifest()
    expect(manifest.manifest).toContain('economic-review')
    expect(manifest.live_review_queue).toBe(0)
    expect(manifest.groups).toHaveLength(5)
    expect(manifest.decision_examples.length).toBeGreaterThanOrEqual(5)
  })
})
