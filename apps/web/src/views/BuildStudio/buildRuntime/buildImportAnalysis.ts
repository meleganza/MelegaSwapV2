import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import { enrichProject } from 'registry/projects/discovery'
import { discoverProjectFromContract } from 'views/ProjectsStudio/projectsRuntime/discoverProjectFromContract'
import { buildMarketSources } from 'views/ProjectsStudio/projectsRuntime/marketSources'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import { buildAiSummary } from 'views/ProjectsStudio/projectsRuntime/buildAiSummary'
import { buildContractIntelligence } from 'views/RadarStudio/radarRuntime/buildContractIntelligence'
import { buildInfrastructureScore } from './buildInfrastructureScore'
import { buildInfrastructureSuggestions } from './buildInfrastructureSuggestions'
import { createBuildRuntimeError, type BuildRuntimeError } from './buildRuntimeErrors'

const CHAIN_ID_MAP: Record<string, number> = {
  bnb: 56,
  eth: 1,
  base: 8453,
  polygon: 137,
}

export interface ImportDetectionItem {
  label: string
  available: boolean
}

export interface ImportAnalysisResult {
  found: boolean
  project?: EnrichedProjectRecord
  projectName?: string
  symbol?: string
  score: ReturnType<typeof buildInfrastructureScore>
  suggestions: ReturnType<typeof buildInfrastructureSuggestions>
  summary: string
  detections: ImportDetectionItem[]
  pipelineComplete: boolean[]
  errors: BuildRuntimeError[]
}

export function runImportAnalysis(contract: string, chainKey: string): ImportAnalysisResult {
  const chainId = CHAIN_ID_MAP[chainKey] ?? 56
  const errors: BuildRuntimeError[] = []

  if (!contract?.trim() || !contract.trim().startsWith('0x')) {
    errors.push(createBuildRuntimeError('NO_CONTRACT'))
    return {
      found: false,
      score: { score: 0, confidence: 0, reason: 'No contract provided.' },
      suggestions: [],
      summary: '',
      detections: [],
      pipelineComplete: [false, false, false, false, false],
      errors,
    }
  }

  const discovery = discoverProjectFromContract(contract.trim(), chainId)
  if (!discovery.found || !discovery.project) {
    errors.push(createBuildRuntimeError('PROJECT_NOT_FOUND'))
    return {
      found: false,
      score: { score: 0, confidence: 0, reason: 'Project not indexed.' },
      suggestions: [],
      summary: 'Contract not found in Melega registry. Import requires registry indexing first.',
      detections: buildUnavailableDetections(),
      pipelineComplete: [true, true, false, false, false],
      errors,
    }
  }

  const project = enrichProject(discovery.project)
  const onChain = buildOnChainMetrics(project)
  const sources = buildMarketSources(project, project.asOf)
  const intel = buildContractIntelligence(project, contract, chainId)
  const score = buildInfrastructureScore(project)
  const suggestions = buildInfrastructureSuggestions(project)
  const sym = project.resources.tokens[0]?.symbol ?? project.displayName

  const detections: ImportDetectionItem[] = [
    { label: 'Name', available: Boolean(project.displayName) },
    { label: 'Ticker', available: Boolean(sym) },
    { label: 'Website', available: Boolean(project.websiteUrl) },
    { label: 'Socials', available: Boolean(project.socialLinks?.length) },
    { label: 'Liquidity', available: project.capabilities.liquidity.status === 'live' },
    { label: 'Holders', available: onChain.holders !== 'Unavailable' },
    { label: 'DEX presence', available: project.capabilities.tradable.status === 'live' },
    { label: 'CoinGecko', available: sources.find((s) => s.key === 'coingecko')?.available ?? false },
    { label: 'DexScreener', available: sources.find((s) => s.key === 'dexscreener')?.available ?? false },
    { label: 'TokenSniffer', available: sources.find((s) => s.key === 'tokensniffer')?.available ?? false },
    { label: 'Contract', available: Boolean(project.resources.tokens[0]?.address) },
    { label: 'AI Summary', available: Boolean(buildAiSummary(project)) },
  ]

  return {
    found: true,
    project,
    projectName: project.displayName,
    symbol: sym,
    score,
    suggestions,
    summary: intel.preview.operationalSummary,
    detections,
    pipelineComplete: [true, true, true, true, score.score >= 50],
    errors: [...discovery.errors, ...intel.errors],
  }
}

function buildUnavailableDetections(): ImportDetectionItem[] {
  return [
    'Name', 'Ticker', 'Website', 'Socials', 'Liquidity', 'Holders',
    'DEX presence', 'CoinGecko', 'DexScreener', 'TokenSniffer', 'Contract', 'AI Summary',
  ].map((label) => ({ label, available: false }))
}
