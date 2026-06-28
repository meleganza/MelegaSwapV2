import {
  ActivationPipelineReadModel,
  ActivationStageId,
  ActivationStageStatus,
  ConstitutionalCanonicalEconomy,
} from 'lib/economic-activation'

export type ActivationEvidenceKind =
  | 'registry'
  | 'manifest'
  | 'labs'
  | 'constitutional'
  | 'presence'
  | 'observation'
  | 'execution'

export interface ActivationEvidenceItem {
  id: string
  kind: ActivationEvidenceKind
  source: string
  summary: string
  href?: string
}

export interface ActivationRuntimeStage {
  id: ActivationStageId
  label: string
  ordinal: number
  state: ActivationStageStatus
  reason: string
  evidence: ActivationEvidenceItem[]
  nextRequirement: string | null
  machineSurface?: string
  href?: string
}

export type ActivationJournalKind = 'observation' | 'gate' | 'requirement' | 'constitutional' | 'progress'

export interface ActivationJournalEntry {
  id: string
  at: string
  stageId: ActivationStageId | 'session'
  kind: ActivationJournalKind
  message: string
  state: ActivationStageStatus | 'RUNTIME'
}

export interface ActivationTimelineEntry {
  id: string
  stageId: ActivationStageId
  label: string
  state: ActivationStageStatus
  ordinal: number
  isCurrentFocus: boolean
  isComplete: boolean
}

export interface ActivationProgress {
  totalStages: number
  readyCount: number
  waitingCount: number
  blockedCount: number
  plannedCount: number
  percentReady: number
  currentFocusStageId: ActivationStageId | null
  phaseLabel: string
}

export interface ActivationSession {
  sessionId: string
  mode: ActivationPipelineReadModel['mode']
  projectSlug?: string
  startedAt: string
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  constitutional: ConstitutionalCanonicalEconomy
  stages: ActivationRuntimeStage[]
  timeline: ActivationTimelineEntry[]
  journal: ActivationJournalEntry[]
  progress: ActivationProgress
}

export interface ActivationRuntimeManifest {
  manifest: string
  api_version: string
  phase: string
  session_id: string
  read_only: true
  execution_enabled: false
  as_of: string
  progress: ActivationProgress
  stages: {
    stage_id: ActivationStageId
    state: ActivationStageStatus
    reason: string
    next_requirement: string | null
    evidence: ActivationEvidenceItem[]
  }[]
  journal_tail: ActivationJournalEntry[]
}
