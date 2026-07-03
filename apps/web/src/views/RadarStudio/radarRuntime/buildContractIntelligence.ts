import { CHAIN_LABELS } from 'registry/projects/constants'
import { getAllProjects } from 'registry/projects/getAllProjects'
import type { StaticProjectRecord } from 'registry/projects/types'
import { buildAiSummary } from 'views/ProjectsStudio/projectsRuntime/buildAiSummary'
import { buildMarketSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'
import type { ContractPreviewData, OperationalMetric, RadarEventCard, RadarStatusLevel } from '../radarStudioData'
import { createRadarRuntimeError, type RadarRuntimeError } from './radarRuntimeErrors'

const UNAVAILABLE = 'Unavailable'

function metric(label: string, available: boolean, liveDescription?: string): OperationalMetric {
  if (!available) {
    return { label, status: 'yellow', description: UNAVAILABLE }
  }
  return { label, status: 'green', description: liveDescription ?? 'Available from indexed registry' }
}

function chainLabel(chainId: number): string {
  return CHAIN_LABELS[chainId] ?? `Chain ${chainId}`
}

function shortAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function buildContractIntelligence(
  project: StaticProjectRecord,
  address?: string,
  chainId?: number,
): { preview: ContractPreviewData; errors: RadarRuntimeError[] } {
  const token =
    project.resources.tokens.find((t) => (chainId ? t.chainId === chainId : true)) ??
    project.resources.tokens[0]
  const resolvedAddress = address?.trim() || token?.address
  const errors: RadarRuntimeError[] = []

  if (!resolvedAddress) errors.push(createRadarRuntimeError('NO_CONTRACT'))
  const sources = buildMarketSources(project, project.asOf)
  const explorer = sources.find((s) => s.key === 'explorer')
  if (!explorer?.available) errors.push(createRadarRuntimeError('NO_EXPLORER'))
  if (!sources.some((s) => ['coingecko', 'dexscreener', 'coinmarketcap'].includes(s.key) && s.available)) {
    errors.push(createRadarRuntimeError('NO_MARKET_SOURCE'))
  }
  if (!project.socialLinks?.length) errors.push(createRadarRuntimeError('NO_SOCIAL'))

  const onChain = buildOnChainMetrics(project)
  const rating = buildProjectRating(project)
  const sym = token?.symbol ?? project.displayName

  const metrics: OperationalMetric[] = [
    metric('Contract verification', onChain.contractVerification !== UNAVAILABLE, onChain.contractVerification),
    metric('Explorer', Boolean(explorer?.available), explorer?.href ? 'Explorer link available' : UNAVAILABLE),
    metric('Ownership', false),
    metric('Liquidity lock', false),
    metric('Mint', false),
    metric('Blacklist', false),
    metric('Proxy', false),
    metric('Upgradeable', false),
    metric('Taxes', false),
    metric('Holder concentration', false),
    metric('Contract Age', onChain.age !== UNAVAILABLE, onChain.age),
    metric('Audit availability', project.trustBadges.includes('canonical') || project.verificationStatus === 'observed'),
    metric('TokenSniffer', false),
    metric('GoPlus', false),
  ]

  const provenance = sources.map((s) => ({
    id: s.key,
    label: s.label,
    available: s.available,
  }))

  const preview: ContractPreviewData = {
    address: resolvedAddress ? shortAddress(resolvedAddress) : UNAVAILABLE,
    network: token ? chainLabel(token.chainId) : UNAVAILABLE,
    score: rating.score,
    projectName: sym,
    symbol: sym,
    metrics,
    operationalSummary: buildAiSummary(project),
    provenance,
    lastUpdated: project.asOf,
    freshness: 'Registry',
    evidenceCount: sources.filter((s) => s.available).length,
    aiVersion: 'Melega Radar Runtime v1',
  }

  return { preview, errors }
}

export function buildContractPreview(
  event: RadarEventCard,
  address?: string,
): ContractPreviewData | null {
  const project = getAllProjects().find((p) => {
    const sym = p.resources.tokens[0]?.symbol ?? p.displayName
    return sym === event.name || p.displayName === event.name
  })
  if (!project) return null
  const token = project.resources.tokens[0]
  return buildContractIntelligence(project, address ?? token?.address, token?.chainId).preview
}

export function buildContractIntelligenceFromAddress(
  contract: string,
  chainId: number,
  project?: StaticProjectRecord,
): { preview: ContractPreviewData | null; errors: RadarRuntimeError[] } {
  if (!project) {
    return {
      preview: null,
      errors: [createRadarRuntimeError('PROJECT_NOT_INDEXED')],
    }
  }
  return buildContractIntelligence(project, contract, chainId)
}

export function statusFromAvailability(available: boolean): RadarStatusLevel {
  return available ? 'green' : 'yellow'
}
