import { LEGACY_ILO_SURFACE } from 'lib/legacy-surfaces'
import {
  SURFACE_GROUPS,
  SURFACE_GROUP_ORDER,
  SURFACE_MAP_AS_OF,
  SURFACE_MAP_DISCLAIMER,
} from './surface-groups'
import {
  SurfaceGroupId,
  SurfaceMapReadModel,
  SurfaceRecord,
  SurfaceStatus,
} from './surface-types'

const surface = (record: SurfaceRecord): SurfaceRecord => ({ ...record })

export const SURFACE_MAP_RECORDS: SurfaceRecord[] = [
  // Execute
  surface({
    id: 'swap',
    label: 'Swap',
    route: '/trade',
    group: 'execute',
    status: 'live',
    humanPurpose: 'Exchange tokens via the legacy DEX swap interface.',
    agentPurpose: 'Primary token swap venue — on-chain execution, wallet required.',
    dataSource: 'legacy-dex-swap',
    executionRisk: 'on_chain',
    visibility: 'primary',
  }),
  surface({
    id: 'liquidity',
    label: 'Liquidity',
    route: '/liquidity-studio',
    group: 'execute',
    status: 'live',
    humanPurpose: 'Add or remove liquidity from V2 pairs.',
    agentPurpose: 'LP provision surface — on-chain add/remove liquidity flows.',
    dataSource: 'legacy-dex-liquidity',
    executionRisk: 'on_chain',
    visibility: 'primary',
  }),
  surface({
    id: 'farms',
    label: 'Farms',
    route: '/farms',
    group: 'execute',
    status: 'live',
    humanPurpose: 'Stake LP tokens in MasterChef farms for rewards.',
    agentPurpose: 'Farm staking surface — on-chain stake/unstake/harvest.',
    dataSource: 'legacy-dex-farms',
    executionRisk: 'on_chain',
    visibility: 'primary',
  }),
  surface({
    id: 'pools',
    label: 'Pools',
    route: '/pools',
    group: 'execute',
    status: 'live',
    humanPurpose: 'Stake in Sous Chef staking pools.',
    agentPurpose: 'Staking pool surface — on-chain pool participation.',
    dataSource: 'legacy-dex-pools',
    executionRisk: 'on_chain',
    visibility: 'primary',
  }),
  surface({
    id: 'execution',
    label: 'Execution',
    route: '/execution',
    group: 'execute',
    status: 'read_model',
    humanPurpose: 'Smart economic execution decision layer — illustrative samples only.',
    agentPurpose: 'Compare execution-quality candidates before routing to live swap/liquidity flows.',
    dataSource: 'smart-execution-read-model',
    executionRisk: 'none',
    manifestUri: '/registry/execution/index.json',
    visibility: 'secondary',
  }),

  // Create
  surface({
    id: 'launch',
    label: 'Launch',
    route: '/build-studio#build-import',
    group: 'create',
    status: 'read_model',
    humanPurpose: 'User launch and listing capabilities — links to existing flows where live.',
    agentPurpose: 'Capability index for token, pool, farm, and collectible launch paths.',
    dataSource: 'user-launch-read-model',
    executionRisk: 'low',
    manifestUri: '/registry/launch/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'activation',
    label: 'New Project / Activation',
    route: '/new-project',
    group: 'create',
    status: 'read_model',
    humanPurpose: 'Economic Activation Runtime — Labs → DEX read model.',
    agentPurpose: 'Activation stage index for economic presence handoff — no blockchain writes.',
    dataSource: 'economic-activation-runtime',
    executionRisk: 'none',
    manifestUri: '/registry/activation/runtime.json',
    visibility: 'primary',
  }),
  surface({
    id: 'collectibles',
    label: 'Collectibles',
    route: '/collectibles',
    group: 'create',
    status: 'read_model',
    humanPurpose: 'Civilization collectibles read model — BabyMarco Genesis and planned identity proofs.',
    agentPurpose: 'Collectible class index; mint via legacy /nft/ when indexed — no fake ownership.',
    dataSource: 'collectibles-registry-static',
    executionRisk: 'low',
    manifestUri: '/registry/collectibles/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'legacy_ilo',
    label: 'Legacy ILO (Retired)',
    route: LEGACY_ILO_SURFACE.legacyRoute,
    group: 'create',
    status: 'retired',
    humanPurpose: 'Legacy ILO pad — preserved for link compatibility only.',
    agentPurpose: 'Do not route launch actions here. Use /launch, /new-project, /workspace instead.',
    dataSource: 'legacy-ilo-retirement',
    executionRisk: 'none',
    manifestUri: '/registry/legacy/ilo-retirement.json',
    replacementRoute: '/build-studio#build-import',
    visibility: 'legacy',
  }),
  surface({
    id: 'nft_mint',
    label: 'BabyMarco NFT Mint',
    route: '/nft',
    group: 'create',
    status: 'legacy',
    humanPurpose: 'Legacy BabyMarco DNFT mint page (BSC only).',
    agentPurpose: 'On-chain mint surface for BabyMarco Genesis — prefer /collectibles for read model context.',
    dataSource: 'legacy-nft-mint',
    executionRisk: 'on_chain',
    manifestUri: '/registry/collectibles/babymarco-genesis.json',
    visibility: 'legacy',
  }),

  // Understand
  surface({
    id: 'projects',
    label: 'Projects',
    route: '/projects',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'Indexed project registry entries.',
    agentPurpose: 'Resolve project UPI bindings and discovery metadata.',
    dataSource: 'project-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/projects/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'assets',
    label: 'Assets',
    route: '/assets',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'Canonical and presence asset bindings.',
    agentPurpose: 'Resolve UAI asset identifiers and lifecycle status.',
    dataSource: 'asset-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/assets/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'venues',
    label: 'Venues',
    route: '/venues',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'LP, farm, and pool venue registry.',
    agentPurpose: 'Map economic venues to deep links without fake TVL.',
    dataSource: 'venue-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/venues/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'events',
    label: 'Events',
    route: '/events',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'Registry-indexed economic events.',
    agentPurpose: 'Timeline and event slug resolution for graph bindings.',
    dataSource: 'event-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/events/index.json',
    visibility: 'secondary',
  }),
  surface({
    id: 'graph',
    label: 'Graph',
    route: '/graph',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'Constitutional registry graph explorer.',
    agentPurpose: 'Traverse project → asset → venue → event relationships.',
    dataSource: 'graph-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/graph/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'query',
    label: 'Query',
    route: '/query',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'Registry query console.',
    agentPurpose: 'Structured query surface over indexed registry records.',
    dataSource: 'query-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/query/index.json',
    visibility: 'secondary',
  }),
  surface({
    id: 'presence',
    label: 'Presence',
    route: '/presence',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'Economic presence targets — not Canonical Economy.',
    agentPurpose: 'Distinguish canonical MARCO on BNB from presence-only deployments.',
    dataSource: 'presence-registry-static',
    executionRisk: 'none',
    manifestUri: '/registry/presence/index.json',
    visibility: 'primary',
  }),

  // Manage
  surface({
    id: 'workspace',
    label: 'Workspace',
    route: '/command-center',
    group: 'manage',
    status: 'read_model',
    humanPurpose: 'User economic workspace — operational center for indexed activity.',
    agentPurpose: 'Aggregate section links across registry modules — no fake balances.',
    dataSource: 'user-workspace-read-model',
    executionRisk: 'none',
    manifestUri: '/registry/workspace/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'identity',
    label: 'Identity',
    route: '/identity',
    group: 'manage',
    status: 'read_model',
    humanPurpose: 'Economic identity console — not social profile or KYC.',
    agentPurpose: 'Archetype and agent-readiness index without wallet holdings.',
    dataSource: 'economic-identity-read-model',
    executionRisk: 'none',
    manifestUri: '/registry/identity/index.json',
    visibility: 'primary',
  }),
  surface({
    id: 'nft_wallet',
    label: 'NFT Wallet View',
    route: '/viewNFTs',
    group: 'manage',
    status: 'legacy',
    humanPurpose: 'View owned BabyMarco NFTs in connected wallet.',
    agentPurpose: 'Legacy wallet NFT inventory — on-chain reads, not indexed in collectibles read model.',
    dataSource: 'legacy-nft-wallet',
    executionRisk: 'low',
    visibility: 'legacy',
  }),
  surface({
    id: 'nft_market',
    label: 'NFT Market',
    route: '/nftmarket',
    group: 'manage',
    status: 'legacy',
    humanPurpose: 'Buy and sell BabyMarco NFTs on legacy marketplace.',
    agentPurpose: 'Legacy NFT market surface — on-chain list/buy flows.',
    dataSource: 'legacy-nft-market',
    executionRisk: 'on_chain',
    visibility: 'legacy',
  }),

  // Meta — hidden navigation index
  surface({
    id: 'surface_map',
    label: 'Surface Map',
    route: '/map',
    group: 'understand',
    status: 'read_model',
    humanPurpose: 'This unified navigation and surface map.',
    agentPurpose: 'Canonical route index for all Melega DEX surfaces — start here for orientation.',
    dataSource: 'surface-map-read-model',
    executionRisk: 'none',
    manifestUri: '/registry/surfaces/index.json',
    visibility: 'hidden',
  }),
]

const countBy = <T extends string>(items: SurfaceRecord[], key: (item: SurfaceRecord) => T): Record<T, number> => {
  const counts = {} as Record<T, number>
  items.forEach((item) => {
    const value = key(item)
    counts[value] = (counts[value] ?? 0) + 1
  })
  return counts
}

export const getAllSurfaces = (): SurfaceRecord[] =>
  SURFACE_MAP_RECORDS.map((record) => ({ ...record }))

export const getSurfacesByGroup = (groupId: SurfaceGroupId): SurfaceRecord[] =>
  getAllSurfaces().filter((record) => record.group === groupId)

export const getSurfaceById = (id: string): SurfaceRecord | undefined =>
  SURFACE_MAP_RECORDS.find((record) => record.id === id)

export const getVisibleSurfaces = (): SurfaceRecord[] =>
  getAllSurfaces().filter((record) => record.visibility !== 'hidden')

export const resolveSurfaceMapReadModel = (): SurfaceMapReadModel => {
  const surfaces = getAllSurfaces()

  return {
    asOf: SURFACE_MAP_AS_OF,
    disclaimer: SURFACE_MAP_DISCLAIMER,
    readOnly: true,
    executionEnabled: false,
    groups: SURFACE_GROUPS.map((group) => ({ ...group })),
    surfaces,
    summary: {
      total: surfaces.length,
      byGroup: countBy(surfaces, (record) => record.group),
      byStatus: countBy(surfaces, (record) => record.status),
      retired: surfaces.filter((record) => record.status === 'retired').length,
      withManifest: surfaces.filter((record) => Boolean(record.manifestUri)).length,
    },
  }
}

export const getGroupedVisibleSurfaces = (): { group: (typeof SURFACE_GROUPS)[number]; surfaces: SurfaceRecord[] }[] =>
  SURFACE_GROUP_ORDER.map((groupId) => ({
    group: SURFACE_GROUPS.find((group) => group.id === groupId)!,
    surfaces: getSurfacesByGroup(groupId).filter((record) => record.visibility !== 'hidden'),
  }))

export const assertSurfaceMapCoverage = (): void => {
  SURFACE_GROUP_ORDER.forEach((groupId) => {
    if (getSurfacesByGroup(groupId).length === 0) {
      throw new Error(`Surface group has no surfaces: ${groupId}`)
    }
  })
}
