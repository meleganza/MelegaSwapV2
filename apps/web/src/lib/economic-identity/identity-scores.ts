import { AgentReadinessScore, IdentityReadModelSection, IdentitySurfaceStatus } from './identity-types'

const statusContribution = (status: IdentitySurfaceStatus): number => {
  switch (status) {
    case 'indexed':
      return 1
    case 'available':
      return 0.75
    case 'planned':
      return 0.35
    case 'not_indexed':
    default:
      return 0
  }
}

const labelFromScore = (score: number): AgentReadinessScore['label'] => {
  if (score >= 75) return 'agent_ready_planned'
  if (score >= 50) return 'operator_candidate'
  if (score >= 25) return 'surface_aware'
  return 'observer'
}

export const computeAgentReadinessScore = (
  sections: IdentityReadModelSection[],
): AgentReadinessScore => {
  const dimensions = sections.map((section) => {
    const weight = 1
    const contribution = Math.round(statusContribution(section.status) * weight * 100) / 100
    return {
      id: section.id,
      label: section.label,
      status: section.status,
      weight,
      contribution,
    }
  })

  const totalWeight = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0)
  const weightedSum = dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0)
  const raw = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0
  const score = Math.round(raw)

  return {
    score,
    label: labelFromScore(score),
    maxScore: 100,
    illustrative: true,
    dimensions,
    notes:
      'Illustrative agent-readiness from indexed economic surfaces only — not wallet-verified, not on-chain.',
  }
}
