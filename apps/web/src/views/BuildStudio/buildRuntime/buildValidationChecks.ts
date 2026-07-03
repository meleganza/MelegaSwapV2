import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { ValidationCheck } from '../buildStudioData'
import { buildInfrastructureScore } from './buildInfrastructureScore'
import { buildMarketSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'

export function buildValidationChecks(project?: EnrichedProjectRecord): ValidationCheck[] {
  if (!project) {
    return [
      { id: 'contract', label: 'Contract compatibility', status: 'yellow' },
      { id: 'score', label: 'Infrastructure score', status: 'yellow' },
      { id: 'machine', label: 'Machine readability', status: 'yellow' },
    ]
  }

  const score = buildInfrastructureScore(project)
  const onChain = buildOnChainMetrics(project)
  const sources = buildMarketSources(project, project.asOf)
  const hasExplorer = sources.some((s) => s.key === 'explorer' && s.available)

  return [
    {
      id: 'ticker',
      label: 'Ticker conflict',
      status: project.trustBadges.includes('canonical') ? 'green' : 'yellow',
    },
    {
      id: 'dup',
      label: 'Token duplication',
      status: project.isCanonical ? 'green' : 'yellow',
    },
    {
      id: 'contract',
      label: 'Contract compatibility',
      status: hasExplorer ? 'green' : 'red',
    },
    {
      id: 'liq',
      label: 'Liquidity recommendations',
      status: project.capabilities.liquidity.status === 'live' ? 'green' : 'yellow',
    },
    {
      id: 'owner',
      label: 'Ownership',
      status: onChain.contractVerification === 'Unavailable' ? 'yellow' : 'green',
    },
    {
      id: 'taxes',
      label: 'Taxes',
      status: 'yellow',
    },
    {
      id: 'machine',
      label: 'Machine readability',
      status: project.capabilities.machineManifest.status === 'live' ? 'green' : 'yellow',
    },
    {
      id: 'score',
      label: 'Infrastructure score',
      status: score.score >= 70 ? 'green' : score.score >= 50 ? 'yellow' : 'red',
    },
  ]
}
