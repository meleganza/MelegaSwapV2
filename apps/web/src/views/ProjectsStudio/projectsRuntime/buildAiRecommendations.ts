import type { StaticProjectRecord } from 'registry/projects/types'
import { buildMarketSources } from './marketSources'

export interface ProjectRecommendation {
  id: string
  text: string
}

export function buildAiRecommendations(project: StaticProjectRecord): ProjectRecommendation[] {
  const recs: ProjectRecommendation[] = []
  const sources = buildMarketSources(project, project.asOf)

  if (!project.websiteUrl) {
    recs.push({ id: 'missing-website', text: 'Missing Website — submit official URL for AI validation.' })
  }

  if (project.verificationStatus !== 'observed' && !project.trustBadges.includes('canonical')) {
    recs.push({ id: 'audit-recommended', text: 'Audit Recommended — professional verification not confirmed.' })
  }

  if (project.capabilities.radar.status !== 'live') {
    recs.push({ id: 'radar-indexing', text: 'Radar Indexing Suggested — enable contract intelligence monitoring.' })
  }

  if (project.capabilities.tradable.status === 'live' && project.isCanonical) {
    recs.push({ id: 'trending-eligible', text: 'Trending Eligible — canonical project with live tradable surface.' })
  }

  if (project.capabilities.pool.status === 'live') {
    recs.push({ id: 'reward-marco', text: 'Reward MARCO Holders Suggested — staking pools are live on Melega.' })
  }

  if (project.spaceProfileUrl && project.capabilities.space.status !== 'live') {
    recs.push({
      id: 'space-audit',
      text: 'Space Professional Audit Suggested — open Melega Space for professional review.',
    })
  }

  const externalUnavailable = sources.filter(
    (s) => ['coingecko', 'dexscreener', 'tokensniffer'].includes(s.key) && !s.available,
  )
  if (externalUnavailable.length >= 2) {
    recs.push({
      id: 'market-feeds',
      text: 'External market feeds unavailable — confirm listings on CoinGecko or DexScreener.',
    })
  }

  return recs
}
