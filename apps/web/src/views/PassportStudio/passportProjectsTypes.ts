/**
 * PASSPORT_MODULE_004 — My Projects view-model contract.
 * Never infer ownership from token holdings. Never invent status/role.
 */

export type PassportProjectStatus =
  | 'Draft'
  | 'Presale'
  | 'Listed'
  | 'Live'
  | 'Paused'
  | 'Suspended'
  | 'Archived'
  | 'Review Required'

export type PassportProjectRole = 'Owner' | 'Co-Owner' | 'Admin' | 'Contributor' | 'Viewer'

export type PassportProjectActionKind = 'manage' | 'open' | 'view' | 'continue_setup'

export type PassportProjectKpiKind = 'market_cap' | 'holders' | 'tvl' | 'campaign'

export type PassportProjectCardModel = {
  id: string
  name: string
  category: string
  status: PassportProjectStatus
  role: PassportProjectRole
  kpiKind: PassportProjectKpiKind
  kpiLabel: string
  kpiValue: string
  logoLabel: string
  actionKind: PassportProjectActionKind
  actionLabel: string
  actionHref: string
}

export type PassportProjectsViewModel = {
  loading: boolean
  walletConnected: boolean
  sourceAvailable: boolean
  projects: readonly PassportProjectCardModel[]
  emptyExplanation: string
  createHref: '/list?intent=create-project'
}

export const PROJECTS_CREATE_HREF = '/list?intent=create-project' as const
export const PROJECTS_KPI_UNAVAILABLE = '—' as const
