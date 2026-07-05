import { RUNTIME_EVENT_LABELS } from './runtime-events'
import { RuntimeEventDefinition, RuntimeEventType, RuntimeMappingTarget } from './runtime-types'

const pipeline = (stageId: string, label: string): RuntimeMappingTarget => ({
  kind: 'pipeline_stage',
  id: stageId,
  label: `Pipeline: ${label}`,
  route: '/pipeline',
  manifestUri: '/registry/pipeline/labs-economic-pipeline.json',
})

const workspace = (): RuntimeMappingTarget => ({
  kind: 'workspace',
  id: 'workspace',
  label: 'Workspace',
  route: '/command-center',
  manifestUri: '/registry/workspace/index.json',
})

const launch = (): RuntimeMappingTarget => ({
  kind: 'launch',
  id: 'launch',
  label: 'Launch',
  route: '/build-studio#build-import',
  manifestUri: '/registry/launch/index.json',
})

const projectRegistry = (): RuntimeMappingTarget => ({
  kind: 'project_registry',
  id: 'project_registry',
  label: 'Project Registry',
  route: '/projects',
  manifestUri: '/registry/projects/index.json',
})

const assetRegistry = (): RuntimeMappingTarget => ({
  kind: 'asset_registry',
  id: 'asset_registry',
  label: 'Asset Registry',
  route: '/assets',
  manifestUri: '/registry/assets/index.json',
})

const presence = (): RuntimeMappingTarget => ({
  kind: 'presence',
  id: 'presence',
  label: 'Presence',
  route: '/presence',
  manifestUri: '/registry/presence/index.json',
})

const execution = (): RuntimeMappingTarget => ({
  kind: 'execution',
  id: 'execution',
  label: 'Execution',
  route: '/execution',
  manifestUri: '/registry/execution/index.json',
})

const event = (
  id: RuntimeEventType,
  description: string,
  mapsTo: RuntimeMappingTarget[],
): RuntimeEventDefinition => ({
  id,
  label: RUNTIME_EVENT_LABELS[id],
  description,
  mapsTo: mapsTo.map((target) => ({ ...target })),
})

export const RUNTIME_EVENT_MAPPINGS: RuntimeEventDefinition[] = [
  event('narrative_created', 'Labs emits when a new project narrative draft is created.', [
    pipeline('narrative', 'Narrative'),
    launch(),
    workspace(),
  ]),
  event('narrative_updated', 'Labs emits when narrative content or metadata changes.', [
    pipeline('narrative', 'Narrative'),
    launch(),
  ]),
  event('narrative_validated', 'Labs constitutional validation passed — ready for registry binding.', [
    pipeline('validation', 'Validation'),
    pipeline('project', 'Project'),
    projectRegistry(),
    launch(),
  ]),
  event('narrative_rejected', 'Labs validation failed — pipeline stage blocked until narrative is revised.', [
    pipeline('validation', 'Validation'),
    pipeline('narrative', 'Narrative'),
    launch(),
  ]),
  event('narrative_ready', 'Narrative approved for economic indexing handoff.', [
    pipeline('validation', 'Validation'),
    pipeline('project', 'Project'),
    projectRegistry(),
    workspace(),
  ]),
  event('project_created', 'Indexed project identity bound after validation.', [
    pipeline('project', 'Project'),
    projectRegistry(),
    workspace(),
    launch(),
  ]),
  event('asset_planned', 'Asset binding planned — UAI assignment pending registry write.', [
    pipeline('asset', 'Asset'),
    assetRegistry(),
    projectRegistry(),
    launch(),
  ]),
  event('metadata_missing', 'Required metadata not indexed — surfaces as not_indexed in pipeline.', [
    pipeline('metadata', 'Metadata'),
    assetRegistry(),
    launch(),
  ]),
  event('liquidity_waiting', 'On-chain liquidity not provisioned — waiting for wallet action via /add.', [
    pipeline('liquidity', 'Liquidity'),
    launch(),
    workspace(),
  ]),
  event('presence_waiting', 'Economic presence targets staged but not fully synchronized.', [
    pipeline('presence', 'Presence'),
    presence(),
    workspace(),
    projectRegistry(),
  ]),
  event('execution_waiting', 'Execution decision layer not ready — illustrative /execution only.', [
    pipeline('execution', 'Execution'),
    execution(),
    workspace(),
  ]),
]

import { RUNTIME_EVENT_ORDER } from './runtime-events'

export const getRuntimeEventMapping = (id: RuntimeEventType): RuntimeEventDefinition | undefined =>
  RUNTIME_EVENT_MAPPINGS.find((definition) => definition.id === id)

export const assertRuntimeEventCoverage = (): void => {
  RUNTIME_EVENT_ORDER.forEach((id) => {
    if (!getRuntimeEventMapping(id)) {
      throw new Error(`Missing runtime event mapping: ${id}`)
    }
  })
}
