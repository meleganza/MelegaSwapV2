import { LEGACY_TO_CANONICAL } from './event-catalog'
import { ACTIVE_CATALOG_EVENTS } from './event-catalog'
import { CIVILIZATION_FABRIC_EDGES, CIVILIZATION_MODULES } from './fabric-graph'
import { validateFabricEventSchema } from './fabric-schema'
import type {
  CanonicalEventType,
  CivilizationFabricEvent,
  CivilizationFabricModuleId,
  CivilizationModuleId,
  FabricValidation,
} from './types'

export { validateFabricEventSchema } from './fabric-schema'

export function detectFabricFeedbackLoops(): string[] {
  const adjacency = new Map<string, Set<string>>()

  CIVILIZATION_FABRIC_EDGES.forEach((edge) => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set())
    adjacency.get(edge.from)!.add(edge.to)
  })

  const cycles: string[] = []
  const visited = new Set<string>()
  const stack = new Set<string>()

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node)
      cycles.push([...path.slice(cycleStart), node].join(' → '))
      return
    }
    if (visited.has(node)) return

    visited.add(node)
    stack.add(node)

    const neighbors = adjacency.get(node) ?? new Set()
    neighbors.forEach((next) => dfs(next, [...path, node]))

    stack.delete(node)
  }

  CIVILIZATION_MODULES.forEach((module) => dfs(module, []))

  return [...new Set(cycles)]
}

/** @deprecated Use detectFabricFeedbackLoops */
export function detectCircularDependencies(): string[] {
  return detectFabricFeedbackLoops()
}

export function validateFabricGraph(
  history: readonly CivilizationFabricEvent[],
  wiredModules: CivilizationModuleId[],
  subscribedConsumers: string[] = [],
): FabricValidation {
  const emittedTypes = new Set(history.map((e) => e.event_type))
  const emittedProducers = new Set(history.map((e) => e.producer_module))

  const brokenPaths: FabricValidation['brokenPaths'] = []
  let connectedEdges = 0

  CIVILIZATION_FABRIC_EDGES.forEach((edge) => {
    const edgeKey = `${edge.from}→${edge.to} (${edge.event_type})`
    const producerWired = wiredModules.includes(edge.producer as CivilizationModuleId)
    const consumerWired = edge.consumers.some((c) =>
      wiredModules.includes(c as CivilizationModuleId),
    )

    if (!producerWired || !consumerWired) {
      brokenPaths.push({
        edge: edgeKey,
        reason: !producerWired
          ? `Producer ${edge.producer} not wired`
          : `Consumers [${edge.consumers.join(', ')}] not wired`,
      })
      return
    }
    connectedEdges += 1
  })

  const producerModules = new Set(
    CIVILIZATION_FABRIC_EDGES.map((e) => e.producer as CivilizationModuleId),
  )
  const consumerModules = new Set(
    CIVILIZATION_FABRIC_EDGES.flatMap((e) =>
      e.consumers.filter((c): c is CivilizationModuleId =>
        CIVILIZATION_MODULES.includes(c as CivilizationModuleId),
      ),
    ),
  )

  const deadProducers = [...producerModules].filter(
    (m) => wiredModules.includes(m) && !emittedProducers.has(m),
  )

  const deadConsumers = [...consumerModules].filter((m) => {
    const isWired = wiredModules.includes(m)
    const hasSubscription = subscribedConsumers.includes(m)
    return isWired && !hasSubscription && m !== 'treasury'
  })

  const deadModules = CIVILIZATION_MODULES.filter(
    (m) => wiredModules.includes(m) && !emittedProducers.has(m),
  )

  const unusedEvents = ACTIVE_CATALOG_EVENTS.filter((type) => !emittedTypes.has(type))

  const schemaViolations = history.flatMap((event) =>
    validateFabricEventSchema(event).map((v) => `${event.event_id}: ${v}`),
  )

  const totalEdges = CIVILIZATION_FABRIC_EDGES.length
  const coveragePercentage = Math.round((connectedEdges / totalEdges) * 100)

  const fabricFeedbackLoops = detectFabricFeedbackLoops()

  return {
    modulesConnected: CIVILIZATION_MODULES.filter((m) => wiredModules.includes(m)),
    brokenPaths,
    deadProducers: deadProducers.filter((m) => m !== 'treasury'),
    deadConsumers: deadConsumers as CivilizationFabricModuleId[],
    deadModules: deadModules.filter((m) => m !== 'treasury'),
    unusedEvents,
    circularDependencies: [],
    fabricFeedbackLoops,
    schemaViolations,
    coveragePercentage,
    totalEdges,
    connectedEdges,
  }
}

/** @deprecated Use validateFabricGraph */
export function validateRuntimeGraph(
  journal: Array<{ type: string; source: CivilizationModuleId }>,
  wiredConsumers: CivilizationModuleId[],
): FabricValidation {
  const history = journal.map((entry, index) => {
    const canonical =
      LEGACY_TO_CANONICAL[entry.type as keyof typeof LEGACY_TO_CANONICAL] ??
      (entry.type as CanonicalEventType)
    return {
      event_id: `legacy-${index}`,
      event_type: canonical,
      timestamp: new Date().toISOString(),
      producer: `civilization.${entry.source}`,
      producer_module: entry.source,
      payload: {},
      schema_version: '1.0.0' as const,
      runtime_version: '1.0.0' as const,
      identity: null,
      wallet: null,
      correlation_id: `legacy-${index}`,
      trace_id: `legacy-trace-${index}`,
    }
  })

  return validateFabricGraph(history, wiredConsumers)
}
