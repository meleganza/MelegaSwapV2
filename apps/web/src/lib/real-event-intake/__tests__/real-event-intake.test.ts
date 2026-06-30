import { describe, expect, it } from 'vitest'
import { EVENT_FAMILY_DEFINITIONS } from '../event-intake-schema'
import { EVENT_INTAKE_ROUTING_RULES } from '../event-intake-routing'
import { EVENT_INTAKE_SAFETY_GATES, GLOBAL_INTAKE_SAFETY_RULES } from '../event-intake-safety'
import { EVENT_INTAKE_VALIDATION_RULES } from '../event-intake-validation'
import { resolveRealEventIntakeReadModel, SCHEMA_EXAMPLE_EVENTS } from '../event-intake-read-model'
import { serializeRealEventIntakeManifest } from '../event-intake-serializer'

describe('real event intake spec', () => {
  it('defines eight canonical event families', () => {
    expect(EVENT_FAMILY_DEFINITIONS).toHaveLength(8)
    const ids = EVENT_FAMILY_DEFINITIONS.map((family) => family.id)
    expect(ids).toContain('labs_narrative')
    expect(ids).toContain('orchestrator_recommendation')
  })

  it('defines validation rules per family with forbidden execution fields', () => {
    expect(EVENT_INTAKE_VALIDATION_RULES).toHaveLength(8)
    const liquidity = EVENT_INTAKE_VALIDATION_RULES.find((rule) => rule.family === 'liquidity_readiness')!
    expect(liquidity.forbiddenFields).toContain('signed_tx')
    expect(liquidity.forbiddenFields).toContain('router_execute')
  })

  it('routes families to orchestrator pipeline and runtime surfaces', () => {
    const narrative = EVENT_INTAKE_ROUTING_RULES.find((rule) => rule.family === 'labs_narrative')!
    expect(narrative.targets).toContain('/runtime/labs')
    expect(narrative.targets).toContain('/pipeline')
    expect(narrative.targets).toContain('/orchestrator')
  })

  it('blocks execution triggers from intake safety gates', () => {
    EVENT_INTAKE_SAFETY_GATES.forEach((gate) => {
      expect(gate.blocksExecution).toBe(true)
    })
    expect(GLOBAL_INTAKE_SAFETY_RULES.some((rule) => rule.includes('No blockchain writes'))).toBe(true)
  })

  it('seeds schema examples only — no live events', () => {
    const model = resolveRealEventIntakeReadModel()
    expect(model.liveEventsIndexed).toBe(0)
    expect(model.schemaExamples).toHaveLength(8)
    model.schemaExamples.forEach((event) => {
      expect(event.sampleKind).toBe('schema_example')
      expect(event.timestamp).toBe('not_indexed')
      expect(event.eventId.startsWith('schema://')).toBe(true)
    })
  })

  it('includes full event record fields on schema examples', () => {
    SCHEMA_EXAMPLE_EVENTS.forEach((event) => {
      expect(event.eventFamily).toBeTruthy()
      expect(event.eventType).toBeTruthy()
      expect(event.sourceSurface).toBeTruthy()
      expect(event.sourceSystem).toBeTruthy()
      expect(event.routingTargets.length).toBeGreaterThan(0)
      expect(event.safetyClassification).toBeTruthy()
      expect(event.resultingReadModelUpdates.length).toBeGreaterThan(0)
    })
  })

  it('is read-only with no persistence or execution', () => {
    const model = resolveRealEventIntakeReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
    expect(model.persistenceEnabled).toBe(false)
  })

  it('serializes public intake manifest', () => {
    const manifest = serializeRealEventIntakeManifest()
    expect(manifest.manifest).toContain('real-event-intake')
    expect(manifest.live_events_indexed).toBe(0)
    expect(manifest.schema_examples).toHaveLength(8)
  })
})
