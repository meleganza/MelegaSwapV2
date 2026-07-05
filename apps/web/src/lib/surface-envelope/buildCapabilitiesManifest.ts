export const CAPABILITIES_SCHEMA = 'melega.capabilities.v1' as const
export const CAPABILITIES_SCHEMA_VERSION = '1.0.0' as const

export interface MelegaCapabilitiesManifest {
  schema: typeof CAPABILITIES_SCHEMA
  schemaVersion: typeof CAPABILITIES_SCHEMA_VERSION
  generatedAt: string
  canonicalUrls: Record<string, string>
  legacyRedirects: Array<{ from: string; to: string }>
  routes: Array<{
    path: string
    module: string
    role: string
    machineSchema: typeof CAPABILITIES_SCHEMA extends string ? 'melega.surface.v1' : never
    status: 'live' | 'preparation' | 'redirect'
  }>
  capabilities: Array<{
    id: string
    module: string
    actions: string[]
    dependencies: string[]
    status: 'live' | 'preparation' | 'unavailable'
  }>
}

export function buildCapabilitiesManifest(): MelegaCapabilitiesManifest {
  const canonicalUrls = {
    home: '/',
    trade: '/trade',
    liquidity: '/liquidity-studio',
    farms: '/farms',
    pools: '/pools',
    trending: '/trending',
    projects: '/projects',
    radar: '/radar',
    build: '/build-studio',
    collectibles: '/collectibles',
    commandCenter: '/command-center',
  }

  const legacyRedirects = [
    { from: '/trade', to: '/trade' },
    { from: '/liquidity-studio', to: '/liquidity-studio' },
    { from: '/add', to: '/liquidity-studio' },
    { from: '/remove', to: '/liquidity-studio' },
    { from: '/find', to: '/liquidity-studio' },
    { from: '/command-center', to: '/command-center' },
    { from: '/command-center', to: '/command-center' },
    { from: '/import-existing-token', to: '/build-studio#build-import' },
    { from: '/build-studio#build-import', to: '/build-studio#build-import' },
    { from: '/pool', to: '/liquidity-studio' },
    { from: '/send', to: '/trade' },
    { from: '/nfts', to: '/collectibles' },
  ]

  return {
    schema: CAPABILITIES_SCHEMA,
    schemaVersion: CAPABILITIES_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    canonicalUrls,
    legacyRedirects,
    routes: [
      { path: '/', module: 'home', role: 'Economic Operating System entry', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/trade', module: 'trade', role: 'Economic Exchange', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/liquidity-studio', module: 'liquidity', role: 'Capital Formation', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/farms', module: 'farms', role: 'Incentive Organ', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/pools', module: 'pools', role: 'Distribution Organ', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/trending', module: 'trending', role: 'Signal Surface', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/projects', module: 'projects', role: 'Economic Registry', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/radar', module: 'radar', role: 'Observation Organ', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/build-studio', module: 'build', role: 'Production Organ', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/collectibles', module: 'collectibles', role: 'Identity Registry', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
      { path: '/command-center', module: 'commandCenter', role: 'Operational Cockpit', machineSchema: 'melega.surface.v1' as 'melega.surface.v1', status: 'live' },
    ],
    capabilities: [
      { id: 'swap', module: 'trade', actions: ['swap'], dependencies: ['smart-router'], status: 'live' },
      { id: 'import_token', module: 'build', actions: ['analyze_contract'], dependencies: ['registry'], status: 'live' },
      { id: 'stake_farm', module: 'farms', actions: ['stake', 'claim'], dependencies: ['master-chef-rpc'], status: 'live' },
      { id: 'stake_pool', module: 'pools', actions: ['stake', 'claim'], dependencies: ['sous-chef-rpc'], status: 'live' },
      { id: 'liquidity_sim', module: 'liquidity', actions: ['simulate_liquidity'], dependencies: ['on-chain-pools'], status: 'live' },
      { id: 'create_token', module: 'build', actions: ['create_token'], dependencies: ['launch-runtime'], status: 'preparation' },
      { id: 'limit_orders', module: 'trade', actions: ['limit_order'], dependencies: ['order-book'], status: 'preparation' },
      { id: 'whale_feed', module: 'radar', actions: ['whale_monitor'], dependencies: ['wallet-intel'], status: 'unavailable' },
    ],
  }
}
