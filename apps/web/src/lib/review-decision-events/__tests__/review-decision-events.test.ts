import { describe, expect, it } from 'vitest'
import { REVIEW_DECISION_TYPES } from 'lib/economic-review/review-decision'
import { DECISION_EVENT_TYPES } from '../decision-event-schema'
import {
  ALLOWED_DOWNSTREAM_EFFECTS,
  BLOCKED_DOWNSTREAM_EFFECTS,
  FORBIDDEN_DECISION_EVENT_PAYLOAD_KEYS,
} from '../decision-event-safety'
import { DECISION_EVENT_ROUTING } from '../decision-event-routing'
import {
  mapDecisionTypeToEventType,
  validateDecisionEvent,
} from '../decision-event-validation'
import {
  SCHEMA_EXAMPLE_DECISION_EVENTS,
  assertDecisionEventTypeCoverage,
  resolveReviewDecisionEventReadModel,
} from '../decision-event-read-model'
import { serializeReviewDecisionEventManifest } from '../decision-event-serializer'

describe('review decision event spec', () => {
  it('defines all seven decision event types', () => {
    expect(DECISION_EVENT_TYPES).toHaveLength(7)
    expect(DECISION_EVENT_TYPES.map((d) => d.type)).toEqual([
      'review_requested',
      'review_started',
      'information_requested',
      'review_approved',
      'review_rejected',
      'review_blocked',
      'review_deferred',
    ])
  })

  it('has schema examples for every event type', () => {
    expect(() => assertDecisionEventTypeCoverage()).not.toThrow()
    expect(SCHEMA_EXAMPLE_DECISION_EVENTS).toHaveLength(7)
  })

  it('exposes required fields on each schema example', () => {
    SCHEMA_EXAMPLE_DECISION_EVENTS.forEach((event) => {
      expect(event.eventId.startsWith('schema://')).toBe(true)
      expect(event.submissionId).toBeTruthy()
      expect(event.reviewQueueItemId).toBeTruthy()
      expect(event.reviewerType).toBeTruthy()
      expect(event.decisionStatus).toBeTruthy()
      expect(event.requiredEvidence.length).toBeGreaterThan(0)
      expect(event.decisionReason).toBeTruthy()
      expect(event.safetyClassification).toBeTruthy()
      expect(event.allowedDownstreamEffects.length).toBeGreaterThan(0)
      expect(event.blockedDownstreamEffects).toEqual(BLOCKED_DOWNSTREAM_EFFECTS)
      expect(event.routingTargets.length).toBeGreaterThan(0)
      expect(event.resultingOrchestratorImpact).toBeTruthy()
      expect(event.sampleKind).toBe('schema_example')
    })
  })

  it('defines allowed and blocked downstream effects', () => {
    expect(ALLOWED_DOWNSTREAM_EFFECTS).toEqual([
      'notify_orchestrator',
      'update_read_model',
      'request_information',
      'mark_as_reviewed_schema_only',
    ])
    expect(BLOCKED_DOWNSTREAM_EFFECTS).toContain('registry_mutation')
    expect(BLOCKED_DOWNSTREAM_EFFECTS).toContain('contract_write')
    expect(BLOCKED_DOWNSTREAM_EFFECTS).toContain('auto_liquidity')
  })

  it('maps review decision types to event types', () => {
    REVIEW_DECISION_TYPES.forEach((decision) => {
      expect(mapDecisionTypeToEventType(decision)).toBeTruthy()
    })
    expect(mapDecisionTypeToEventType('approve')).toBe('review_approved')
    expect(mapDecisionTypeToEventType('blocked')).toBe('review_blocked')
  })

  it('validates forbidden payloads and blocks registry mutation effects', () => {
    const approved = SCHEMA_EXAMPLE_DECISION_EVENTS.find(
      (e) => e.decisionEventType === 'review_approved',
    )!
    const invalid = validateDecisionEvent(approved, ['signed_tx'])
    expect(invalid.valid).toBe(false)
    expect(invalid.blockedReason).toContain('signed_tx')

    approved.blockedDownstreamEffects.forEach((effect) => {
      expect(ALLOWED_DOWNSTREAM_EFFECTS).not.toContain(effect)
    })
    expect(FORBIDDEN_DECISION_EVENT_PAYLOAD_KEYS).toContain('registry_write')
  })

  it('has liveDecisionEvents zero and no persistence', () => {
    const model = resolveReviewDecisionEventReadModel()
    expect(model.liveDecisionEvents).toBe(0)
    expect(model.persistenceEnabled).toBe(false)
    expect(model.executionEnabled).toBe(false)
    expect(model.readOnly).toBe(true)
  })

  it('defines routing for all event types', () => {
    DECISION_EVENT_TYPES.forEach((definition) => {
      const routing = DECISION_EVENT_ROUTING[definition.type]
      expect(routing.targets.length).toBeGreaterThan(0)
      expect(routing.notes).toBeTruthy()
    })
  })

  it('serializes public decision events manifest', () => {
    const manifest = serializeReviewDecisionEventManifest()
    expect(manifest.manifest).toContain('review-decision-events')
    expect(manifest.live_decision_events).toBe(0)
    expect(manifest.schema_examples).toHaveLength(7)
    expect(manifest.event_type_definitions).toHaveLength(7)
  })
})
