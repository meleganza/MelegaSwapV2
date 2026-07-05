import { getConstitutionalCanonicalEconomy } from 'lib/economic-activation'
import { resolveActivationSession } from 'lib/economic-runtime'
import { resolveSmartExecutionReadModel } from 'lib/smart-execution'
import { getAllAssets } from 'registry/assets/getAllAssets'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import { getAllPresence } from 'registry/presence/getAllPresence'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getAllVenues } from 'registry/venues/getAllVenues'
import {
  USER_WORKSPACE_AS_OF,
  USER_WORKSPACE_DISCLAIMER,
  WORKSPACE_EMPTY_MESSAGE,
  WORKSPACE_FUTURE_SURFACES,
} from './workspace-constants'
import { UserWorkspaceReadModel, WorkspaceSection, WorkspaceSectionItem } from './workspace-types'

const buildSection = (
  section: Omit<WorkspaceSection, 'emptyMessage' | 'hasActivity' | 'indexedCount'> & {
    items: WorkspaceSectionItem[]
  },
): WorkspaceSection => ({
  ...section,
  indexedCount: section.items.length,
  hasActivity: section.items.length > 0,
  emptyMessage: WORKSPACE_EMPTY_MESSAGE,
})

export const resolveUserWorkspaceReadModel = (): UserWorkspaceReadModel => {
  const projects = getAllProjects()
  const assets = getAllAssets()
  const venues = getAllVenues()
  const presence = getAllPresence()
  const collectibles = getAllCollectibles()
  const activation = resolveActivationSession()
  const execution = resolveSmartExecutionReadModel()

  const liquidityVenues = venues.filter((venue) => venue.venueType === 'spot_lp')
  const farmVenues = venues.filter((venue) => venue.venueType === 'farm')
  const poolVenues = venues.filter((venue) => venue.venueType === 'stake_pool')

  const sections: WorkspaceSection[] = [
    buildSection({
      id: 'projects',
      label: 'Projects',
      description: 'Indexed project registry entries.',
      moduleHref: '/projects',
      items: projects.map((project) => ({
        id: project.slug,
        label: project.displayName,
        href: `/projects/${project.slug}`,
        status: project.registryStatus,
        notes: project.upi,
      })),
    }),
    buildSection({
      id: 'assets',
      label: 'Assets',
      description: 'Canonical and presence asset bindings.',
      moduleHref: '/assets',
      items: assets.map((asset) => ({
        id: asset.slug,
        label: asset.name,
        href: `/assets/${asset.slug}`,
        status: asset.lifecycle,
        notes: asset.uai,
      })),
    }),
    buildSection({
      id: 'liquidity',
      label: 'Liquidity',
      description: 'Registry-indexed LP venues. No TVL or balance figures.',
      moduleHref: '/liquidity-studio',
      items: liquidityVenues.map((venue) => ({
        id: venue.slug,
        label: venue.displayName,
        href: venue.deepLinks?.liquidity ?? '/liquidity-studio',
        status: venue.metrics.status,
        notes: venue.metrics.notes,
      })),
    }),
    buildSection({
      id: 'pools',
      label: 'Pools',
      description: 'Registry-indexed staking pool venues.',
      moduleHref: '/pools',
      items: poolVenues.map((venue) => ({
        id: venue.slug,
        label: venue.displayName,
        href: venue.deepLinks?.pools ?? '/pools',
        status: venue.lifecycle,
        notes: venue.metrics.notes,
      })),
    }),
    buildSection({
      id: 'farms',
      label: 'Farms',
      description: 'Registry-indexed farm venues. No APR or reward figures.',
      moduleHref: '/farms',
      items: farmVenues.map((venue) => ({
        id: venue.slug,
        label: venue.displayName,
        href: venue.deepLinks?.farms ?? '/farms',
        status: venue.lifecycle,
        notes: venue.metrics.notes,
      })),
    }),
    buildSection({
      id: 'presence',
      label: 'Presence',
      description: 'Economic presence targets — not Canonical Economy.',
      moduleHref: '/presence',
      items: presence.map((record) => ({
        id: record.slug,
        label: record.displayName,
        href: `/presence/${record.slug}`,
        status: record.status,
        notes: record.isCanonical ? 'Canonical' : 'NOT CANONICAL',
      })),
    }),
    buildSection({
      id: 'collectibles',
      label: 'Collectibles',
      description: 'Civilization collectibles read model — no ownership counts indexed.',
      moduleHref: '/collectibles',
      items: collectibles.map((record) => ({
        id: record.slug,
        label: record.displayName,
        href: `/collectibles/${record.slug}`,
        status: record.status,
        notes: record.mint.route ? `Mint: ${record.mint.route}` : 'No mint route indexed',
      })),
    }),
    buildSection({
      id: 'activation',
      label: 'Activation',
      description: 'Economic activation runtime read model.',
      moduleHref: '/new-project',
      items: activation.stages
        .filter((stage) => stage.state === 'READY')
        .map((stage) => ({
          id: stage.id,
          label: stage.label,
          href: stage.href ?? '/new-project',
          status: stage.state,
          notes: stage.reason,
        })),
    }),
    buildSection({
      id: 'execution',
      label: 'Execution',
      description: 'Smart execution decision layer — illustrative samples only.',
      moduleHref: '/execution',
      items: [
        {
          id: execution.recommendation.candidateId,
          label: execution.recommendation.label,
          href: '/execution',
          status: 'RECOMMENDED',
          notes: `Execution quality ${execution.recommendation.executionQualityScore} — illustrative`,
        },
        ...execution.alternatives.map((alternative) => ({
          id: alternative.candidateId,
          label: alternative.label,
          href: '/execution',
          status: 'ALTERNATIVE',
          notes: `Gap ${alternative.gapFromRecommended} — illustrative`,
        })),
      ],
    }),
  ]

  return {
    asOf: USER_WORKSPACE_AS_OF,
    disclaimer: USER_WORKSPACE_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    constitutional: getConstitutionalCanonicalEconomy(),
    sections,
    futureSurfaces: WORKSPACE_FUTURE_SURFACES.map((surface) => ({ ...surface })),
  }
}
