import { getAssetBySlug, getAssetsByProjectSlug } from 'registry/assets/getAssetBySlug'
import { assetToNode, eventToNode, projectToNode, venueToNode } from 'registry/graph/nodes'
import { resolveEconomicGraph } from 'registry/graph/resolveGraph'
import { getAllEvents } from 'registry/events/getAllEvents'
import { getEventsByAssetSlug, getEventsByProjectSlug, getEventsByVenueSlug } from 'registry/events/getEventBySlug'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { CapabilityStatus, ProjectCapabilities, StaticProjectRecord } from 'registry/projects/types'
import { getAllVenues } from 'registry/venues/getAllVenues'
import { getVenuesByAssetSlug, getVenuesByProjectSlug } from 'registry/venues/getVenueBySlug'
import { VenueType } from 'registry/venues/types'
import { MACHINE_MANIFEST_SURFACES, QUERY_REGISTRY_AS_OF } from './constants'
import {
  ProjectCapabilityQuery,
  QueryItemStatus,
  QueryResult,
  QueryResultItem,
  TreasuryCompatibilityFilter,
} from './types'

const isTreasuryCompatible = (status: CapabilityStatus): boolean => status === 'live' || status === 'partial'

const itemFromProject = (project: StaticProjectRecord, status: QueryItemStatus = 'linked'): QueryResultItem => {
  const node = projectToNode(project)
  return { ...node, nodeType: 'project', status }
}

const wrapResult = (queryId: string, label: string, description: string, items: QueryResultItem[]): QueryResult => ({
  queryId,
  label,
  description,
  resultCount: items.length,
  items,
  dataSource: 'registry-query-static',
  asOf: QUERY_REGISTRY_AS_OF,
})

export const findProjectsByAsset = (assetSlug: string): QueryResultItem[] => {
  const asset = getAssetBySlug(assetSlug)
  if (!asset) return []
  return getAllProjects()
    .filter((project) => getAssetsByProjectSlug(project.slug).some((a) => a.slug === assetSlug))
    .map((project) => itemFromProject(project))
}

export const findProjectsByCapability = (
  capability: ProjectCapabilityQuery,
  statuses: CapabilityStatus[] = ['live', 'partial'],
): QueryResultItem[] =>
  getAllProjects()
    .filter((project) => statuses.includes(project.capabilities[capability].status))
    .map((project) =>
      itemFromProject(project, project.capabilities[capability].status as QueryItemStatus),
    )

export const findProjectsByTreasuryCompatibility = (
  filter: TreasuryCompatibilityFilter = { includePartial: true, includeLive: true },
): QueryResultItem[] =>
  getAllProjects()
    .filter((project) => {
      const status = project.capabilities.treasuryCompatible.status
      if (filter.includeLive && status === 'live') return true
      if (filter.includePartial && status === 'partial') return true
      return false
    })
    .map((project) => itemFromProject(project, project.capabilities.treasuryCompatible.status as QueryItemStatus))

export const findAssetsByProject = (projectSlug: string): QueryResultItem[] =>
  getAssetsByProjectSlug(projectSlug).map((asset) => ({
    ...assetToNode(asset),
    nodeType: 'asset' as const,
    status: asset.lifecycle as QueryItemStatus,
  }))

export const findVenuesByProject = (projectSlug: string): QueryResultItem[] =>
  getVenuesByProjectSlug(projectSlug).map((venue) => ({
    ...venueToNode(venue),
    nodeType: 'venue' as const,
    status: venue.lifecycle as QueryItemStatus,
  }))

export const findVenuesByAsset = (assetSlug: string): QueryResultItem[] =>
  getVenuesByAssetSlug(assetSlug).map((venue) => ({
    ...venueToNode(venue),
    nodeType: 'venue' as const,
    status: venue.lifecycle as QueryItemStatus,
  }))

export const findVenuesByType = (venueType: VenueType): QueryResultItem[] =>
  getAllVenues()
    .filter((venue) => venue.venueType === venueType)
    .map((venue) => ({
      ...venueToNode(venue),
      nodeType: 'venue' as const,
      status: venue.lifecycle as QueryItemStatus,
    }))

export const findEventsByProject = (projectSlug: string): QueryResultItem[] =>
  getEventsByProjectSlug(projectSlug).map((event) => ({
    ...eventToNode(event),
    nodeType: 'event' as const,
    status: event.status as QueryItemStatus,
  }))

export const findEventsByAsset = (assetSlug: string): QueryResultItem[] =>
  getEventsByAssetSlug(assetSlug).map((event) => ({
    ...eventToNode(event),
    nodeType: 'event' as const,
    status: event.status as QueryItemStatus,
  }))

export const findEventsByVenue = (venueSlug: string): QueryResultItem[] =>
  getEventsByVenueSlug(venueSlug).map((event) => ({
    ...eventToNode(event),
    nodeType: 'event' as const,
    status: event.status as QueryItemStatus,
  }))

export const findMachineReadyNodes = (): QueryResultItem[] => {
  const projectItems = getAllProjects()
    .filter((project) => project.capabilities.machineManifest.status === 'live')
    .map((project) => ({
      ...projectToNode(project),
      nodeType: 'project' as const,
      status: 'live' as const,
      notes: project.capabilities.machineManifest.notes,
    }))

  const manifestItems: QueryResultItem[] = MACHINE_MANIFEST_SURFACES.map((surface) => ({
    nodeType: 'manifest',
    slug: surface.slug,
    identity: surface.identity,
    displayName: surface.displayName,
    href: surface.href,
    status: 'live',
    notes: 'Static machine discovery index',
  }))

  return [...projectItems, ...manifestItems]
}

export const findNotIndexedRelationships = (): QueryResultItem[] => {
  const items: QueryResultItem[] = []

  getAllVenues().forEach((venue) => {
    venue.assetBindings.forEach((binding) => {
      if (!getAssetBySlug(binding.assetSlug)) {
        items.push({
          nodeType: 'relationship',
          slug: `${venue.slug}-${binding.assetSlug}`,
          identity: binding.assetUai,
          displayName: `${venue.displayName} → ${binding.assetSlug}`,
          href: `/venues/${venue.slug}`,
          status: 'not_indexed',
          notes: `Asset binding not in Organ 02 registry (${binding.role})`,
        })
      }
    })
    if (venue.metrics.status === 'not_indexed') {
      items.push({
        nodeType: 'relationship',
        slug: `${venue.slug}-metrics`,
        identity: venue.uvi,
        displayName: `${venue.displayName} metrics`,
        href: `/venues/${venue.slug}`,
        status: 'not_indexed',
        notes: venue.metrics.notes,
      })
    }
  })

  getAllEvents().forEach((event) => {
    if (event.relationships.treasury.status === 'not_indexed') {
      items.push({
        nodeType: 'relationship',
        slug: `${event.slug}-treasury`,
        identity: event.uei,
        displayName: `${event.displayName} treasury`,
        href: `/events/${event.slug}`,
        status: 'not_indexed',
        notes: event.relationships.treasury.notes,
      })
    }
  })

  getAllProjects().forEach((project) => {
    if (!isTreasuryCompatible(project.capabilities.treasuryCompatible.status)) {
      items.push({
        nodeType: 'relationship',
        slug: `${project.slug}-treasury-compat`,
        identity: project.upi,
        displayName: `${project.displayName} treasury compatibility`,
        href: `/@${project.slug}/`,
        status: 'not_indexed',
        notes: project.capabilities.treasuryCompatible.notes,
      })
    }
  })

  const graph = resolveEconomicGraph()
  if (graph.summary.notIndexedEdgeCount > 0) {
    graph.edges
      .filter((edge) => edge.status === 'not_indexed')
      .forEach((edge) => {
        items.push({
          nodeType: 'relationship',
          slug: `${edge.from.slug}-${edge.to.slug}-${edge.relation}`,
          identity: `${edge.from.identity} -> ${edge.to.identity}`,
          displayName: `${edge.from.displayName} → ${edge.to.displayName}`,
          href: '/graph',
          status: 'not_indexed',
          notes: edge.relation,
        })
      })
  } else {
    items.push({
      nodeType: 'relationship',
      slug: 'graph-treasury',
      identity: 'manifest://melega/platform/registry-graph@0.1.0',
      displayName: 'Registry graph treasury attribution',
      href: '/graph',
      status: 'not_indexed',
      notes: 'Treasury SKU attribution — Treasury Runtime Phase 2',
    })
  }

  return items
}

export const runQueryPreset = (presetId: import('./types').QueryPresetId): QueryResult => {
  switch (presetId) {
    case 'projects-with-marco-assets':
      return wrapResult(
        presetId,
        'Projects with MARCO assets',
        'Projects linked to the MARCO (BSC) asset.',
        findProjectsByAsset('marco'),
      )
    case 'treasury-compatible-projects':
      return wrapResult(
        presetId,
        'Treasury-compatible projects',
        'Projects with treasuryCompatible partial or live.',
        findProjectsByTreasuryCompatibility(),
      )
    case 'venues-connected-to-marco':
      return wrapResult(
        presetId,
        'Venues connected to MARCO',
        'Venues linked to MARCO in the static registry.',
        findVenuesByAsset('marco'),
      )
    case 'events-derived-from-marco':
      return wrapResult(
        presetId,
        'Events derived from MARCO',
        'Events linked to MARCO in the static registry.',
        findEventsByAsset('marco'),
      )
    case 'machine-ready-surfaces':
      return wrapResult(
        presetId,
        'Machine-ready surfaces',
        'Live machine manifests and static discovery indexes.',
        findMachineReadyNodes(),
      )
    case 'not-indexed-relationships':
      return wrapResult(
        presetId,
        'Not-indexed relationships',
        'Unresolved bindings and treasury placeholders.',
        findNotIndexedRelationships(),
      )
    default:
      return wrapResult(presetId, presetId, '', [])
  }
}

export const runAllQueryPresets = (): QueryResult[] =>
  (['projects-with-marco-assets', 'treasury-compatible-projects', 'venues-connected-to-marco', 'events-derived-from-marco', 'machine-ready-surfaces', 'not-indexed-relationships'] as const).map(
    runQueryPreset,
  )

export type { ProjectCapabilities }
