import { describe, expect, it } from 'vitest'
import { SUBMISSION_CATEGORY_IDS } from 'lib/economic-submission/submission-categories'
import { BRIDGE_MAPPINGS, assertBridgeCategoryCoverage } from '../bridge-mapping'
import {
  BRIDGE_VALIDATION_RULES,
  FORBIDDEN_BRIDGE_PAYLOAD_KEYS,
  validateBridgeHandoff,
} from '../bridge-validation'
import { resolveSubmissionReviewIntakeReadModel } from '../bridge-read-model'
import { serializeSubmissionReviewIntakeManifest } from '../bridge-serializer'

describe('submission review intake bridge', () => {
  it('maps all eleven submission categories', () => {
    expect(() => assertBridgeCategoryCoverage()).not.toThrow()
    expect(BRIDGE_MAPPINGS).toHaveLength(11)
    expect(BRIDGE_MAPPINGS.length).toBe(SUBMISSION_CATEGORY_IDS.length)
  })

  it('exposes required bridge fields per category', () => {
    BRIDGE_MAPPINGS.forEach((mapping) => {
      expect(mapping.requiredReviewType).toBeTruthy()
      expect(mapping.requiredEvidence.length).toBeGreaterThan(0)
      expect(mapping.reviewQueueGroup).toBeTruthy()
      expect(mapping.allowedReviewDecisions.length).toBeGreaterThan(0)
      expect(mapping.resultingIntakeFamily).toBeTruthy()
      expect(mapping.resultingIntakeEventType).toBeTruthy()
      expect(mapping.safetyClassification).toBeTruthy()
      expect(mapping.orchestratorImpact).toBeTruthy()
      expect(mapping.targetSurfaces.length).toBeGreaterThan(0)
      expect(mapping.machineManifestUri).toBe('/registry/bridges/submission-review-intake.json')
      expect(mapping.linkedSubmissionManifest).toContain('economic-submission')
      expect(mapping.linkedReviewManifest).toContain('economic-review')
      expect(mapping.linkedIntakeManifest).toContain('real-event-intake')
      expect(mapping.sampleKind).toBe('schema_example')
    })
  })

  it('defines submission → review → intake → orchestrator flow', () => {
    const model = resolveSubmissionReviewIntakeReadModel()
    expect(model.flow).toEqual(['submission', 'review', 'intake', 'orchestrator'])
    expect(model.liveBridgeEvents).toBe(0)
    expect(model.persistenceEnabled).toBe(false)
    expect(model.executionEnabled).toBe(false)
  })

  it('blocks forbidden payloads and unsafe approve decisions', () => {
    const metadata = BRIDGE_MAPPINGS.find((m) => m.submissionCategory === 'token_metadata')!
    const blocked = validateBridgeHandoff(metadata, 'approve', ['signed_tx'])
    expect(blocked.valid).toBe(false)
    expect(blocked.blockedReason).toContain('signed_tx')

    const futureAi = BRIDGE_MAPPINGS.find((m) => m.submissionCategory === 'future_ai_review')!
    const approveBlocked = validateBridgeHandoff(futureAi, 'approve')
    expect(approveBlocked.valid).toBe(false)
  })

  it('does not fake live bridge events', () => {
    const model = resolveSubmissionReviewIntakeReadModel()
    model.flowExamples.forEach((example) => {
      expect(example.sampleKind).toBe('schema_example')
      expect(example.liveIndexed).toBe(false)
    })
  })

  it('defines validation rules forbidding execution payloads', () => {
    expect(BRIDGE_VALIDATION_RULES.length).toBeGreaterThan(0)
    expect(FORBIDDEN_BRIDGE_PAYLOAD_KEYS).toContain('router_execute')
    expect(FORBIDDEN_BRIDGE_PAYLOAD_KEYS).toContain('deploy_contract')
  })

  it('includes blocked reason for unsafe categories', () => {
    const presence = BRIDGE_MAPPINGS.find((m) => m.submissionCategory === 'economic_presence_request')!
    expect(presence.blockedReason).toContain('MARCO')

    const futureAi = BRIDGE_MAPPINGS.find((m) => m.submissionCategory === 'future_ai_review')!
    expect(futureAi.blockedReason).toBeTruthy()
    expect(futureAi.allowedReviewDecisions).not.toContain('approve')
  })

  it('serializes public bridge manifest', () => {
    const manifest = serializeSubmissionReviewIntakeManifest()
    expect(manifest.manifest).toContain('submission-review-intake')
    expect(manifest.live_bridge_events).toBe(0)
    expect(manifest.mappings).toHaveLength(11)
    expect(manifest.flow).toEqual(['submission', 'review', 'intake', 'orchestrator'])
  })
})
