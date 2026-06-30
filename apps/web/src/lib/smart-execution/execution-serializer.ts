import { stripUndefinedDeep } from 'registry/venues/manifest'
import { SMART_EXECUTION_VERSION } from './execution-constraints'
import { SmartExecutionManifest, SmartExecutionReadModel } from './execution-types'

export const serializeSmartExecutionManifest = (
  model: SmartExecutionReadModel,
): SmartExecutionManifest => {
  const manifest: SmartExecutionManifest = {
    manifest: 'manifest://melega/platform/smart-execution@0.1.0',
    api_version: SMART_EXECUTION_VERSION,
    phase: 'smart_execution_read_model',
    read_only: true,
    execution_enabled: false,
    illustrative: true,
    disclaimer: model.disclaimer,
    as_of: model.asOf,
    constitutional: model.constitutional,
    constraints: model.constraints,
    recommendation: model.recommendation,
    alternatives: model.alternatives,
    rejections: model.rejections,
    candidates: model.scores.map((score) => {
      const candidate = model.candidates.find((entry) => entry.id === score.candidateId)!
      return {
        id: candidate.id,
        label: candidate.label,
        venue: candidate.venue,
        chain: candidate.chain,
        illustrative: true as const,
        execution_quality_score: score.executionQualityScore,
        civilization_benefit_score: score.civilizationBenefitScore,
        dimensions: score.dimensionScores,
      }
    }),
    reasons: model.reasons,
  }

  return stripUndefinedDeep(manifest) as SmartExecutionManifest
}
