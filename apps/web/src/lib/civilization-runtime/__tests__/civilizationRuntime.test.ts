import {
  emitCivilizationEvent,
  emitFabricEvent,
  getFabricHistory,
  getCivilizationEventJournal,
  resetFabricHistory,
  subscribeFabricEvents,
  subscribeCivilizationEvents,
  getEventsByTraceId,
} from '../event-fabric'
import {
  buildCivilizationFabricProfile,
  buildCivilizationRuntimeProfile,
  WIRED_CIVILIZATION_MODULES,
} from '../buildCivilizationFabric'
import {
  CIVILIZATION_FABRIC_EDGES,
  CIVILIZATION_RUNTIME_EDGES,
} from '../fabric-graph'
import { EVENT_CATALOG, LEGACY_TO_CANONICAL } from '../event-catalog'
import { validateFabricGraph, detectCircularDependencies } from '../validate-fabric'
import { CIVILIZATION_FABRIC_SCHEMA } from '../types'

describe('civilizationFabric R501', () => {
  beforeEach(() => resetFabricHistory())

  it('emits immutable fabric events with constitutional schema', () => {
    const seen: string[] = []
    const unsub = subscribeFabricEvents((e) => {
      seen.push(e.event_type)
      expect(Object.isFrozen(e)).toBe(true)
      expect(Object.isFrozen(e.payload)).toBe(true)
      expect(e.event_id).toBeTruthy()
      expect(e.trace_id).toBeTruthy()
      expect(e.correlation_id).toBeTruthy()
      expect(e.schema_version).toBe('1.0.0')
      expect(e.runtime_version).toBe('1.0.0')
    })

    emitCivilizationEvent('import_analyzed', 'import', { contract: '0xabc' })
    emitCivilizationEvent('registry_indexed', 'registry', { slug: 'test' })
    unsub()

    expect(getFabricHistory().length).toBe(2)
    expect(getFabricHistory()[0].event_type).toBe('PROJECT_IMPORTED')
    expect(getFabricHistory()[1].event_type).toBe('PROJECT_VERIFIED')
    expect(seen).toEqual(['PROJECT_IMPORTED', 'PROJECT_VERIFIED'])
  })

  it('maps legacy producer keys to canonical catalog types', () => {
    emitCivilizationEvent('trade_executed', 'trade', { txHash: '0x1' })
    const event = getFabricHistory()[0]
    expect(event.event_type).toBe('TRADE_EXECUTED')
    expect(LEGACY_TO_CANONICAL.trade_executed).toBe('TRADE_EXECUTED')
  })

  it('preserves trace chains across correlated emissions', () => {
    const trade = emitFabricEvent('TRADE_EXECUTED', 'trade', {
      payload: { txHash: '0xabc' },
      trace_id: 'trace-chain-1',
      correlation_id: 'corr-trade-1',
    })
    emitFabricEvent('TREASURY_SETTLED', 'trade', {
      payload: { settlementId: 'set-1' },
      trace_id: 'trace-chain-1',
      correlation_id: trade.event_id,
    })

    const chain = getEventsByTraceId('trace-chain-1')
    expect(chain.length).toBe(2)
    expect(chain[1].correlation_id).toBe(trade.event_id)
  })

  it('produces melega.civilization.fabric.v1 machine profile', () => {
    emitCivilizationEvent('radar_signals_refreshed', 'radar', { eventCount: 3 })
    const profile = buildCivilizationFabricProfile()

    expect(profile.schema).toBe(CIVILIZATION_FABRIC_SCHEMA)
    expect(profile.fabric.owner).toBe('civilization')
    expect(profile.fabric.reactRole).toBe('consumer_only')
    expect(profile.fabric.appendOnlyHistory).toBe(true)
    expect(profile.eventCatalog.length).toBeGreaterThanOrEqual(20)
    expect(profile.nodes.length).toBeGreaterThan(WIRED_CIVILIZATION_MODULES.length)
    expect(profile.edges.length).toBe(CIVILIZATION_FABRIC_EDGES.length)
    expect(profile.identity.constitutional).toBe(true)
    expect(profile.futureCompatibility.architecturalChangesRequired).toBe(false)
    expect(profile.coverage.coveragePercentage).toBeGreaterThan(0)
  })

  it('maintains backward-compatible runtime profile alias', () => {
    const profile = buildCivilizationRuntimeProfile()
    expect(profile.schema).toBe(CIVILIZATION_FABRIC_SCHEMA)
    expect(profile.events.journal).toEqual(getCivilizationEventJournal())
  })

  it('validates civilization runtime graph wiring across modules', () => {
    const validation = validateFabricGraph([], WIRED_CIVILIZATION_MODULES)
    expect(validation.brokenPaths.length).toBe(0)
    expect(validation.modulesConnected.length).toBe(WIRED_CIVILIZATION_MODULES.length)
    expect(validation.totalEdges).toBe(CIVILIZATION_FABRIC_EDGES.length)
    expect(validation.connectedEdges).toBe(validation.totalEdges)
    expect(validation.coveragePercentage).toBe(100)
    expect(validation.circularDependencies.length).toBe(0)
    expect(validation.fabricFeedbackLoops).toContain('command_center → identity → command_center')
  })

  it('detects unused active catalog events at cold start', () => {
    const validation = validateFabricGraph([], WIRED_CIVILIZATION_MODULES)
    expect(validation.unusedEvents.length).toBeGreaterThan(0)
    expect(validation.deadProducers.length).toBeGreaterThan(0)
  })

  it('marks producers alive after fabric emissions', () => {
    emitCivilizationEvent('trade_executed', 'trade', { txHash: '0x1' })
    emitCivilizationEvent('identity_resolved', 'identity', { balance: 1 })
    const validation = validateFabricGraph(getFabricHistory(), WIRED_CIVILIZATION_MODULES)
    expect(validation.deadProducers).not.toContain('trade')
    expect(validation.deadProducers).not.toContain('identity')
    expect(validation.unusedEvents).not.toContain('TRADE_EXECUTED')
    expect(validation.unusedEvents).not.toContain('IDENTITY_VERIFIED')
  })

  it('exposes canonical event catalog with producers and consumers', () => {
    const tradeEntry = EVENT_CATALOG.find((e) => e.event_type === 'TRADE_EXECUTED')
    expect(tradeEntry?.producer).toBe('trade')
    expect(tradeEntry?.consumers).toContain('command_center')
    expect(tradeEntry?.consumers).toContain('treasury')
  })

  it('detects fabric feedback loops without architectural circular dependencies', () => {
    expect(detectCircularDependencies()).toContain('command_center → identity → command_center')
    const validation = validateFabricGraph([], WIRED_CIVILIZATION_MODULES)
    expect(validation.circularDependencies).toEqual([])
  })

  it('legacy subscribe API still receives journal entries', () => {
    const seen: string[] = []
    const unsub = subscribeCivilizationEvents((e) => seen.push(e.type))
    emitCivilizationEvent('farm_claimed', 'farms', { pid: 1 })
    unsub()
    expect(seen).toEqual(['farm_claimed'])
  })

  it('legacy runtime edges remain aligned with fabric edges', () => {
    expect(CIVILIZATION_RUNTIME_EDGES.length).toBe(CIVILIZATION_FABRIC_EDGES.length)
  })

  it('maps pool legacy emits to canonical POOL_JOINED, POOL_LEFT, POOL_CLAIMED', () => {
    emitCivilizationEvent('pool_staked', 'pools', { sousId: 1, txHash: '0xpool1' })
    emitCivilizationEvent('pool_unstaked', 'pools', { sousId: 1, txHash: '0xpool2' })
    emitCivilizationEvent('pool_claimed', 'pools', { sousId: 1, txHash: '0xpool3' })
    const history = getFabricHistory()
    expect(history[0].event_type).toBe('POOL_JOINED')
    expect(history[1].event_type).toBe('POOL_LEFT')
    expect(history[2].event_type).toBe('POOL_CLAIMED')
    expect(history.every((e) => e.producer_module === 'pools')).toBe(true)
  })

  it('validates pools producer path in civilization fabric graph', () => {
    emitCivilizationEvent('pool_staked', 'pools', { sousId: 2, txHash: '0xabc' })
    const validation = validateFabricGraph(getFabricHistory(), WIRED_CIVILIZATION_MODULES, ['command_center'])
    expect(validation.brokenPaths.filter((p) => p.edge.includes('POOL_'))).toEqual([])
    expect(validation.deadProducers).not.toContain('pools')
  })
})
