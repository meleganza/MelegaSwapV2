import type { StaticProjectRecord } from 'registry/projects/types'
import { buildOnChainMetrics } from './onChainMetrics'
import { buildMarketSources } from './marketSources'

export type HealthTone = 'green' | 'yellow' | 'red'

export interface ProjectHealthDimension {
  key: string
  label: string
  tone: HealthTone
}

function docTone(project: StaticProjectRecord): HealthTone {
  if (project.docsUrl && project.websiteUrl) return 'green'
  if (project.docsUrl || project.websiteUrl) return 'yellow'
  return 'red'
}

function socialTone(project: StaticProjectRecord): HealthTone {
  const count = project.socialLinks?.length ?? 0
  if (count >= 2) return 'green'
  if (count === 1) return 'yellow'
  return 'red'
}

function contractTone(project: StaticProjectRecord): HealthTone {
  if (project.trustBadges.includes('canonical')) return 'green'
  if (project.verificationStatus === 'observed') return 'yellow'
  return 'red'
}

function securityTone(project: StaticProjectRecord): HealthTone {
  if (project.riskTier === 'low') return 'green'
  if (project.riskTier === 'medium') return 'yellow'
  return 'red'
}

function activityTone(project: StaticProjectRecord): HealthTone {
  const liveCount = Object.values(project.capabilities).filter((c) => c.status === 'live').length
  if (liveCount >= 4) return 'green'
  if (liveCount >= 2) return 'yellow'
  return 'red'
}

function transparencyTone(project: StaticProjectRecord): HealthTone {
  const fields = [project.websiteUrl, project.docsUrl, project.disclaimer, project.spaceProfileUrl]
  const filled = fields.filter(Boolean).length
  if (filled >= 3) return 'green'
  if (filled >= 2) return 'yellow'
  return 'red'
}

export function buildProjectHealth(project: StaticProjectRecord): ProjectHealthDimension[] {
  const metrics = buildOnChainMetrics(project)
  const liquidityTone: HealthTone =
    metrics.liquidity === 'Unavailable'
      ? project.capabilities.liquidity.status === 'live'
        ? 'yellow'
        : 'red'
      : 'green'

  return [
    { key: 'liquidity', label: 'Liquidity', tone: liquidityTone },
    { key: 'community', label: 'Community', tone: socialTone(project) },
    { key: 'documentation', label: 'Documentation', tone: docTone(project) },
    { key: 'contract', label: 'Contract', tone: contractTone(project) },
    { key: 'security', label: 'Security', tone: securityTone(project) },
    { key: 'transparency', label: 'Transparency', tone: transparencyTone(project) },
    { key: 'activity', label: 'Activity', tone: activityTone(project) },
  ]
}

export function healthSummaryLabel(dimensions: ProjectHealthDimension[]): string {
  const reds = dimensions.filter((d) => d.tone === 'red').length
  const greens = dimensions.filter((d) => d.tone === 'green').length
  if (reds >= 3) return 'Elevated risk'
  if (greens >= 5) return 'Healthy'
  return 'Moderate'
}
