/**
 * Read-only ERC-20 identity fetch for project import discovery.
 * Returns null when the contract is not a readable ERC-20 — callers must explain why.
 */
import { ethers } from 'ethers'
import { BSC_RPC_URLS } from 'config/constants/rpc'

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
]

const RPC_BY_CHAIN: Record<number, string[]> = {
  56: [process.env.BSC_RPC_URL, process.env.BSC_RPC_FALLBACK_URL, ...BSC_RPC_URLS].filter((u): u is string =>
    Boolean(u && u.trim()),
  ),
  1: [process.env.ETH_RPC_URL, 'https://ethereum.publicnode.com'].filter((u): u is string => Boolean(u && u.trim())),
  137: [process.env.POLYGON_RPC_URL, 'https://polygon-rpc.com'].filter((u): u is string => Boolean(u && u.trim())),
  8453: [process.env.BASE_RPC_URL, 'https://mainnet.base.org'].filter((u): u is string => Boolean(u && u.trim())),
}

/** Canonical read-only RPC resolution shared by project identity and ownership proof. */
export function getProjectRpcUrls(chainId: number): string[] {
  return RPC_BY_CHAIN[chainId] ?? []
}

export interface Erc20OnChainIdentity {
  name: string | null
  symbol: string | null
  decimals: number | null
  totalSupplyRaw: string | null
  totalSupplyFormatted: string | null
  verifiedDeployment: boolean
  explorerUrl: string | null
  reasonUnavailable: string | null
}

const EXPLORER_BY_CHAIN: Record<number, string> = {
  56: 'https://bscscan.com/token/',
  1: 'https://etherscan.io/token/',
  137: 'https://polygonscan.com/token/',
  8453: 'https://basescan.org/token/',
}

/** One endpoint may stall. Move on before the Boost spinner waits the RPC client default (minutes). */
export const ERC20_RPC_ATTEMPT_MS = 1_800
export const ERC20_RPC_BUDGET_MS = 4_000

export type Erc20IdentityReadOptions = {
  urls?: string[]
  attemptMs?: number
  budgetMs?: number
}

function unavailableIdentity(explorerUrl: string | null, reasonUnavailable: string): Erc20OnChainIdentity {
  return {
    name: null,
    symbol: null,
    decimals: null,
    totalSupplyRaw: null,
    totalSupplyFormatted: null,
    verifiedDeployment: false,
    explorerUrl,
    reasonUnavailable,
  }
}

async function withAttemptTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('RPC_TIMEOUT')), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function sanitizeMeta(raw: unknown, max = 64): string | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (!cleaned) return null
  return cleaned.slice(0, max)
}

async function readIdentityFromUrl(
  url: string,
  chainId: number,
  address: string,
  explorerUrl: string | null,
  attemptMs: number,
): Promise<Erc20OnChainIdentity> {
  // Static provider plus an explicit chain avoids JsonRpcProvider network polling, which retries with no deadline.
  const provider = new ethers.providers.StaticJsonRpcProvider(
    { url, timeout: attemptMs },
    { name: 'bnb', chainId },
  )
  const code = await provider.getCode(address)
  if (!code || code === '0x') {
    return {
      name: null,
      symbol: null,
      decimals: null,
      totalSupplyRaw: null,
      totalSupplyFormatted: null,
      verifiedDeployment: false,
      explorerUrl,
      reasonUnavailable: 'No contract bytecode at this address on the selected chain (not deployed).',
    }
  }

  const token = new ethers.Contract(address, ERC20_ABI, provider)
  let name: string | null = null
  let symbol: string | null = null
  let decimals: number | null = null
  let totalSupplyRaw: string | null = null
  let totalSupplyFormatted: string | null = null
  const failures: string[] = []

  try {
    name = sanitizeMeta(await token.name())
  } catch {
    failures.push('name()')
  }
  try {
    symbol = sanitizeMeta(await token.symbol(), 32)
  } catch {
    failures.push('symbol()')
  }
  try {
    const d = await token.decimals()
    const n = Number(d)
    decimals = Number.isFinite(n) ? n : null
  } catch {
    failures.push('decimals()')
  }
  try {
    const supply = await token.totalSupply()
    totalSupplyRaw = supply.toString()
    if (decimals != null) totalSupplyFormatted = ethers.utils.formatUnits(supply, decimals)
  } catch {
    failures.push('totalSupply()')
  }

  if (!name && !symbol) {
    return {
      name: null,
      symbol: null,
      decimals,
      totalSupplyRaw,
      totalSupplyFormatted,
      verifiedDeployment: true,
      explorerUrl,
      reasonUnavailable: `Contract is deployed but ERC-20 metadata is unreadable (${
        failures.join(', ') || 'name/symbol failed'
      }).`,
    }
  }

  return {
    name,
    symbol,
    decimals,
    totalSupplyRaw,
    totalSupplyFormatted,
    verifiedDeployment: true,
    explorerUrl,
    reasonUnavailable: null,
  }
}

export async function fetchErc20OnChainIdentity(
  chainId: number,
  contract: string,
  options?: Erc20IdentityReadOptions,
): Promise<Erc20OnChainIdentity> {
  const address = contract.trim()
  const explorerBase = EXPLORER_BY_CHAIN[chainId]
  const explorerUrl = explorerBase ? `${explorerBase}${address}` : null
  const urls = RPC_BY_CHAIN[chainId] ?? []

  if (!ethers.utils.isAddress(address)) {
    return {
      name: null,
      symbol: null,
      decimals: null,
      totalSupplyRaw: null,
      totalSupplyFormatted: null,
      verifiedDeployment: false,
      explorerUrl,
      reasonUnavailable: 'Contract address is not a valid EVM address.',
    }
  }

  const attemptMs = options?.attemptMs ?? ERC20_RPC_ATTEMPT_MS
  const budgetMs = options?.budgetMs ?? ERC20_RPC_BUDGET_MS
  const candidates = options?.urls ?? urls
  if (candidates.length === 0) {
    return unavailableIdentity(explorerUrl, `No RPC endpoints configured for chain ${chainId}.`)
  }

  const started = Date.now()
  let sawTimeout = false
  let lastReason = `RPC read failed for chain ${chainId}. Retry or verify the contract on the explorer.`
  for (const url of candidates) {
    const remaining = budgetMs - (Date.now() - started)
    if (remaining < 150) break
    const slice = Math.min(attemptMs, remaining)
    try {
      return await withAttemptTimeout(
        readIdentityFromUrl(url, chainId, address, explorerUrl, slice),
        slice,
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'RPC_TIMEOUT') sawTimeout = true
      lastReason = sawTimeout
        ? `RPC read timed out for chain ${chainId}. Retry or verify the contract on the explorer.`
        : `RPC read failed for chain ${chainId}. Retry or verify the contract on the explorer.`
    }
  }

  return unavailableIdentity(explorerUrl, lastReason)
}
