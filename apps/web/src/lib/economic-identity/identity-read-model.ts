import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { resolveActivationSession } from 'lib/economic-runtime'
import { resolveSmartExecutionReadModel } from 'lib/smart-execution'
import { resolveUserLaunchReadModel } from 'lib/user-launch'
import { resolveUserWorkspaceReadModel } from 'lib/user-workspace'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import { getAllPresence } from 'registry/presence/getAllPresence'
import {
  ECONOMIC_IDENTITY_AS_OF,
  ECONOMIC_IDENTITY_DISCLAIMER,
  IDENTITY_ARCHETYPE_SEEDS,
  IDENTITY_EMPTY_MESSAGE,
  isEvmAddressShape,
  PLACEHOLDER_ADDRESS_SLUG,
} from './identity-constants'
import { computeAgentReadinessScore } from './identity-scores'
import {
  EconomicIdentityReadModel,
  IdentityArchetype,
  IdentityReadModelSection,
  IdentitySurfaceStatus,
  WalletIdentityState,
  WalletConnectionStatus,
} from './identity-types'

export interface ResolveEconomicIdentityOptions {
  addressParam?: string | null
}

const surfaceStatusFromCount = (count: number, planned = false): IdentitySurfaceStatus => {
  if (count > 0) return 'indexed'
  if (planned) return 'planned'
  return 'not_indexed'
}

const buildSection = (
  section: Omit<IdentityReadModelSection, 'emptyMessage'> & { items: IdentityReadModelSection['items'] },
): IdentityReadModelSection => ({
  ...section,
  indexedCount: section.items.length,
  emptyMessage: IDENTITY_EMPTY_MESSAGE,
})

const resolveWalletState = (addressParam?: string | null): WalletIdentityState => {
  if (!addressParam || addressParam === PLACEHOLDER_ADDRESS_SLUG) {
    if (addressParam === PLACEHOLDER_ADDRESS_SLUG) {
      return {
        status: 'not_indexed',
        address: null,
        addressIndexed: false,
        holdingsIndexed: false,
        notes:
          'Placeholder address route — future connected-wallet binding. No on-chain reads or fake holdings.',
      }
    }

    return {
      status: 'wallet_not_connected',
      address: null,
      addressIndexed: false,
      holdingsIndexed: false,
      notes: 'Wallet integration not used in this read model. Connect flows remain on legacy surfaces.',
    }
  }

  if (isEvmAddressShape(addressParam)) {
    return {
      status: 'not_indexed',
      address: addressParam,
      addressIndexed: false,
      holdingsIndexed: false,
      notes:
        'Address shape accepted for future indexing only. No balances, NFT holdings, or ownership verified.',
    }
  }

  return {
    status: 'not_indexed',
    address: null,
    addressIndexed: false,
    holdingsIndexed: false,
    notes: 'Invalid or unsupported address parameter — economic binding not indexed.',
  }
}

const resolvePrimaryArchetype = (
  walletStatus: WalletConnectionStatus,
  launchAvailable: number,
  collectiblesIndexed: number,
): IdentityArchetype => {
  if (walletStatus === 'wallet_not_connected') return 'observer'
  if (collectiblesIndexed > 0) return 'collector'
  if (launchAvailable > 0) return 'launcher'
  return 'human_operator'
}

export const resolveEconomicIdentityReadModel = (
  options: ResolveEconomicIdentityOptions = {},
): EconomicIdentityReadModel => {
  const workspace = resolveUserWorkspaceReadModel()
  const launch = resolveUserLaunchReadModel()
  const activation = resolveActivationSession()
  const execution = resolveSmartExecutionReadModel()
  const presence = getAllPresence()
  const collectibles = getAllCollectibles()

  const wallet = resolveWalletState(options.addressParam)

  const projectsSection = workspace.sections.find((section) => section.id === 'projects')
  const assetsSection = workspace.sections.find((section) => section.id === 'assets')
  const liquiditySection = workspace.sections.find((section) => section.id === 'liquidity')

  const launchAvailable = launch.capabilities.filter(
    (capability) =>
      capability.status === 'LIVE' || capability.status === 'AVAILABLE_EXISTING_FLOW',
  )

  const activationReady = activation.stages.filter((stage) => stage.state === 'READY')

  const sections: IdentityReadModelSection[] = [
    buildSection({
      id: 'identity_role',
      label: 'Identity Role',
      description: 'Economic archetypes supported by the Melega identity layer — not social personas.',
      moduleHref: '/identity',
      status: 'indexed',
      items: IDENTITY_ARCHETYPE_SEEDS.map((archetype) => ({
        id: archetype.id,
        label: archetype.label,
        href: '/identity',
        status: archetype.status,
        notes: archetype.description,
      })),
    }),
    buildSection({
      id: 'wallet',
      label: 'Connected Wallet Status',
      description: 'Wallet binding state — no balances or holdings indexed.',
      moduleHref: '/identity',
      status: wallet.status === 'wallet_not_connected' ? 'not_indexed' : 'planned',
      items: [
        {
          id: 'wallet_status',
          label: wallet.status,
          href: '/identity',
          notes: wallet.notes,
        },
      ],
    }),
    buildSection({
      id: 'workspace',
      label: 'Workspace Links',
      description: 'Operational economic workspace surfaces.',
      moduleHref: '/workspace',
      status: 'indexed',
      items: workspace.sections.map((section) => ({
        id: section.id,
        label: section.label,
        href: section.moduleHref,
        status: section.hasActivity ? 'indexed' : 'not_indexed',
        notes: `${section.indexedCount} indexed`,
      })),
    }),
    buildSection({
      id: 'projects',
      label: 'Projects',
      description: 'Registry-indexed projects — operator binding not wallet-verified.',
      moduleHref: '/projects',
      status: surfaceStatusFromCount(projectsSection?.indexedCount ?? 0),
      items: (projectsSection?.items ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        status: item.status,
        notes: item.notes,
      })),
    }),
    buildSection({
      id: 'assets',
      label: 'Assets',
      description: 'Canonical and presence asset bindings.',
      moduleHref: '/assets',
      status: surfaceStatusFromCount(assetsSection?.indexedCount ?? 0),
      items: (assetsSection?.items ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        status: item.status,
        notes: item.notes,
      })),
    }),
    buildSection({
      id: 'liquidity',
      label: 'Liquidity',
      description: 'LP venue registry — no TVL or wallet balance figures.',
      moduleHref: '/liquidity',
      status: surfaceStatusFromCount(liquiditySection?.indexedCount ?? 0),
      items: (liquiditySection?.items ?? []).map((item) => ({
        id: item.id,
        label: item.label,
        href: item.href,
        status: item.status,
        notes: item.notes,
      })),
    }),
    buildSection({
      id: 'collectibles',
      label: 'Collectibles',
      description: 'Civilization collectibles role — ownership not wallet-verified.',
      moduleHref: '/collectibles',
      status: surfaceStatusFromCount(collectibles.length),
      items: collectibles.map((record) => ({
        id: record.slug,
        label: record.displayName,
        href: `/collectibles/${record.slug}`,
        status: record.status,
        notes: record.mint.route ? `Mint: ${record.mint.route}` : 'No mint route',
      })),
    }),
    buildSection({
      id: 'launch',
      label: 'Launch Capabilities',
      description: 'User launch and listing layer — links to existing flows only.',
      moduleHref: '/launch',
      status: surfaceStatusFromCount(launchAvailable.length),
      items: launch.capabilities.map((capability) => ({
        id: capability.id,
        label: capability.label,
        href: capability.existingFlowHref ?? capability.registryHref ?? '/launch',
        status: capability.status,
        notes: capability.availability,
      })),
    }),
    buildSection({
      id: 'activation',
      label: 'Activation State',
      description: 'Economic activation runtime stages.',
      moduleHref: '/new-project',
      status: surfaceStatusFromCount(activationReady.length, true),
      items: activation.stages.map((stage) => ({
        id: stage.id,
        label: stage.label,
        href: stage.href ?? '/new-project',
        status: stage.state,
        notes: stage.reason,
      })),
    }),
    buildSection({
      id: 'presence',
      label: 'Economic Presence',
      description: 'Presence targets — not Canonical Economy.',
      moduleHref: '/presence',
      status: surfaceStatusFromCount(presence.length),
      items: presence.map((record) => ({
        id: record.slug,
        label: record.displayName,
        href: `/presence/${record.slug}`,
        status: record.status,
        notes: record.isCanonical ? 'Canonical' : 'NOT CANONICAL',
      })),
    }),
    buildSection({
      id: 'execution',
      label: 'Execution Readiness',
      description: 'Smart execution decision layer — illustrative samples only.',
      moduleHref: '/execution',
      status: 'indexed',
      items: [
        {
          id: execution.recommendation.candidateId,
          label: execution.recommendation.label,
          href: '/execution',
          status: 'RECOMMENDED',
          notes: `Quality ${execution.recommendation.executionQualityScore} — illustrative`,
        },
        ...execution.alternatives.map((alternative) => ({
          id: alternative.candidateId,
          label: alternative.label,
          href: '/execution',
          status: 'ALTERNATIVE',
          notes: `Gap ${alternative.gapFromRecommended}`,
        })),
      ],
    }),
  ]

  const agentReadiness = computeAgentReadinessScore(sections)

  return {
    asOf: ECONOMIC_IDENTITY_AS_OF,
    disclaimer: ECONOMIC_IDENTITY_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    isSocialProfile: false,
    isKyc: false,
    isAccountCreation: false,
    constitutional: getConstitutionalCanonicalEconomy(),
    wallet,
    primaryArchetype: resolvePrimaryArchetype(
      wallet.status,
      launchAvailable.length,
      collectibles.length,
    ),
    archetypes: IDENTITY_ARCHETYPE_SEEDS.map((archetype) => ({ ...archetype })),
    sections,
    agentReadiness,
    crossLinks: {
      workspace: '/workspace',
      launch: '/launch',
      collectibles: '/collectibles',
      presence: '/presence',
      activation: '/new-project',
      execution: '/execution',
      graph: '/graph',
      query: '/query',
    },
  }
}
