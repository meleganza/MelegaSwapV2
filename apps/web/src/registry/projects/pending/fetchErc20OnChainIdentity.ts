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
]

const RPC_BY_CHAIN: Record<number, string[]> = {
  56: [
    process.env.BSC_RPC_URL,
    process.env.BSC_RPC_FALLBACK_URL,
    ...BSC_RPC_URLS,
  ].filter((u): u is string => Boolean(u && u.trim())),
  1: [process.env.ETH_RPC_URL, 'https://ethereum.publicnode.com'].filter((u): u is string => Boolean(u && u.trim())),
  137: [process.env.POLYGON_RPC_URL, 'https://polygon-rpc.com'].filter((u): u is string => Boolean(u && u.trim())),
  8453: [process.env.BASE_RPC_URL, 'https://mainnet.base.org'].filter((u): u is string => Boolean(u && u.trim())),
}

export interface Erc20OnChainIdentity {
  name: string | null
  symbol: string | null
  decimals: number | null
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

function sanitizeMeta(raw: unknown, max = 64): string | null {
  if (typeof raw !== 'string') return null
  const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (!cleaned) return null
  return cleaned.slice(0, max)
}

async function withProvider<T>(urls: string[], fn: (provider: ethers.providers.JsonRpcProvider) => Promise<T>): Promise<T> {
  let lastError: unknown
  for (const url of urls) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(url)
      return await fn(provider)
    } catch (err) {
      lastError = err
    }
  }
  throw lastError instanceof Error ? lastError : new Error('RPC unavailable')
}

export async function fetchErc20OnChainIdentity(
  chainId: number,
  contract: string,
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
      verifiedDeployment: false,
      explorerUrl,
      reasonUnavailable: 'Contract address is not a valid EVM address.',
    }
  }

  if (urls.length === 0) {
    return {
      name: null,
      symbol: null,
      decimals: null,
      verifiedDeployment: false,
      explorerUrl,
      reasonUnavailable: `No RPC endpoints configured for chain ${chainId}.`,
    }
  }

  try {
    return await withProvider(urls, async (provider) => {
      const code = await provider.getCode(address)
      if (!code || code === '0x') {
        return {
          name: null,
          symbol: null,
          decimals: null,
          verifiedDeployment: false,
          explorerUrl,
          reasonUnavailable: 'No contract bytecode at this address on the selected chain (not deployed).',
        }
      }

      const token = new ethers.Contract(address, ERC20_ABI, provider)
      let name: string | null = null
      let symbol: string | null = null
      let decimals: number | null = null
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

      if (!name && !symbol) {
        return {
          name: null,
          symbol: null,
          decimals,
          verifiedDeployment: true,
          explorerUrl,
          reasonUnavailable: `Contract is deployed but ERC-20 metadata is unreadable (${failures.join(', ') || 'name/symbol failed'}).`,
        }
      }

      return {
        name,
        symbol,
        decimals,
        verifiedDeployment: true,
        explorerUrl,
        reasonUnavailable: null,
      }
    })
  } catch {
    return {
      name: null,
      symbol: null,
      decimals: null,
      verifiedDeployment: false,
      explorerUrl,
      reasonUnavailable: `RPC read failed for chain ${chainId}. Retry or verify the contract on the explorer.`,
    }
  }
}
