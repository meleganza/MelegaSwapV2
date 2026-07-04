export type PendingProjectStatus =
  | 'discovered'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'canonical'
  | 'archived'

export type ProvenanceSource =
  | 'onchain'
  | 'ai_discovery'
  | 'owner_submission'
  | 'manual_review'
  | 'registry_import'

export interface ProvenanceField<T = string> {
  value: T | null
  available: boolean
  source: ProvenanceSource
  observed_at: string
  confidence?: number
  notes?: string
}

export interface PendingProjectSocials {
  twitter?: ProvenanceField
  telegram?: ProvenanceField
  discord?: ProvenanceField
  github?: ProvenanceField
}

export interface PendingProjectHealth {
  readiness_score: number
  identity_completeness: number
  review_ready: boolean
  missing_fields: string[]
}

export interface PendingProjectReview {
  state: PendingProjectStatus
  reviewed_at?: string
  reviewed_by?: string
  review_notes?: string
}

/** Non-canonical project profile — pending human approval before registry promotion. */
export interface PendingProjectRecord {
  schema: 'melega.project-profile.pending.v1'
  id: string
  contract: string
  chain: number
  name: ProvenanceField
  symbol: ProvenanceField
  logo: ProvenanceField
  website: ProvenanceField
  socials: PendingProjectSocials
  category: ProvenanceField
  description_ai: ProvenanceField
  description_owner: ProvenanceField
  sources: ProvenanceField<string[]>
  health: PendingProjectHealth
  rating: ProvenanceField<number>
  status: PendingProjectStatus
  is_canonical: false
  created_at: string
  updated_at: string
  review: PendingProjectReview
}

export interface CanonicalPromotionCandidate {
  pending_id: string
  slug: string
  requires_manual_registry_write: true
  note: string
}
