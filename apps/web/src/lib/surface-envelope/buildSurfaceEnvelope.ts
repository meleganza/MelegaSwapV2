import type { CivilizationModule } from './civilizationRoles'
import {
  SURFACE_DEPENDENCIES,
  SURFACE_NEXT_ACTIONS,
  SURFACE_PRIMARY_ACTIONS,
} from './civilizationRoles'

export const SURFACE_SCHEMA = 'melega.surface.v1' as const
export const SURFACE_SCHEMA_VERSION = '1.0.0' as const

export interface MelegaSurfaceEnvelope {
  schema: typeof SURFACE_SCHEMA
  schemaVersion: typeof SURFACE_SCHEMA_VERSION
  module: CivilizationModule | string
  runtime: string | Record<string, unknown>
  primaryActions: string[]
  nextActions: string[]
  reasonCodes: Record<string, string>
  sources: string[]
  dependencies: string[]
  timestamp: string
  machineReadable: true
}

export function buildSurfaceEnvelope(input: {
  module: CivilizationModule | string
  runtime: string | Record<string, unknown>
  primaryActions?: string[]
  nextActions?: string[]
  reasonCodes?: Record<string, string>
  sources?: string[]
  dependencies?: string[]
  timestamp?: string
}): MelegaSurfaceEnvelope {
  const mod = input.module as CivilizationModule
  return {
    schema: SURFACE_SCHEMA,
    schemaVersion: SURFACE_SCHEMA_VERSION,
    module: input.module,
    runtime: input.runtime,
    primaryActions: input.primaryActions ?? SURFACE_PRIMARY_ACTIONS[mod] ?? [],
    nextActions: input.nextActions ?? SURFACE_NEXT_ACTIONS[mod] ?? [],
    reasonCodes: input.reasonCodes ?? {},
    sources: input.sources ?? [],
    dependencies: input.dependencies ?? SURFACE_DEPENDENCIES[mod] ?? [],
    timestamp: input.timestamp ?? new Date().toISOString(),
    machineReadable: true,
  }
}
