import { EventIntakeFamily } from 'lib/real-event-intake/event-intake-types'

export type SubmissionValidationStatus = 'valid' | 'invalid' | 'pending' | 'not_indexed'

export type SubmissionReviewStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'blocked'
  | 'not_indexed'

export type SubmissionSafetyClassification =
  | 'observation_only'
  | 'human_review_required'
  | 'blocked'
  | 'future_execution'

export type SubmissionCategoryId =
  | 'token_metadata'
  | 'token_logo'
  | 'website'
  | 'social_links'
  | 'project_narrative'
  | 'whitepaper'
  | 'audit_reference'
  | 'category_classification'
  | 'economic_presence_request'
  | 'launch_request'
  | 'future_ai_review'

export type SubmissionSource = 'human' | 'ai_agent' | 'labs_handoff' | 'schema_example'

export type SubmissionSampleKind = 'schema_example' | 'not_indexed'

export interface SubmissionFieldDefinition {
  id: string
  label: string
  required: boolean
  type: string
  notes?: string
}

export interface SubmissionCategoryDefinition {
  id: SubmissionCategoryId
  label: string
  description: string
  targetSurface: string
  targetRegistry: string
  targetRegistryManifest: string
  requiredFields: SubmissionFieldDefinition[]
  optionalFields: SubmissionFieldDefinition[]
  defaultSafety: SubmissionSafetyClassification
  resultingEventIntakeFamily: EventIntakeFamily
  resultingRegistryTarget: string
  humanReviewerAction: string
  aiReviewerAction: string
}

export interface SubmissionValidationRule {
  id: string
  category: SubmissionCategoryId
  description: string
  requiredFieldIds: string[]
  forbiddenPayloadKeys: string[]
  onMissing: SubmissionValidationStatus
  onForbidden: SubmissionValidationStatus
}

export interface SubmissionReviewGate {
  id: string
  status: SubmissionReviewStatus
  description: string
  allowsRegistryMutation: boolean
  requiresHumanReviewer: boolean
}

export interface EconomicSubmissionRecord {
  submissionId: string
  category: SubmissionCategoryId
  source: SubmissionSource
  sampleKind: SubmissionSampleKind
  targetSurface: string
  targetRegistry: string
  requiredFields: string[]
  optionalFields: string[]
  validationStatus: SubmissionValidationStatus
  reviewStatus: SubmissionReviewStatus
  safetyClassification: SubmissionSafetyClassification
  missingFields: string[]
  nextAction: string
  humanReviewerAction: string
  aiReviewerAction: string
  resultingEventIntakeFamily: EventIntakeFamily
  resultingRegistryTarget: string
  blockedReason?: string
}

export interface EconomicSubmissionReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  persistenceEnabled: false
  phase: string
  categories: SubmissionCategoryDefinition[]
  validationRules: SubmissionValidationRule[]
  reviewGates: SubmissionReviewGate[]
  schemaExamples: EconomicSubmissionRecord[]
  liveSubmissionsIndexed: number
  crossLinks: Array<{ label: string; route: string }>
}

export interface EconomicSubmissionManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  persistence_enabled: false
  as_of: string
  disclaimer: string
  categories: SubmissionCategoryDefinition[]
  validation_rules: SubmissionValidationRule[]
  review_gates: SubmissionReviewGate[]
  schema_examples: EconomicSubmissionRecord[]
  live_submissions_indexed: number
  cross_links: EconomicSubmissionReadModel['crossLinks']
}
