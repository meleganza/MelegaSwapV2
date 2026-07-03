import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { buildInfrastructureSuggestions } from './buildInfrastructureSuggestions'
import { buildInfrastructureScore } from './buildInfrastructureScore'

export function buildAiManifest(project?: EnrichedProjectRecord, importContract?: string) {
  const sym = project?.resources.tokens[0]?.symbol ?? '—'
  const score = project ? buildInfrastructureScore(project) : null
  const suggestions = project ? buildInfrastructureSuggestions(project) : []

  return {
    schema: 'https://melega.finance/schemas/build-manifest/v1',
    manifestVersion: '1.0.0',
    infrastructureId: project?.upi ?? 'bs-inf-pending',
    timestamp: new Date().toISOString(),
    capabilities: project
      ? Object.entries(project.capabilities)
          .filter(([, v]) => v.status === 'live' || v.status === 'partial')
          .map(([k]) => k)
      : [],
    permissions: ['builder.read', 'manifest.write', 'dex.execute.preview'],
    configuration: {
      project_slug: project?.slug ?? null,
      contract: importContract ?? project?.resources.tokens[0]?.address ?? null,
      stakeToken: sym === '—' ? null : sym,
      chain: project?.supportedChains[0] ?? null,
      executionReadiness: 'preparation_only',
    },
    infrastructure: {
      pools: project?.capabilities.pool.status ?? 'unavailable',
      farms: project?.capabilities.farm.status ?? 'unavailable',
      radar: project?.capabilities.radar.status ?? 'unavailable',
      projects: project?.registryStatus ?? 'unavailable',
    },
    dependencies: suggestions.map((s) => s.dependencies),
    status: score ? (score.score >= 70 ? 'ready' : 'incomplete') : 'pending',
    riskSummary: { level: score && score.score >= 70 ? 'low' : 'medium', flags: [] },
    humanSummary: project
      ? `Infrastructure manifest for ${project.displayName} — preparation only, no deployment.`
      : 'Run import analysis to generate infrastructure manifest.',
  }
}
