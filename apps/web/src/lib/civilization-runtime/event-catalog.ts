import type {
  CanonicalEventType,
  CivilizationFabricModuleId,
  CivilizationModuleId,
  EventCatalogEntry,
  LegacyFabricEventType,
} from './types'

export const LEGACY_TO_CANONICAL: Record<LegacyFabricEventType, CanonicalEventType> = {
  import_analyzed: 'PROJECT_IMPORTED',
  registry_indexed: 'PROJECT_VERIFIED',
  radar_signals_refreshed: 'RADAR_DISCOVERED',
  projects_intelligence_refreshed: 'PROJECT_UPDATED',
  trending_refreshed: 'TRENDING_SCORE_CHANGED',
  trade_executed: 'TRADE_EXECUTED',
  treasury_settlement: 'TREASURY_SETTLED',
  liquidity_position_changed: 'LIQUIDITY_ADDED',
  pool_staked: 'POOL_JOINED',
  pool_unstaked: 'POOL_LEFT',
  pool_claimed: 'POOL_CLAIMED',
  farm_staked: 'FARM_STAKED',
  farm_withdrawn: 'FARM_WITHDRAWN',
  farm_claimed: 'FARM_CLAIMED',
  identity_resolved: 'IDENTITY_VERIFIED',
  command_center_synced: 'COMMAND_NOTIFICATION_CREATED',
}

export const CANONICAL_TO_LEGACY: Partial<Record<CanonicalEventType, LegacyFabricEventType>> =
  Object.fromEntries(
    Object.entries(LEGACY_TO_CANONICAL).map(([legacy, canonical]) => [canonical, legacy]),
  ) as Partial<Record<CanonicalEventType, LegacyFabricEventType>>

export const EVENT_CATALOG: EventCatalogEntry[] = [
  {
    event_type: 'PROJECT_IMPORTED',
    producer: 'import',
    payload: '{ contract, chainId, tier?, slug? }',
    consumers: ['registry', 'build_studio', 'command_center', 'projects', 'radar'],
    status: 'active',
    legacy_key: 'import_analyzed',
  },
  {
    event_type: 'PROJECT_VERIFIED',
    producer: 'registry',
    payload: '{ tier, contract?, slug? }',
    consumers: ['radar', 'projects', 'trending', 'command_center'],
    status: 'active',
    legacy_key: 'registry_indexed',
  },
  {
    event_type: 'PROJECT_UPDATED',
    producer: 'projects',
    payload: '{ slug, projectCount?, recommendationCount? }',
    consumers: ['trending', 'command_center', 'portfolio'],
    status: 'active',
    legacy_key: 'projects_intelligence_refreshed',
  },
  {
    event_type: 'RADAR_DISCOVERED',
    producer: 'radar',
    payload: '{ eventCount?, slug?, source? }',
    consumers: ['projects', 'trending', 'command_center', 'signal'],
    status: 'active',
    legacy_key: 'radar_signals_refreshed',
  },
  {
    event_type: 'TRENDING_SCORE_CHANGED',
    producer: 'trending',
    payload: '{ itemCount?, topSlug? }',
    consumers: ['command_center', 'trade', 'projects'],
    status: 'active',
    legacy_key: 'trending_refreshed',
  },
  {
    event_type: 'TRADE_EXECUTED',
    producer: 'trade',
    payload: '{ txHash?, pair?, amountIn?, amountOut? }',
    consumers: ['command_center', 'treasury', 'portfolio', 'identity'],
    status: 'active',
    legacy_key: 'trade_executed',
  },
  {
    event_type: 'SWAP_COMPLETED',
    producer: 'trade',
    payload: '{ txHash, route, slippage? }',
    consumers: ['command_center', 'treasury', 'portfolio'],
    status: 'planned',
  },
  {
    event_type: 'TREASURY_HANDOFF_CREATED',
    producer: 'treasury',
    payload: '{ handoffId, settlementRef }',
    consumers: ['command_center', 'trade'],
    status: 'planned',
  },
  {
    event_type: 'TREASURY_SETTLED',
    producer: 'trade',
    payload: '{ txHash?, settlementId?, status? }',
    consumers: ['treasury', 'command_center'],
    status: 'active',
    legacy_key: 'treasury_settlement',
  },
  {
    event_type: 'LIQUIDITY_ADDED',
    producer: 'liquidity',
    payload: '{ positionId?, pair?, action? }',
    consumers: ['pools', 'command_center', 'treasury', 'portfolio'],
    status: 'active',
    legacy_key: 'liquidity_position_changed',
  },
  {
    event_type: 'LIQUIDITY_REMOVED',
    producer: 'liquidity',
    payload: '{ positionId?, pair?, action? }',
    consumers: ['pools', 'command_center', 'treasury', 'portfolio'],
    status: 'planned',
  },
  {
    event_type: 'POOL_JOINED',
    producer: 'pools',
    payload: '{ pid?, txHash? }',
    consumers: ['command_center', 'portfolio', 'treasury'],
    status: 'active',
    legacy_key: 'pool_staked',
  },
  {
    event_type: 'POOL_LEFT',
    producer: 'pools',
    payload: '{ pid?, txHash? }',
    consumers: ['command_center', 'portfolio'],
    status: 'active',
    legacy_key: 'pool_unstaked',
  },
  {
    event_type: 'POOL_CLAIMED',
    producer: 'pools',
    payload: '{ pid?, txHash? }',
    consumers: ['command_center', 'portfolio', 'treasury'],
    status: 'active',
    legacy_key: 'pool_claimed',
  },
  {
    event_type: 'FARM_STAKED',
    producer: 'farms',
    payload: '{ pid, txHash }',
    consumers: ['command_center', 'portfolio'],
    status: 'active',
    legacy_key: 'farm_staked',
  },
  {
    event_type: 'FARM_WITHDRAWN',
    producer: 'farms',
    payload: '{ pid, txHash }',
    consumers: ['command_center', 'portfolio'],
    status: 'active',
    legacy_key: 'farm_withdrawn',
  },
  {
    event_type: 'FARM_CLAIMED',
    producer: 'farms',
    payload: '{ pid, txHash }',
    consumers: ['command_center', 'portfolio', 'treasury'],
    status: 'active',
    legacy_key: 'farm_claimed',
  },
  {
    event_type: 'IDENTITY_VERIFIED',
    producer: 'identity',
    payload: '{ balance?, collection?, tokenId? }',
    consumers: ['command_center', 'radar', 'portfolio'],
    status: 'active',
    legacy_key: 'identity_resolved',
  },
  {
    event_type: 'IDENTITY_UNLOCKED',
    producer: 'identity',
    payload: '{ capability, collection }',
    consumers: ['command_center', 'radar', 'labs'],
    status: 'planned',
  },
  {
    event_type: 'COLLECTION_MINTED',
    producer: 'identity',
    payload: '{ collection, tokenId, txHash }',
    consumers: ['command_center', 'identity', 'treasury'],
    status: 'planned',
  },
  {
    event_type: 'COMMAND_NOTIFICATION_CREATED',
    producer: 'command_center',
    payload: '{ notificationCount?, coverage? }',
    consumers: ['identity'],
    status: 'active',
    legacy_key: 'command_center_synced',
  },
  {
    event_type: 'SIGNAL_DETECTED',
    producer: 'signal',
    payload: '{ signalId, strength, source }',
    consumers: ['radar', 'projects', 'command_center', 'ai_agents'],
    status: 'future',
  },
  {
    event_type: 'LABS_EXPERIMENT_STARTED',
    producer: 'labs',
    payload: '{ experimentId, hypothesis }',
    consumers: ['command_center', 'projects', 'ai_agents'],
    status: 'future',
  },
  {
    event_type: 'SPACE_SESSION_OPENED',
    producer: 'space',
    payload: '{ sessionId, participants }',
    consumers: ['command_center', 'identity'],
    status: 'future',
  },
  {
    event_type: 'SMARTDROP_DISPATCHED',
    producer: 'smartdrop',
    payload: '{ dropId, audience }',
    consumers: ['command_center', 'identity', 'treasury'],
    status: 'future',
  },
  {
    event_type: 'KERL_NODE_REGISTERED',
    producer: 'kerl',
    payload: '{ nodeId, region }',
    consumers: ['master_core', 'runtime_services'],
    status: 'future',
  },
  {
    event_type: 'MASTER_CORE_SYNCED',
    producer: 'master_core',
    payload: '{ syncId, modules }',
    consumers: ['runtime_services', 'command_center', 'ai_agents'],
    status: 'future',
  },
  {
    event_type: 'AI_AGENT_ACTION',
    producer: 'ai_agents',
    payload: '{ agentId, action, trace_id }',
    consumers: ['command_center', 'labs', 'signal'],
    status: 'future',
  },
]

export const CATALOG_PRODUCER_MAP = EVENT_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.event_type] = entry.producer
    return acc
  },
  {} as Record<CanonicalEventType, CivilizationFabricModuleId>,
)

export const CATALOG_CONSUMER_MAP = EVENT_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.event_type] = entry.consumers
    return acc
  },
  {} as Partial<Record<CanonicalEventType, CivilizationFabricModuleId[]>>,
)

export const ACTIVE_CATALOG_EVENTS = EVENT_CATALOG.filter((e) => e.status === 'active').map(
  (e) => e.event_type,
)

/** @deprecated Use CATALOG_PRODUCER_MAP via legacy keys */
export const EVENT_PRODUCERS: Record<LegacyFabricEventType, CivilizationModuleId> =
  Object.fromEntries(
    Object.entries(LEGACY_TO_CANONICAL).map(([legacy, canonical]) => {
      const entry = EVENT_CATALOG.find((e) => e.event_type === canonical)
      return [legacy, (entry?.producer as CivilizationModuleId) ?? 'import']
    }),
  ) as Record<LegacyFabricEventType, CivilizationModuleId>

export function resolveCanonicalEventType(
  type: LegacyFabricEventType | CanonicalEventType,
): CanonicalEventType {
  if (type in LEGACY_TO_CANONICAL) {
    return LEGACY_TO_CANONICAL[type as LegacyFabricEventType]
  }
  return type as CanonicalEventType
}
