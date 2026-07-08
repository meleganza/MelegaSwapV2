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
  status: 'ready' | 'loading' | 'empty' | 'unavailable' | 'error'
  source: RuntimeDataSource
  indexer?: string
  registry?: string
  fallback?: string
  reason: string
  timestamp: string
  lastAttempt?: string
}

export interface IndexerActivityDiagnostic {
  title: string
  source: string
  indexer: string
  lastAttempt: string
  reason: string
}

export function buildRuntimeDiagnostic(
  partial: Omit<RuntimeDiagnostic, 'timestamp'>,
): RuntimeDiagnostic {
  return { ...partial, timestamp: new Date().toISOString(), lastAttempt: partial.lastAttempt ?? new Date().toISOString() }
}

export function formatActivityUnavailable(diagnostic: RuntimeDiagnostic): string {
  return `Last indexed activity unavailable — ${diagnostic.reason} (${diagnostic.source})`
}

export function buildIndexerActivityDiagnostic(input: {
  title?: string
  source: string
  indexer: string
  lastAttempt: string
  reason: string
}): IndexerActivityDiagnostic {
  return {
    title: input.title ?? 'Last indexed activity unavailable',
    source: input.source,
    indexer: input.indexer,
    lastAttempt: input.lastAttempt,
    reason: input.reason,
  }
}

export function formatIndexerDiagnosticLines(diagnostic: IndexerActivityDiagnostic): string[] {
  return [
    diagnostic.title,
    `Source: ${diagnostic.source}`,
    `Indexer: ${diagnostic.indexer}`,
    `Last attempt: ${new Date(diagnostic.lastAttempt).toLocaleString()}`,
    `Reason: ${diagnostic.reason}`,
  ]
}
