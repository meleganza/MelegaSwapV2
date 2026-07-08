/** R726 — production runtime data integrity diagnostics. */

export type RuntimeDataSource =
  | 'subgraph'
  | 'on-chain'
  | 'registry'
  | 'runtime'
  | 'explorer'
  | 'coingecko'
  | 'fallback'
  | 'unavailable'

export interface RuntimeDiagnostic {
  surface: string
  status: 'ready' | 'loading' | 'empty' | 'unavailable'
  source: RuntimeDataSource
  indexer?: string
  registry?: string
  fallback?: string
  reason: string
  timestamp: string
}

export function buildRuntimeDiagnostic(
  partial: Omit<RuntimeDiagnostic, 'timestamp'>,
): RuntimeDiagnostic {
  return { ...partial, timestamp: new Date().toISOString() }
}

export function formatActivityUnavailable(diagnostic: RuntimeDiagnostic): string {
  return `Last indexed activity unavailable — ${diagnostic.reason} (${diagnostic.source})`
}
