import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'

export type ExecutionDimensionId =
  | 'price_quality'
  | 'slippage_risk'
  | 'gas_efficiency'
  | 'liquidity_confidence'
  | 'venue_health'
  | 'canonical_alignment'
  | 'civilization_benefit'

export type ExecutionCandidateStatus = 'recommended' | 'alternative' | 'rejected'

export type ExecutionReasonKind =
  | 'recommendation'
  | 'alternative'
  | 'rejection'
  | 'constraint'
  | 'constitutional'

export interface ExecutionDimensionScore {
  id: ExecutionDimensionId
  label: string
  score: number
  weight: number
  notes: string
}

export interface ExecutionCandidate {
  id: string
  label: string
  venue: string
  chain: string
  illustrative: true
  disclaimer: string
  dimensions: ExecutionDimensionScore[]
}

export interface ExecutionConstraint {
  id: string
  label: string
  rule: string
  enforced: true
}

export interface ExecutionReason {
  id: string
  kind: ExecutionReasonKind
  candidateId?: string
  message: string
}

export interface ExecutionScoreBreakdown {
  candidateId: string
  executionQualityScore: number
  civilizationBenefitScore: number
  compositeRankScore: number
  dimensionScores: ExecutionDimensionScore[]
}

export interface ExecutionRecommendation {
  candidateId: string
  label: string
  venue: string
  chain: string
  executionQualityScore: number
  civilizationBenefitScore: number
  reasons: ExecutionReason[]
}

export interface AlternativeExecution {
  candidateId: string
  label: string
  rank: number
  executionQualityScore: number
  civilizationBenefitScore: number
  gapFromRecommended: number
  reasons: ExecutionReason[]
}

export interface RejectedExecution {
  candidateId: string
  label: string
  reasons: ExecutionReason[]
}

export interface SmartExecutionReadModel {
  asOf: string
  disclaimer: string
  illustrative: true
  constitutional: ConstitutionalCanonicalEconomy
  constraints: ExecutionConstraint[]
  candidates: ExecutionCandidate[]
  scores: ExecutionScoreBreakdown[]
  recommendation: ExecutionRecommendation
  alternatives: AlternativeExecution[]
  rejections: RejectedExecution[]
  reasons: ExecutionReason[]
}

export interface SmartExecutionManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  illustrative: true
  disclaimer: string
  as_of: string
  constitutional: ConstitutionalCanonicalEconomy
  constraints: ExecutionConstraint[]
  recommendation: ExecutionRecommendation
  alternatives: AlternativeExecution[]
  rejections: RejectedExecution[]
  candidates: {
    id: string
    label: string
    venue: string
    chain: string
    illustrative: true
    execution_quality_score: number
    civilization_benefit_score: number
    dimensions: ExecutionDimensionScore[]
  }[]
  reasons: ExecutionReason[]
}
