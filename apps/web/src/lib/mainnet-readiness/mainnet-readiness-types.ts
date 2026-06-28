export type ReadinessClassification =
  | 'production_safe'
  | 'preview_only'
  | 'read_model_only'
  | 'retired'
  | 'legacy_risky'
  | 'blocked'

export type BranchRisk = 'low' | 'medium' | 'high'

export type GateVerdict = 'conditional_go' | 'blocked' | 'go'

export interface MissionBranchRecord {
  id: string
  branch: string
  mergeOrder: number
  headCommit?: string
  dependsOn: string[]
  risk: BranchRisk
  conflictNotes: string[]
}

export interface SurfaceReadinessRecord {
  id: string
  route: string
  classification: ReadinessClassification
  notes: string
}

export interface ForbiddenFileAudit {
  path: string
  status: 'untouched_missions_09_18' | 'pre_mission_change' | 'unchanged'
  notes: string
}

export interface MainnetReadinessGate {
  manifest: string
  api_version: string
  phase: string
  as_of: string
  verdict: GateVerdict
  audit_type: 'read_only'
  disclaimer: string
  branch_lineage: MissionBranchRecord[]
  recommended_merge_order: string[]
  blockers: string[]
  warnings: string[]
  can_go_live_now: string[]
  must_stay_secondary: string[]
  forbidden_files: ForbiddenFileAudit[]
  surfaces: SurfaceReadinessRecord[]
  routes_added: string[]
  registry_manifests: string[]
  well_known_manifests: string[]
  next_mission: string
}
