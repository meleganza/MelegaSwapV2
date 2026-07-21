import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import { resolveProjectBySlug } from '../resolveProject'
import { loadProjectEvidencePack } from '../evidence'
import { fingerprint } from '../evidence/evidenceId'
import { sanitizePlainText } from '../urlSafety'
import {
  MACHINE_INTERFACE_VERSION,
  MACHINE_LIMITATIONS,
  MACHINE_RESOLVER_REVISION,
  PROJECT_MACHINE_SCHEMA_VERSION,
  PROJECT_PAGE_MACHINE_SUMMARY_EXTENSION,
  isCertifiedMachineRoute,
  isMachineActionKind,
  isMachineActionStatus,
  isMachineAvailability,
  isMachineCapability,
  isMachineRelationType,
  isMachineResourceKind,
  type MachineAvailability,
} from './schema'
import {
  buildActionId,
  buildCapabilityId,
  buildEndpointId,
  buildMachineEntityRevision,
  buildMachineInterfaceId,
  buildMachineRelationId,
  buildMachineResourceId,
} from './ids'
import {
  listMachineActionsForSlug,
  listMachineCapabilitiesForSlug,
  listMachineRelationsForSlug,
  listMachineResourcesForSlug,
} from './registry.data'
import type {
  MachineActionEntity,
  MachineCapabilityEntity,
  MachineEndpointEntity,
  MachineRelation,
  MachineResourceEntity,
  MachineSchemaEntity,
  MachineSummaryForProjectApi,
  MachineWarning,
  ProjectMachineDocument,
} from './types'

const SEED_SLUG = 'melega-dex'

function revisionFromParts(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

function sanitizeTag(raw: string): string | null {
  const cleaned = sanitizePlainText(raw, 64)
  if (!cleaned) return null
  return cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
}

/** Rewrite melega-dex path templates to the resolved canonical slug. */
function localizeRoute(route: string | null, slug: string): string | null {
  if (!route) return null
  return route.replace(/melega-dex/g, slug)
}

function isSafeMachineRoute(route: string): boolean {
  const [pathPart, hash] = route.split('#')
  if (!isCertifiedMachineRoute(pathPart)) return false
  if (hash && !/^[a-z0-9-]+$/i.test(hash)) return false
  return true
}

const HUB_SCHEMAS: MachineSchemaEntity[] = [
  { schemaId: 'schema:project-page', schemaVersion: 'melega.project-page.v1', title: 'Project Page', hub: 'PP001' },
  { schemaId: 'schema:evidence', schemaVersion: 'melega.project-evidence.v1', title: 'Evidence', hub: 'PP002' },
  { schemaId: 'schema:readiness', schemaVersion: 'melega.project-readiness.v1', title: 'Readiness', hub: 'PP003' },
  { schemaId: 'schema:markets', schemaVersion: 'melega.project-markets.v1', title: 'Markets', hub: 'PP005' },
  {
    schemaId: 'schema:participation',
    schemaVersion: 'melega.project-participation.v1',
    title: 'Participation',
    hub: 'PP006',
  },
  {
    schemaId: 'schema:liquidity-building',
    schemaVersion: 'melega.project-liquidity-building.v1',
    title: 'Liquidity Building',
    hub: 'PP007',
  },
  { schemaId: 'schema:updates', schemaVersion: 'melega.project-updates.v1', title: 'Updates', hub: 'PP008' },
  { schemaId: 'schema:ecosystem', schemaVersion: 'melega.project-ecosystem.v1', title: 'Ecosystem', hub: 'PP009' },
  { schemaId: 'schema:developer', schemaVersion: 'melega.project-developer.v1', title: 'Developer', hub: 'PP010' },
  { schemaId: 'schema:governance', schemaVersion: 'melega.project-governance.v1', title: 'Governance', hub: 'PP011' },
  {
    schemaId: 'schema:control-center',
    schemaVersion: 'melega.project-control-center.v1',
    title: 'Control Center',
    hub: 'PP012',
  },
  { schemaId: 'schema:growth', schemaVersion: 'melega.project-growth.v1', title: 'Growth', hub: 'PP013' },
  { schemaId: 'schema:machine', schemaVersion: 'melega.project-machine.v1', title: 'Machine Interface', hub: 'PP014' },
]

/**
 * Shared Machine Interface resolver — public API and Project Page must use this.
 */
export function buildProjectMachineDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  generatedAt?: string
}): ProjectMachineDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: MachineWarning[] = []
  const projectId = input.document.projectId
  const slug = input.document.slug
  const idByStableKey = new Map<string, string>()

  const capabilityRows = listMachineCapabilitiesForSlug(SEED_SLUG)
  const actionRows = listMachineActionsForSlug(SEED_SLUG)
  const resourceRows = listMachineResourcesForSlug(SEED_SLUG)

  for (const row of capabilityRows) {
    if (!isMachineCapability(row.capability)) continue
    idByStableKey.set(
      row.stableKey,
      buildCapabilityId({ projectId, stableKey: row.stableKey, capability: row.capability }),
    )
  }
  for (const row of actionRows) {
    if (!isMachineCapability(row.capability) || !isMachineActionKind(row.kind)) continue
    idByStableKey.set(
      row.stableKey,
      buildActionId({
        projectId,
        stableKey: row.stableKey,
        capability: row.capability,
        kind: row.kind,
      }),
    )
  }
  for (const row of resourceRows) {
    if (!isMachineResourceKind(row.kind)) continue
    idByStableKey.set(row.stableKey, buildMachineResourceId({ projectId, stableKey: row.stableKey, kind: row.kind }))
  }

  const endpointByPath = new Map<string, MachineEndpointEntity>()
  const capabilities: MachineCapabilityEntity[] = []
  for (const row of capabilityRows) {
    if (!isMachineCapability(row.capability) || !isMachineAvailability(row.availability)) {
      warnings.push({
        reasonCode: 'INVALID_CAPABILITY_DROPPED',
        message: `Dropped capability ${row.stableKey}.`,
        entityId: null,
      })
      continue
    }
    const title = sanitizePlainText(row.title, 120)
    const summary = sanitizePlainText(row.summary, 400)
    if (!title || !summary) continue
    const capabilityId = idByStableKey.get(row.stableKey)!
    const relatedEndpointIds: string[] = []
    for (const rawPath of row.relatedEndpointPaths) {
      const path = localizeRoute(rawPath, slug)
      if (!path || !isCertifiedMachineRoute(path)) {
        warnings.push({
          reasonCode: 'UNSAFE_ROUTE_DROPPED',
          message: `Dropped uncertified endpoint path for ${row.stableKey}.`,
          entityId: capabilityId,
        })
        continue
      }
      const endpointId = buildEndpointId({ projectId, path, method: 'GET' })
      relatedEndpointIds.push(endpointId)
      if (!endpointByPath.has(path)) {
        endpointByPath.set(path, {
          endpointId,
          projectId,
          path,
          method: 'GET',
          title: path,
          schemaVersion: null,
          availability: 'AVAILABLE',
          revision: buildMachineEntityRevision([endpointId, path]),
        })
      }
    }
    capabilities.push({
      capabilityId,
      projectId,
      capability: row.capability,
      title,
      summary,
      availability: row.availability,
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      relatedEndpointIds: [...new Set(relatedEndpointIds)].sort(),
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      revision: buildMachineEntityRevision([capabilityId, row.capability, row.availability, title, summary]),
      stableKey: row.stableKey,
    })
  }
  capabilities.sort((a, b) => a.capabilityId.localeCompare(b.capabilityId))

  const actions: MachineActionEntity[] = []
  for (const row of actionRows) {
    if (
      !isMachineCapability(row.capability) ||
      !isMachineActionKind(row.kind) ||
      !isMachineAvailability(row.availability) ||
      !isMachineActionStatus(row.status)
    ) {
      warnings.push({
        reasonCode: 'INVALID_ACTION_DROPPED',
        message: `Dropped action ${row.stableKey}.`,
        entityId: null,
      })
      continue
    }
    const title = sanitizePlainText(row.title, 160)
    const summary = sanitizePlainText(row.summary, 400)
    if (!title || !summary) continue
    let route = localizeRoute(row.route, slug)
    if (route && !isSafeMachineRoute(route)) {
      warnings.push({
        reasonCode: 'UNSAFE_ROUTE_DROPPED',
        message: `Dropped uncertified route for action ${row.stableKey}.`,
        entityId: idByStableKey.get(row.stableKey) ?? null,
      })
      route = null
    }
    const actionId = idByStableKey.get(row.stableKey)!
    // Hard rule: never claim wallet-required execution / tx payloads.
    actions.push({
      actionId,
      projectId,
      capability: row.capability,
      kind: row.kind,
      title,
      summary,
      route,
      requiredContext: [...row.requiredContext].sort(),
      walletRequired: false,
      chainRequired: row.chainRequired,
      availability: route || row.kind === 'DISCOVER' ? row.availability : 'UNAVAILABLE',
      status: route || row.kind === 'DISCOVER' ? row.status : 'UNAVAILABLE',
      limitations: row.limitations.map((l) => sanitizePlainText(l, 240)).filter((l): l is string => Boolean(l)),
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      revision: buildMachineEntityRevision([actionId, row.capability, row.kind, route ?? '', 'walletRequired:false']),
      stableKey: row.stableKey,
    })
  }
  actions.sort((a, b) => a.actionId.localeCompare(b.actionId))

  const resources: MachineResourceEntity[] = []
  for (const row of resourceRows) {
    if (!isMachineResourceKind(row.kind) || !isMachineAvailability(row.availability)) continue
    const title = sanitizePlainText(row.title, 160)
    const summary = sanitizePlainText(row.summary, 400)
    if (!title || !summary) continue
    let route = localizeRoute(row.route, slug)
    if (route && !isSafeMachineRoute(route)) {
      warnings.push({
        reasonCode: 'UNSAFE_ROUTE_DROPPED',
        message: `Dropped uncertified resource route for ${row.stableKey}.`,
        entityId: idByStableKey.get(row.stableKey) ?? null,
      })
      route = null
    }
    const resourceId = idByStableKey.get(row.stableKey)!
    resources.push({
      resourceId,
      projectId,
      kind: row.kind,
      title,
      summary,
      route,
      schemaVersion: row.schemaVersion,
      availability: row.availability,
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      revision: buildMachineEntityRevision([resourceId, row.kind, route ?? '', row.availability]),
      stableKey: row.stableKey,
    })
  }
  resources.sort((a, b) => a.resourceId.localeCompare(b.resourceId))

  const machinePath = `/api/public/projects/${slug}/machine/`
  if (!endpointByPath.has(machinePath)) {
    endpointByPath.set(machinePath, {
      endpointId: buildEndpointId({ projectId, path: machinePath, method: 'GET' }),
      projectId,
      path: machinePath,
      method: 'GET',
      title: 'Machine Interface',
      schemaVersion: PROJECT_MACHINE_SCHEMA_VERSION,
      availability: 'AVAILABLE',
      revision: buildMachineEntityRevision([machinePath]),
    })
  }
  const endpoints = [...endpointByPath.values()].sort((a, b) => a.path.localeCompare(b.path))

  const relationships: MachineRelation[] = []
  for (const edge of listMachineRelationsForSlug(SEED_SLUG)) {
    if (!isMachineRelationType(edge.relationType)) continue
    const fromId = idByStableKey.get(edge.fromStableKey)
    const toId = idByStableKey.get(edge.toStableKey)
    if (!fromId || !toId) {
      warnings.push({
        reasonCode: 'RELATION_TARGET_MISSING',
        message: `Relation ${edge.fromStableKey} -> ${edge.toStableKey} missing endpoint.`,
        entityId: fromId ?? toId ?? null,
      })
      continue
    }
    relationships.push({
      relationId: buildMachineRelationId({ fromId, toId, relationType: edge.relationType }),
      fromId,
      toId,
      relationType: edge.relationType,
    })
  }
  for (const cap of capabilities) {
    for (const sectionId of cap.relatedSectionIds) {
      const toId = `section:${sectionId}`
      relationships.push({
        relationId: buildMachineRelationId({
          fromId: cap.capabilityId,
          toId,
          relationType: 'LINKS_SECTION',
        }),
        fromId: cap.capabilityId,
        toId,
        relationType: 'LINKS_SECTION',
      })
    }
    for (const endpointId of cap.relatedEndpointIds) {
      relationships.push({
        relationId: buildMachineRelationId({
          fromId: cap.capabilityId,
          toId: endpointId,
          relationType: 'LINKS_ENDPOINT',
        }),
        fromId: cap.capabilityId,
        toId: endpointId,
        relationType: 'LINKS_ENDPOINT',
      })
    }
  }
  for (const act of actions) {
    const cap = capabilities.find((c) => c.capability === act.capability)
    if (cap) {
      relationships.push({
        relationId: buildMachineRelationId({
          fromId: act.actionId,
          toId: cap.capabilityId,
          relationType: 'USES_CAPABILITY',
        }),
        fromId: act.actionId,
        toId: cap.capabilityId,
        relationType: 'USES_CAPABILITY',
      })
    }
  }
  relationships.sort((a, b) => a.relationId.localeCompare(b.relationId))

  if (capabilities.length === 0) {
    warnings.push({
      reasonCode: 'NO_CAPABILITIES',
      message: 'No machine capabilities registered.',
      entityId: null,
    })
  }

  const interfaceId = buildMachineInterfaceId({
    projectId,
    version: MACHINE_INTERFACE_VERSION,
  })
  const revision = revisionFromParts([
    input.document.revision,
    interfaceId,
    ...capabilities.map((c) => `${c.capabilityId}:${c.revision}`),
    ...actions.map((a) => `${a.actionId}:${a.revision}`),
    ...resources.map((r) => `${r.resourceId}:${r.revision}`),
    ...endpoints.map((e) => e.endpointId),
    ...relationships.map((r) => r.relationId),
  ])

  const availability: MachineAvailability = capabilities.length > 0 ? 'AVAILABLE' : 'NOT_APPLICABLE'
  const discoveryEndpoint = `/.well-known/melega-dex-discovery.json`
  const wellKnownPath = `/.well-known/melega-dex-machine.json`

  return {
    schemaVersion: PROJECT_MACHINE_SCHEMA_VERSION,
    projectId,
    slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    revision,
    resolverRevision: MACHINE_RESOLVER_REVISION,
    generatedAt,
    machineInterface: {
      interfaceId,
      projectId,
      version: MACHINE_INTERFACE_VERSION,
      generatedAt,
      revision,
      discoveryEndpoint,
      machineEndpoint: machinePath,
      wellKnownPath,
    },
    capabilities,
    actions,
    resources,
    endpoints,
    schemas: HUB_SCHEMAS,
    relationships,
    summary: {
      interfaceVersion: MACHINE_INTERFACE_VERSION,
      capabilityCount: capabilities.length,
      actionCount: actions.length,
      endpointCount: endpoints.length,
      machineEndpoint: machinePath,
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: MACHINE_LIMITATIONS,
  }
}

export function toMachineSummaryForProjectApi(doc: ProjectMachineDocument): MachineSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_MACHINE_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    interfaceVersion: doc.machineInterface.version,
    capabilityCount: doc.summary.capabilityCount,
    endpoint: doc.summary.machineEndpoint,
    revision: doc.revision,
  }
}

export function loadProjectMachineDocument(slug: string, generatedAt?: string): ProjectMachineDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectMachineDocument({
    project: resolved.project,
    document: loaded.document,
    generatedAt: at,
  })
}
