import { MELEGA_PRODUCTION_CONTRACTS, ONTOLOGY_BY_ID } from './ontology'

export interface ProductionMetricDefinition {
  id: string
  label: string
  ontologyId: keyof typeof ONTOLOGY_BY_ID | string
  source: string
  owner: string
  href: string
  asOf: string
}

export function buildLiveEconomyMetric(
  id: string,
  label: string,
  value: string,
  ontologyId: string,
  source: string,
  owner: string,
  href: string,
): ProductionMetricDefinition & { value: string } {
  return {
    id,
    label,
    value,
    ontologyId,
    source,
    owner,
    href,
    asOf: new Date().toISOString(),
  }
}

export const LIVE_ECONOMY_METRIC_BUILDERS = {
  swaps24h: (value: string) =>
    buildLiveEconomyMetric(
      'swaps24h',
      '24H Swaps',
      value,
      'recent_event',
      'bsc-indexer durable events',
      'indexer',
      '/trade',
    ),
  activeFarms: (value: string) =>
    buildLiveEconomyMetric(
      'activeFarms',
      'Live Farms',
      value,
      'farm_active',
      `MasterChef poolLength enumeration · ${MELEGA_PRODUCTION_CONTRACTS.masterChef}`,
      'masterchef',
      '/farms',
    ),
  rewardingPools: (value: string) =>
    buildLiveEconomyMetric(
      'rewardingPools',
      'Rewarding Pools',
      value,
      'pool_rewarding',
      `SmartChef on-chain + SousChef rewardPerBlock · ${MELEGA_PRODUCTION_CONTRACTS.smartChefFactory}`,
      'smartchef',
      '/pools',
    ),
  liquidPairs: (value: string) =>
    buildLiveEconomyMetric(
      'liquidPairs',
      'Liquid Pairs',
      value,
      'pair_tradeable',
      `Factory allPairs + getReserves · ${MELEGA_PRODUCTION_CONTRACTS.factory}`,
      'factory',
      '/trade',
    ),
  indexedAssets: (value: string) =>
    buildLiveEconomyMetric(
      'indexedAssets',
      'Indexed Assets',
      value,
      'indexed_asset',
      'canonical asset registry · chainId+address dedupe',
      'registry',
      '/projects',
    ),
}
