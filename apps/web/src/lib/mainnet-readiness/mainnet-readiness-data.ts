import {
  ForbiddenFileAudit,
  MainnetReadinessGate,
  MissionBranchRecord,
  SurfaceReadinessRecord,
} from './mainnet-readiness-types'

export const MAINNET_READINESS_VERSION = '0.1.0'

export const MAINNET_READINESS_AS_OF = '2026-06-28'

export const MAINNET_READINESS_DISCLAIMER =
  'Mainnet Readiness Gate audit only. No runtime behavior changes. Consolidates Missions Organ 01–18 for production merge planning.'

export const MISSION_BRANCH_LINEAGE: MissionBranchRecord[] = [
  {
    id: 'organ01',
    branch: 'organ01-project-registry-core',
    mergeOrder: 1,
    headCommit: '5bc3dad',
    dependsOn: ['main'],
    risk: 'low',
    conflictNotes: ['Introduces registry/projects routes and base translations keys'],
  },
  {
    id: 'organ02',
    branch: 'organ02-asset-registry-spec',
    mergeOrder: 2,
    headCommit: '57a17e0',
    dependsOn: ['organ01'],
    risk: 'low',
    conflictNotes: ['Adds /assets routes and AssetDetail views'],
  },
  {
    id: 'organ03',
    branch: 'organ03-economic-venue-registry',
    mergeOrder: 3,
    headCommit: '25df311',
    dependsOn: ['organ02'],
    risk: 'low',
    conflictNotes: ['Adds /venues routes'],
  },
  {
    id: 'organ04',
    branch: 'organ04-economic-event-registry',
    mergeOrder: 4,
    headCommit: 'f61f787',
    dependsOn: ['organ03'],
    risk: 'low',
    conflictNotes: ['Adds /events routes'],
  },
  {
    id: 'mission05',
    branch: 'mission05-registry-integration-layer',
    mergeOrder: 5,
    headCommit: 'e47509b',
    dependsOn: ['organ04'],
    risk: 'medium',
    conflictNotes: ['Adds /graph integration layer — Mission 07/08 not delivered as separate branches'],
  },
  {
    id: 'mission06',
    branch: 'mission06-economic-query-layer',
    mergeOrder: 6,
    headCommit: 'e02ae30',
    dependsOn: ['mission05'],
    risk: 'low',
    conflictNotes: ['Adds /query route'],
  },
  {
    id: 'mission09',
    branch: 'mission09-economic-activation-runtime',
    mergeOrder: 7,
    headCommit: '408e054',
    dependsOn: ['mission06'],
    risk: 'medium',
    conflictNotes: ['Adds /new-project — translations.json growth begins in earnest'],
  },
  {
    id: 'mission10',
    branch: 'mission10-smart-economic-execution',
    mergeOrder: 8,
    headCommit: '65d3f02',
    dependsOn: ['mission09'],
    risk: 'low',
    conflictNotes: ['Adds /execution read model'],
  },
  {
    id: 'mission11',
    branch: 'mission11-economic-presence-registry',
    mergeOrder: 9,
    headCommit: '55ac12c',
    dependsOn: ['mission10'],
    risk: 'medium',
    conflictNotes: ['Adds /presence and .well-known/melega-dex-presence.json'],
  },
  {
    id: 'mission12',
    branch: 'mission12-user-launch-listing-layer',
    mergeOrder: 10,
    headCommit: '7a424e8',
    dependsOn: ['mission11'],
    risk: 'low',
    conflictNotes: ['Adds /launch capability read model'],
  },
  {
    id: 'mission13',
    branch: 'mission13-dex-capability-audit',
    mergeOrder: 11,
    headCommit: '06b2dac',
    dependsOn: ['mission12'],
    risk: 'low',
    conflictNotes: ['Audit doc only — docs/MISSION_13_DEX_CAPABILITY_AUDIT.md'],
  },
  {
    id: 'mission14',
    branch: 'mission14-user-economic-workspace',
    mergeOrder: 12,
    headCommit: 'ef27a7e',
    dependsOn: ['mission13'],
    risk: 'low',
    conflictNotes: ['Adds /workspace'],
  },
  {
    id: 'mission15',
    branch: 'mission15-legacy-ilo-retirement',
    mergeOrder: 13,
    headCommit: '9830b84',
    dependsOn: ['mission14'],
    risk: 'medium',
    conflictNotes: ['Replaces /ilo rendered page — route preserved, IFO code untouched'],
  },
  {
    id: 'mission16',
    branch: 'mission16-civilization-collectibles-layer',
    mergeOrder: 14,
    headCommit: 'e6cdb99',
    dependsOn: ['mission15'],
    risk: 'low',
    conflictNotes: ['Adds /collectibles — cross-links workspace/launch'],
  },
  {
    id: 'mission17',
    branch: 'mission17-economic-identity-layer',
    mergeOrder: 15,
    headCommit: '5591e9f',
    dependsOn: ['mission16'],
    risk: 'low',
    conflictNotes: ['Adds /identity'],
  },
  {
    id: 'mission18',
    branch: 'mission18-navigation-surface-map',
    mergeOrder: 16,
    headCommit: 'df68e4c',
    dependsOn: ['mission17'],
    risk: 'low',
    conflictNotes: ['Adds /map — tip branch for consolidated merge'],
  },
]

export const RECOMMENDED_MERGE_ORDER = MISSION_BRANCH_LINEAGE.map((record) => record.branch)

export const SURFACE_READINESS: SurfaceReadinessRecord[] = [
  { id: 'swap', route: '/swap', classification: 'production_safe', notes: 'Legacy live DEX swap — untouched by missions 09–18' },
  { id: 'liquidity', route: '/liquidity', classification: 'production_safe', notes: 'Legacy add/remove LP — LIVE' },
  { id: 'farms', route: '/farms', classification: 'production_safe', notes: 'Legacy MasterChef farms — LIVE participate only' },
  { id: 'pools', route: '/pools', classification: 'production_safe', notes: 'Legacy Sous Chef pools — LIVE participate only' },
  { id: 'projects', route: '/projects', classification: 'read_model_only', notes: 'Static registry — no writes' },
  { id: 'assets', route: '/assets', classification: 'read_model_only', notes: 'Static asset registry' },
  { id: 'venues', route: '/venues', classification: 'read_model_only', notes: 'Static venue registry — no fake TVL' },
  { id: 'events', route: '/events', classification: 'read_model_only', notes: 'Static event registry' },
  { id: 'graph', route: '/graph', classification: 'read_model_only', notes: 'Registry graph explorer' },
  { id: 'query', route: '/query', classification: 'read_model_only', notes: 'Registry query console' },
  { id: 'new-project', route: '/new-project', classification: 'preview_only', notes: 'Activation runtime UI — read model, no chain writes' },
  { id: 'execution', route: '/execution', classification: 'read_model_only', notes: 'Illustrative execution samples only' },
  { id: 'presence', route: '/presence', classification: 'read_model_only', notes: 'Economic presence — NOT canonical economy' },
  { id: 'launch', route: '/launch', classification: 'read_model_only', notes: 'Capability index — links to existing flows' },
  { id: 'workspace', route: '/workspace', classification: 'read_model_only', notes: 'Operational workspace aggregator' },
  { id: 'ilo', route: '/ilo', classification: 'retired', notes: 'Retirement page — route preserved, IFO logic not rendered' },
  { id: 'collectibles', route: '/collectibles', classification: 'read_model_only', notes: 'Civilization collectibles — no fake ownership' },
  { id: 'identity', route: '/identity', classification: 'read_model_only', notes: 'Economic identity — not KYC/social' },
  { id: 'map', route: '/map', classification: 'read_model_only', notes: 'Unified surface map for humans and agents' },
  { id: 'nft_mint', route: '/nft', classification: 'legacy_risky', notes: 'BabyMarco DNFT mint — BSC only, on-chain' },
  { id: 'nft_wallet', route: '/viewNFTs', classification: 'legacy_risky', notes: 'Legacy wallet NFT view' },
  { id: 'nft_market', route: '/nftmarket', classification: 'legacy_risky', notes: 'Legacy NFT marketplace' },
  { id: 'farm_create', route: '/farms (create)', classification: 'blocked', notes: 'No user farm deploy — Mission 12 BLOCKED' },
  { id: 'token_listing', route: '/swap (import)', classification: 'blocked', notes: 'Token listing governance missing — Mission 13 audit' },
]

export const FORBIDDEN_FILE_AUDIT: ForbiddenFileAudit[] = [
  { path: 'apps/web/src/config/constants/exchange.ts', status: 'unchanged', notes: 'No changes in missions 09–18; unchanged vs main in mission18 tip' },
  { path: 'apps/web/src/config/constants/contracts.ts', status: 'unchanged', notes: 'No mission commits touched this file' },
  { path: 'apps/web/src/config/constants/pools.tsx', status: 'unchanged', notes: 'No mission commits touched this file' },
  { path: 'apps/web/src/utils/wagmi.ts', status: 'pre_mission_change', notes: 'WP1 brand shell (dd67070) — 2-line change before Organ 01; missions 09–18 untouched' },
  { path: 'apps/web/src/config/constants/tokenLists/', status: 'unchanged', notes: 'No mission commits touched token lists' },
  { path: 'Router / swap logic', status: 'unchanged', notes: 'Legacy swap pages unchanged by missions 09–18' },
  { path: 'MasterChef / farms logic', status: 'unchanged', notes: 'Farm business logic untouched' },
  { path: 'Wallet integration', status: 'unchanged', notes: 'No wagmi/hooks changes in missions 09–18' },
  { path: 'NFT minting logic', status: 'unchanged', notes: 'pages/nft/* untouched by missions 15–18' },
]

export const ROUTES_ADDED_OR_MODIFIED = [
  '/projects',
  '/assets',
  '/venues',
  '/events',
  '/graph',
  '/query',
  '/new-project',
  '/execution',
  '/presence',
  '/launch',
  '/workspace',
  '/ilo',
  '/collectibles',
  '/identity',
  '/map',
]

export const REGISTRY_MANIFESTS = [
  '/registry/projects/index.json',
  '/registry/projects/discovery.json',
  '/registry/projects/melega-dex.json',
  '/registry/assets/index.json',
  '/registry/venues/index.json',
  '/registry/events/index.json',
  '/registry/graph/index.json',
  '/registry/query/index.json',
  '/registry/activation/preview.json',
  '/registry/activation/runtime.json',
  '/registry/execution/index.json',
  '/registry/presence/index.json',
  '/registry/launch/index.json',
  '/registry/workspace/index.json',
  '/registry/legacy/ilo-retirement.json',
  '/registry/collectibles/index.json',
  '/registry/identity/index.json',
  '/registry/surfaces/index.json',
  '/registry/capabilities/dex-capability-audit.json',
  '/registry/readiness/mainnet-gate.json',
]

export const WELL_KNOWN_MANIFESTS = [
  '/.well-known/melega-dex-manifest.json',
  '/.well-known/melega-dex-discovery.json',
  '/.well-known/melega-dex-projects.json',
  '/.well-known/melega-dex-assets.json',
  '/.well-known/melega-dex-venues.json',
  '/.well-known/melega-dex-events.json',
  '/.well-known/melega-dex-graph.json',
  '/.well-known/melega-dex-query.json',
  '/.well-known/melega-dex-presence.json',
  '/.well-known/melega-dex-collectibles.json',
]

export const BLOCKERS = [
  'Mission stack (Organ 01–Mission 18) not merged to main — 23 commits ahead on mission18-navigation-surface-map',
  'translations.json has ~488 insertions vs main — high merge conflict probability; resolve with append-only key merge',
  'Token listing governance pipeline MISSING (Mission 13) — no protocol token list submission UI',
  'User farm/pool creation BLOCKED — MasterChef allocation is protocol-governed',
  'No consolidated mainnet menu/navigation wiring — new surfaces reachable by direct URL only unless manually linked',
]

export const WARNINGS = [
  'Mission 07 and Mission 08 were not delivered as isolated branches — graph/query absorbed into Mission 05/06',
  'WP1 commit (dd67070) modified wagmi.ts before Organ 01 — review before mainnet merge',
  'Legacy PancakeSwap UI/uikit dependency remains for registry pages',
  'ILO contract logic preserved but UI retired at /ilo — external links may still expect active pad',
  'NFT mint/market routes are legacy_risky — preserved, not reframed in menu',
  'Read-model surfaces lack wallet-verified data — by design, but agents must not infer balances',
  'Multiple isolated remote branches exist — prefer single tip merge from mission18-navigation-surface-map',
]

export const CAN_GO_LIVE_NOW = [
  'Legacy DEX core: /swap, /liquidity, /farms, /pools',
  'Registry read models: /projects, /assets, /venues, /events, /graph, /query, /presence',
  'Operational read models: /launch, /workspace, /collectibles, /identity, /map',
  'Retired /ilo compatibility page with supersession CTAs',
  'All public registry JSON manifests under /registry/',
]

export const MUST_STAY_SECONDARY = [
  '/execution — illustrative samples only',
  '/new-project — preview/activation read model, not production launch pad',
  '/nft, /viewNFTs, /nftmarket — legacy on-chain, not primary navigation',
  '/ilo — retired surface, link compatibility only',
  'Planned presence targets (Solana, non-canonical chains) — not canonical economy',
]

export const NEXT_MISSION =
  'Mission 20: Mainnet Consolidation Merge — merge mission18-navigation-surface-map to main, resolve translations.json, add optional secondary nav links to /map without global UI redesign'

export const resolveMainnetReadinessGate = (): MainnetReadinessGate => ({
  manifest: 'manifest://melega/platform/mainnet-readiness-gate@0.1.0',
  api_version: MAINNET_READINESS_VERSION,
  phase: 'mainnet_readiness_audit',
  as_of: MAINNET_READINESS_AS_OF,
  verdict: 'conditional_go',
  audit_type: 'read_only',
  disclaimer: MAINNET_READINESS_DISCLAIMER,
  branch_lineage: MISSION_BRANCH_LINEAGE.map((record) => ({ ...record, conflictNotes: [...record.conflictNotes] })),
  recommended_merge_order: [...RECOMMENDED_MERGE_ORDER],
  blockers: [...BLOCKERS],
  warnings: [...WARNINGS],
  can_go_live_now: [...CAN_GO_LIVE_NOW],
  must_stay_secondary: [...MUST_STAY_SECONDARY],
  forbidden_files: FORBIDDEN_FILE_AUDIT.map((record) => ({ ...record })),
  surfaces: SURFACE_READINESS.map((record) => ({ ...record })),
  routes_added: [...ROUTES_ADDED_OR_MODIFIED],
  registry_manifests: [...REGISTRY_MANIFESTS],
  well_known_manifests: [...WELL_KNOWN_MANIFESTS],
  next_mission: NEXT_MISSION,
})
