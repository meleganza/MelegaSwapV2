export type LegacySurfaceStatus = 'retired' | 'superseded' | 'historical'

export interface LegacySurfaceSupersession {
  route: string
  label: string
  purpose: string
}

export interface LegacySurfaceRecord {
  id: string
  legacyRoute: string
  label: string
  status: LegacySurfaceStatus
  retiredAsOf: string
  summary: string
  historicalModule: string
  contractLogicUntouched: true
  supersededBy: LegacySurfaceSupersession[]
  warnings: string[]
}

export interface LegacyIloRetirementManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  legacy_route: string
  status: LegacySurfaceStatus
  surface: LegacySurfaceRecord
}
