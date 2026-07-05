import { CANONICAL_TO_LEGACY, EVENT_CATALOG } from './event-catalog'
import type {
  CanonicalEventType,
  CivilizationFabricModuleId,
  CivilizationModuleId,
  FabricGraphEdge,
  FabricGraphNode,
  FabricNodeRole,
  RuntimeGraphEdge,
} from './types'

export const CIVILIZATION_MODULES: CivilizationModuleId[] = [
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

export const FUTURE_MODULES: CivilizationFabricModuleId[] = [
  'signal',
  'labs',
  'space',
  'smartdrop',
  'kerl',
  'master_core',
  'runtime_services',
  'ai_agents',
  'portfolio',
]

/** Civilization Runtime Graph — fabric-mediated edges only. */
export const CIVILIZATION_FABRIC_EDGES: FabricGraphEdge[] = [
  { from: 'import', to: 'registry', event_type: 'PROJECT_IMPORTED', producer: 'import', consumers: ['registry', 'build_studio'], flowOrder: 1, coupling: 'fabric_only' },
  { from: 'registry', to: 'radar', event_type: 'PROJECT_VERIFIED', producer: 'registry', consumers: ['radar', 'projects'], flowOrder: 2, coupling: 'fabric_only' },
  { from: 'radar', to: 'projects', event_type: 'RADAR_DISCOVERED', producer: 'radar', consumers: ['projects', 'trending', 'command_center'], flowOrder: 3, coupling: 'fabric_only' },
  { from: 'projects', to: 'trending', event_type: 'PROJECT_UPDATED', producer: 'projects', consumers: ['trending', 'command_center'], flowOrder: 4, coupling: 'fabric_only' },
  { from: 'trending', to: 'trade', event_type: 'TRENDING_SCORE_CHANGED', producer: 'trending', consumers: ['command_center'], flowOrder: 5, coupling: 'fabric_only' },
  { from: 'trade', to: 'treasury', event_type: 'TRADE_EXECUTED', producer: 'trade', consumers: ['command_center', 'treasury'], flowOrder: 6, coupling: 'fabric_only' },
  { from: 'trade', to: 'treasury', event_type: 'TREASURY_SETTLED', producer: 'trade', consumers: ['treasury', 'command_center'], flowOrder: 6, coupling: 'fabric_only' },
  { from: 'liquidity', to: 'pools', event_type: 'LIQUIDITY_ADDED', producer: 'liquidity', consumers: ['pools', 'command_center'], flowOrder: 7, coupling: 'fabric_only' },
  { from: 'pools', to: 'command_center', event_type: 'POOL_JOINED', producer: 'pools', consumers: ['command_center'], flowOrder: 8, coupling: 'fabric_only' },
  { from: 'pools', to: 'command_center', event_type: 'POOL_LEFT', producer: 'pools', consumers: ['command_center'], flowOrder: 8, coupling: 'fabric_only' },
  { from: 'pools', to: 'command_center', event_type: 'POOL_CLAIMED', producer: 'pools', consumers: ['command_center'], flowOrder: 8, coupling: 'fabric_only' },
  { from: 'farms', to: 'command_center', event_type: 'FARM_STAKED', producer: 'farms', consumers: ['command_center'], flowOrder: 9, coupling: 'fabric_only' },
  { from: 'farms', to: 'command_center', event_type: 'FARM_WITHDRAWN', producer: 'farms', consumers: ['command_center'], flowOrder: 9, coupling: 'fabric_only' },
  { from: 'farms', to: 'command_center', event_type: 'FARM_CLAIMED', producer: 'farms', consumers: ['command_center'], flowOrder: 9, coupling: 'fabric_only' },
  { from: 'identity', to: 'command_center', event_type: 'IDENTITY_VERIFIED', producer: 'identity', consumers: ['command_center', 'radar'], flowOrder: 10, coupling: 'fabric_only' },
  { from: 'build_studio', to: 'registry', event_type: 'PROJECT_IMPORTED', producer: 'build_studio', consumers: ['registry', 'projects', 'radar'], flowOrder: 1, coupling: 'fabric_only' },
  { from: 'command_center', to: 'identity', event_type: 'COMMAND_NOTIFICATION_CREATED', producer: 'command_center', consumers: ['identity'], flowOrder: 11, coupling: 'fabric_only' },
]

/** @deprecated Use CIVILIZATION_FABRIC_EDGES */
export const CIVILIZATION_RUNTIME_EDGES: RuntimeGraphEdge[] = CIVILIZATION_FABRIC_EDGES.map((edge) => ({
  from: edge.from as CivilizationModuleId,
  to: edge.to as CivilizationModuleId,
  event: (CANONICAL_TO_LEGACY[edge.event_type] ?? edge.event_type) as RuntimeGraphEdge['event'],
  producer: edge.producer as CivilizationModuleId,
  consumers: edge.consumers.filter((c): c is CivilizationModuleId =>
    CIVILIZATION_MODULES.includes(c as CivilizationModuleId),
  ),
  flowOrder: edge.flowOrder,
}))

function nodeRoles(produces: CanonicalEventType[], consumes: CanonicalEventType[]): FabricNodeRole[] {
  const roles: FabricNodeRole[] = []
  if (produces.length > 0) roles.push('producer')
  if (consumes.length > 0) roles.push('consumer')
  if (produces.length > 0 && consumes.length > 0) roles.push('bidirectional')
  if (produces.length === 0 && consumes.length > 0) roles.push('passive')
  if (produces.length > 0 || consumes.length > 0) roles.push('active')
  return roles
}

function catalogForModule(module: CivilizationFabricModuleId) {
  const entries = EVENT_CATALOG.filter((e) => e.producer === module || e.consumers.includes(module))
  const produces = EVENT_CATALOG.filter((e) => e.producer === module).map((e) => e.event_type)
  const consumes = EVENT_CATALOG.filter((e) => e.consumers.includes(module)).map((e) => e.event_type)
  return { entries, produces, consumes }
}

export function buildFabricGraphNodes(
  wiredModules: CivilizationModuleId[],
): FabricGraphNode[] {
  const wiredNodes: FabricGraphNode[] = wiredModules.map((module) => {
    const { produces, consumes } = catalogForModule(module)
    return {
      module,
      label: module.replace(/_/g, ' '),
      roles: nodeRoles(produces, consumes),
      status: 'wired',
      produces,
      consumes,
    }
  })

  const futureNodes: FabricGraphNode[] = FUTURE_MODULES.map((module) => {
    const { produces, consumes } = catalogForModule(module)
    return {
      module,
      label: module.replace(/_/g, ' '),
      roles: nodeRoles(produces, consumes),
      status: 'future',
      produces,
      consumes,
    }
  })

  return [...wiredNodes, ...futureNodes]
}

export { EVENT_PRODUCERS } from './event-catalog'
