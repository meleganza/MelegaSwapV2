import { getAssetBySlug, getAssetsByProjectSlug } from 'registry/assets/getAssetBySlug'
import { getAllAssets } from 'registry/assets/getAllAssets'
import { getAllEvents } from 'registry/events/getAllEvents'
import { getEventsByAssetSlug, getEventsByProjectSlug, getEventsByVenueSlug } from 'registry/events/getEventBySlug'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { getEventBySlug } from 'registry/events/getEventBySlug'
import { getAllVenues } from 'registry/venues/getAllVenues'
import { getVenueBySlug, getVenuesByAssetSlug, getVenuesByProjectSlug } from 'registry/venues/getVenueBySlug'
import { assetToNode, eventToNode, projectToNode, venueToNode } from './nodes'
import {
  EconomicGraph,
  GraphEdge,
  GraphLayerChain,
  GraphLinkStatus,
  GraphNeighborhood,
  GraphNodeRef,
  GraphNodeType,
  GraphRelation,
  RegistryGraphSummary,
} from './types'

const edgeKey = (from: GraphNodeRef, to: GraphNodeRef, relation: GraphRelation): string =>
  `${from.type}:${from.slug}->${to.type}:${to.slug}:${relation}`

const addEdge = (
  edges: Map<string, GraphEdge>,
  from: GraphNodeRef,
  to: GraphNodeRef,
  relation: GraphRelation,
  status: GraphLinkStatus = 'linked',
): void => {
  const key = edgeKey(from, to, relation)
  if (!edges.has(key)) {
    edges.set(key, { from, to, relation, status })
  }
}

export const resolveEconomicGraph = (): EconomicGraph => {
  const projects = getAllProjects().map(projectToNode)
  const assets = getAllAssets().map(assetToNode)
  const venues = getAllVenues().map(venueToNode)
  const events = getAllEvents().map(eventToNode)
  const edgeMap = new Map<string, GraphEdge>()

  getAllProjects().forEach((project) => {
    const projectNode = projectToNode(project)
    getAssetsByProjectSlug(project.slug).forEach((asset) => {
      addEdge(edgeMap, projectNode, assetToNode(asset), 'project_to_asset')
      addEdge(edgeMap, assetToNode(asset), projectNode, 'asset_to_project')
    })
    getVenuesByProjectSlug(project.slug).forEach((venue) => {
      addEdge(edgeMap, projectNode, venueToNode(venue), 'project_to_venue')
      addEdge(edgeMap, venueToNode(venue), projectNode, 'venue_to_project')
    })
    getEventsByProjectSlug(project.slug).forEach((event) => {
      addEdge(edgeMap, projectNode, eventToNode(event), 'project_to_event')
      addEdge(edgeMap, eventToNode(event), projectNode, 'event_to_project')
    })
  })

  getAllAssets().forEach((asset) => {
    const assetNode = assetToNode(asset)
    getVenuesByAssetSlug(asset.slug).forEach((venue) => {
      addEdge(edgeMap, assetNode, venueToNode(venue), 'asset_to_venue')
      addEdge(edgeMap, venueToNode(venue), assetNode, 'venue_to_asset')
    })
    getEventsByAssetSlug(asset.slug).forEach((event) => {
      addEdge(edgeMap, assetNode, eventToNode(event), 'asset_to_event')
      addEdge(edgeMap, eventToNode(event), assetNode, 'event_to_asset')
    })
  })

  getAllVenues().forEach((venue) => {
    const venueNode = venueToNode(venue)
    venue.assetBindings.forEach((binding) => {
      const asset = getAssetBySlug(binding.assetSlug)
      if (asset) {
        addEdge(edgeMap, venueNode, assetToNode(asset), 'venue_to_asset')
        addEdge(edgeMap, assetToNode(asset), venueNode, 'asset_to_venue')
      }
    })
    getEventsByVenueSlug(venue.slug).forEach((event) => {
      addEdge(edgeMap, venueNode, eventToNode(event), 'venue_to_event')
      addEdge(edgeMap, eventToNode(event), venueNode, 'event_to_venue')
    })
  })

  getAllEvents().forEach((event) => {
    const eventNode = eventToNode(event)
    if (event.relationships.venueSlug) {
      const venue = getVenueBySlug(event.relationships.venueSlug)
      if (venue) {
        addEdge(edgeMap, eventNode, venueToNode(venue), 'event_to_venue')
        addEdge(edgeMap, venueToNode(venue), eventNode, 'venue_to_event')
      }
    }
  })

  const edges = Array.from(edgeMap.values())
  const chains: GraphLayerChain[] = getAllProjects().map((project) => ({
    projectSlug: project.slug,
    assetSlugs: getAssetsByProjectSlug(project.slug).map((a) => a.slug),
    venueSlugs: getVenuesByProjectSlug(project.slug).map((v) => v.slug),
    eventSlugs: getEventsByProjectSlug(project.slug).map((e) => e.slug),
  }))

  const summary: RegistryGraphSummary = {
    projectCount: projects.length,
    assetCount: assets.length,
    venueCount: venues.length,
    eventCount: events.length,
    edgeCount: edges.length,
    linkedEdgeCount: edges.filter((e) => e.status === 'linked').length,
    notIndexedEdgeCount: edges.filter((e) => e.status === 'not_indexed').length,
    primaryProjectSlug: projects[0]?.slug ?? 'melega-dex',
  }

  return {
    summary,
    nodes: [...projects, ...assets, ...venues, ...events],
    edges,
    layers: { projects, assets, venues, events },
    chains,
  }
}

export const resolveGraphNeighborhood = (type: GraphNodeType, slug: string): GraphNeighborhood | null => {
  const graph = resolveEconomicGraph()
  const focus = graph.nodes.find((node) => node.type === type && node.slug === slug)
  if (!focus) {
    return null
  }

  const connectedEdges = graph.edges.filter(
    (edge) =>
      (edge.from.type === type && edge.from.slug === slug) || (edge.to.type === type && edge.to.slug === slug),
  )

  const pickNodes = (nodeType: GraphNodeType): GraphNodeRef[] => {
    const nodes: GraphNodeRef[] = []
    connectedEdges.forEach((edge) => {
      if (edge.from.type === type && edge.from.slug === slug && edge.to.type === nodeType) {
        nodes.push(edge.to)
      }
      if (edge.to.type === type && edge.to.slug === slug && edge.from.type === nodeType) {
        nodes.push(edge.from)
      }
    })
    return Array.from(new Map(nodes.map((n) => [n.slug, n])).values())
  }

  const uniqueEdges = Array.from(
    new Map(connectedEdges.map((edge) => [edgeKey(edge.from, edge.to, edge.relation), edge])).values(),
  )

  return {
    focus,
    projects: pickNodes('project'),
    assets: pickNodes('asset'),
    venues: pickNodes('venue'),
    events: pickNodes('event'),
    edges: uniqueEdges,
    treasuryStatus: 'not_indexed',
  }
}

export const getGraphNode = (type: GraphNodeType, slug: string): GraphNodeRef | undefined => {
  const project = type === 'project' ? getProjectBySlug(slug) : undefined
  if (project) return projectToNode(project)
  const asset = type === 'asset' ? getAssetBySlug(slug) : undefined
  if (asset) return assetToNode(asset)
  const venue = type === 'venue' ? getVenueBySlug(slug) : undefined
  if (venue) return venueToNode(venue)
  const event = type === 'event' ? getEventBySlug(slug) : undefined
  if (event) return eventToNode(event)
  return undefined
}
