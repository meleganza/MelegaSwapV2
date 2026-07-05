import type { CivilizationFabricEvent } from './types'

const REQUIRED_EVENT_FIELDS = [
  'event_id',
  'event_type',
  'timestamp',
  'producer',
  'producer_module',
  'payload',
  'schema_version',
  'runtime_version',
  'identity',
  'wallet',
  'correlation_id',
  'trace_id',
] as const

export function validateFabricEventSchema(event: CivilizationFabricEvent): string[] {
  const violations: string[] = []

  REQUIRED_EVENT_FIELDS.forEach((field) => {
    if (!(field in event)) {
      violations.push(`missing field: ${field}`)
    }
  })

  if (typeof event.event_id !== 'string' || event.event_id.length === 0) {
    violations.push('event_id must be a non-empty string')
  }
  if (typeof event.trace_id !== 'string' || event.trace_id.length === 0) {
    violations.push('trace_id must be a non-empty string')
  }
  if (typeof event.correlation_id !== 'string' || event.correlation_id.length === 0) {
    violations.push('correlation_id must be a non-empty string')
  }
  if (event.payload === null || typeof event.payload !== 'object' || Array.isArray(event.payload)) {
    violations.push('payload must be a plain object')
  }

  return violations
}
