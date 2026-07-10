export interface OnchainAmmPair {
  pairAddress: string
  token0?: string
  token1?: string
  reserve0?: string
  reserve1?: string
  active?: boolean
  dataSource: string
  lastVerified: string
  latestSyncBlock?: number
}

export interface OnchainFarm {
  pid: number
  lpToken: string
  allocationPoints: number
  active: boolean
  contract: string
  dataSource: string
  lastVerified: string
  latestSyncBlock?: number
  bscscanUrl: string
}

export interface OnchainSmartChefPool {
  contractAddress: string
  poolName: string
  sousId: number
  stakedToken: string
  rewardToken: string
  startBlock: number | string
  endBlock: number | string
  active: boolean
  state: string
  dataSource: string
  lastVerified: string
  bscscanUrl: string
}

export interface OnchainRegistry {
  schema: string
  chainId: number
  generatedAt: string
  currentBlock: number
  summary: {
    ammPairs: number
    activeAmmPairs: number
    masterChefFarms: number
    activeFarms: number
    smartChefPools: number
    activeSmartChefPools: number
  }
  amm: { count: number; pairs: OnchainAmmPair[] }
  farms: { count: number; farms: OnchainFarm[] }
  smartChef: { count: number; pools: OnchainSmartChefPool[]; smartChefFactory: string }
}

let cached: OnchainRegistry | null = null

export async function loadOnchainRegistry(): Promise<OnchainRegistry | null> {
  if (cached) return cached
  try {
    const res = await fetch('/registry/onchain/bsc-mainnet.json')
    if (!res.ok) return null
    cached = (await res.json()) as OnchainRegistry
    return cached
  } catch {
    return null
  }
}

export function getOnchainRegistrySync(): OnchainRegistry | null {
  return cached
}
