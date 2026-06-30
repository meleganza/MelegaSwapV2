import { describe, expect, it } from 'vitest'
import { DRY_RUN_FLOW_STEPS, CIVILIZATION_DRY_RUN_FLOW } from '../dry-run-flow'
import {
  FORBIDDEN_DRY_RUN_ACTIONS,
  DRY_RUN_VALIDATION_RULES,
  validateDryRunScenario,
} from '../dry-run-validation'
import {
  MARCO_ECONOMY_NARRATIVE_DRY_RUN,
  resolveCivilizationDryRunReadModel,
} from '../dry-run-read-model'
import { DRY_RUN_RECORD_FLAGS, MARCO_ECONOMY_NARRATIVE_DRY_RUN_ID } from '../dry-run-scenario'
import { serializeCivilizationDryRunManifest } from '../dry-run-serializer'

describe('civilization dry run', () => {
  it('defines marco-economy-narrative-dry-run seed scenario', () => {
    expect(MARCO_ECONOMY_NARRATIVE_DRY_RUN.id).toBe(MARCO_ECONOMY_NARRATIVE_DRY_RUN_ID)
    expect(MARCO_ECONOMY_NARRATIVE_DRY_RUN.narrative.title).toBeTruthy()
    expect(MARCO_ECONOMY_NARRATIVE_DRY_RUN.narrative.summary).toBeTruthy()
  })

  it('covers full civilization flow in order', () => {
    expect(CIVILIZATION_DRY_RUN_FLOW).toEqual([
      'narrative',
      'submission',
      'review_queue',
      'decision_event',
      'intake',
      'pipeline',
      'runtime',
      'orchestrator',
      'workspace',
    ])
    expect(DRY_RUN_FLOW_STEPS).toHaveLength(9)
  })

  it('marks all records with required safety flags', () => {
    const scenario = MARCO_ECONOMY_NARRATIVE_DRY_RUN
    const records = [
      scenario.narrative,
      scenario.submission,
      scenario.review,
      scenario.decisionEvent,
      scenario.intake,
      scenario.runtimeEffect,
      scenario.orchestratorEffect,
      scenario.workspaceEffect,
      scenario,
      ...scenario.pipelineEffects,
    ]
    records.forEach((record) => {
      expect(record.flags).toEqual(DRY_RUN_RECORD_FLAGS)
    })
  })

  it('includes all required scenario mappings', () => {
    const s = MARCO_ECONOMY_NARRATIVE_DRY_RUN
    expect(s.submission.submissionCategory).toBe('project_narrative')
    expect(s.review.reviewQueueGroup).toBe('waiting_review')
    expect(s.decisionEvent.decisionEventType).toBe('review_deferred')
    expect(s.intake.intakeEventFamily).toBe('labs_narrative')
    expect(s.pipelineEffects.length).toBeGreaterThan(0)
    expect(s.runtimeEffect.labsConnected).toBe(false)
    expect(s.orchestratorEffect.effect).toBeTruthy()
    expect(s.workspaceEffect.visibility).toBe('schema_example_only')
    expect(s.finalVerdict).toBe('partial')
  })

  it('does not fake approvals or live execution', () => {
    expect(validateDryRunScenario(MARCO_ECONOMY_NARRATIVE_DRY_RUN).valid).toBe(true)
    expect(MARCO_ECONOMY_NARRATIVE_DRY_RUN.decisionEvent.decisionEventType).not.toBe('review_approved')

    const model = resolveCivilizationDryRunReadModel()
    expect(model.liveDryRuns).toBe(0)
    expect(model.persistenceEnabled).toBe(false)
    expect(model.executionEnabled).toBe(false)
  })

  it('defines validation rules and forbidden actions', () => {
    expect(DRY_RUN_VALIDATION_RULES.length).toBeGreaterThan(0)
    expect(FORBIDDEN_DRY_RUN_ACTIONS).toContain('registry_write')
    expect(FORBIDDEN_DRY_RUN_ACTIONS).toContain('auto_approve')
  })

  it('rejects scenarios with fake approval', () => {
    const invalid = {
      ...MARCO_ECONOMY_NARRATIVE_DRY_RUN,
      decisionEvent: {
        ...MARCO_ECONOMY_NARRATIVE_DRY_RUN.decisionEvent,
        decisionEventType: 'review_approved' as const,
      },
    }
    expect(validateDryRunScenario(invalid).valid).toBe(false)
  })

  it('serializes public dry run manifest', () => {
    const manifest = serializeCivilizationDryRunManifest()
    expect(manifest.manifest).toContain('civilization-dry-run')
    expect(manifest.live_dry_runs).toBe(0)
    expect(manifest.scenarios).toHaveLength(1)
    expect(manifest.flow).toHaveLength(9)
  })
})
