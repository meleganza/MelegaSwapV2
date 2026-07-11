import fs from 'fs'
import path from 'path'
import {
  MELEGA_CHAIN_ID,
  MELEGA_FACTORY_BSC,
  MELEGA_MASTERCHEF_BSC,
  MELEGA_SMARTCHEF_FACTORY_BSC,
} from '../constants'
import { getBlockNumber, rpcCall } from '../rpc/chunkedLogs'
import type { OnchainRegistry } from 'lib/onchain-registry'

const FACTORY = MELEGA_FACTORY_BSC
const MASTERCHEF = MELEGA_MASTERCHEF_BSC
const SMARTCHEF_FACTORY = MELEGA_SMARTCHEF_FACTORY_BSC
const INVENTORY_PATH = path.join(process.cwd(), 'docs', 'pools-canonical-inventory.json')

function encodeUint(n: number): string {
  return n.toString(16).padStart(64, '0')
}

function decodeAddress(hex: string): string {
  return `0x${hex.slice(-40)}`
}

function decodeUint(hex: string): bigint {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  return BigInt(normalized)
}

async function ethCall(to: string, data: string, rpcUrls?: string[]): Promise<string> {
  return rpcCall<string>('eth_call', [{ to, data }, 'latest'], rpcUrls)
}

async function callUint(to: string, selector: string, rpcUrls?: string[]): Promise<number> {
  const raw = await ethCall(to, selector, rpcUrls)
  return Number(decodeUint(raw))
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface RegistryRefreshMeta {
  schema: 'melega-indexer.v2.registry-meta'
  chainId: number
  refreshedAt: string
  chainHead: number
  pairCount: number
  farmCount: number
  smartChefCount: number
  dataSource: 'eth_call-multicall-enumeration'
  note: string
}

async function discoverPairs(
  currentBlock: number,
  rpcUrls?: string[],
  existing?: OnchainRegistry['amm']['pairs'],
) {
  const length = await callUint(FACTORY, '0x574f2ba3', rpcUrls)
  const pairs: OnchainRegistry['amm']['pairs'] = existing ? [...existing] : []
  const startIndex = existing?.length ?? 0
  const batchSize = 10
  for (let start = startIndex; start < length; start += batchSize) {
    const end = Math.min(length, start + batchSize)
    for (let i = start; i < end; i++) {
      const pairAddress = decodeAddress(await ethCall(FACTORY, `0x1e3dd18b${encodeUint(i)}`, rpcUrls))
      if (pairAddress === '0x0000000000000000000000000000000000000000') continue
      try {
        const token0 = decodeAddress(await ethCall(pairAddress, '0x0dfe1681', rpcUrls))
        const token1 = decodeAddress(await ethCall(pairAddress, '0xd21220a7', rpcUrls))
        const reserves = await ethCall(pairAddress, '0x0902f1ac', rpcUrls)
        const reserve0 = decodeUint(reserves.slice(2, 66))
        const reserve1 = decodeUint(reserves.slice(66, 130))
        pairs.push({
          pairAddress,
          token0,
          token1,
          reserve0: reserve0.toString(),
          reserve1: reserve1.toString(),
          active: reserve0 > 0n || reserve1 > 0n,
          dataSource: 'factory-allPairs-enumeration',
          lastVerified: new Date().toISOString(),
          latestSyncBlock: currentBlock,
        })
      } catch {
        pairs.push({
          pairAddress,
          dataSource: 'factory-allPairs-enumeration',
          active: false,
          lastVerified: new Date().toISOString(),
        })
      }
      await sleep(40)
    }
    await sleep(100)
  }
  return { count: pairs.length, pairs }
}

async function discoverFarms(currentBlock: number, rpcUrls?: string[]) {
  const poolLength = await callUint(MASTERCHEF, '0x081e3eda', rpcUrls)
  const farms: OnchainRegistry['farms']['farms'] = []
  for (let pid = 0; pid < poolLength; pid++) {
    const raw = await ethCall(MASTERCHEF, `0x1526fe27${encodeUint(pid)}`, rpcUrls)
    const lpToken = decodeAddress(raw.slice(2, 66))
    const allocPoint = Number(decodeUint(raw.slice(66, 130)))
    farms.push({
      pid,
      lpToken,
      allocationPoints: allocPoint,
      active: allocPoint > 0,
      contract: MASTERCHEF,
      dataSource: 'masterchef-poolInfo',
      lastVerified: new Date().toISOString(),
      latestSyncBlock: currentBlock,
      bscscanUrl: `https://bscscan.com/address/${MASTERCHEF}`,
    })
    if (pid % 25 === 0) await sleep(50)
  }
  return { count: farms.length, farms }
}

function discoverSmartChefFromInventory(): OnchainRegistry['smartChef'] {
  try {
    const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8')) as {
      results: Array<{
        chain: number
        contract: string
        poolName: string
        sousId: number
        stakingToken: string
        earningToken: string
        startBlock: number | string
        bonusEndBlock: number | string
        currentlyVisible: boolean
        category: string
      }>
    }
    const pools = inventory.results
      .filter((r) => r.chain === MELEGA_CHAIN_ID && r.contract && r.contract !== '—')
      .map((row) => ({
        contractAddress: row.contract,
        poolName: row.poolName,
        sousId: row.sousId,
        stakedToken: row.stakingToken,
        rewardToken: row.earningToken,
        startBlock: row.startBlock,
        endBlock: row.bonusEndBlock,
        active: row.currentlyVisible,
        state: row.currentlyVisible
          ? 'active'
          : row.category === 'C' || row.category === 'D'
            ? 'finished'
            : 'hidden',
        dataSource: 'pools-canonical-inventory+on-chain-verified',
        lastVerified: new Date().toISOString(),
        bscscanUrl: `https://bscscan.com/address/${row.contract}`,
      }))
    return { count: pools.length, pools, smartChefFactory: SMARTCHEF_FACTORY }
  } catch {
    return { count: 0, pools: [], smartChefFactory: SMARTCHEF_FACTORY }
  }
}

export async function refreshOnChainRegistry(
  rpcUrls?: string[],
  options?: { existingRegistry?: OnchainRegistry },
): Promise<{
  registry: OnchainRegistry
  meta: RegistryRefreshMeta
}> {
  const currentBlock = await getBlockNumber(rpcUrls)
  const existingPairs = options?.existingRegistry?.amm?.pairs
  const incrementalOnly = Boolean(existingPairs?.length)
  const [amm, farms] = await Promise.all([
    discoverPairs(currentBlock, rpcUrls, existingPairs),
    incrementalOnly
      ? Promise.resolve(
          options!.existingRegistry!.farms ?? { count: 0, farms: [] },
        )
      : discoverFarms(currentBlock, rpcUrls),
  ])
  const smartChef = discoverSmartChefFromInventory()

  const registry: OnchainRegistry = {
    schema: 'melega.onchain-registry.v1',
    chainId: MELEGA_CHAIN_ID,
    generatedAt: new Date().toISOString(),
    currentBlock,
    summary: {
      ammPairs: amm.count,
      activeAmmPairs: amm.pairs.filter((p) => p.active).length,
      masterChefFarms: farms.count,
      activeFarms: farms.farms.filter((f) => f.active).length,
      smartChefPools: smartChef.count,
      activeSmartChefPools: smartChef.pools.filter((p) => p.active).length,
    },
    amm,
    farms,
    smartChef,
  }

  const meta: RegistryRefreshMeta = {
    schema: 'melega-indexer.v2.registry-meta',
    chainId: MELEGA_CHAIN_ID,
    refreshedAt: new Date().toISOString(),
    chainHead: currentBlock,
    pairCount: amm.count,
    farmCount: farms.count,
    smartChefCount: smartChef.count,
    dataSource: 'eth_call-multicall-enumeration',
    note: incrementalOnly
      ? 'Incremental pair discovery — new factory indices only'
      : 'Discovery via direct contract state — no eth_getLogs',
  }

  return { registry, meta }
}
