import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { OptionalService } from '../buildStudioData'
import { buildInfrastructureSuggestions } from './buildInfrastructureSuggestions'

export interface ExtensionCard extends OptionalService {
  available: boolean
  requirements: string
  status: string
  href?: string
}

const EXTENSION_DEFS: Omit<ExtensionCard, 'available' | 'requirements' | 'status'>[] = [
  {
    id: 'radar',
    title: 'Radar Visibility',
    purpose: 'Index project infrastructure in ecosystem radar for operational discovery.',
    activationTime: '~15 min',
    href: '/radar',
  },
  {
    id: 'projects',
    title: 'Projects Verification',
    purpose: 'Verify project profile against constitutional infrastructure standards.',
    activationTime: '~30 min',
    href: '/projects',
  },
  {
    id: 'trending',
    title: 'Trending Boost',
    purpose: 'Enable trending eligibility after infrastructure validation completes.',
    activationTime: '~20 min',
    href: '/trending',
  },
  {
    id: 'audit',
    title: 'Professional Audit (Melega Space)',
    purpose: 'Optional security infrastructure extension via Melega Space.',
    activationTime: '2–5 days',
    href: 'https://melega.space/',
  },
  {
    id: 'smartdrop',
    title: 'SmartDrop Campaign',
    purpose: 'Distribution infrastructure extension — not fundraising.',
    activationTime: '~45 min',
  },
  {
    id: 'labs',
    title: 'Labs Narrative Activation',
    purpose: 'Labs narrative extension — separate from DEX infrastructure.',
    activationTime: '1–3 days',
    href: '/runtime/labs',
  },
]

export function buildInfrastructureExtensions(project?: EnrichedProjectRecord): ExtensionCard[] {
  const suggestions = project ? buildInfrastructureSuggestions(project) : []
  const suggestedIds = new Set(suggestions.map((s) => s.id))

  return EXTENSION_DEFS.map((ext) => {
    let available = false
    let requirements = 'Import or select a registry project first'
    let status = 'Unavailable'

    if (project) {
      switch (ext.id) {
        case 'radar':
          available = project.capabilities.radar.status === 'live' || suggestedIds.has('radar-indexing')
          requirements = 'Registry project + contract'
          status = project.capabilities.radar.status === 'live' ? 'Live' : 'Suggested'
          break
        case 'projects':
          available = project.registryStatus === 'listed'
          requirements = 'Indexed in Projects registry'
          status = available ? 'Available' : 'Unavailable'
          break
        case 'trending':
          available = suggestedIds.has('trending-eligible')
          requirements = 'Canonical project + live tradable surface'
          status = available ? 'Eligible' : 'Unavailable'
          break
        case 'audit':
          available = Boolean(project.spaceProfileUrl)
          requirements = 'Melega Space profile'
          status = available ? 'Available' : 'Suggested'
          break
        case 'smartdrop':
          available = project.capabilities.smartdrop.status === 'live'
          requirements = 'SmartDrop module'
          status = project.capabilities.smartdrop.status
          break
        case 'labs':
          available = project.capabilities.labs.status === 'live' || project.capabilities.labs.status === 'partial'
          requirements = 'Labs runtime'
          status = project.capabilities.labs.status
          break
        default:
          break
      }
    }

    return { ...ext, available, requirements, status }
  })
}
