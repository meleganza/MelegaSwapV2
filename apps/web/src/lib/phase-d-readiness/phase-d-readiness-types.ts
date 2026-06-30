export type PhaseDConsolidationVerdict = 'release_candidate' | 'blocked' | 'not_indexed'

export type PhaseDMissionId =
  | 'mission22'
  | 'mission23'
  | 'mission24'
  | 'mission25'
  | 'mission26'
  | 'mission27'
  | 'mission28'
  | 'mission29'
  | 'mission30'
  | 'mission31'

export interface PhaseDMissionLineageRecord {
  id: PhaseDMissionId
  mission: number
  title: string
  branch: string
  headCommit: string
  route?: string
  manifestUri?: string
}

export interface PhaseDRouteRecord {
  route: string
  pagePath: string
  phase: 'phase_d' | 'legacy_dex' | 'shared'
  verified: true
}

export interface PhaseDManifestRecord {
  uri: string
  mission: PhaseDMissionId | 'consolidation'
  verified: true
}

export interface ForbiddenFileRecord {
  path: string
  unchangedFromBase: true
  baseCommit: string
}

export interface PhaseDConsolidationGate {
  gate: string
  api_version: string
  phase: string
  as_of: string
  disclaimer: string
  read_only: true
  execution_enabled: false
  registry_mutation_enabled: false
  verdict: PhaseDConsolidationVerdict
  base_branch: string
  consolidation_branch: string
  lineage: PhaseDMissionLineageRecord[]
  routes: PhaseDRouteRecord[]
  manifests: PhaseDManifestRecord[]
  forbidden_files: ForbiddenFileRecord[]
  validation: {
    mission_tests: string
    build: string
    routes: string
    manifests: string
    forbidden_files: string
  }
}

export interface PhaseDReadinessReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  registryMutationEnabled: false
  phase: string
  verdict: PhaseDConsolidationVerdict
  baseBranch: string
  consolidationBranch: string
  lineage: PhaseDMissionLineageRecord[]
  routes: PhaseDRouteRecord[]
  manifests: PhaseDManifestRecord[]
  forbiddenFiles: ForbiddenFileRecord[]
}
