import { get, set } from 'local-storage'

import type { ExecutionTrackerRecord, ExecutionTrackerSnapshot } from './types'

export const LS_EXECUTION_TRACKER = 'kerl_exec_tracker_'

export const MAX_TRACKED_EXECUTIONS = 50

export function trackerScopeKey(account: string | undefined, chainId: number | undefined): string {
  if (!account || !chainId) {
    return '__memory__'
  }
  return `${account.toLowerCase()}:${chainId}`
}

export function trackerStorageKey(scopeKey: string): string {
  return `${LS_EXECUTION_TRACKER}${scopeKey}`
}

export function loadTrackerSnapshot(scopeKey: string): ExecutionTrackerRecord[] {
  if (scopeKey === '__memory__') {
    return []
  }
  const snapshot = get<ExecutionTrackerSnapshot>(trackerStorageKey(scopeKey))
  return snapshot?.records ?? []
}

export function saveTrackerSnapshot(scopeKey: string, records: ExecutionTrackerRecord[]): void {
  if (scopeKey === '__memory__') {
    return
  }
  const trimmed = records.slice(-MAX_TRACKED_EXECUTIONS)
  const snapshot: ExecutionTrackerSnapshot = {
    scopeKey,
    records: trimmed,
    updatedAt: new Date().toISOString(),
  }
  set(trackerStorageKey(scopeKey), snapshot)
}
