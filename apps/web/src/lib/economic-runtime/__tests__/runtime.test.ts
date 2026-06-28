import { describe, expect, it } from 'vitest'
import { resolveLabsActivationPreview, resolveActivationForProject } from 'lib/economic-activation'
import {
  createActivationSession,
  resolveActivationSession,
  serializeActivationRuntime,
  buildRuntimeStages,
} from '../index'

describe('economic activation runtime', () => {
  it('creates labs preview session without fake projects', () => {
    const session = resolveActivationSession()
    expect(session.readOnly).toBe(true)
    expect(session.executionEnabled).toBe(false)
    expect(session.mode).toBe('labs_preview')
    expect(session.projectSlug).toBeUndefined()
    expect(session.sessionId).toBe('activation:labs_preview')
    expect(session.stages).toHaveLength(11)
  })

  it('exposes state, evidence, reason, and next requirement per stage', () => {
    const session = createActivationSession(resolveLabsActivationPreview())
    const narrative = session.stages.find((stage) => stage.id === 'narrative')
    const validation = session.stages.find((stage) => stage.id === 'validation')

    expect(narrative?.state).toBe('WAITING')
    expect(narrative?.reason).toBeTruthy()
    expect(narrative?.evidence.length).toBeGreaterThan(0)
    expect(narrative?.nextRequirement).toContain('Labs')

    expect(validation?.state).toBe('BLOCKED')
    expect(validation?.nextRequirement).toContain('Narrative')
  })

  it('builds timeline with current focus on first non-ready stage', () => {
    const session = resolveActivationSession()
    const focus = session.timeline.find((entry) => entry.isCurrentFocus)
    expect(focus?.stageId).toBe('narrative')
    expect(session.progress.currentFocusStageId).toBe('narrative')
  })

  it('records journal observations without execution', () => {
    const session = resolveActivationSession()
    expect(session.journal.some((entry) => entry.kind === 'constitutional')).toBe(true)
    expect(session.journal.some((entry) => entry.kind === 'requirement')).toBe(true)
    expect(session.journal.every((entry) => entry.state !== 'EXECUTING')).toBe(true)
  })

  it('derives melega-dex runtime from registry', () => {
    const session = resolveActivationSession({ projectSlug: 'melega-dex' })
    expect(session.mode).toBe('project_derived')
    expect(session.progress.readyCount).toBeGreaterThan(3)
    const registry = session.stages.find((stage) => stage.id === 'project_registry')
    expect(registry?.state).toBe('READY')
    expect(registry?.nextRequirement).toBeNull()
  })

  it('includes phase 2 evidence for treasury radar space smartdrop', () => {
    const stages = buildRuntimeStages(resolveActivationForProject('melega-dex')!)
    const treasury = stages.find((stage) => stage.id === 'treasury_runtime')
    expect(treasury?.evidence.some((item) => item.kind === 'manifest')).toBe(true)
    expect(treasury?.nextRequirement).toContain('Phase 2')
  })

  it('serializes runtime manifest as read-only', () => {
    const manifest = serializeActivationRuntime(resolveActivationSession())
    expect(manifest.manifest).toContain('economic-runtime')
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
    expect(manifest.stages).toHaveLength(11)
  })
})
