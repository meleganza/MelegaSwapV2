import { getConnectedChainLabels } from 'registry/projects/intelligence'
import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { StaticProjectRecord } from 'registry/projects/types'
import { buildOnChainMetrics } from './onChainMetrics'
import { countAvailableSources, buildMarketSources } from './marketSources'

const MAX_LINES = 4

function pushLine(lines: string[], line: string) {
  if (lines.length < MAX_LINES && line) lines.push(line)
}

export function buildAiSummary(project: StaticProjectRecord | EnrichedProjectRecord): string {
  const lines: string[] = []
  const chains = getConnectedChainLabels(project)
  const metrics = buildOnChainMetrics(project)
  const sources = buildMarketSources(project, project.asOf)
  const availableSources = countAvailableSources(sources)

  if (chains.length) {
    pushLine(
      lines,
      `Project indexed on ${chains.join(', ')} with ${project.verificationStatus} registry verification.`,
    )
  }

  if (metrics.contractVerification !== 'Unavailable') {
    pushLine(lines, `Contract status: ${metrics.contractVerification}.`)
  }

  const liveSurfaces = [
    project.capabilities.liquidity.status === 'live' ? 'liquidity' : null,
    project.capabilities.farm.status === 'live' ? 'farms' : null,
    project.capabilities.pool.status === 'live' ? 'staking pools' : null,
  ].filter(Boolean)

  if (liveSurfaces.length) {
    pushLine(lines, `Live Melega surfaces: ${liveSurfaces.join(', ')}.`)
  } else {
    pushLine(lines, 'On-chain liquidity and volume metrics are unavailable from integrated market feeds.')
  }

  if (project.websiteUrl && project.socialLinks?.length) {
    pushLine(lines, 'Official website and social channels are present in the registry.')
  } else if (!project.websiteUrl) {
    pushLine(lines, 'No official website is registered for this project.')
  }

  if (availableSources > 0) {
    pushLine(lines, `${availableSources} intelligence source(s) available; external market feeds not confirmed.`)
  }

  return lines.slice(0, MAX_LINES).join(' ')
}
