import BigNumber from 'bignumber.js'
import { Interface } from '@ethersproject/abi'
import { getAddress } from '@ethersproject/address'
import { bscTokens, baseTokens, ethereumTokens, polygonTokens } from '@pancakeswap/tokens'
import { MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS } from 'config/publicNetworkSwitchCapabilities'
import { getMelegaChain, isMelegaCapabilityEnabled } from 'config/melegaChainRegistry'
import { rpcCall } from 'lib/bsc-indexer/rpc/chunkedLogs'
import { aggregateGlobalPricedTvl, dedupeGlobalPools, sortGlobalPoolsByTvl } from './model'
import type { GlobalLiquidityChainCensus, GlobalLiquidityPool, GlobalLiquiditySnapshot } from './types'

const CACHE_TTL_MS = 120_000
const CHUNK_SIZE = 120
const MULTICALL3_FALLBACK = '0xcA11bde05977b3631167028862bE2a173976CA11'

const factoryInterface = new Interface([
  'function allPairsLength() view returns (uint256)',
  'function allPairs(uint256) view returns (address)',
])
const pairInterface = new Interface([
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
])
const tokenInterface = new Interface([
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
])
const multicallInterface = new Interface([
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
])

const PUBLIC_RPC_BY_CHAIN: Record<number, string[]> = {
  1: ['https://ethereum-rpc.publicnode.com', 'https://eth.llamarpc.com'],
  56: ['https://bsc-rpc.publicnode.com', 'https://binance.llamarpc.com'],
  137: ['https://polygon-bor-rpc.publicnode.com', 'https://polygon.drpc.org', 'https://polygon-rpc.com'],
  8453: ['https://base-rpc.publicnode.com', 'https://base.llamarpc.com'],
}
const ENV_RPC_BY_CHAIN: Record<number, Array<string | undefined>> = {
  1: [process.env.ETH_RPC_URL, process.env.NEXT_PUBLIC_ETH_RPC_URL],
  56: [process.env.BSC_RPC_URL, process.env.BSC_RPC_FALLBACK_URL, process.env.NEXT_PUBLIC_BSC_RPC_URL],
  137: [process.env.POLYGON_RPC_URL, process.env.NEXT_PUBLIC_POLYGON_RPC_URL],
  8453: [process.env.BASE_RPC_URL, process.env.NEXT_PUBLIC_BASE_RPC_URL],
}

const STABLE_ADDRESSES: Record<number, string[]> = {
  1: [ethereumTokens.usdt.address, ethereumTokens.usdc.address, ethereumTokens.dai.address],
  56: [bscTokens.usdt.address, bscTokens.usdc.address, bscTokens.busd.address, bscTokens.dai.address],
  137: [polygonTokens.usdt.address, polygonTokens.usdc.address, polygonTokens.dai.address],
  8453: [baseTokens.usdc.address, baseTokens.dai.address],
}
const WRAPPED_NATIVE: Record<number, string> = {
  1: ethereumTokens.weth.address,
  56: bscTokens.wbnb.address,
  137: polygonTokens.wmatic.address,
  8453: baseTokens.weth.address,
}

type ChainConfig = {
  chainId: number
  chainName: string
  factory: string
  multicall: string
  rpcUrls: string[]
}
type AggregateResult = { success: boolean; returnData: string }
type RawPair = {
  chainId: number
  chainName: string
  pairAddress: string
  token0: string
  token1: string
  reserve0Raw: string
  reserve1Raw: string
}
type TokenMetadata = { symbol: string; name?: string; decimals: number }

let cached: { expiresAt: number; snapshot: GlobalLiquiditySnapshot } | null = null
let inflight: Promise<GlobalLiquiditySnapshot> | null = null

function chunks<T>(rows: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => rows.slice(index * size, (index + 1) * size))
}

function resolveConfigs(): ChainConfig[] {
  return MELEGA_PUBLIC_TRADING_SWITCHER_CHAIN_IDS.flatMap((chainId) => {
    const chain = getMelegaChain(chainId)
    if (!chain || !isMelegaCapabilityEnabled(chainId, 'swap') || !chain.contracts.factory) return []
    const urls = [...(ENV_RPC_BY_CHAIN[chainId] ?? []), ...(PUBLIC_RPC_BY_CHAIN[chainId] ?? [])].filter(
      (url): url is string => Boolean(url),
    )
    if (!urls.length) return []
    return [{
      chainId,
      chainName: chain.name,
      factory: chain.contracts.factory,
      multicall: chain.contracts.multicall || MULTICALL3_FALLBACK,
      rpcUrls: [...new Set(urls)],
    }]
  })
}

async function aggregate(config: ChainConfig, calls: Array<[string, string]>): Promise<AggregateResult[]> {
  if (!calls.length) return []
  const data = multicallInterface.encodeFunctionData('tryAggregate', [false, calls])
  const encoded = await rpcCall<string>('eth_call', [{ to: config.multicall, data }, 'latest'], config.rpcUrls)
  const [results] = multicallInterface.decodeFunctionResult('tryAggregate', encoded)
  return results as AggregateResult[]
}

async function enumeratePairs(config: ChainConfig): Promise<string[]> {
  const encoded = await rpcCall<string>(
    'eth_call',
    [{ to: config.factory, data: factoryInterface.encodeFunctionData('allPairsLength') }, 'latest'],
    config.rpcUrls,
  )
  const [rawLength] = factoryInterface.decodeFunctionResult('allPairsLength', encoded)
  const length = Number(rawLength.toString())
  if (!Number.isSafeInteger(length) || length < 0 || length > 50_000) throw new Error('Invalid factory pair count')
  const addresses: string[] = []
  for (const batch of chunks(Array.from({ length }, (_, index) => index), CHUNK_SIZE)) {
    const results = await aggregate(
      config,
      batch.map((index) => [config.factory, factoryInterface.encodeFunctionData('allPairs', [index])]),
    )
    for (const result of results) {
      if (!result.success || result.returnData === '0x') continue
      try {
        const [address] = factoryInterface.decodeFunctionResult('allPairs', result.returnData)
        addresses.push(getAddress(address))
      } catch {
        // The census records the resulting short read instead of fabricating a pair.
      }
    }
  }
  return addresses
}

async function hydratePairs(config: ChainConfig, addresses: string[]): Promise<RawPair[]> {
  const rows: RawPair[] = []
  for (const batch of chunks(addresses, CHUNK_SIZE)) {
    const results = await aggregate(
      config,
      batch.flatMap((address) => [
        [address, pairInterface.encodeFunctionData('token0')],
        [address, pairInterface.encodeFunctionData('token1')],
        [address, pairInterface.encodeFunctionData('getReserves')],
      ]) as Array<[string, string]>,
    )
    batch.forEach((pairAddress, index) => {
      const token0Result = results[index * 3]
      const token1Result = results[index * 3 + 1]
      const reservesResult = results[index * 3 + 2]
      if (!token0Result?.success || !token1Result?.success || !reservesResult?.success) return
      try {
        const [token0] = pairInterface.decodeFunctionResult('token0', token0Result.returnData)
        const [token1] = pairInterface.decodeFunctionResult('token1', token1Result.returnData)
        const [reserve0, reserve1] = pairInterface.decodeFunctionResult('getReserves', reservesResult.returnData)
        rows.push({
          chainId: config.chainId,
          chainName: config.chainName,
          pairAddress,
          token0: getAddress(token0),
          token1: getAddress(token1),
          reserve0Raw: reserve0.toString(),
          reserve1Raw: reserve1.toString(),
        })
      } catch {
        // Failed contracts remain visible in census counts through pairsRead mismatch.
      }
    })
  }
  return rows
}

async function loadMetadata(config: ChainConfig, pairs: RawPair[]): Promise<Map<string, TokenMetadata>> {
  const addresses = [...new Set(pairs.flatMap((pair) => [pair.token0, pair.token1]).map((address) => address.toLowerCase()))]
  const metadata = new Map<string, TokenMetadata>()
  for (const batch of chunks(addresses, CHUNK_SIZE)) {
    const results = await aggregate(
      config,
      batch.flatMap((address) => [
        [address, tokenInterface.encodeFunctionData('symbol')],
        [address, tokenInterface.encodeFunctionData('name')],
        [address, tokenInterface.encodeFunctionData('decimals')],
      ]) as Array<[string, string]>,
    )
    batch.forEach((address, index) => {
      let symbol = 'Unknown token'
      let name: string | undefined
      let decimals = 18
      try {
        const symbolResult = results[index * 3]
        if (symbolResult?.success) [symbol] = tokenInterface.decodeFunctionResult('symbol', symbolResult.returnData)
      } catch {}
      try {
        const nameResult = results[index * 3 + 1]
        if (nameResult?.success) [name] = tokenInterface.decodeFunctionResult('name', nameResult.returnData)
      } catch {}
      try {
        const decimalsResult = results[index * 3 + 2]
        if (decimalsResult?.success) {
          const [rawDecimals] = tokenInterface.decodeFunctionResult('decimals', decimalsResult.returnData)
          const parsed = Number(rawDecimals)
          if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 255) decimals = parsed
        }
      } catch {}
      metadata.set(address, { symbol: typeof symbol === 'string' && symbol.trim() ? symbol.trim() : 'Unknown token', name, decimals })
    })
  }
  return metadata
}

function human(raw: string, decimals: number): BigNumber {
  return new BigNumber(raw).shiftedBy(-decimals)
}

function pricePairs(pairs: RawPair[], metadata: Map<string, TokenMetadata>, chainId: number): GlobalLiquidityPool[] {
  const prices = new Map<string, BigNumber>()
  const stableKeys = new Set((STABLE_ADDRESSES[chainId] ?? []).map((address) => address.toLowerCase()))
  for (const key of stableKeys) prices.set(key, new BigNumber(1))

  // Existing canonical graph policy: stablecoins anchor USD; the deepest stable/native
  // Melega pool anchors wrapped-native USD. Arbitrary token-token paths never become oracles.
  const wrapped = WRAPPED_NATIVE[chainId]?.toLowerCase()
  let nativeAnchorLiquidity = new BigNumber(0)
  for (const pair of pairs) {
    const key0 = pair.token0.toLowerCase()
    const key1 = pair.token1.toLowerCase()
    if (!wrapped || (!stableKeys.has(key0) && !stableKeys.has(key1))) continue
    if (key0 !== wrapped && key1 !== wrapped) continue
    const meta0 = metadata.get(key0) ?? { symbol: 'Unknown token', decimals: 18 }
    const meta1 = metadata.get(key1) ?? { symbol: 'Unknown token', decimals: 18 }
    const reserve0 = human(pair.reserve0Raw, meta0.decimals)
    const reserve1 = human(pair.reserve1Raw, meta1.decimals)
    if (!reserve0.isPositive() || !reserve1.isPositive()) continue
    const stableReserve = stableKeys.has(key0) ? reserve0 : reserve1
    const nativeReserve = key0 === wrapped ? reserve0 : reserve1
    if (stableReserve.gt(nativeAnchorLiquidity)) {
      const nativePrice = stableReserve.div(nativeReserve)
      if (nativePrice.isFinite() && nativePrice.isPositive()) {
        prices.set(wrapped, nativePrice)
        nativeAnchorLiquidity = stableReserve
      }
    }
  }

  return pairs.map((pair) => {
    const key0 = pair.token0.toLowerCase()
    const key1 = pair.token1.toLowerCase()
    const meta0 = metadata.get(key0) ?? { symbol: 'Unknown token', decimals: 18 }
    const meta1 = metadata.get(key1) ?? { symbol: 'Unknown token', decimals: 18 }
    const reserve0 = human(pair.reserve0Raw, meta0.decimals)
    const reserve1 = human(pair.reserve1Raw, meta1.decimals)
    const zero = reserve0.isZero() && reserve1.isZero()
    const price0 = prices.get(key0)
    const price1 = prices.get(key1)
    const calculated =
      price0 && price1
        ? reserve0.times(price0).plus(reserve1.times(price1))
        : price0
          ? reserve0.times(price0).times(2)
          : price1
            ? reserve1.times(price1).times(2)
            : null
    const tvl = calculated?.isFinite() && !calculated.isNegative() ? calculated : null
    const factualTvl = zero ? new BigNumber(0) : tvl
    return {
      ...pair,
      symbol0: meta0.symbol,
      symbol1: meta1.symbol,
      name0: meta0.name,
      name1: meta1.name,
      decimals0: meta0.decimals,
      decimals1: meta1.decimals,
      tvlUsd: factualTvl?.toFixed() ?? null,
      status: zero ? 'ZERO_LIQUIDITY' : factualTvl ? 'ACTIVE_WITH_LIQUIDITY' : 'UNPRICED',
    }
  })
}

async function loadChain(config: ChainConfig): Promise<{ census: GlobalLiquidityChainCensus; pools: GlobalLiquidityPool[] }> {
  const addresses = await enumeratePairs(config)
  const rawPairs = await hydratePairs(config, addresses)
  const metadata = await loadMetadata(config, rawPairs)
  const pools = pricePairs(rawPairs, metadata, config.chainId)
  const subtotalUsd = aggregateGlobalPricedTvl(pools)
  return {
    pools,
    census: {
      chainId: config.chainId,
      chainName: config.chainName,
      factory: config.factory,
      pairCount: addresses.length,
      pairsRead: rawPairs.length,
      pairsWithLiquidity: pools.filter((pool) => pool.reserve0Raw !== '0' || pool.reserve1Raw !== '0').length,
      pricedCount: pools.filter((pool) => pool.tvlUsd != null).length,
      unpricedCount: pools.filter((pool) => pool.status === 'UNPRICED').length,
      zeroLiquidityCount: pools.filter((pool) => pool.status === 'ZERO_LIQUIDITY').length,
      readFailedCount: addresses.length - rawPairs.length,
      subtotalUsd,
    },
  }
}

async function buildSnapshot(): Promise<GlobalLiquiditySnapshot> {
  const configs = resolveConfigs()
  const settled = await Promise.allSettled(configs.map(loadChain))
  const chains: GlobalLiquidityChainCensus[] = []
  const pools: GlobalLiquidityPool[] = []
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      chains.push(result.value.census)
      pools.push(...result.value.pools)
      return
    }
    const config = configs[index]
    chains.push({
      chainId: config.chainId,
      chainName: config.chainName,
      factory: config.factory,
      pairCount: 0,
      pairsRead: 0,
      pairsWithLiquidity: 0,
      pricedCount: 0,
      unpricedCount: 0,
      zeroLiquidityCount: 0,
      readFailedCount: 0,
      subtotalUsd: '0',
      error: result.reason instanceof Error ? result.reason.message : 'Chain census failed',
    })
  })
  const uniquePools = sortGlobalPoolsByTvl(dedupeGlobalPools(pools))
  const failedChains = chains.filter((chain) => chain.error).length
  return {
    schema: 'melega.global-liquidity.v1',
    status: failedChains === 0 ? 'complete' : failedChains === chains.length ? 'unavailable' : 'partial',
    sourceTimestamp: new Date().toISOString(),
    cacheTtlSeconds: CACHE_TTL_MS / 1000,
    refreshTrigger: 'SWR revalidation and server cache expiry',
    totalPricedTvlUsd: aggregateGlobalPricedTvl(uniquePools),
    uniquePairCount: uniquePools.length,
    pricedPairCount: uniquePools.filter((pool) => pool.tvlUsd != null).length,
    unpricedPairCount: uniquePools.filter((pool) => pool.status === 'UNPRICED').length,
    chains,
    pools: uniquePools,
  }
}

export async function getGlobalLiquiditySnapshot(force = false): Promise<GlobalLiquiditySnapshot> {
  if (!force && cached && cached.expiresAt > Date.now()) return cached.snapshot
  if (!force && inflight) return inflight
  inflight = buildSnapshot()
  try {
    const snapshot = await inflight
    cached = { expiresAt: Date.now() + CACHE_TTL_MS, snapshot }
    return snapshot
  } finally {
    inflight = null
  }
}
