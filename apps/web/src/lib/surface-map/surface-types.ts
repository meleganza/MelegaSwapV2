export type SurfaceGroupId = 'execute' | 'create' | 'understand' | 'manage'

export type SurfaceStatus = 'live' | 'read_model' | 'legacy' | 'retired' | 'planned'

export type SurfaceVisibility = 'primary' | 'secondary' | 'legacy' | 'hidden'

export type ExecutionRisk = 'none' | 'low' | 'medium' | 'high' | 'on_chain'

export interface SurfaceRecord {
  id: string
  label: string
  route: string
  group: SurfaceGroupId
  status: SurfaceStatus
  humanPurpose: string
  agentPurpose: string
  dataSource: string
  executionRisk: ExecutionRisk
  manifestUri?: string
  replacementRoute?: string
  visibility: SurfaceVisibility
}

export interface SurfaceGroup {
  id: SurfaceGroupId
  label: string
  description: string
  agentSummary: string
}

export interface SurfaceMapReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  groups: SurfaceGroup[]
  surfaces: SurfaceRecord[]
  summary: {
    total: number
    byGroup: Record<SurfaceGroupId, number>
    byStatus: Record<SurfaceStatus, number>
    retired: number
    withManifest: number
  }
}

export interface SurfaceMapManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  groups: SurfaceGroup[]
  surfaces: SurfaceRecord[]
  summary: SurfaceMapReadModel['summary']
}
