import { CANONICAL_TO_LEGACY } from './event-catalog'
import type {
  CanonicalEventType,
  CivilizationFabricEvent,
  CivilizationModuleId,
  CivilizationRuntimeEvent,
  EmitFabricEventOptions,
  LegacyFabricEventType,
} from './types'
import {
  FABRIC_EVENT_SCHEMA_VERSION,
  FABRIC_RUNTIME_VERSION,
} from './types'
import { resolveCanonicalEventType } from './event-catalog'
import { validateFabricEventSchema } from './fabric-schema'

const MAX_HISTORY = 256

type FabricListener = (event: CivilizationFabricEvent) => void

let history: CivilizationFabricEvent[] = []
const listeners = new Set<FabricListener>()
const consumerSubscriptions = new Set<CivilizationModuleId | string>()
let seq = 0

function createTraceId(): string {
  return `trace-${Date.now()}-${++seq}`
}

function freezeEvent(event: CivilizationFabricEvent): CivilizationFabricEvent {
  return Object.freeze({
    ...event,
    payload: Object.freeze({ ...event.payload }),
  })
}

function toLegacyJournalEntry(event: CivilizationFabricEvent): CivilizationRuntimeEvent {
  const legacyType = CANONICAL_TO_LEGACY[event.event_type]
  return {
    id: event.event_id,
    type: (legacyType ?? event.event_type) as LegacyFabricEventType,
    source: event.producer_module,
    emittedAt: event.timestamp,
    payload: { ...event.payload },
  }
}

export function emitFabricEvent(
  eventType: CanonicalEventType | LegacyFabricEventType,
  producerModule: CivilizationModuleId,
  options: EmitFabricEventOptions = {},
): CivilizationFabricEvent {
  const canonicalType = resolveCanonicalEventType(eventType)
  const eventId = `civ-${++seq}`
  const traceId = options.trace_id ?? createTraceId()
  const correlationId = options.correlation_id ?? eventId

  const draft: CivilizationFabricEvent = {
    event_id: eventId,
    event_type: canonicalType,
    timestamp: new Date().toISOString(),
    producer: options.producer ?? `civilization.${producerModule}`,
    producer_module: producerModule,
    payload: options.payload ?? {},
    schema_version: FABRIC_EVENT_SCHEMA_VERSION,
    runtime_version: FABRIC_RUNTIME_VERSION,
    identity: options.identity ?? null,
    wallet: options.wallet ?? null,
    correlation_id: correlationId,
    trace_id: traceId,
  }

  const violations = validateFabricEventSchema(draft)
  if (violations.length > 0) {
    throw new Error(`Civilization Fabric schema violation: ${violations.join('; ')}`)
  }

  const event = freezeEvent(draft)
  history = [...history, event].slice(-MAX_HISTORY)
  listeners.forEach((fn) => fn(event))
  return event
}

/** Producer entry point — legacy keys map to canonical catalog types inside the Fabric. */
export function emitCivilizationEvent(
  type: LegacyFabricEventType,
  source: CivilizationModuleId,
  payload?: Record<string, unknown>,
  options?: Omit<EmitFabricEventOptions, 'payload'>,
): CivilizationFabricEvent {
  return emitFabricEvent(type, source, { ...options, payload })
}

export function subscribeFabricEvents(listener: FabricListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function subscribeFabricConsumer(
  consumerId: CivilizationModuleId | string,
  listener?: FabricListener,
): () => void {
  consumerSubscriptions.add(consumerId)
  if (!listener) {
    return () => consumerSubscriptions.delete(consumerId)
  }
  return subscribeFabricEvents((event) => {
    listener(event)
  })
}

/** @deprecated Use subscribeFabricEvents */
export function subscribeCivilizationEvents(
  listener: (event: CivilizationRuntimeEvent) => void,
): () => void {
  return subscribeFabricEvents((event) => listener(toLegacyJournalEntry(event)))
}

export function getFabricHistory(): readonly CivilizationFabricEvent[] {
  return [...history]
}

/** @deprecated Use getFabricHistory */
export function getCivilizationEventJournal(): CivilizationRuntimeEvent[] {
  return history.map(toLegacyJournalEntry).reverse()
}

export function getFabricConsumerSubscriptions(): string[] {
  return [...consumerSubscriptions]
}

export function resetFabricHistory(): void {
  history = []
  consumerSubscriptions.clear()
  seq = 0
}

/** @deprecated Use resetFabricHistory */
export function resetCivilizationEventJournal(): void {
  resetFabricHistory()
}

export function getFabricHistorySnapshot(): number {
  return history.length
}

/** @deprecated Use getFabricHistorySnapshot */
export function getCivilizationEventSnapshot(): number {
  return history.length
}

export function getEventsByTraceId(traceId: string): CivilizationFabricEvent[] {
  return history.filter((e) => e.trace_id === traceId)
}

export function getEventsByCorrelationId(correlationId: string): CivilizationFabricEvent[] {
  return history.filter((e) => e.correlation_id === correlationId)
}
