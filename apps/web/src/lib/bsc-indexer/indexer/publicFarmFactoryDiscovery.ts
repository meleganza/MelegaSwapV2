/**
 * Canonical farm discovery merge — Public Farm Factory + MasterBuilder.
 * Factory address is null until deployment; discovery no-ops without fabricated addresses.
 */
import {
  classifyFarmProvenance,
  dedupeCanonicalFarms,
  PUBLIC_FARM_CREATED_TOPIC0,
  type CanonicalIndexedFarm,
} from './publicFarmFactoryTopics'

/** Not deployed — must remain null. Do not fabricate. */
export const PUBLIC_FARM_FACTORY_ADDRESS: string | null = null

export type MasterChefFarmRow = {
  pid: number
  lpToken: string
  contract: string
  active?: boolean
}

export function masterChefRowsToCanonical(
  chainId: number,
  rows: MasterChefFarmRow[],
): CanonicalIndexedFarm[] {
  return rows.map((row) => ({
    chainId,
    // MasterChef farms are identified by MasterChef+pid; use synthetic address key for dedupe
    // until a dedicated farm contract exists. Explore Farms continues to use MasterChef pid model.
    farmAddress: `${row.contract}:pid:${row.pid}`,
    lpToken: row.lpToken,
    rewardToken: 'MARCO', // protocol MARCO emissions — not Public Factory
    creator: null,
    rewardBudget: null,
    start: null,
    end: null,
    emission: null,
    creationFee: null,
    timestamp: null,
    provenance: classifyFarmProvenance('masterchef_pool'),
    source: 'masterchef_pool' as const,
  }))
}

/**
 * Scan FarmCreated logs when factory is deployed. Returns [] while address is null.
 */
export async function discoverPublicFactoryFarms(_opts: {
  chainId: number
  fromBlock: number
  toBlock: number
  getLogs?: (filter: {
    address: string
    topics: string[]
    fromBlock: number
    toBlock: number
  }) => Promise<Array<{ address?: string; topics?: string[]; data?: string; blockNumber?: number }>>
}): Promise<CanonicalIndexedFarm[]> {
  if (!PUBLIC_FARM_FACTORY_ADDRESS) return []
  // Deployment-gated path — reserved for post-deploy wiring.
  void PUBLIC_FARM_CREATED_TOPIC0
  return []
}

export function mergeFarmDiscovery(input: {
  chainId: number
  masterChefRows: MasterChefFarmRow[]
  publicFactoryFarms: CanonicalIndexedFarm[]
}): CanonicalIndexedFarm[] {
  const master = masterChefRowsToCanonical(input.chainId, input.masterChefRows)
  return dedupeCanonicalFarms([...master, ...input.publicFactoryFarms])
}
