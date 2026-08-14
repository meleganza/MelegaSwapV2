/**
 * Public Farm Factory — FarmCreated topic + canonical discovery helpers.
 * MasterBuilder / MasterChef farm discovery remains via existing registry refresh.
 *
 * Topic0 verified via ethers.utils.id(signature) == keccak256(signature).
 */

/** FarmCreated(address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256) */
export const PUBLIC_FARM_CREATED_EVENT_SIGNATURE =
  'FarmCreated(address,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256)'

export const PUBLIC_FARM_CREATED_TOPIC0 =
  '0xac393159f8f1578d33650efd21b6e4ee67e34b827ed4e1954c2b8db4a48c8a8c'

export type FarmProvenance = 'public_farm_factory' | 'masterbuilder' | 'unknown'

export type CanonicalIndexedFarm = {
  chainId: number
  farmAddress: string
  lpToken: string
  rewardToken: string
  creator: string | null
  rewardBudget: string | null
  start: number | null
  end: number | null
  emission: string | null
  creationFee: string | null
  timestamp: number | null
  provenance: FarmProvenance
  source: 'public_factory_event' | 'masterchef_pool' | 'manual'
}

export function farmDedupeKey(chainId: number, farmAddress: string): string {
  return `${chainId}:${farmAddress.toLowerCase()}`
}

/** Merge Public Factory + MasterBuilder farms; first occurrence wins per key. */
export function dedupeCanonicalFarms(farms: CanonicalIndexedFarm[]): CanonicalIndexedFarm[] {
  const map = new Map<string, CanonicalIndexedFarm>()
  for (const farm of farms) {
    const key = farmDedupeKey(farm.chainId, farm.farmAddress)
    if (!map.has(key)) {
      map.set(key, farm)
      continue
    }
    const existing = map.get(key)!
    if (existing.provenance === 'unknown' && farm.provenance !== 'unknown') {
      map.set(key, farm)
    }
  }
  return [...map.values()]
}

export function classifyFarmProvenance(source: CanonicalIndexedFarm['source']): FarmProvenance {
  if (source === 'public_factory_event') return 'public_farm_factory'
  if (source === 'masterchef_pool') return 'masterbuilder'
  return 'unknown'
}
