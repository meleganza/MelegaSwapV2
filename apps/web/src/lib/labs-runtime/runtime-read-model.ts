import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { buildDefaultPipeline } from 'lib/labs-economic-pipeline'
import { PipelineStageId } from 'lib/labs-economic-pipeline/pipeline-types'
import { RUNTIME_EVENT_MAPPINGS, assertRuntimeEventCoverage } from './runtime-mapping'
import { observeLabsRuntime } from './runtime-observer'
import { LABS_RUNTIME_ENDPOINT, LABS_RUNTIME_SESSION_ID } from './runtime-session'
import {
  LabsRuntimeReadModel,
  ObservedNarrative,
  ObservedRuntimeEvent,
  PipelineSyncState,
  RuntimeAction,
  RuntimeRequirement,
  RuntimeStatus,
} from './runtime-types'

export { LABS_RUNTIME_ENDPOINT, LABS_RUNTIME_SESSION_ID }

export const LABS_RUNTIME_VERSION = '0.1.0'

export const LABS_RUNTIME_AS_OF = '2026-06-29'

export const LABS_RUNTIME_DISCLAIMER =
  'Labs Runtime Connector (Mission 24) — observation and synchronization read model only. No blockchain writes, token deployment, or liquidity execution. Labs unavailable surfaces as waiting or not_indexed — no fake connection or narratives.'

export const LABS_RUNTIME_CROSS_LINKS = [
  { label: 'Labs Pipeline', route: '/pipeline' },
  { label: 'Workspace', route: '/command-center' },
  { label: 'Launch', route: '/build-studio#build-import' },
  { label: 'Surface Map', route: '/map' },
  { label: 'Activation Preview', route: '/new-project' },
]

const buildPipelineSyncState = (labsConnected: boolean): PipelineSyncState[] => {
  const pipeline = buildDefaultPipeline()

  return pipeline.stages.map((stage) => {
    const pipelineStatus = stage.status as RuntimeStatus
    const syncStatus: RuntimeStatus = labsConnected
      ? pipelineStatus
      : pipelineStatus === 'ready'
        ? 'ready'
        : 'waiting'

    return {
      stageId: stage.id as PipelineStageId,
      stageLabel: stage.label,
      pipelineStatus,
      syncStatus,
      notes: labsConnected
        ? undefined
        : pipelineStatus === 'ready'
          ? 'Indexed in Economic OS — Labs observation not required for this stage.'
          : `Awaiting Labs runtime observation — pipeline stage ${stage.status} until Labs event received.`,
    }
  })
}

const buildPendingRequirements = (labsConnected: boolean): RuntimeRequirement[] => [
  {
    id: 'labs_endpoint',
    label: 'Labs runtime endpoint indexed',
    status: labsConnected ? 'ready' : 'waiting',
    notes: labsConnected ? undefined : `${LABS_RUNTIME_ENDPOINT} not reachable in this build.`,
  },
  {
    id: 'narrative_stream',
    label: 'Narrative event stream subscription',
    status: labsConnected ? 'ready' : 'not_indexed',
    notes: 'No narrative_created or narrative_updated events observed.',
  },
  {
    id: 'validation_handoff',
    label: 'Validation handoff channel',
    status: 'planned',
    notes: 'Constitutional validation sync planned for Phase C.',
  },
  {
    id: 'registry_sync',
    label: 'Registry write-back observer',
    status: labsConnected ? 'waiting' : 'not_indexed',
    notes: 'Observation only — no registry writes from connector.',
  },
]

const buildBlockedReasons = (labsConnected: boolean): string[] => {
  const reasons = [
    'Labs runtime not connected — cannot observe narrative state changes.',
    'No fake narratives or projects will be synthesized while disconnected.',
  ]
  if (!labsConnected) {
    reasons.push('Pipeline synchronization paused until Labs endpoint is indexed.')
  }
  return reasons
}

const buildFutureActions = (): RuntimeAction[] => [
  {
    id: 'subscribe_narrative_events',
    label: 'Subscribe to Labs narrative event stream',
    kind: 'future',
    reason: 'Requires indexed Labs runtime endpoint.',
  },
  {
    id: 'sync_pipeline_on_event',
    label: 'Auto-sync pipeline stages on runtime events',
    kind: 'future',
    route: '/pipeline',
    reason: 'Event → stage mapping defined; observer not live.',
  },
  {
    id: 'surface_workspace_alerts',
    label: 'Push pending requirements to Workspace',
    kind: 'future',
    route: '/command-center',
  },
  {
    id: 'route_launch_capabilities',
    label: 'Update Launch capability status from Labs validation',
    kind: 'future',
    route: '/build-studio#build-import',
  },
]

export const resolveLabsRuntimeReadModel = (): LabsRuntimeReadModel => {
  assertRuntimeEventCoverage()

  const observation = observeLabsRuntime()
  const constitutional = getConstitutionalCanonicalEconomy()
  const pipelineState = buildPipelineSyncState(observation.labsConnected)

  const observedNarratives: ObservedNarrative[] = []
  const recentEvents: ObservedRuntimeEvent[] = []

  return {
    asOf: LABS_RUNTIME_AS_OF,
    disclaimer: LABS_RUNTIME_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    phase: 'civilization_services_labs_runtime_connector',
    constitutional,
    session: {
      sessionId: LABS_RUNTIME_SESSION_ID,
      labsConnected: observation.labsConnected,
      connectionStatus: observation.connectionStatus,
      labsEndpoint: LABS_RUNTIME_ENDPOINT,
      lastObserved: observation.lastObserved,
      lastEvent: observation.lastEvent,
      observedNarrativeCount: observedNarratives.length,
    },
    labsConnected: observation.labsConnected,
    lastObserved: observation.lastObserved,
    lastEvent: observation.lastEvent,
    pipelineState,
    observedNarratives,
    recentEvents,
    eventDefinitions: RUNTIME_EVENT_MAPPINGS.map((definition) => ({
      ...definition,
      mapsTo: definition.mapsTo.map((target) => ({ ...target })),
    })),
    pendingRequirements: buildPendingRequirements(observation.labsConnected),
    blockedReasons: buildBlockedReasons(observation.labsConnected),
    futureActions: buildFutureActions(),
    crossLinks: LABS_RUNTIME_CROSS_LINKS.map((link) => ({ ...link })),
  }
}
