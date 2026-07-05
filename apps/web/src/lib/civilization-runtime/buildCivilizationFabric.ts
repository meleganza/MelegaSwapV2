import { IDENTITY_HUB_COLLECTIONS } from 'registry/collectibles/identity-hub-collections.config'
import { TREASURY_HANDOFF_API_PATH } from 'lib/treasury-handoff/config'
import {
  CATALOG_CONSUMER_MAP,
  CATALOG_PRODUCER_MAP,
  EVENT_CATALOG,
  EVENT_PRODUCERS,
} from './event-catalog'
import {
  getFabricConsumerSubscriptions,
  getFabricHistory,
  getCivilizationEventJournal,
} from './event-fabric'
import {
  buildFabricGraphNodes,
  CIVILIZATION_FABRIC_EDGES,
  CIVILIZATION_MODULES,
  FUTURE_MODULES,
} from './fabric-graph'
import { validateFabricGraph } from './validate-fabric'
import type { CivilizationFabricProfile, CivilizationModuleId } from './types'
import {
  CIVILIZATION_FABRIC_SCHEMA,
  FABRIC_EVENT_SCHEMA_VERSION,
  FABRIC_RUNTIME_VERSION,
} from './types'

/** Modules with active Fabric wiring in this build. */
export const WIRED_CIVILIZATION_MODULES: CivilizationModuleId[] = [
  'import',
  'registry',
  'radar',
  'projects',
  'trending',
  'trade',
  'liquidity',
  'pools',
  'farms',
  'identity',
  'command_center',
  'treasury',
  'build_studio',
]

const LEGACY_EVENT_CONSUMERS = {
  import_analyzed: ['registry', 'projects', 'radar', 'command_center'],
  registry_indexed: ['radar', 'projects', 'trending', 'command_center'],
  radar_signals_refreshed: ['projects', 'trending', 'command_center'],
  projects_intelligence_refreshed: ['trending', 'command_center'],
  trending_refreshed: ['command_center'],
  trade_executed: ['command_center', 'treasury'],
  treasury_settlement: ['treasury', 'command_center'],
  liquidity_position_changed: ['pools', 'command_center', 'treasury'],
  pool_staked: ['command_center'],
  pool_unstaked: ['command_center'],
  pool_claimed: ['command_center'],
  farm_staked: ['command_center'],
  farm_withdrawn: ['command_center'],
  farm_claimed: ['command_center'],
  identity_resolved: ['command_center', 'radar'],
  command_center_synced: ['identity'],
} as const

export function buildCivilizationFabricProfile(): CivilizationFabricProfile {
  const history = getFabricHistory()
  const subscribedConsumers = getFabricConsumerSubscriptions()
  const coverage = validateFabricGraph(history, WIRED_CIVILIZATION_MODULES, subscribedConsumers)
  const nodes = buildFabricGraphNodes(WIRED_CIVILIZATION_MODULES)

  return {
    schema: CIVILIZATION_FABRIC_SCHEMA,
    generatedAt: new Date().toISOString(),
    fabric: {
      name: 'Civilization Event Fabric',
      owner: 'civilization',
      reactRole: 'consumer_only',
      appendOnlyHistory: true,
    },
    versions: {
      runtime: FABRIC_RUNTIME_VERSION,
      schema: FABRIC_EVENT_SCHEMA_VERSION,
    },
    nodes,
    edges: CIVILIZATION_FABRIC_EDGES,
    eventCatalog: EVENT_CATALOG,
    producerMap: CATALOG_PRODUCER_MAP,
    consumerMap: CATALOG_CONSUMER_MAP,
    schemas: {
      event: FABRIC_EVENT_SCHEMA_VERSION,
      fabric: CIVILIZATION_FABRIC_SCHEMA,
    },
    history,
    identity: {
      label: 'Civilization Identities',
      constitutional: true,
      collections: IDENTITY_HUB_COLLECTIONS.map((c) => c.name),
    },
    treasury: {
      handoffPath: TREASURY_HANDOFF_API_PATH,
      status: 'partial',
    },
    coverage,
    futureCompatibility: {
      readyModules: FUTURE_MODULES,
      extensionPoints: [
        'emitFabricEvent',
        'subscribeFabricConsumer',
        'EVENT_CATALOG',
        'CIVILIZATION_FABRIC_EDGES',
      ],
      architecturalChangesRequired: false,
    },
    events: {
      definitions: EVENT_CATALOG.filter((e) => e.status === 'active').map((e) => e.event_type),
      journal: getCivilizationEventJournal(),
      producers: EVENT_PRODUCERS,
      consumers: LEGACY_EVENT_CONSUMERS,
    },
    dependencies: CIVILIZATION_FABRIC_EDGES,
    runtimeGraph: coverage,
  }
}

/** @deprecated Use buildCivilizationFabricProfile */
export function buildCivilizationRuntimeProfile(): CivilizationFabricProfile {
  return buildCivilizationFabricProfile()
}

export { CIVILIZATION_MODULES }
