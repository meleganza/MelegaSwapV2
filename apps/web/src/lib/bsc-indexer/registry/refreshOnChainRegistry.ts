import {
  MELEGA_CHAIN_ID,
  MELEGA_FACTORY_BSC,
  MELEGA_MASTERCHEF_BSC,
} from '../constants'
import { getBlockNumber, rpcCall } from '../rpc/chunkedLogs'
import type { OnchainRegistry } from 'lib/onchain-registry'
import { discoverSmartChefOnChain } from './discoverSmartChefOnChain'

const FACTORY = MELEGA_FACTORY_BSC
const MASTERCHEF = MELEGA_MASTERCHEF_BSC

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
  const { smartChef, meta: smartChefMeta } = await discoverSmartChefOnChain(currentBlock, rpcUrls)

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
      rewardingSmartChefPools: smartChef.pools.filter((p) => p.rewarding).length,
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
      ? `Incremental pair discovery — new factory indices only. SmartChef: ${smartChefMeta.note}`
      : `Discovery via direct contract state. SmartChef: ${smartChefMeta.note}`,
  }

  return { registry, meta }
}
