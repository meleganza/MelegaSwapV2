import { fingerprint } from '../evidence/evidenceId'

export function buildMachineInterfaceId(parts: { projectId: string; version: string }): string {
  return `mif_${fingerprint([parts.projectId, parts.version].join('\u001f'))}`
}

export function buildCapabilityId(parts: { projectId: string; stableKey: string; capability: string }): string {
  return `cap_${fingerprint([parts.projectId, parts.stableKey, parts.capability].join('\u001f'))}`
}

export function buildActionId(parts: {
  projectId: string
  stableKey: string
  capability: string
  kind: string
}): string {
  return `act_${fingerprint([parts.projectId, parts.stableKey, parts.capability, parts.kind].join('\u001f'))}`
}

export function buildMachineResourceId(parts: { projectId: string; stableKey: string; kind: string }): string {
  return `mres_${fingerprint([parts.projectId, parts.stableKey, parts.kind].join('\u001f'))}`
}

export function buildEndpointId(parts: { projectId: string; path: string; method: string }): string {
  return `ep_${fingerprint([parts.projectId, parts.path, parts.method].join('\u001f'))}`
}

export function buildMachineRelationId(parts: { fromId: string; toId: string; relationType: string }): string {
  return `mrel_${fingerprint([parts.fromId, parts.toId, parts.relationType].join('\u001f'))}`
}

export function buildMachineEntityRevision(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}
