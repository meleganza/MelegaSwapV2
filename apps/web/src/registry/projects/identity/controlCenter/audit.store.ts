import type { ControlCenterAuditRecord } from './types'

const globalKey = '__melega_pp012_control_center_audit__'

function getRoot(): Map<string, ControlCenterAuditRecord[]> {
  const g = globalThis as typeof globalThis & { [globalKey]?: Map<string, ControlCenterAuditRecord[]> }
  if (!g[globalKey]) g[globalKey] = new Map()
  return g[globalKey]!
}

/** Append-only. Never deletes or mutates prior records. */
export function appendAuditRecord(record: ControlCenterAuditRecord): ControlCenterAuditRecord {
  const root = getRoot()
  const list = root.get(record.projectSlug) ?? []
  if (list.some((r) => r.auditId === record.auditId)) {
    return record
  }
  list.push(record)
  root.set(record.projectSlug, list)
  return record
}

export function listAuditRecords(slug: string): ControlCenterAuditRecord[] {
  const list = getRoot().get(slug) ?? []
  return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.auditId.localeCompare(b.auditId))
}

export function resetAuditForTests(): void {
  getRoot().clear()
}
