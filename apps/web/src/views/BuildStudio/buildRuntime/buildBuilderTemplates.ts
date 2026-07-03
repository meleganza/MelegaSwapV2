import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { BuilderTemplate } from '../buildStudioData'
import { buildInfrastructureScore } from './buildInfrastructureScore'

export interface BuilderTemplateRuntime extends BuilderTemplate {
  configuration: Record<string, unknown>
  executionPreview: string
}

const BASE_TEMPLATES: BuilderTemplate[] = [
  { id: 'official', title: 'Official Token', description: 'Canonical project token with governance hooks.' },
  { id: 'governance', title: 'Governance Token', description: 'Voting-weight infrastructure for DAO operations.' },
  { id: 'reward', title: 'Reward Token', description: 'Emission token for staking and farm rewards.' },
  { id: 'community', title: 'Community Token', description: 'Community-governed utility with transparent supply.' },
  { id: 'infrastructure', title: 'Infrastructure Token', description: 'DEX-native infrastructure coordination token.' },
  { id: 'ai', title: 'AI Token', description: 'Machine-readable token with AI manifest compatibility.' },
]

export function buildBuilderTemplates(project?: EnrichedProjectRecord): BuilderTemplateRuntime[] {
  const chainIds = project?.supportedChains ?? [56, 1, 137, 8453]

  return BASE_TEMPLATES.map((t) => ({
    ...t,
    configuration: {
      template_id: t.id,
      schema: 'https://melega.finance/schemas/build-template/v1',
      supported_chains: chainIds,
      machine_manifest: true,
      deployment_mode: 'preparation_only',
      ownership_options: ['renounce', 'multisig', 'timelock'],
      treasury: { enabled: false, notes: 'Configure at deployment — not executed in Build Studio' },
    },
    executionPreview: 'Dry-run preparation only — deployment suppressed in Build Studio.',
  }))
}

export function buildTokenPreparation(project?: EnrichedProjectRecord) {
  const score = project ? buildInfrastructureScore(project) : null
  return {
    supportedChains: ['BNB', 'Ethereum', 'Base', 'Polygon'],
    deploymentPreview: 'Preparation only — no on-chain deployment from Build Studio.',
    gasEstimation: 'Unavailable',
    ownershipOptions: ['Renounce', 'Multisig', 'Timelock'],
    treasuryConfiguration: 'Unavailable — configure at dedicated launch runtime',
    machineManifest: Boolean(project?.capabilities.machineManifest.status === 'live'),
    readinessScore: score?.score ?? 0,
  }
}
