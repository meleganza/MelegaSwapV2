import { CHAIN_LABELS } from './constants'
import { CapabilityStatus, ProjectCapabilities, StaticProjectRecord } from './types'

export type IntelligenceDisplayStatus =
  | 'live'
  | 'connected'
  | 'observed'
  | 'planned'
  | 'deprecated'
  | 'unavailable'

export interface ProjectHealthMetrics {
  identityCompleteness: number
  capabilityCompleteness: number
  machineManifestAvailable: boolean
  observabilityReadiness: IntelligenceDisplayStatus
  treasuryCompatibility: IntelligenceDisplayStatus
}

export const mapCapabilityToDisplayStatus = (status: CapabilityStatus): IntelligenceDisplayStatus => {
  switch (status) {
    case 'live':
      return 'live'
    case 'partial':
      return 'connected'
    case 'planned':
    case 'scheduled':
      return 'planned'
    case 'finished':
      return 'deprecated'
    case 'unverified':
    case 'clear':
    case 'watch':
      return 'observed'
    case 'none':
    default:
      return 'unavailable'
  }
}

export const getIntelligenceStatusLabel = (status: IntelligenceDisplayStatus): string => {
  switch (status) {
    case 'live':
      return 'Live'
    case 'connected':
      return 'Connected'
    case 'observed':
      return 'Observed'
    case 'planned':
      return 'Planned'
    case 'deprecated':
      return 'Deprecated'
    case 'unavailable':
    default:
      return 'Unavailable'
  }
}

export const computeIdentityCompleteness = (project: StaticProjectRecord): number => {
  const fields = [
    project.displayName,
    project.description,
    project.tagline,
    project.websiteUrl,
    project.docsUrl,
    project.spaceProfileUrl,
    project.socialLinks?.length,
    project.sectorTags?.length,
    project.upi,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export const computeCapabilityCompleteness = (capabilities: ProjectCapabilities): number => {
  const entries = Object.values(capabilities)
  const ready = entries.filter((cell) => cell.status === 'live' || cell.status === 'partial').length
  return Math.round((ready / entries.length) * 100)
}

export const computeHealthMetrics = (project: StaticProjectRecord): ProjectHealthMetrics => ({
  identityCompleteness: computeIdentityCompleteness(project),
  capabilityCompleteness: computeCapabilityCompleteness(project.capabilities),
  machineManifestAvailable: project.capabilities.machineManifest.status === 'live',
  observabilityReadiness: 'planned',
  treasuryCompatibility: mapCapabilityToDisplayStatus(project.capabilities.treasuryCompatible.status),
})

export const getConnectedChainLabels = (project: StaticProjectRecord): string[] =>
  project.supportedChains.map((id) => CHAIN_LABELS[id] ?? `Chain ${id}`)

export const serializeProjectManifest = (project: StaticProjectRecord): Record<string, unknown> => ({
  $schema: 'https://melega.finance/schemas/project/v1',
  upi: project.upi,
  slug: project.slug,
  display_name: project.displayName,
  tagline: project.tagline,
  description: project.description,
  registry_status: project.registryStatus,
  phase: project.phase,
  verification_status: project.verificationStatus,
  trust_badges: project.trustBadges,
  endorsement_status: project.endorsementStatus,
  risk_tier: project.riskTier,
  legacy_import: project.legacyImport,
  is_canonical: project.isCanonical,
  mvp_static: project.mvpStatic,
  sector_tags: project.sectorTags,
  supported_chains: project.supportedChains,
  website_url: project.websiteUrl,
  docs_url: project.docsUrl,
  space_profile_url: project.spaceProfileUrl,
  social_links: project.socialLinks,
  resources: {
    tokens: project.resources.tokens.map((token) => ({
      chain_id: token.chainId,
      address: token.address,
      symbol: token.symbol,
      ref: token.ref,
    })),
    liquidity_pools: project.resources.liquidityPools,
    farms: project.resources.farms,
    staking_pools: project.resources.stakingPools,
  },
  capabilities: project.capabilities,
  primary_token_refs: project.primaryTokenRefs,
  deep_links: {
    swap: project.deepLinks.swap,
    liquidity: project.deepLinks.liquidity,
    farms: project.deepLinks.farms,
    pools: project.deepLinks.pools,
    buy_marco: project.deepLinks.buyMarco,
  },
  intelligence: {
    identity_completeness: computeIdentityCompleteness(project),
    capability_completeness: computeCapabilityCompleteness(project.capabilities),
    observability_readiness: 'planned',
    data_source: 'project-registry-static',
  },
  disclaimer: project.disclaimer,
  data_source: 'project-registry',
  as_of: project.asOf,
})
