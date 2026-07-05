/** Constitutional role labels — one short line per organ (R505 E5). */
export const CIVILIZATION_ROLE_LABELS = {
  home: 'Economic Operating System entry',
  trade: 'Economic Exchange',
  liquidity: 'Capital Formation',
  farms: 'Incentive Organ',
  pools: 'Distribution Organ',
  trending: 'Signal Surface',
  projects: 'Economic Registry',
  radar: 'Observation Organ',
  build: 'Production Organ',
  collectibles: 'Identity Registry',
  commandCenter: 'Operational Cockpit',
} as const

export type CivilizationModule = keyof typeof CIVILIZATION_ROLE_LABELS

export const SURFACE_NEXT_ACTIONS: Record<CivilizationModule, string[]> = {
  home: ['trade', 'build_import', 'view_projects', 'open_command_center'],
  trade: ['swap', 'add_liquidity', 'view_chart'],
  liquidity: ['add_liquidity', 'view_pools', 'trade'],
  farms: ['stake', 'claim', 'view_pools'],
  pools: ['stake', 'claim', 'view_farms'],
  trending: ['view_project', 'trade', 'open_radar'],
  projects: ['trade', 'view_radar', 'build_import'],
  radar: ['view_project', 'trade', 'build_import'],
  build: ['import_contract', 'view_infrastructure'],
  collectibles: ['view_collection', 'mint_genesis'],
  commandCenter: ['trade', 'claim_rewards', 'view_settlement'],
}

export const SURFACE_PRIMARY_ACTIONS: Record<CivilizationModule, string[]> = {
  home: ['swap', 'build_import'],
  trade: ['swap'],
  liquidity: ['simulate_liquidity'],
  farms: ['stake', 'unstake', 'claim'],
  pools: ['stake', 'unstake', 'claim'],
  trending: ['filter', 'view_signals'],
  projects: ['filter', 'view_featured'],
  radar: ['discover', 'analyze'],
  build: ['import_contract', 'analyze_contract'],
  collectibles: ['view_identity', 'connect_wallet'],
  commandCenter: ['view_briefing', 'view_portfolio'],
}

export const SURFACE_DEPENDENCIES: Record<CivilizationModule, string[]> = {
  home: ['registry', 'subgraph', 'farms-api', 'pools-api'],
  trade: ['melega-subgraph', 'smart-router', 'presence-registry'],
  liquidity: ['melega-subgraph', 'on-chain-pools'],
  farms: ['master-chef-rpc', 'price-oracle'],
  pools: ['sous-chef-rpc', 'price-oracle'],
  trending: ['registry', 'radar-events'],
  projects: ['registry', 'subgraph'],
  radar: ['registry', 'contract-intelligence'],
  build: ['registry', 'import-runtime'],
  collectibles: ['registry', 'wallet-nft-rpc'],
  commandCenter: ['civilization-fabric', 'wallet', 'module-runtimes'],
}
