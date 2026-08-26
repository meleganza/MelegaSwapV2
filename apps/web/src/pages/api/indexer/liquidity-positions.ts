import type { NextApiHandler } from 'next'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { getMelegaChain, isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'
import { loadClassifiedAmmPairsAsync } from 'lib/bsc-indexer/pairs/registry'
import { rpcCall } from 'lib/bsc-indexer/rpc/chunkedLogs'

const MULTICALL3_FALLBACK = '0xcA11bde05977b3631167028862bE2a173976CA11'
const PAIR_CHUNK_SIZE = 120
const TOKEN_CHUNK_SIZE = 120

const erc20 = new Interface([
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
])
const pairContract = new Interface([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
])
const factoryContract = new Interface([
  'function allPairsLength() view returns (uint256)',
  'function allPairs(uint256) view returns (address)',
])
const multicall = new Interface([
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
])

type PairCandidate = {
  pairAddress: string
  token0?: string
  token1?: string
  symbol0?: string
  symbol1?: string
}

type PositionRow = PairCandidate & {
  token0Decimals?: number
  token1Decimals?: number
  reserve0Raw?: string
  reserve1Raw?: string
  lpBalanceRaw: string
}

type TokenMetadata = { symbol?: string; decimals?: number }

type LiquidityChainConfig = {
  chainId: number
  factory: string
  multicall: string
  rpcUrls: string[]
}

const PUBLIC_RPC_BY_CHAIN: Record<number, string> = {
  1: 'https://ethereum-rpc.publicnode.com',
  56: 'https://bsc-rpc.publicnode.com',
  137: 'https://polygon-bor-rpc.publicnode.com',
  8453: 'https://base-rpc.publicnode.com',
  42161: 'https://arbitrum-one-rpc.publicnode.com',
  43114: 'https://api.avax.network/ext/bc/C/rpc',
}

const ENV_RPC_BY_CHAIN: Record<number, Array<string | undefined>> = {
  1: [process.env.ETH_RPC_URL, process.env.NEXT_PUBLIC_ETH_RPC_URL],
  56: [process.env.BSC_RPC_URL, process.env.BSC_RPC_FALLBACK_URL, process.env.NEXT_PUBLIC_BSC_RPC_URL],
  137: [process.env.POLYGON_RPC_URL, process.env.NEXT_PUBLIC_POLYGON_RPC_URL],
  8453: [process.env.BASE_RPC_URL, process.env.NEXT_PUBLIC_BASE_RPC_URL],
  42161: [process.env.ARBITRUM_RPC_URL, process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL],
  43114: [process.env.AVAX_RPC_URL, process.env.NEXT_PUBLIC_AVAX_RPC_URL],
}

export function resolveLiquidityChainConfig(chainId: number): LiquidityChainConfig | null {
  const chain = getMelegaChain(chainId)
  if (!chain || !isMelegaCapabilityEnabled(chainId, 'swap') || !chain.contracts.factory) return null
  const rpcUrls = [...(ENV_RPC_BY_CHAIN[chainId] ?? []), PUBLIC_RPC_BY_CHAIN[chainId]].filter(
    (url): url is string => Boolean(url),
  )
  if (!rpcUrls.length) return null
  return {
    chainId,
    factory: chain.contracts.factory,
    multicall: chain.contracts.multicall || MULTICALL3_FALLBACK,
    rpcUrls: [...new Set(rpcUrls)],
  }
}

function chunks<T>(values: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, (index + 1) * size),
  )
}

async function aggregate(
  config: LiquidityChainConfig,
  calls: Array<[string, string]>,
): Promise<Array<{ success: boolean; returnData: string }>> {
  if (!calls.length) return []
  const callData = multicall.encodeFunctionData('tryAggregate', [false, calls])
  const encoded = await rpcCall<string>(
    'eth_call',
    [{ to: config.multicall, data: callData }, 'latest'],
    config.rpcUrls,
  )
  const [results] = multicall.decodeFunctionResult('tryAggregate', encoded)
  return results as Array<{ success: boolean; returnData: string }>
}

async function enumerateCanonicalPairs(config: LiquidityChainConfig): Promise<PairCandidate[]> {
  const lengthRaw = await rpcCall<string>(
    'eth_call',
    [{ to: config.factory, data: factoryContract.encodeFunctionData('allPairsLength') }, 'latest'],
    config.rpcUrls,
  )
  const [lengthValue] = factoryContract.decodeFunctionResult('allPairsLength', lengthRaw)
  const length = Number(lengthValue.toString())
  if (!Number.isSafeInteger(length) || length < 0 || length > 50_000) throw new Error('Invalid factory pair count')

  const indexes = Array.from({ length }, (_, index) => index)
  const candidates: PairCandidate[] = []
  for (const batch of chunks(indexes, PAIR_CHUNK_SIZE)) {
    const results = await aggregate(
      config,
      batch.map((index) => [config.factory, factoryContract.encodeFunctionData('allPairs', [index])]),
    )
    results.forEach((result) => {
      if (!result.success || result.returnData === '0x') return
      try {
        const [pairAddress] = factoryContract.decodeFunctionResult('allPairs', result.returnData)
        candidates.push({ pairAddress: getAddress(pairAddress) })
      } catch {
        // A malformed factory row is omitted without hiding all other wallet positions.
      }
    })
  }
  return candidates
}

async function loadCandidates(config: LiquidityChainConfig): Promise<{ pairs: PairCandidate[]; source: string }> {
  if (config.chainId === 56) {
    const { pairs, source } = await loadClassifiedAmmPairsAsync()
    return {
      pairs: pairs
        .filter((pair) => pair.pairAddress && pair.token0 && pair.token1)
        .map((pair) => ({
          pairAddress: pair.pairAddress,
          token0: pair.token0,
          token1: pair.token1,
          symbol0: pair.symbol0,
          symbol1: pair.symbol1,
        })),
      source,
    }
  }
  return { pairs: await enumerateCanonicalPairs(config), source: 'canonical-factory' }
}

async function loadOwnedPairs(
  config: LiquidityChainConfig,
  candidates: PairCandidate[],
  account: string,
): Promise<PositionRow[]> {
  const owned: PositionRow[] = []
  for (const batch of chunks(candidates, PAIR_CHUNK_SIZE)) {
    const results = await aggregate(
      config,
      batch.map((pair) => [pair.pairAddress, erc20.encodeFunctionData('balanceOf', [account])]),
    )
    results.forEach((result, index) => {
      if (!result.success || result.returnData === '0x') return
      try {
        const [balance] = erc20.decodeFunctionResult('balanceOf', result.returnData)
        if (balance.isZero()) return
        owned.push({ ...batch[index], lpBalanceRaw: balance.toString() })
      } catch {
        // A non-standard LP token cannot invalidate other confirmed balances.
      }
    })
  }
  return owned
}

async function hydrateOwnedPairs(config: LiquidityChainConfig, rows: PositionRow[]): Promise<void> {
  for (const batch of chunks(rows, PAIR_CHUNK_SIZE)) {
    const calls = batch.flatMap((row) => [
      [row.pairAddress, pairContract.encodeFunctionData('token0')],
      [row.pairAddress, pairContract.encodeFunctionData('token1')],
      [row.pairAddress, pairContract.encodeFunctionData('getReserves')],
    ]) as Array<[string, string]>
    const results = await aggregate(config, calls)
    batch.forEach((row, index) => {
      const token0Result = results[index * 3]
      const token1Result = results[index * 3 + 1]
      const reservesResult = results[index * 3 + 2]
      try {
        if (token0Result?.success && token0Result.returnData !== '0x') {
          const [token0] = pairContract.decodeFunctionResult('token0', token0Result.returnData)
          row.token0 = getAddress(token0)
        }
        if (token1Result?.success && token1Result.returnData !== '0x') {
          const [token1] = pairContract.decodeFunctionResult('token1', token1Result.returnData)
          row.token1 = getAddress(token1)
        }
        if (reservesResult?.success && reservesResult.returnData !== '0x') {
          const [reserve0, reserve1] = pairContract.decodeFunctionResult('getReserves', reservesResult.returnData)
          row.reserve0Raw = reserve0.toString()
          row.reserve1Raw = reserve1.toString()
        }
      } catch {
        // Leave only the failed enrichment absent; the LP ownership remains factual.
      }
    })
  }
}

async function loadOwnedTokenMetadata(
  config: LiquidityChainConfig,
  rows: PositionRow[],
): Promise<Map<string, TokenMetadata>> {
  const addresses = Array.from(
    new Set(rows.flatMap((row) => [row.token0, row.token1]).filter((value): value is string => Boolean(value))),
  )
  const metadata = new Map<string, TokenMetadata>()
  for (const batch of chunks(addresses, TOKEN_CHUNK_SIZE)) {
    const calls = batch.flatMap((address) => [
      [address, erc20.encodeFunctionData('symbol')],
      [address, erc20.encodeFunctionData('decimals')],
    ]) as Array<[string, string]>
    const results = await aggregate(config, calls)
    batch.forEach((address, index) => {
      const symbolResult = results[index * 2]
      const decimalsResult = results[index * 2 + 1]
      const entry: TokenMetadata = {}
      if (symbolResult?.success && symbolResult.returnData !== '0x') {
        try {
          const [symbol] = erc20.decodeFunctionResult('symbol', symbolResult.returnData)
          if (typeof symbol === 'string' && symbol.trim()) entry.symbol = symbol.trim()
        } catch {
          // Preserve indexed metadata for legacy bytes32 symbols.
        }
      }
      if (decimalsResult?.success && decimalsResult.returnData !== '0x') {
        try {
          const [decimals] = erc20.decodeFunctionResult('decimals', decimalsResult.returnData)
          const value = Number(decimals)
          if (Number.isInteger(value) && value >= 0 && value <= 255) entry.decimals = value
        } catch {
          // The client retains the canonical ERC-20 default only for this token.
        }
      }
      metadata.set(address.toLowerCase(), entry)
    })
  }
  return metadata
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawAccount = typeof req.query.account === 'string' ? req.query.account : ''
  let account: string
  try {
    account = getAddress(rawAccount)
  } catch {
    return res.status(400).json({ status: 'error', error: 'Invalid wallet address' })
  }

  const rawChainId = typeof req.query.chainId === 'string' ? req.query.chainId : '56'
  const chainId = Number(rawChainId)
  const config = Number.isSafeInteger(chainId) ? resolveLiquidityChainConfig(chainId) : null
  if (!config) return res.status(400).json({ status: 'error', error: 'Unsupported Melega liquidity chain' })

  try {
    const { pairs: candidates, source } = await loadCandidates(config)
    const owned = await loadOwnedPairs(config, candidates, account)
    await hydrateOwnedPairs(config, owned)
    const metadata = await loadOwnedTokenMetadata(config, owned)
    const rows = owned.filter((row) => row.token0 && row.token1 && row.reserve0Raw != null && row.reserve1Raw != null)
    rows.forEach((row) => {
      const token0 = row.token0 ? metadata.get(row.token0.toLowerCase()) : undefined
      const token1 = row.token1 ? metadata.get(row.token1.toLowerCase()) : undefined
      row.symbol0 = token0?.symbol ?? row.symbol0
      row.symbol1 = token1?.symbol ?? row.symbol1
      row.token0Decimals = token0?.decimals
      row.token1Decimals = token1?.decimals
    })

    res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=30')
    return res.status(200).json({
      status: rows.length > 0 ? 'ready' : 'empty',
      account,
      chainId,
      scannedPairs: candidates.length,
      rows,
      source,
      ownershipSource: 'DIRECT_WALLET_LP',
    })
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      chainId,
      error: error instanceof Error ? error.message : 'Liquidity position discovery failed',
    })
  }
}

export default handler
