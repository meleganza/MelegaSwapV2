import { CAPABILITY_LABELS, CHAIN_LABELS } from './constants'
import { computeCapabilityCompleteness, computeIdentityCompleteness } from './intelligence'
import {
  CapabilityStatus,
  ProjectCapabilities,
  ProjectRegistryStatus,
  ProjectTrustBadge,
  StaticProjectRecord,
} from './types'
import { getAllProjects } from './getAllProjects'

/**
 * Civilization Readiness Score (0–100)
 *
 * Measures how integrated a project is into the Melega/Kiri ecosystem.
 * This score does NOT represent price, quality, investment advice, or financial ranking.
 *
 * Calculation (weighted sum of sub-scores, each 0–100):
 * - Identity completeness (15%): static profile fields present (name, docs, UPI, tags, etc.)
 * - Capability integration (30%): live = 100%, partial = 50%, other = 0% per capability slot
 * - Ecosystem surfaces (25%): smartdrop, radar, space, labs, treasuryCompatible weighted by status
 * - Machine & agent readiness (15%): machineManifest live = full; aiReport partial credit
 * - Multi-chain presence (10%): min(100, supportedChains.length / 4 × 100) for current platform max
 * - Trust & registry signals (5%): canonical badge, observed verification, listed status
 */
/**
 * Fractional weights (sum = 1). Point caps are weight × CIVILIZATION_READINESS_MAX.
 * TRUST_EVIDENCE in PP003 maps to trustSignals (registry signals) — not a new formula.
 */
export const CIVILIZATION_READINESS_WEIGHTS = {
  identity: 0.15,
  capabilities: 0.3,
  ecosystemSurfaces: 0.25,
  machineReadiness: 0.15,
  multiChain: 0.1,
  trustSignals: 0.05,
} as const

export const CIVILIZATION_READINESS_MAX = 100 as const

export const CIVILIZATION_READINESS_POINT_CAPS = {
  identity: 15,
  capabilities: 30,
  ecosystemSurfaces: 25,
  machineReadiness: 15,
  multiChain: 10,
  trustSignals: 5,
} as const

export const CIVILIZATION_READINESS_CALCULATION_REVISION = 'CIVILIZATION_READINESS_V1' as const

const ECOSYSTEM_SURFACE_KEYS: (keyof ProjectCapabilities)[] = [
  'smartdrop',
  'radar',
  'space',
  'labs',
  'treasuryCompatible',
]

const PLATFORM_CHAIN_COUNT = 4

export type CivilizationReadinessComponentKey = keyof typeof CIVILIZATION_READINESS_WEIGHTS

export interface CivilizationReadinessSubScores {
  identity: number
  capabilities: number
  ecosystemSurfaces: number
  machineReadiness: number
  multiChain: number
  trustSignals: number
}

export interface CivilizationReadinessBreakdown {
  calculationRevision: typeof CIVILIZATION_READINESS_CALCULATION_REVISION
  maxScore: typeof CIVILIZATION_READINESS_MAX
  /** Canonical total — Math.round of weighted sum (unchanged Organ 01 semantics). */
  totalScore: number
  /** Pre-round weighted sum for explainability. */
  totalExact: number
  subScores: CivilizationReadinessSubScores
  /** Achieved points per component (subScore × weight), before total rounding. */
  achievedPoints: Record<CivilizationReadinessComponentKey, number>
  pointCaps: typeof CIVILIZATION_READINESS_POINT_CAPS
}

export type DiscoverySortOption =
  | 'alphabetical'
  | 'recently_added'
  | 'capability_completeness'
  | 'civilization_readiness'

export type DiscoveryCapabilityChipKey =
  | 'tradable'
  | 'liquidity'
  | 'farm'
  | 'pool'
  | 'smartdrop'
  | 'radar'
  | 'space'
  | 'labs'
  | 'treasuryCompatible'

export const DISCOVERY_CAPABILITY_CHIPS: {
  key: DiscoveryCapabilityChipKey
  label: string
}[] = [
  { key: 'tradable', label: 'Swap' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'farm', label: 'Farm' },
  { key: 'pool', label: 'Pool' },
  { key: 'smartdrop', label: 'SmartDrop' },
  { key: 'radar', label: 'Radar' },
  { key: 'space', label: 'Space' },
  { key: 'labs', label: 'Labs' },
  { key: 'treasuryCompatible', label: 'Treasury' },
]

export const DISCOVERY_CHAIN_CHIPS: { chainId: number; label: string }[] = [
  { chainId: 56, label: 'BNB' },
  { chainId: 1, label: 'Ethereum' },
  { chainId: 137, label: 'Polygon' },
  { chainId: 8453, label: 'Base' },
]

export type TreasuryFilter = 'any' | 'live' | 'partial_or_live' | 'planned' | 'none'
export type MachineManifestFilter = 'any' | 'live' | 'not_live'

export interface DiscoveryFilters {
  query?: string
  chains?: number[]
  capabilities?: DiscoveryCapabilityChipKey[]
  trustBadges?: ProjectTrustBadge[]
  lifecycle?: ProjectRegistryStatus | 'all'
  treasury?: TreasuryFilter
  machineManifest?: MachineManifestFilter
}

export interface DiscoverySummary {
  totalProjects: number
  matchingProjects: number
  liveCapabilityTypes: number
  uniqueChains: number
  machineReadyProjects: number
  treasuryCompatibleProjects: number
}

export interface EnrichedProjectRecord extends StaticProjectRecord {
  civilizationReadiness: number
  capabilityCompleteness: number
  tickers: string[]
  searchableText: string
}

const capabilityStatusScore = (status: CapabilityStatus): number => {
  if (status === 'live') return 100
  if (status === 'partial') return 50
  return 0
}

const isTreasuryCompatible = (status: CapabilityStatus): boolean =>
  status === 'live' || status === 'partial'

const isMachineReady = (project: StaticProjectRecord): boolean =>
  project.capabilities.machineManifest.status === 'live'

export const getProjectTickers = (project: StaticProjectRecord): string[] => {
  const symbols = project.resources.tokens.map((token) => token.symbol)
  return [...new Set(symbols)]
}

export const buildSearchableText = (project: StaticProjectRecord): string => {
  const ecosystemLabels = ECOSYSTEM_SURFACE_KEYS.map((key) => CAPABILITY_LABELS[key])
  const capabilityLabels = Object.values(CAPABILITY_LABELS)
  const parts = [
    project.displayName,
    project.slug,
    project.description,
    project.tagline,
    ...getProjectTickers(project),
    ...project.sectorTags,
    ...project.trustBadges,
    project.phase,
    project.registryStatus,
    ...project.supportedChains.map((id) => CHAIN_LABELS[id] ?? String(id)),
    ...DISCOVERY_CHAIN_CHIPS.filter((c) => project.supportedChains.includes(c.chainId)).map((c) => c.label),
    ...ecosystemLabels,
    ...capabilityLabels,
    ...DISCOVERY_CAPABILITY_CHIPS.map((chip) => chip.label),
  ]
  return parts.filter(Boolean).join(' ').toLowerCase()
}

/** Canonical explainable breakdown — same inputs and rounding as Organ 01. */
export const computeCivilizationReadinessBreakdown = (
  project: StaticProjectRecord,
): CivilizationReadinessBreakdown => {
  const identityScore = computeIdentityCompleteness(project)

  const capabilityEntries = Object.values(project.capabilities)
  const capabilityScore =
    capabilityEntries.reduce((sum, cell) => sum + capabilityStatusScore(cell.status), 0) /
    capabilityEntries.length

  const ecosystemEntries = ECOSYSTEM_SURFACE_KEYS.map((key) => project.capabilities[key])
  const ecosystemScore =
    ecosystemEntries.reduce((sum, cell) => sum + capabilityStatusScore(cell.status), 0) /
    ecosystemEntries.length

  const machineScore =
    capabilityStatusScore(project.capabilities.machineManifest.status) * 0.7 +
    capabilityStatusScore(project.capabilities.aiReport.status) * 0.3

  const uniqueChains = [...new Set(project.supportedChains)]
  const multiChainScore = Math.min(100, (uniqueChains.length / PLATFORM_CHAIN_COUNT) * 100)

  let trustScore = 0
  if (project.trustBadges.includes('canonical')) trustScore += 40
  if (project.verificationStatus === 'observed') trustScore += 30
  if (project.registryStatus === 'listed') trustScore += 30
  trustScore = Math.min(100, trustScore)

  const subScores: CivilizationReadinessSubScores = {
    identity: identityScore,
    capabilities: capabilityScore,
    ecosystemSurfaces: ecosystemScore,
    machineReadiness: machineScore,
    multiChain: multiChainScore,
    trustSignals: trustScore,
  }

  const achievedPoints = {
    identity: subScores.identity * CIVILIZATION_READINESS_WEIGHTS.identity,
    capabilities: subScores.capabilities * CIVILIZATION_READINESS_WEIGHTS.capabilities,
    ecosystemSurfaces: subScores.ecosystemSurfaces * CIVILIZATION_READINESS_WEIGHTS.ecosystemSurfaces,
    machineReadiness: subScores.machineReadiness * CIVILIZATION_READINESS_WEIGHTS.machineReadiness,
    multiChain: subScores.multiChain * CIVILIZATION_READINESS_WEIGHTS.multiChain,
    trustSignals: subScores.trustSignals * CIVILIZATION_READINESS_WEIGHTS.trustSignals,
  }

  const totalExact =
    achievedPoints.identity +
    achievedPoints.capabilities +
    achievedPoints.ecosystemSurfaces +
    achievedPoints.machineReadiness +
    achievedPoints.multiChain +
    achievedPoints.trustSignals

  return {
    calculationRevision: CIVILIZATION_READINESS_CALCULATION_REVISION,
    maxScore: CIVILIZATION_READINESS_MAX,
    totalScore: Math.round(totalExact),
    totalExact,
    subScores,
    achievedPoints,
    pointCaps: CIVILIZATION_READINESS_POINT_CAPS,
  }
}

export const computeCivilizationReadiness = (project: StaticProjectRecord): number =>
  computeCivilizationReadinessBreakdown(project).totalScore

export const enrichProject = (project: StaticProjectRecord): EnrichedProjectRecord => ({
  ...project,
  civilizationReadiness: computeCivilizationReadiness(project),
  capabilityCompleteness: computeCapabilityCompleteness(project.capabilities),
  tickers: getProjectTickers(project),
  searchableText: buildSearchableText(project),
})

const matchesQuery = (project: EnrichedProjectRecord, query: string): boolean => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return project.searchableText.includes(normalized)
}

const matchesChains = (project: StaticProjectRecord, chains?: number[]): boolean => {
  if (!chains?.length) return true
  return chains.every((chainId) => project.supportedChains.includes(chainId))
}

const matchesCapabilities = (
  project: StaticProjectRecord,
  capabilities?: DiscoveryCapabilityChipKey[],
): boolean => {
  if (!capabilities?.length) return true
  return capabilities.every((key) => {
    const status = project.capabilities[key].status
    return status === 'live' || status === 'partial'
  })
}

const matchesTrust = (project: StaticProjectRecord, trustBadges?: ProjectTrustBadge[]): boolean => {
  if (!trustBadges?.length) return true
  return trustBadges.every((badge) => project.trustBadges.includes(badge))
}

const matchesLifecycle = (
  project: StaticProjectRecord,
  lifecycle?: ProjectRegistryStatus | 'all',
): boolean => {
  if (!lifecycle || lifecycle === 'all') return true
  return project.registryStatus === lifecycle
}

const matchesTreasury = (project: StaticProjectRecord, treasury?: TreasuryFilter): boolean => {
  if (!treasury || treasury === 'any') return true
  const status = project.capabilities.treasuryCompatible.status
  switch (treasury) {
    case 'live':
      return status === 'live'
    case 'partial_or_live':
      return isTreasuryCompatible(status)
    case 'planned':
      return status === 'planned' || status === 'scheduled'
    case 'none':
      return status === 'none'
    default:
      return true
  }
}

const matchesMachineManifest = (
  project: StaticProjectRecord,
  machineManifest?: MachineManifestFilter,
): boolean => {
  if (!machineManifest || machineManifest === 'any') return true
  const isLive = project.capabilities.machineManifest.status === 'live'
  return machineManifest === 'live' ? isLive : !isLive
}

export const filterProjects = (
  projects: EnrichedProjectRecord[],
  filters: DiscoveryFilters,
): EnrichedProjectRecord[] =>
  projects.filter(
    (project) =>
      matchesQuery(project, filters.query ?? '') &&
      matchesChains(project, filters.chains) &&
      matchesCapabilities(project, filters.capabilities) &&
      matchesTrust(project, filters.trustBadges) &&
      matchesLifecycle(project, filters.lifecycle) &&
      matchesTreasury(project, filters.treasury) &&
      matchesMachineManifest(project, filters.machineManifest),
  )

export const sortProjects = (
  projects: EnrichedProjectRecord[],
  sortBy: DiscoverySortOption,
): EnrichedProjectRecord[] => {
  const sorted = [...projects]
  switch (sortBy) {
    case 'recently_added':
      return sorted.sort((a, b) => b.asOf.localeCompare(a.asOf) || a.displayName.localeCompare(b.displayName))
    case 'capability_completeness':
      return sorted.sort(
        (a, b) =>
          b.capabilityCompleteness - a.capabilityCompleteness ||
          a.displayName.localeCompare(b.displayName),
      )
    case 'civilization_readiness':
      return sorted.sort(
        (a, b) =>
          b.civilizationReadiness - a.civilizationReadiness ||
          a.displayName.localeCompare(b.displayName),
      )
    case 'alphabetical':
    default:
      return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }
}

export const discoverProjects = (
  filters: DiscoveryFilters = {},
  sortBy: DiscoverySortOption = 'alphabetical',
  projects: StaticProjectRecord[] = getAllProjects(),
): EnrichedProjectRecord[] => {
  const enriched = projects.map(enrichProject)
  const filtered = filterProjects(enriched, filters)
  return sortProjects(filtered, sortBy)
}

export const getLiveCapabilityKeys = (project: StaticProjectRecord): DiscoveryCapabilityChipKey[] =>
  DISCOVERY_CAPABILITY_CHIPS.filter((chip) => {
    const status = project.capabilities[chip.key].status
    return status === 'live' || status === 'partial'
  }).map((chip) => chip.key)

export const computeDiscoverySummary = (
  allProjects: StaticProjectRecord[],
  matchingProjects: EnrichedProjectRecord[],
): DiscoverySummary => {
  const liveCapabilitySet = new Set<DiscoveryCapabilityChipKey>()
  const chainSet = new Set<number>()

  allProjects.forEach((project) => {
    getLiveCapabilityKeys(project).forEach((key) => liveCapabilitySet.add(key))
    project.supportedChains.forEach((chainId) => chainSet.add(chainId))
  })

  return {
    totalProjects: allProjects.length,
    matchingProjects: matchingProjects.length,
    liveCapabilityTypes: liveCapabilitySet.size,
    uniqueChains: chainSet.size,
    machineReadyProjects: allProjects.filter(isMachineReady).length,
    treasuryCompatibleProjects: allProjects.filter((p) =>
      isTreasuryCompatible(p.capabilities.treasuryCompatible.status),
    ).length,
  }
}

export const serializeMachineDiscovery = (
  filters: DiscoveryFilters = {},
  sortBy: DiscoverySortOption = 'alphabetical',
): Record<string, unknown> => {
  const allProjects = getAllProjects()
  const results = discoverProjects(filters, sortBy, allProjects)
  const summary = computeDiscoverySummary(allProjects, results)

  return {
    $schema: 'https://melega.finance/schemas/project-discovery/v1',
    api_version: '0.1.0',
    phase: 'mvp_static',
    data_source: 'project-registry-static',
    as_of: allProjects[0]?.asOf ?? null,
    disclaimer:
      'Discovery index derived from static registry. Civilization readiness measures ecosystem integration only — not price, quality, or investment merit.',
    civilization_readiness_formula: {
      description: 'Weighted ecosystem integration score (0–100). Not financial advice.',
      weights: CIVILIZATION_READINESS_WEIGHTS,
      components: [
        'identity_completeness',
        'capability_integration',
        'ecosystem_surfaces',
        'machine_agent_readiness',
        'multi_chain_presence',
        'trust_registry_signals',
      ],
    },
    sort: sortBy,
    filters_applied: filters,
    summary: {
      total_projects: summary.totalProjects,
      matching_projects: summary.matchingProjects,
      live_capability_types: summary.liveCapabilityTypes,
      unique_chains: summary.uniqueChains,
      machine_ready_projects: summary.machineReadyProjects,
      treasury_compatible_projects: summary.treasuryCompatibleProjects,
    },
    sort_options: ['alphabetical', 'recently_added', 'capability_completeness', 'civilization_readiness'],
    filter_schema: {
      query: 'full-text over name, slug, ticker, description, tags, ecosystem surfaces',
      chains: DISCOVERY_CHAIN_CHIPS.map((c) => c.chainId),
      capabilities: DISCOVERY_CAPABILITY_CHIPS.map((c) => c.key),
      trust_badges: ['canonical', 'observed', 'unverified', 'planned'],
      lifecycle: ['listed', 'archived', 'all'],
      treasury: ['any', 'live', 'partial_or_live', 'planned', 'none'],
      machine_manifest: ['any', 'live', 'not_live'],
    },
    projects: results.map((project) => ({
      upi: project.upi,
      slug: project.slug,
      display_name: project.displayName,
      tickers: project.tickers,
      civilization_readiness: project.civilizationReadiness,
      capability_completeness: project.capabilityCompleteness,
      registry_status: project.registryStatus,
      phase: project.phase,
      trust_badges: project.trustBadges,
      supported_chains: project.supportedChains,
      capabilities_live: getLiveCapabilityKeys(project),
      machine_ready: isMachineReady(project),
      treasury_compatible: isTreasuryCompatible(project.capabilities.treasuryCompatible.status),
      manifest_url: `/registry/projects/${project.slug}.json`,
    })),
  }
}
