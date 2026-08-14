import fs from 'fs'
import path from 'path'
import { MELEGA_CHAIN_ID, MELEGA_MASTERCHEF_BSC, MELEGA_SMARTCHEF_FACTORY_BSC } from '../constants'
import { rpcCall } from '../rpc/chunkedLogs'
import type { OnchainRegistry } from 'lib/onchain-registry'

const MASTERCHEF = MELEGA_MASTERCHEF_BSC.toLowerCase()

const SEL = {
  rewardPerBlock: '0x8ae39cac',
  startBlock: '0x48cd4cb1',
  bonusEndBlock: '0x1aed6553',
  stakedToken: '0xcc7a262e',
  syrup: '0x86a952c4',
  rewardToken: '0xf7c618c1',
  balanceOf: '0x70a08231',
  owner: '0x8da5cb5b',
  allPoolsLength: '0xefde4e64',
  allPools: '0x41d1de97',
} as const

function encodeAddress(addr: string): string {
  return addr.toLowerCase().replace('0x', '').padStart(64, '0')
}

function encodeUint(value: number): string {
  return Math.max(0, Math.floor(value)).toString(16).padStart(64, '0')
}

function decodeAddress(hex: string): string {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  return `0x${normalized.slice(-40)}`
}

function decodeUint(hex: string): bigint {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  if (normalized === '0x' || normalized.length <= 2) return BigInt(0)
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
  const candidatePaths = [
    path.join(process.cwd(), 'docs', 'pools-canonical-inventory.json'),
    path.join(process.cwd(), '..', '..', 'docs', 'pools-canonical-inventory.json'),
    path.join(process.cwd(), 'public', 'registry', 'pools-canonical-inventory.json'),
  ]
  for (const inventoryPath of candidatePaths) {
    try {
      if (!fs.existsSync(inventoryPath)) continue
      const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) as {
        results: Array<{ chain: number; contract: string }>
      }
      inventory.results
        .filter((r) => r.chain === MELEGA_CHAIN_ID && r.contract && r.contract !== '—')
        .forEach((r) => set.add(r.contract.toLowerCase()))
      if (set.size > 0) break
    } catch {
      /* try next path */
    }
  }
  if (set.size === 0) {
    try {
      const registryPath = path.join(process.cwd(), 'public', 'registry', 'onchain', 'bsc-mainnet.json')
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as OnchainRegistry
      registry.smartChef?.pools?.forEach((p) => {
        if (p.contractAddress) set.add(p.contractAddress.toLowerCase())
      })
    } catch {
      /* registry fallback optional */
    }
  }
  set.delete(MASTERCHEF)
  return [...set]
}

/**
 * Public Pool Adapter discovery is rooted in the live legacy-factory owner.
 * Before activation the owner is the Founder EOA and this returns no entries.
 * After activation the adapter's enumerable pool registry becomes authoritative.
 */
async function loadAdapterPoolAddresses(rpcUrls?: string[]): Promise<string[]> {
  const ownerRaw = await ethCall(MELEGA_SMARTCHEF_FACTORY_BSC, SEL.owner, rpcUrls)
  if (!ownerRaw) return []
  const adapter = decodeAddress(ownerRaw)
  if (adapter === '0x0000000000000000000000000000000000000000') return []
  if (!(await hasBytecode(adapter, rpcUrls))) return []
  const lengthRaw = await ethCall(adapter, SEL.allPoolsLength, rpcUrls)
  if (!lengthRaw) return []
  const count = Number(decodeUint(lengthRaw))
  if (!Number.isSafeInteger(count) || count <= 0 || count > 10_000) return []

  const pools: string[] = []
  const chunkSize = 12
  for (let start = 0; start < count; start += chunkSize) {
    const indexes = Array.from({ length: Math.min(chunkSize, count - start) }, (_, offset) => start + offset)
    const rows = await Promise.all(
      indexes.map((index) => ethCall(adapter, `${SEL.allPools}${encodeUint(index)}`, rpcUrls)),
    )
    rows.forEach((raw) => {
      if (!raw) return
      const pool = decodeAddress(raw).toLowerCase()
      if (pool !== '0x0000000000000000000000000000000000000000') pools.push(pool)
    })
  }
  return pools
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
  const rewardToken = rewardTokenAddr !== '0x0000000000000000000000000000000000000000' ? rewardTokenAddr : undefined

  let rewardBalance = BigInt(0)
  if (rewardToken) {
    const balRaw = await ethCall(rewardToken, SEL.balanceOf + encodeAddress(contractAddress), rpcUrls)
    if (balRaw) rewardBalance = decodeUint(balRaw)
  }

  const hasStarted = startBlock === 0 || currentBlock >= startBlock
  const notEnded = endBlock === 0 || currentBlock < endBlock
  const isActive = hasStarted && notEnded && rewardPerBlock > BigInt(0)
  // A configured emission is not funding. Keep the pool hidden until the
  // reward token balance is actually present in the SmartChef contract.
  const isFunded = rewardBalance > BigInt(0)
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
  const candidates = [...new Set([...loadCandidateAddresses(), ...(await loadAdapterPoolAddresses(rpcUrls))])]
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
      // active includes rewarding (rewarding ⊆ active). Do not else-if away rewarding pools.
      if (pool.active || pool.rewarding) active += 1
      if (pool.rewarding) rewarding += 1
      if (!pool.active && !pool.rewarding) ended += 1
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
      note: 'Candidates come from the canonical inventory plus the active Public Pool Adapter enumerable registry, then every SmartChef is verified via eth_call. Invalid bytecode or missing rewardPerBlock excluded.',
    },
  }
}
