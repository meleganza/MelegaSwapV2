import { getAllAssets } from 'registry/assets/getAllAssets'
import { getAssetBySlug } from 'registry/assets/getAssetBySlug'
import { getAllEvents } from 'registry/events/getAllEvents'
import { getEventsByProjectSlug } from 'registry/events/getEventBySlug'
import { getProjectBySlug } from 'registry/projects/getProjectBySlug'
import { getAllVenues } from 'registry/venues/getAllVenues'
import { getVenuesByProjectSlug } from 'registry/venues/getVenueBySlug'
import {
  ACTIVATION_AS_OF,
  ACTIVATION_DISCLAIMER,
  ACTIVATION_PIPELINE_STAGES,
} from './activation-pipeline'
import { mapCapabilityToActivationStatus } from './activation-status'
import {
  ActivationPipelineReadModel,
  ActivationStage,
  ActivationStageId,
  ActivationStageStatus,
  ConstitutionalCanonicalEconomy,
  EconomicPresenceTarget,
} from './activation-types'

const CONSTITUTIONAL_CANONICAL: ConstitutionalCanonicalEconomy = {
  canonicalChain: 'BNB Chain',
  canonicalAsset: 'MARCO',
  status: 'LIVE',
  immutable: true,
}

const PRESENCE_CHAIN_DEFS: Omit<EconomicPresenceTarget, 'status' | 'notes'>[] = [
  { chainId: 'bnb', displayName: 'BNB Chain', role: 'canonical', registryChainId: 56 },
  { chainId: 'ethereum', displayName: 'Ethereum', role: 'presence', registryChainId: 1 },
  { chainId: 'polygon', displayName: 'Polygon', role: 'presence', registryChainId: 137 },
  { chainId: 'base', displayName: 'Base', role: 'presence', registryChainId: 8453 },
  { chainId: 'solana', displayName: 'Solana', role: 'presence' },
]

const ASSET_SLUG_BY_CHAIN: Record<number, string> = {
  56: 'marco',
  1: 'marco-ethereum',
  137: 'marco-polygon',
  8453: 'marco-base',
}

const buildStage = (
  id: ActivationStageId,
  status: ActivationStageStatus,
  summary: string,
  notes?: string,
  href?: string,
): ActivationStage => {
  const def = ACTIVATION_PIPELINE_STAGES.find((stage) => stage.id === id)!
  return {
    id,
    label: def.label,
    status,
    summary,
    notes,
    href: href ?? def.defaultHref,
    machineSurface: def.machineSurface,
  }
}

export const getConstitutionalCanonicalEconomy = (): ConstitutionalCanonicalEconomy => ({
  ...CONSTITUTIONAL_CANONICAL,
})

export const resolvePresenceTargets = (projectSlug?: string): EconomicPresenceTarget[] => {
  const project = projectSlug ? getProjectBySlug(projectSlug) : undefined

  return PRESENCE_CHAIN_DEFS.map((chain) => {
    if (chain.chainId === 'solana') {
      return {
        ...chain,
        status: 'PLANNED',
        notes: 'Economic Presence only — Solana bridge indexing PLANNED',
      }
    }

    if (chain.role === 'canonical') {
      const marco = getAssetBySlug('marco')
      return {
        ...chain,
        status: marco ? 'READY' : 'WAITING',
        notes: 'Constitutional Canonical Economy — not replaceable by new project activation',
      }
    }

    const assetSlug = chain.registryChainId ? ASSET_SLUG_BY_CHAIN[chain.registryChainId] : undefined
    const asset = assetSlug ? getAssetBySlug(assetSlug) : undefined
    const onProject =
      project && asset
        ? project.resources.tokens.some((token) => token.chainId === chain.registryChainId)
        : Boolean(asset)

    return {
      ...chain,
      status: onProject ? 'READY' : asset ? 'WAITING' : 'PLANNED',
      notes: onProject
        ? `MARCO presence observed on ${chain.displayName}`
        : asset
          ? `MARCO asset indexed — project binding ${projectSlug ? 'pending' : 'not started'}`
          : `Economic Presence target — ${chain.displayName}`,
    }
  })
}

export const resolveLabsActivationPreview = (): ActivationPipelineReadModel => ({
  mode: 'labs_preview',
  asOf: ACTIVATION_AS_OF,
  disclaimer: ACTIVATION_DISCLAIMER,
  constitutional: getConstitutionalCanonicalEconomy(),
  presenceTargets: resolvePresenceTargets(),
  labsConnected: false,
  narrativeIndexed: false,
  stages: [
    buildStage(
      'narrative',
      'WAITING',
      'Awaiting validated Labs narrative',
      'Melega Labs → DEX handoff not indexed in this build',
    ),
    buildStage(
      'validation',
      'BLOCKED',
      'Constitutional validation blocked',
      'Requires indexed Labs narrative',
    ),
    buildStage(
      'project_registry',
      'WAITING',
      'Project Registry entry pending',
      'Follows successful narrative validation',
    ),
    buildStage(
      'canonical_asset',
      'WAITING',
      'Project asset registration pending',
      'Constitutional MARCO on BNB Chain remains immutable',
    ),
    buildStage(
      'economic_presence',
      'PLANNED',
      'Economic Presence targets staged',
      'BNB · Ethereum · Polygon · Base · Solana — presence only',
    ),
    buildStage('venue_activation', 'WAITING', 'Venue activation pending', 'Requires project + asset registry'),
    buildStage('economic_events', 'WAITING', 'Economic events pending', 'Derived from venue graph'),
    buildStage(
      'treasury_runtime',
      'PLANNED',
      'Treasury Runtime — Phase 2',
      'No treasury amounts indexed',
    ),
    buildStage('radar', 'PLANNED', 'Radar — Phase 2', 'Incident feed not indexed'),
    buildStage('space', 'PLANNED', 'Space — Phase 2', 'Community bind not live for new activations'),
    buildStage('smartdrop', 'PLANNED', 'SmartDrop — Phase 2', 'Campaign runtime not indexed'),
  ],
})

export const resolveActivationForProject = (projectSlug: string): ActivationPipelineReadModel | null => {
  const project = getProjectBySlug(projectSlug)
  if (!project) return null

  const venues = getVenuesByProjectSlug(projectSlug)
  const events = getEventsByProjectSlug(projectSlug)
  const marco = getAssetBySlug('marco')
  const capabilities = project.capabilities

  const narrativeStatus: ActivationStageStatus = mapCapabilityToActivationStatus(capabilities.labs?.status)
  const validationStatus: ActivationStageStatus =
    project.registryStatus === 'listed' && project.verificationStatus === 'observed' ? 'READY' : 'WAITING'

  return {
    mode: 'project_derived',
    projectSlug,
    asOf: ACTIVATION_AS_OF,
    disclaimer: ACTIVATION_DISCLAIMER,
    constitutional: getConstitutionalCanonicalEconomy(),
    presenceTargets: resolvePresenceTargets(projectSlug),
    labsConnected: capabilities.labs?.status === 'live',
    narrativeIndexed: capabilities.labs?.status === 'live' || capabilities.labs?.status === 'partial',
    stages: [
      buildStage(
        'narrative',
        narrativeStatus === 'READY' ? 'READY' : 'PLANNED',
        capabilities.labs?.notes ?? 'Labs narrative surface',
      ),
      buildStage(
        'validation',
        validationStatus,
        `Verification: ${project.verificationStatus}`,
        project.disclaimer,
        `/@${projectSlug}/`,
      ),
      buildStage(
        'project_registry',
        'READY',
        `${project.displayName} listed`,
        project.upi,
        `/@${projectSlug}/`,
      ),
      buildStage(
        'canonical_asset',
        marco ? 'READY' : 'WAITING',
        marco ? `MARCO (${marco.symbol}) indexed` : 'Canonical asset not indexed',
        'Constitutional asset binding',
        marco ? `/assets/${marco.slug}` : '/assets',
      ),
      buildStage(
        'economic_presence',
        project.supportedChains.length > 1 ? 'READY' : 'WAITING',
        `${project.supportedChains.length} presence chains configured`,
        'Presence chains are not Canonical Economy',
      ),
      buildStage(
        'venue_activation',
        venues.length > 0 ? 'READY' : 'WAITING',
        `${venues.length} venues linked`,
        undefined,
        '/venues',
      ),
      buildStage(
        'economic_events',
        events.length > 0 ? 'READY' : 'WAITING',
        `${events.length} registry-derived events`,
        undefined,
        '/events',
      ),
      buildStage(
        'treasury_runtime',
        mapCapabilityToActivationStatus(capabilities.treasuryCompatible?.status),
        capabilities.treasuryCompatible?.notes ?? 'Treasury Runtime',
      ),
      buildStage(
        'radar',
        mapCapabilityToActivationStatus(capabilities.radar?.status),
        capabilities.radar?.notes ?? 'Radar',
      ),
      buildStage(
        'space',
        mapCapabilityToActivationStatus(capabilities.space?.status),
        capabilities.space?.notes ?? 'Space',
        project.spaceProfileUrl,
      ),
      buildStage(
        'smartdrop',
        mapCapabilityToActivationStatus(capabilities.smartdrop?.status),
        capabilities.smartdrop?.notes ?? 'SmartDrop',
      ),
    ],
  }
}

export const resolveActivationReadModel = (options?: {
  projectSlug?: string
}): ActivationPipelineReadModel => {
  if (options?.projectSlug) {
    const derived = resolveActivationForProject(options.projectSlug)
    if (derived) return derived
  }
  return resolveLabsActivationPreview()
}

export const getActivationRegistryStats = () => ({
  projects: getProjectBySlug('melega-dex') ? 1 : 0,
  assets: getAllAssets().length,
  venues: getAllVenues().length,
  events: getAllEvents().length,
})
