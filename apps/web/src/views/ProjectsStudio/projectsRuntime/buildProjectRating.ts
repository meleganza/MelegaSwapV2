import type { ProjectRatingTier } from '../projectsStudioData'
import type { StaticProjectRecord } from 'registry/projects/types'
import {
  computeCapabilityCompleteness,
  computeIdentityCompleteness,
} from 'registry/projects/intelligence'
import { countAvailableSources, buildMarketSources } from './marketSources'

export interface ProjectRatingResult {
  score: number
  confidence: number
  reason: string
  tier: ProjectRatingTier
}

function tierFromScore(score: number): ProjectRatingTier {
  if (score >= 95) return 'exceptional'
  if (score >= 85) return 'strong'
  if (score >= 70) return 'active'
  if (score >= 50) return 'emerging'
  if (score > 0) return 'high-risk'
  return 'unknown'
}

export function buildProjectRating(project: StaticProjectRecord): ProjectRatingResult {
  const identity = computeIdentityCompleteness(project)
  const capability = computeCapabilityCompleteness(project.capabilities)
  const sources = buildMarketSources(project, project.asOf)
  const sourceScore = Math.min(100, countAvailableSources(sources) * 12)

  let verificationBonus = 0
  if (project.trustBadges.includes('canonical')) verificationBonus = 15
  else if (project.verificationStatus === 'observed') verificationBonus = 8

  let trustBonus = 0
  if (project.trustBadges.includes('canonical')) trustBonus += 10
  if (project.isCanonical) trustBonus += 5

  const websiteBonus = project.websiteUrl ? 8 : 0
  const docsBonus = project.docsUrl ? 6 : 0
  const socialBonus = project.socialLinks?.length ? Math.min(10, project.socialLinks.length * 3) : 0
  const multiChainBonus = Math.min(8, Math.max(0, project.supportedChains.length - 1) * 2)

  const weighted =
    identity * 0.22 +
    capability * 0.28 +
    sourceScore * 0.15 +
    verificationBonus +
    trustBonus +
    websiteBonus +
    docsBonus +
    socialBonus +
    multiChainBonus

  const score = Math.round(Math.min(100, Math.max(0, weighted)))

  const inputsPresent = [
    identity > 0 ? 'identity' : null,
    capability > 0 ? 'capabilities' : null,
    project.websiteUrl ? 'website' : null,
    project.docsUrl ? 'documentation' : null,
    project.socialLinks?.length ? 'social' : null,
    verificationBonus ? 'verification' : null,
    sourceScore ? 'sources' : null,
  ].filter(Boolean)

  const confidence = Math.round(
    Math.min(96, Math.max(35, 40 + inputsPresent.length * 8 - (score > 80 && !project.docsUrl ? 5 : 0))),
  )

  const reason = `Heuristic score from ${inputsPresent.join(', ') || 'registry baseline'}. Liquidity, volume, and holder metrics unavailable — not estimated.`

  return {
    score,
    confidence,
    reason,
    tier: tierFromScore(score),
  }
}
