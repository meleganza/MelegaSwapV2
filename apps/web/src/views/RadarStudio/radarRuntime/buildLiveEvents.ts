import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { CHAIN_LABELS } from 'registry/projects/constants'
import type { LiveEventItem, LiveEventType } from '../radarStudioData'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'

export interface RadarLiveEvent extends LiveEventItem {
  severity: 'low' | 'medium' | 'high'
  source: string
}

function symbol(project: EnrichedProjectRecord): string {
  return project.resources.tokens[0]?.symbol ?? project.displayName
}

function pushEvent(
  events: RadarLiveEvent[],
  partial: Omit<RadarLiveEvent, 'id'> & { id?: string },
) {
  events.push({
    id: partial.id ?? `evt-${events.length + 1}`,
    ...partial,
  })
}

export function buildLiveEvents(projects: EnrichedProjectRecord[]): RadarLiveEvent[] {
  const events: RadarLiveEvent[] = []

  projects.forEach((project) => {
    const sym = symbol(project)
    const rating = buildProjectRating(project)

    pushEvent(events, {
      type: 'verification',
      project: sym,
      event: 'Project indexed in Melega registry',
      timestamp: project.asOf,
      confidence: `${rating.confidence}%`,
      severity: 'medium',
      source: 'Projects Runtime',
    })

    if (project.capabilities.pool.status === 'live') {
      pushEvent(events, {
        type: 'dex',
        project: sym,
        event: 'Staking pools live on Melega',
        timestamp: project.asOf,
        confidence: `${Math.min(95, rating.confidence + 5)}%`,
        severity: 'medium',
        source: 'Internal Runtime',
      })
    }

    if (project.capabilities.farm.status === 'live') {
      pushEvent(events, {
        type: 'liquidity',
        project: sym,
        event: 'Farm infrastructure active',
        timestamp: project.asOf,
        confidence: `${rating.confidence}%`,
        severity: 'medium',
        source: 'Internal Runtime',
      })
    }

    if (project.trustBadges.includes('canonical')) {
      pushEvent(events, {
        type: 'audit',
        project: sym,
        event: 'Canonical project verified in registry',
        timestamp: project.asOf,
        confidence: `${rating.confidence}%`,
        severity: 'high',
        source: 'Projects Runtime',
      })
    }

    pushEvent(events, {
      type: 'contract',
      project: sym,
      event: `Radar intelligence linked · ${CHAIN_LABELS[project.supportedChains[0]] ?? 'Multi-chain'}`,
      timestamp: project.asOf,
      confidence: `${rating.confidence}%`,
      severity: 'low',
      source: 'Melega AI',
    })
  })

  return events
}

export function eventTypeFromFilter(chip: string): LiveEventType | null {
  switch (chip) {
    case 'Whales':
      return 'whale'
    case 'Liquidity':
      return 'liquidity'
    case 'Contracts':
      return 'contract'
    case 'Holder Growth':
      return 'community'
    default:
      return null
  }
}
