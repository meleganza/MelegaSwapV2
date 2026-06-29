import { describe, expect, it } from 'vitest'
import { RUNTIME_EVENT_ORDER } from '../runtime-events'
import { assertRuntimeEventCoverage, getRuntimeEventMapping } from '../runtime-mapping'
import { observeLabsRuntime } from '../runtime-observer'
import { resolveLabsRuntimeReadModel } from '../runtime-read-model'
import { serializeLabsRuntimeManifest } from '../runtime-serializer'

describe('labs runtime connector', () => {
  it('defines all required runtime events', () => {
    assertRuntimeEventCoverage()
    expect(RUNTIME_EVENT_ORDER).toHaveLength(11)
    RUNTIME_EVENT_ORDER.forEach((id) => {
      expect(getRuntimeEventMapping(id)).toBeDefined()
    })
  })

  it('maps every event to pipeline stage and at least one surface', () => {
    RUNTIME_EVENT_ORDER.forEach((id) => {
      const mapping = getRuntimeEventMapping(id)!
      expect(mapping.mapsTo.some((target) => target.kind === 'pipeline_stage')).toBe(true)
      expect(mapping.mapsTo.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('does not fake Labs connection', () => {
    const observation = observeLabsRuntime()
    expect(observation.labsConnected).toBe(false)
    expect(observation.connectionStatus).toBe('waiting')
    expect(observation.lastObserved).toBeNull()
    expect(observation.lastEvent).toBeNull()
  })

  it('exposes read model without fake narratives or events', () => {
    const model = resolveLabsRuntimeReadModel()
    expect(model.labsConnected).toBe(false)
    expect(model.observedNarratives).toHaveLength(0)
    expect(model.recentEvents).toHaveLength(0)
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
  })

  it('synchronizes pipeline state with waiting sync when disconnected', () => {
    const model = resolveLabsRuntimeReadModel()
    expect(model.pipelineState).toHaveLength(10)
    model.pipelineState.forEach((stage) => {
      if (stage.pipelineStatus === 'ready') {
        expect(stage.syncStatus).toBe('ready')
      } else {
        expect(stage.syncStatus).toBe('waiting')
      }
    })
  })

  it('includes pending requirements and blocked reasons', () => {
    const model = resolveLabsRuntimeReadModel()
    expect(model.pendingRequirements.length).toBeGreaterThan(0)
    expect(model.blockedReasons.some((reason) => reason.includes('not connected'))).toBe(true)
    expect(model.futureActions.length).toBeGreaterThan(0)
  })

  it('serializes public labs runtime manifest', () => {
    const manifest = serializeLabsRuntimeManifest()
    expect(manifest.manifest).toContain('labs-runtime')
    expect(manifest.labs_connected).toBe(false)
    expect(manifest.event_definitions).toHaveLength(11)
    expect(manifest.read_only).toBe(true)
  })
})
