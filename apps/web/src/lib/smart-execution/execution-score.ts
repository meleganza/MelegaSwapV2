import {
  CIVILIZATION_DIMENSION,
  EXECUTION_QUALITY_DIMENSIONS,
} from './execution-constraints'
import { ExecutionCandidate, ExecutionDimensionId, ExecutionScoreBreakdown } from './execution-types'

const isExecutionQualityDimension = (id: ExecutionDimensionId): boolean =>
  (EXECUTION_QUALITY_DIMENSIONS as readonly string[]).includes(id)

const weightedAverage = (
  dimensions: ExecutionCandidate['dimensions'],
  filter: (id: ExecutionDimensionId) => boolean,
): number => {
  const filtered = dimensions.filter((dimension) => filter(dimension.id))
  if (filtered.length === 0) return 0

  const totalWeight = filtered.reduce((sum, dimension) => sum + dimension.weight, 0)
  if (totalWeight === 0) {
    return Math.round(filtered.reduce((sum, dimension) => sum + dimension.score, 0) / filtered.length)
  }

  const weighted = filtered.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0)
  return Math.round(weighted / totalWeight)
}

export const computeExecutionQualityScore = (candidate: ExecutionCandidate): number =>
  weightedAverage(candidate.dimensions, isExecutionQualityDimension)

export const computeCivilizationBenefitScore = (candidate: ExecutionCandidate): number => {
  const civilization = candidate.dimensions.find((dimension) => dimension.id === CIVILIZATION_DIMENSION)
  return civilization?.score ?? 0
}

export const computeScoreBreakdown = (candidate: ExecutionCandidate): ExecutionScoreBreakdown => {
  const executionQualityScore = computeExecutionQualityScore(candidate)
  const civilizationBenefitScore = computeCivilizationBenefitScore(candidate)

  return {
    candidateId: candidate.id,
    executionQualityScore,
    civilizationBenefitScore,
    compositeRankScore: executionQualityScore,
    dimensionScores: candidate.dimensions.map((dimension) => ({ ...dimension })),
  }
}

export const computeAllScoreBreakdowns = (candidates: ExecutionCandidate[]): ExecutionScoreBreakdown[] =>
  candidates.map(computeScoreBreakdown)

export const getVenueHealthScore = (candidate: ExecutionCandidate): number =>
  candidate.dimensions.find((dimension) => dimension.id === 'venue_health')?.score ?? 0
