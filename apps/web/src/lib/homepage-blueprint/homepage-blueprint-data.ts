import { HomepageBlueprint, HomepageSurfaceSlot } from './homepage-blueprint-types'

export const HOMEPAGE_BLUEPRINT_VERSION = '0.1.0'

export const HOMEPAGE_BLUEPRINT_AS_OF = '2026-06-29'

export const HOMEPAGE_BLUEPRINT_BRANCH = 'mainnet-consolidation-m20'

export const HOMEPAGE_BLUEPRINT_DISCLAIMER =
  'Homepage blueprint (Mission 21A) — Civilization Entry Point specification only. No UI implementation in this mission.'

export const HOMEPAGE_BLUEPRINT_VERDICT =
  'APPROVED_BLUEPRINT — Civilization Entry Point replaces Pancake-era home; CORE four (Swap, Workspace, Launch, Map) with constitutional MARCO banner'

const slot = (surface: HomepageSurfaceSlot): HomepageSurfaceSlot => ({ ...surface })

export const CORE_SURFACES: HomepageSurfaceSlot[] = [
  slot({
    id: 'swap',
    label: 'Swap',
    route: '/trade',
    tier: 'core',
    promotion: 'promote',
    humanPurpose: 'Exchange tokens immediately — primary on-chain action.',
    agentPurpose: 'Route live execution here after registry/orientation.',
    notes: 'Hero CTA #1. Production-safe. Unchanged execution surface.',
  }),
  slot({
    id: 'workspace',
    label: 'Workspace',
    route: '/command-center',
    tier: 'core',
    promotion: 'promote',
    humanPurpose: 'Manage your economic activity across indexed Melega surfaces.',
    agentPurpose: 'Operator hub — aggregate section links without fake balances.',
    manifestUri: '/registry/workspace/index.json',
    notes: 'Hero CTA #2. Replaces implicit “figure it out” navigation.',
  }),
  slot({
    id: 'launch',
    label: 'Launch',
    route: '/build-studio#build-import',
    tier: 'core',
    promotion: 'promote',
    humanPurpose: 'See what you can create — tokens, pools, collectibles — with honest capability status.',
    agentPurpose: 'Capability index; links to existing flows only.',
    manifestUri: '/registry/launch/index.json',
    notes: 'Hero CTA #3. Must NOT point to /ilo.',
  }),
  slot({
    id: 'map',
    label: 'Map',
    route: '/map',
    tier: 'core',
    promotion: 'promote',
    humanPurpose: 'Understand every surface — grouped, status-badged, agent-readable.',
    agentPurpose: 'Canonical orientation index for humans and agents.',
    manifestUri: '/registry/surfaces/index.json',
    notes: 'Hero CTA #4. Mission 18 surface map becomes homepage compass.',
  }),
]

export const SECONDARY_SURFACES: HomepageSurfaceSlot[] = [
  slot({
    id: 'projects',
    label: 'Projects',
    route: '/projects',
    tier: 'secondary',
    promotion: 'keep',
    humanPurpose: 'Browse indexed Melega projects and constitutional identity.',
    agentPurpose: 'Resolve UPI and project manifests.',
    manifestUri: '/registry/projects/index.json',
    notes: 'Secondary row — already in global menu.',
  }),
  slot({
    id: 'assets',
    label: 'Assets',
    route: '/assets',
    tier: 'secondary',
    promotion: 'promote',
    humanPurpose: 'Canonical and presence asset bindings (MARCO, etc.).',
    agentPurpose: 'UAI resolution layer.',
    manifestUri: '/registry/assets/index.json',
    notes: 'Pair with Projects in registry strip.',
  }),
  slot({
    id: 'graph',
    label: 'Graph',
    route: '/graph',
    tier: 'secondary',
    promotion: 'promote',
    humanPurpose: 'Explore project → asset → venue → event relationships.',
    agentPurpose: 'Primary traversal after Map orientation.',
    manifestUri: '/registry/graph/index.json',
    notes: 'Secondary — not hero.',
  }),
  slot({
    id: 'presence',
    label: 'Presence',
    route: '/presence',
    tier: 'secondary',
    promotion: 'keep',
    humanPurpose: 'Economic presence targets — explicitly NOT Canonical Economy.',
    agentPurpose: 'Distinguish canonical MARCO on BNB from bridge deployments.',
    manifestUri: '/registry/presence/index.json',
    notes: 'Constitutional disclaimer required in copy.',
  }),
]

export const ADVANCED_SURFACES: HomepageSurfaceSlot[] = [
  slot({
    id: 'query',
    label: 'Query',
    route: '/query',
    tier: 'advanced',
    promotion: 'keep',
    humanPurpose: 'Structured registry queries for power users.',
    agentPurpose: 'Agent query console — may merge UI with Graph in Mission 22.',
    manifestUri: '/registry/query/index.json',
    notes: 'Footer or advanced accordion only.',
  }),
  slot({
    id: 'execution',
    label: 'Execution',
    route: '/execution',
    tier: 'advanced',
    promotion: 'demote',
    humanPurpose: 'Illustrative execution-quality samples — not live trading.',
    agentPurpose: 'Pre-swap decision layer; never execute here.',
    manifestUri: '/registry/execution/index.json',
    notes: 'Advanced only. Warning badge required.',
  }),
  slot({
    id: 'identity',
    label: 'Identity',
    route: '/identity',
    tier: 'advanced',
    promotion: 'keep',
    humanPurpose: 'Economic identity archetypes — not social profile or KYC.',
    agentPurpose: 'Agent-readiness and wallet binding state (read-only).',
    manifestUri: '/registry/identity/index.json',
    notes: 'Link from Workspace; not hero.',
  }),
  slot({
    id: 'collectibles',
    label: 'Collectibles',
    route: '/collectibles',
    tier: 'advanced',
    promotion: 'keep',
    humanPurpose: 'Civilization collectibles read model (BabyMarco Genesis, etc.).',
    agentPurpose: 'Collectible class index; mint via legacy /nft when indexed.',
    manifestUri: '/registry/collectibles/index.json',
    notes: 'Replaces homepage NFT mint prominence.',
  }),
  slot({
    id: 'activation',
    label: 'Activation',
    route: '/new-project',
    tier: 'advanced',
    promotion: 'demote',
    humanPurpose: 'Economic Activation Runtime preview — Labs handoff read model.',
    agentPurpose: 'Activation stage index; no chain writes.',
    manifestUri: '/registry/activation/runtime.json',
    notes: 'Preview badge. Not primary launch pad.',
  }),
]

export const LEGACY_SURFACES: HomepageSurfaceSlot[] = [
  slot({
    id: 'ilo',
    label: 'ILO (Retired)',
    route: '/ilo',
    tier: 'legacy',
    promotion: 'legacy_compat',
    humanPurpose: 'Link compatibility — supersession message and CTAs to Launch/Workspace.',
    agentPurpose: 'Retired surface; manifest declares replacement routes.',
    manifestUri: '/registry/legacy/ilo-retirement.json',
    notes: 'Footer legacy link only. Never hero or carousel.',
  }),
  slot({
    id: 'nft_mint',
    label: 'NFT Mint (Legacy)',
    route: '/nft',
    tier: 'legacy',
    promotion: 'remove_from_home',
    humanPurpose: 'BabyMarco DNFT mint — BSC on-chain legacy flow.',
    agentPurpose: 'On-chain mint; prefer /collectibles for read model.',
    manifestUri: '/registry/collectibles/babymarco-genesis.json',
    notes: 'Remove from homepage entirely. Menu legacy submenu only.',
  }),
  slot({
    id: 'nft_market',
    label: 'NFT Market (Legacy)',
    route: '/nftmarket',
    tier: 'legacy',
    promotion: 'legacy_compat',
    humanPurpose: 'Legacy BabyMarco marketplace.',
    agentPurpose: 'On-chain market; not civilization entry.',
    notes: 'Footer legacy compat link.',
  }),
  slot({
    id: 'nft_wallet',
    label: 'NFT Wallet (Legacy)',
    route: '/viewNFTs',
    tier: 'legacy',
    promotion: 'legacy_compat',
    humanPurpose: 'View owned BabyMarco NFTs.',
    agentPurpose: 'Wallet inventory; not indexed in collectibles read model.',
    notes: 'Footer legacy compat link.',
  }),
]

export const HOMEPAGE_SECTIONS = [
  {
    id: 'constitutional_banner',
    label: 'Constitutional Economy',
    order: 1,
    description: 'MARCO on BNB Chain — LIVE, immutable Canonical Economy. One line, no fake metrics.',
    surfaces: [],
    required: true,
  },
  {
    id: 'value_proposition',
    label: 'What Is Melega DEX',
    order: 2,
    description: 'Civilization-grade DEX + Economic OS. Swap on-chain; understand and manage via read models.',
    surfaces: [],
    required: true,
  },
  {
    id: 'core_actions',
    label: 'Core Actions',
    order: 3,
    description: 'Four primary CTAs: Swap, Workspace, Launch, Map.',
    surfaces: ['swap', 'workspace', 'launch', 'map'],
    required: true,
  },
  {
    id: 'registry_strip',
    label: 'Understand the System',
    order: 4,
    description: 'Secondary registry surfaces: Projects, Assets, Graph, Presence.',
    surfaces: ['projects', 'assets', 'graph', 'presence'],
    required: true,
  },
  {
    id: 'advanced_strip',
    label: 'Advanced & Agents',
    order: 5,
    description: 'Collapsed/footer links: Query, Execution, Identity, Collectibles, Activation.',
    surfaces: ['query', 'execution', 'identity', 'collectibles', 'activation'],
    required: false,
  },
  {
    id: 'legacy_compat',
    label: 'Legacy Compatibility',
    order: 6,
    description: 'Small-print links to retired/legacy surfaces — never prominent.',
    surfaces: ['ilo', 'nft_mint', 'nft_market', 'nft_wallet'],
    required: true,
  },
  {
    id: 'machine_discovery',
    label: 'Machine Discovery',
    order: 7,
    description: 'Manifest links for agents: surfaces index, readiness gate, blueprint.',
    surfaces: ['map'],
    required: true,
  },
]

export const HOMEPAGE_JOURNEYS = [
  {
    persona: 'Human User (first visit)',
    entryRoute: '/',
    steps: [
      { label: 'Read constitutional banner', route: '/', priority: 'core' as const },
      { label: 'Orient via Map', route: '/map', priority: 'core' as const },
      { label: 'Swap if ready', route: '/trade', priority: 'core' as const },
      { label: 'Explore Workspace', route: '/command-center', priority: 'core' as const },
    ],
    successCriteria: 'User understands MARCO canonical economy and finds Swap or Map within 10 seconds.',
  },
  {
    persona: 'AI Agent',
    entryRoute: '/',
    steps: [
      { label: 'Fetch blueprint manifest', route: '/registry/blueprints/homepage-entry-point.json', priority: 'core' as const },
      { label: 'Fetch surface map', route: '/registry/surfaces/index.json', priority: 'core' as const },
      { label: 'Traverse graph', route: '/graph', priority: 'secondary' as const },
      { label: 'Route execution to swap', route: '/trade', priority: 'core' as const },
    ],
    successCriteria: 'Agent resolves orientation without scraping Pancake-era DOM.',
  },
  {
    persona: 'Project Creator',
    entryRoute: '/',
    steps: [
      { label: 'Launch capabilities', route: '/build-studio#build-import', priority: 'core' as const },
      { label: 'Activation preview', route: '/new-project', priority: 'advanced' as const },
      { label: 'Presence targets', route: '/presence', priority: 'secondary' as const },
      { label: 'Workspace', route: '/command-center', priority: 'core' as const },
    ],
    successCriteria: 'Creator reaches /launch from homepage — never /ilo.',
  },
  {
    persona: 'Liquidity Provider',
    entryRoute: '/',
    steps: [
      { label: 'Swap or Liquidity', route: '/trade', priority: 'core' as const },
      { label: 'Farms/Pools via Earn', route: '/farms', priority: 'core' as const },
      { label: 'Workspace venues', route: '/command-center', priority: 'core' as const },
    ],
    successCriteria: 'LP reaches liquidity/farms without homepage NFT/ILO distraction.',
  },
]

export const REMOVE_FROM_HOMEPAGE = [
  'BabyMarco NFT mint block (MintModal, Timer, quota UI)',
  'ILO carousel banner linking to /ilo',
  'AliceCarousel primary banner with /ilo and legacy apply images',
  'Pool-only subbanner carousel dominance (17+ pool banners)',
  'Pancake-era CakeDataRow as primary hero metric',
  'Component named/exported as Nft for homepage',
  'IFO success toast copy on homepage',
]

export const PROMOTE_ON_HOMEPAGE = [
  'Swap — primary on-chain CTA',
  'Workspace — manage economy',
  'Launch — honest capability index (/launch not /ilo)',
  'Map — civilization compass',
  'Constitutional MARCO on BNB Chain banner',
  'Assets + Graph in secondary registry strip',
]

export const STAY_SECONDARY = [
  'Projects',
  'Assets',
  'Graph',
  'Presence',
  'Liquidity (link from Swap area, not duplicate hero)',
  'Farms',
  'Pools',
]

export const LEGACY_COMPATIBLE = [
  '/ilo — retirement page, footer link only',
  '/nft — mint legacy, menu submenu not homepage',
  '/nftmarket — market legacy, footer',
  '/viewNFTs — wallet legacy, footer',
]

export const COPYWRITING_DIRECTION = [
  'Lead with Civilization / Economic OS — not PancakeSwap fork',
  'State MARCO on BNB Chain as Canonical Economy — immutable, LIVE',
  'Use action verbs: Swap, Manage, Launch, Explore Map',
  'Never imply ILO is active; say "Legacy ILO retired" if linked',
  'Never embed mint UI on home; say "Collectibles" for BabyMarco',
  'Read-model surfaces: "indexed", "read-only", "no fake balances"',
  'Agent-facing footer: link machine manifests explicitly',
  'Tone: operational, constitutional, honest — not hype or TVL claims',
]

export const MACHINE_READABLE_REQUIREMENTS = [
  'Homepage must expose <link rel="alternate" type="application/json"> or visible manifest URLs',
  'JSON-LD or static links to /registry/blueprints/homepage-entry-point.json',
  'JSON-LD or static links to /registry/surfaces/index.json',
  'JSON-LD or static links to /registry/readiness/mainnet-gate.json',
  'Core CTAs must have stable href paths matching surface map ids',
  'No client-only routes for CORE four — SSR/static friendly',
  'constitutional block must match activation/presence canonical fields',
  'legacy surfaces must declare replacementRoute in linked manifests',
]

export const MISSION_22_PLAN = [
  'Phase 1: Replace Home view content — remove NFT mint, ILO carousel, pool banner dominance',
  'Phase 2: Implement Civilization Entry Point sections per blueprint (melegaOperational tokens)',
  'Phase 3: Wire CORE four CTAs (Swap, Workspace, Launch, Map)',
  'Phase 4: Add constitutional MARCO banner + registry secondary strip',
  'Phase 5: Menu alias Launch → /launch; add Map + Workspace to menu or footer',
  'Phase 6: Legacy compat footer links (ILO retired, NFT legacy)',
  'Phase 7: Publish homepage-entry-point.json; update .well-known discovery',
  'Phase 8: Vercel validation — no changes to swap/liquidity/farms/pools logic',
]

export const SURFACES_PROMOTED = ['swap', 'workspace', 'launch', 'map', 'assets', 'graph']

export const SURFACES_DEMOTED = [
  'ilo',
  'nft_mint',
  'execution',
  'activation',
  'pool_carousels',
  'pancake_metrics',
]

export const resolveHomepageBlueprint = (): HomepageBlueprint => ({
  manifest: 'manifest://melega/platform/homepage-entry-point-blueprint@0.1.0',
  api_version: HOMEPAGE_BLUEPRINT_VERSION,
  phase: 'civilization_entry_point_blueprint',
  as_of: HOMEPAGE_BLUEPRINT_AS_OF,
  audit_type: 'read_only_blueprint',
  branch_basis: HOMEPAGE_BLUEPRINT_BRANCH,
  verdict: HOMEPAGE_BLUEPRINT_VERDICT,
  disclaimer: HOMEPAGE_BLUEPRINT_DISCLAIMER,
  purpose:
    'Melega DEX homepage as Civilization Entry Point — orient humans and AI agents to constitutional economy, core actions, and honest surface hierarchy in seconds.',
  constitutional: {
    canonicalChain: 'BNB Chain',
    canonicalAsset: 'MARCO',
    status: 'LIVE',
    framing: 'Canonical Economy — not replaceable by Economic Presence layers',
  },
  hierarchy: {
    core: CORE_SURFACES.map((surface) => ({ ...surface })),
    secondary: SECONDARY_SURFACES.map((surface) => ({ ...surface })),
    advanced: ADVANCED_SURFACES.map((surface) => ({ ...surface })),
    legacy: LEGACY_SURFACES.map((surface) => ({ ...surface })),
  },
  sections: HOMEPAGE_SECTIONS.map((section) => ({
    ...section,
    surfaces: [...section.surfaces],
  })),
  journeys: HOMEPAGE_JOURNEYS.map((journey) => ({
    ...journey,
    steps: journey.steps.map((step) => ({ ...step })),
  })),
  removeFromHomepage: [...REMOVE_FROM_HOMEPAGE],
  promoteOnHomepage: [...PROMOTE_ON_HOMEPAGE],
  staySecondary: [...STAY_SECONDARY],
  legacyCompatible: [...LEGACY_COMPATIBLE],
  copywritingDirection: [...COPYWRITING_DIRECTION],
  machineReadableRequirements: [...MACHINE_READABLE_REQUIREMENTS],
  mission22Plan: [...MISSION_22_PLAN],
  surfacesPromoted: [...SURFACES_PROMOTED],
  surfacesDemoted: [...SURFACES_DEMOTED],
})
