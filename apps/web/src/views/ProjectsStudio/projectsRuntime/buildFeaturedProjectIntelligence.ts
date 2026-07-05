import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { ProjectLiveMetricsSnapshot } from 'lib/projects-data/projectLiveMetrics'
import { buildProjectHealth, healthSummaryLabel } from './buildProjectHealth'
import { buildProjectRating } from './buildProjectRating'
import { buildMarketSources } from './marketSources'

export interface ProjectIntelligenceRow {
  label: string
  value: string
  score: string
  tone: 'green' | 'gold' | 'gray'
  source?: string
}

function sourceConfidence(available: boolean, configured: boolean): string {
  if (available) return 'Verified'
  if (configured) return 'Public link'
  return 'Unavailable'
}

export function buildFeaturedProjectIntelligence(
  project: EnrichedProjectRecord | undefined,
  liveMetrics?: ProjectLiveMetricsSnapshot,
): ProjectIntelligenceRow[] {
  if (!project) {
    return [{ label: 'Featured project', value: '—', score: '—', tone: 'gray' }]
  }

  const sources = buildMarketSources(project, project.asOf)
  const health = buildProjectHealth(project)
  const rating = buildProjectRating(project)
  const symbol = project.resources.tokens[0]?.symbol ?? project.displayName
  const riskLabel =
    project.riskTier === 'low'
      ? 'Low'
      : project.riskTier === 'medium'
        ? 'Medium'
        : project.riskTier === 'high'
          ? 'High'
          : healthSummaryLabel(health)

  const cg = sources.find((s) => s.key === 'coingecko')
  const dex = sources.find((s) => s.key === 'dexscreener')
  const dt = sources.find((s) => s.key === 'dextools')
  const explorer = sources.find((s) => s.key === 'explorer')

  const marketPresence = [cg, dex, dt].filter((s) => s?.href).length
  const marketLabel =
    marketPresence >= 2
      ? `${marketPresence} public sources`
      : marketPresence === 1
        ? '1 public source'
        : explorer?.href
          ? 'Explorer only'
          : 'Registry'

  return [
    {
      label: 'Risk',
      value: riskLabel,
      score: `${rating.score}/100`,
      tone: riskLabel === 'Low' || riskLabel === 'Healthy' ? 'green' : 'gold',
      source: 'Registry + runtime',
    },
    {
      label: 'Age',
      value: liveMetrics?.age.display ?? project.asOf ?? '—',
      score: sourceConfidence(Boolean(liveMetrics?.age.display && liveMetrics.age.display !== '—'), true),
      tone: 'gray',
      source: 'Registry',
    },
    {
      label: 'Liquidity',
      value: liveMetrics?.liquidity.display ?? '—',
      score: liveMetrics?.liquidity.reasonCode ? 'Indexed pending' : 'Subgraph',
      tone: liveMetrics?.liquidity.display && liveMetrics.liquidity.display !== '—' ? 'green' : 'gold',
      source: 'Subgraph',
    },
    {
      label: 'Verification',
      value:
        project.verificationStatus === 'observed'
          ? 'Observed'
          : project.trustBadges.includes('canonical')
            ? 'Canonical'
            : 'Pending',
      score: project.trustBadges.includes('canonical') ? 'Constitutional' : 'Review',
      tone: project.trustBadges.includes('canonical') ? 'green' : 'gold',
      source: 'Registry',
    },
    {
      label: 'Website',
      value: project.websiteUrl ? 'Listed' : '—',
      score: sourceConfidence(Boolean(project.websiteUrl), true),
      tone: project.websiteUrl ? 'green' : 'gray',
      source: 'Registry',
    },
    {
      label: 'Social',
      value: project.socialLinks?.length ? `${project.socialLinks.length} channels` : '—',
      score: sourceConfidence(Boolean(project.socialLinks?.length), true),
      tone: project.socialLinks?.length ? 'green' : 'gray',
      source: 'Registry',
    },
    {
      label: 'Market presence',
      value: marketLabel,
      score: [cg?.label, dex?.label, dt?.label].filter(Boolean).join(' · ') || 'BSC',
      tone: marketPresence > 0 ? 'green' : 'gold',
      source: 'Public catalogs',
    },
    {
      label: 'Confidence',
      value: symbol,
      score: `${rating.confidence}%`,
      tone: rating.confidence >= 80 ? 'green' : 'gold',
      source: 'Melega AI runtime',
    },
  ]
}
