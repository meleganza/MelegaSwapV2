import { describe, expect, it } from 'vitest'
import { SUBMISSION_CATEGORIES, SUBMISSION_CATEGORY_IDS } from '../submission-categories'
import { SUBMISSION_REVIEW_GATES } from '../submission-review'
import { SUBMISSION_VALIDATION_RULES } from '../submission-validation'
import { resolveEconomicSubmissionReadModel } from '../submission-read-model'
import { serializeEconomicSubmissionManifest } from '../submission-serializer'

describe('economic submission service', () => {
  it('defines all eleven submission categories', () => {
    expect(SUBMISSION_CATEGORY_IDS).toHaveLength(11)
    expect(SUBMISSION_CATEGORIES).toHaveLength(11)
    expect(SUBMISSION_CATEGORY_IDS).toContain('token_metadata')
    expect(SUBMISSION_CATEGORY_IDS).toContain('future_ai_review')
  })

  it('exposes required fields and event intake mapping per category', () => {
    SUBMISSION_CATEGORIES.forEach((category) => {
      expect(category.requiredFields.length).toBeGreaterThan(0)
      expect(category.resultingEventIntakeFamily).toBeTruthy()
      expect(category.resultingRegistryTarget.startsWith('/')).toBe(true)
      expect(category.humanReviewerAction).toBeTruthy()
      expect(category.aiReviewerAction).toBeTruthy()
    })
  })

  it('defines validation rules forbidding execution payloads', () => {
    expect(SUBMISSION_VALIDATION_RULES).toHaveLength(11)
    SUBMISSION_VALIDATION_RULES.forEach((rule) => {
      expect(rule.forbiddenPayloadKeys).toContain('signed_tx')
      expect(rule.forbiddenPayloadKeys).toContain('router_execute')
    })
  })

  it('defines review gates without automatic registry mutation', () => {
    SUBMISSION_REVIEW_GATES.forEach((gate) => {
      expect(gate.allowsRegistryMutation).toBe(false)
    })
    const approved = SUBMISSION_REVIEW_GATES.find((gate) => gate.status === 'approved')!
    expect(approved.requiresHumanReviewer).toBe(true)
  })

  it('has no live submissions and schema examples only', () => {
    const model = resolveEconomicSubmissionReadModel()
    expect(model.liveSubmissionsIndexed).toBe(0)
    expect(model.persistenceEnabled).toBe(false)
    model.schemaExamples.forEach((submission) => {
      expect(submission.sampleKind).toBe('schema_example')
      expect(submission.reviewStatus).toBe('not_indexed')
      expect(submission.submissionId.startsWith('schema://')).toBe(true)
    })
  })

  it('does not fake approval outcomes', () => {
    const model = resolveEconomicSubmissionReadModel()
    const approved = model.schemaExamples.filter((submission) => submission.reviewStatus === 'approved')
    expect(approved).toHaveLength(0)
  })

  it('is read-only with execution disabled', () => {
    const model = resolveEconomicSubmissionReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
  })

  it('serializes public submission manifest', () => {
    const manifest = serializeEconomicSubmissionManifest()
    expect(manifest.manifest).toContain('economic-submission')
    expect(manifest.live_submissions_indexed).toBe(0)
    expect(manifest.categories).toHaveLength(11)
  })
})
