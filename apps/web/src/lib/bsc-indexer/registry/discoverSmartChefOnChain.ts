import fs from 'fs'
import path from 'path'
import { MELEGA_CHAIN_ID, MELEGA_MASTERCHEF_BSC, MELEGA_SMARTCHEF_FACTORY_BSC } from '../constants'
import { rpcCall } from '../rpc/chunkedLogs'
import type { OnchainRegistry } from 'lib/onchain-registry'

const INVENTORY_PATH = path.join(process.cwd(), 'docs', 'pools-canonical-inventory.json')
const MASTERCHEF = MELEGA_MASTERCHEF_BSC.toLowerCase()

const SEL = {
  rewardPerBlock: '0x8ae39cac',
  startBlock: '0x48cd4cb1',
  bonusEndBlock: '0x1aed6553',
  stakedToken: '0xcc7a262e',
  syrup: '0x86a952c4',
  rewardToken: '0xf7c618c1',
  balanceOf: '0x70a08231',
} as const

function encodeAddress(addr: string): string {
  return addr.toLowerCase().replace('0x', '').padStart(64, '0')
}

function decodeAddress(hex: string): string {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  return `0x${normalized.slice(-40)}`
}

function decodeUint(hex: string): bigint {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  if (normalized === '0x' || normalized.length <= 2) return 0n
  return BigInt(normalized)
}

async function ethCall(to: string, data: string, rpcUrls?: string[]): Promise<string | null> {
  try {
    return await rpcCall<string>('eth_call', [{ to, data }, 'latest'], rpcUrls)
  } catch {
    return null
  }
}

async function hasBytecode(address: string, rpcUrls?: string[]): Promise<boolean> {
  try {
    const code = await rpcCall<string>('eth_getCode', [address, 'latest'], rpcUrls)
    return Boolean(code && code !== '0x' && code.length > 4)
  } catch {
    return false
  }
}

function loadCandidateAddresses(): string[] {
  const set = new Set<string>()
  try {
    const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8')) as {
      results: Array<{ chain: number; contract: string }>
    }
    inventory.results
      .filter((r) => r.chain === MELEGA_CHAIN_ID && r.contract && r.contract !== '—')
      .forEach((r) => set.add(r.contract.toLowerCase()))
  } catch {
    /* inventory optional seed */
  }
  set.delete(MASTERCHEF)
  return [...set]
}

export interface SmartChefDiscoveryMeta {
  discovered: number
  verified: number
  active: number
  funded: number
  rewarding: number
  ended: number
  invalid: number
  dataSource: string
  note: string
}

async function verifyPool(
  contractAddress: string,
  currentBlock: number,
  rpcUrls?: string[],
): Promise<OnchainRegistry['smartChef']['pools'][number] | null> {
  if (!(await hasBytecode(contractAddress, rpcUrls))) return null

  const rewardPerBlockRaw = await ethCall(contractAddress, SEL.rewardPerBlock, rpcUrls)
  if (!rewardPerBlockRaw) return null
  const rewardPerBlock = decodeUint(rewardPerBlockRaw)

  const startRaw = await ethCall(contractAddress, SEL.startBlock, rpcUrls)
  const endRaw = await ethCall(contractAddress, SEL.bonusEndBlock, rpcUrls)
  const startBlock = startRaw ? Number(decodeUint(startRaw)) : 0
  const endBlock = endRaw ? Number(decodeUint(endRaw)) : 0

  let stakedToken =
    decodeAddress((await ethCall(contractAddress, SEL.stakedToken, rpcUrls)) ?? '0x') ||
    decodeAddress((await ethCall(contractAddress, SEL.syrup, rpcUrls)) ?? '0x')
  if (stakedToken === '0x0000000000000000000000000000000000000000') stakedToken = undefined

  const rewardTokenAddr = decodeAddress((await ethCall(contractAddress, SEL.rewardToken, rpcUrls)) ?? '0x')
  const rewardToken =
    rewardTokenAddr !== '0x0000000000000000000000000000000000000000' ? rewardTokenAddr : undefined

  let rewardBalance = 0n
  if (rewardToken) {
    const balRaw = await ethCall(rewardToken, SEL.balanceOf + encodeAddress(contractAddress), rpcUrls)
    if (balRaw) rewardBalance = decodeUint(balRaw)
  }

  const hasStarted = startBlock === 0 || currentBlock >= startBlock
  const notEnded = endBlock === 0 || currentBlock < endBlock
  const isActive = hasStarted && notEnded && rewardPerBlock > 0n
  const isFunded = rewardBalance > 0n || (isActive && endBlock > currentBlock && rewardPerBlock > 0n)
  const isRewarding = isActive && isFunded

  return {
    contractAddress,
    stakedToken,
    rewardToken,
    startBlock: startBlock || undefined,
    endBlock: endBlock || undefined,
    rewardPerBlock: rewardPerBlock.toString(),
    rewardBalance: rewardBalance.toString(),
    active: isActive,
    funded: isFunded,
    rewarding: isRewarding,
    state: isRewarding ? 'rewarding' : isActive ? 'active' : 'ended',
    dataSource: 'on-chain-verified-multicall',
    lastVerified: new Date().toISOString(),
    latestSyncBlock: currentBlock,
    bscscanUrl: `https://bscscan.com/address/${contractAddress}`,
  }
}

/** R781 — verify SmartChef/SousChef contracts on-chain; factory has no enumerable state. */
export async function discoverSmartChefOnChain(
  currentBlock: number,
  rpcUrls?: string[],
): Promise<{ smartChef: OnchainRegistry['smartChef']; meta: SmartChefDiscoveryMeta }> {
  const candidates = loadCandidateAddresses()
  const pools: OnchainRegistry['smartChef']['pools'] = []
  let verified = 0
  let active = 0
  let funded = 0
  let rewarding = 0
  let ended = 0
  let invalid = 0

  const chunkSize = 8
  for (let i = 0; i < candidates.length; i += chunkSize) {
    const chunk = candidates.slice(i, i + chunkSize)
    const results = await Promise.all(chunk.map((addr) => verifyPool(addr, currentBlock, rpcUrls)))
    results.forEach((pool) => {
      if (!pool) {
        invalid += 1
        return
      }
      verified += 1
      if (pool.rewarding) rewarding += 1
      else if (pool.active) active += 1
      else ended += 1
      if (pool.funded) funded += 1
      pools.push(pool)
    })
  }

  return {
    smartChef: {
      count: pools.length,
      pools,
      smartChefFactory: MELEGA_SMARTCHEF_FACTORY_BSC,
    },
    meta: {
      discovered: candidates.length,
      verified,
      active,
      funded,
      rewarding,
      ended,
      invalid,
      dataSource: 'on-chain-verified-multicall',
      note:
        'SmartChefFactory has no enumerable poolLength; candidates seeded from deployment inventory then verified via eth_call. Invalid bytecode or missing rewardPerBlock excluded.',
    },
  }
}
