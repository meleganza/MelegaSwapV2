import { describe, expect, it } from 'vitest'
import { analyzeEconomicState } from '../orchestrator-analysis'
import { buildRecommendations } from '../orchestrator-recommendations'
import { ORCHESTRATOR_RULES } from '../orchestrator-rules'
import { resolveEconomicOrchestratorReadModel } from '../orchestrator-read-model'
import { serializeEconomicOrchestratorManifest } from '../orchestrator-serializer'

describe('economic orchestrator', () => {
  it('ingests all required Economic OS inputs', () => {
    const ctx = analyzeEconomicState()
    const inputIds = ctx.inputs.map((input) => input.id)
    expect(inputIds).toContain('pipeline')
    expect(inputIds).toContain('workspace')
    expect(inputIds).toContain('launch')
    expect(inputIds).toContain('projects')
    expect(inputIds).toContain('assets')
    expect(inputIds).toContain('presence')
    expect(inputIds).toContain('execution')
    expect(inputIds).toContain('identity')
    expect(inputIds).toContain('labs_runtime')
  })

  it('does not emit fake recommendations when Labs is disconnected', () => {
    const model = resolveEconomicOrchestratorReadModel()
    expect(model.currentState.labsConnected).toBe(false)
    const labsRec = model.recommendations.find((rec) => rec.id === 'labs_runtime_waiting')
    expect(labsRec).toBeDefined()
    expect(labsRec?.status).toBe('waiting')
  })

  it('recommends launch for liquidity when asset ready and liquidity waiting', () => {
    const recommendations = buildRecommendations()
    const liquidityRec = recommendations.find((rec) => rec.id === 'asset_ready_liquidity_missing')
    expect(liquidityRec).toBeDefined()
    expect(liquidityRec?.targetRoute).toBe('/launch')
    expect(liquidityRec?.priority).toBe('high')
  })

  it('recommends execution review when presence ready and execution planned', () => {
    const recommendations = buildRecommendations()
    const executionRec = recommendations.find((rec) => rec.id === 'presence_ready_execution_waiting')
    expect(executionRec).toBeDefined()
    expect(executionRec?.targetRoute).toBe('/execution')
    expect(executionRec?.status).toBe('planned')
  })

  it('marks metadata recommendation as not_indexed when evidence missing', () => {
    const recommendations = buildRecommendations()
    const metadataRec = recommendations.find((rec) => rec.id === 'metadata_not_indexed')
    expect(metadataRec).toBeDefined()
    expect(metadataRec?.status).toBe('not_indexed')
  })

  it('defines orchestrator rules with human and AI actions', () => {
    expect(ORCHESTRATOR_RULES.length).toBeGreaterThanOrEqual(8)
    ORCHESTRATOR_RULES.forEach((rule) => {
      const ctx = analyzeEconomicState()
      if (rule.when(ctx)) {
        const recommendation = rule.build(ctx)
        expect(recommendation.humanAction).toBeTruthy()
        expect(recommendation.aiAction).toBeTruthy()
        expect(recommendation.targetRoute.startsWith('/')).toBe(true)
      }
    })
  })

  it('is read-only with execution disabled', () => {
    const model = resolveEconomicOrchestratorReadModel()
    expect(model.readOnly).toBe(true)
    expect(model.executionEnabled).toBe(false)
    expect(model.dependencyGraph.length).toBe(10)
    expect(model.nextActions.length).toBeGreaterThan(0)
  })

  it('serializes public orchestrator manifest', () => {
    const manifest = serializeEconomicOrchestratorManifest()
    expect(manifest.manifest).toContain('economic-orchestrator')
    expect(manifest.read_only).toBe(true)
    expect(manifest.recommendations.length).toBeGreaterThan(0)
  })
})
