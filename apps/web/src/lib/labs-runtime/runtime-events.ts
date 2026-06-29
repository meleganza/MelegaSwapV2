import { RuntimeEventType } from './runtime-types'

export const RUNTIME_EVENT_ORDER: RuntimeEventType[] = [
  'narrative_created',
  'narrative_updated',
  'narrative_validated',
  'narrative_rejected',
  'narrative_ready',
  'project_created',
  'asset_planned',
  'metadata_missing',
  'liquidity_waiting',
  'presence_waiting',
  'execution_waiting',
]

export const RUNTIME_EVENT_LABELS: Record<RuntimeEventType, string> = {
  narrative_created: 'Narrative Created',
  narrative_updated: 'Narrative Updated',
  narrative_validated: 'Narrative Validated',
  narrative_rejected: 'Narrative Rejected',
  narrative_ready: 'Narrative Ready',
  project_created: 'Project Created',
  asset_planned: 'Asset Planned',
  metadata_missing: 'Metadata Missing',
  liquidity_waiting: 'Liquidity Waiting',
  presence_waiting: 'Presence Waiting',
  execution_waiting: 'Execution Waiting',
}

export const getRuntimeEventLabel = (id: RuntimeEventType): string => RUNTIME_EVENT_LABELS[id]
