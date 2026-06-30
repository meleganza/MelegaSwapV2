export type ExperienceAuditClassification =
  | 'production_safe'
  | 'read_model_only'
  | 'preview_only'
  | 'retired'
  | 'legacy_risky'
  | 'blocked'

export type HomepageTier = 'core' | 'secondary' | 'advanced' | 'hidden'

export type NavigationRecommendation = 'keep' | 'merge' | 'move' | 'retire' | 'alias' | 'promote'

export interface SurfaceExperienceAudit {
  id: string
  route: string
  purposeClarity: number
  humanUnderstanding: number
  aiUnderstanding: number
  machineDiscoverability: number
  navigationRedundancy: number
  informationDuplication: number
  economicUsefulness: number
  executionUsefulness: number
  needToExist: boolean
  betterMerged?: string
  betterHidden: boolean
  betterPromoted: boolean
  classification: ExperienceAuditClassification
  inGlobalMenu: boolean
  hasManifest: boolean
  manifestUri?: string
  navigationRecommendation: NavigationRecommendation
  findings: string[]
}

export interface JourneyStep {
  step: string
  route?: string
  status: 'clear' | 'broken' | 'missing' | 'indirect'
  notes: string
}

export interface EconomicJourneyAudit {
  persona: string
  steps: JourneyStep[]
  journeyScore: number
  blockers: string[]
}

export interface ExperienceAuditScores {
  humanUx: number
  aiUx: number
  machineReadability: number
  economicFlow: number
  navigation: number
  civilizationConvergence: number
  d87Alignment: number
  overallD87: number
}

export interface AiAgentExperienceAudit {
  manifest: string
  api_version: string
  phase: string
  as_of: string
  audit_type: 'read_only'
  branch_audited: string
  disclaimer: string
  scores: ExperienceAuditScores
  verdict: string
  criticalFindings: string[]
  surfaces: SurfaceExperienceAudit[]
  journeys: EconomicJourneyAudit[]
  homepageTiers: Record<HomepageTier, string[]>
  navigationRecommendations: { surface: string; action: NavigationRecommendation; rationale: string }[]
  surfacesToMerge: string[]
  surfacesToRetire: string[]
  recommendedHomepageArchitecture: string[]
  recommendedMission22: string
}
