import {
  DEFAULT_CHUNK_SIZE,
  MIN_CHUNK_SIZE,
  BURN_TOPIC,
  MINT_TOPIC,
  SWAP_TOPIC,
  SYNC_TOPIC,
} from '../constants'
import type { NormalizedIndexerEvent } from '../types'

export function resolveRpcUrls(): string[] {
  return [
    process.env.BSC_RPC_URL,
    process.env.BSC_RPC_FALLBACK_URL,
    process.env.NEXT_PUBLIC_BSC_RPC_URL,
    'https://bsc-dataseed1.defibit.io',
    'https://bsc-dataseed.binance.org',
  ].filter(Boolean) as string[]
}

/** Prefer public/dataseed endpoints for log scans when dedicated RPC hits log limits. */
export function resolveBootstrapLogRpcUrls(): string[] {
  return [
    process.env.BSC_RPC_FALLBACK_URL,
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    process.env.BSC_RPC_URL,
    process.env.NEXT_PUBLIC_BSC_RPC_URL,
  ].filter(Boolean) as string[]
}

export async function rpcCall<T>(method: string, params: unknown[], rpcUrls = resolveRpcUrls()): Promise<T> {
  let lastError: Error | undefined
  for (const url of rpcUrls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      const json = (await res.json()) as { result?: T; error?: { message: string } }
      if (json.error) throw new Error(json.error.message)
      if (json.result === undefined) throw new Error(`RPC ${method} empty result`)
      return json.result
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('All RPC endpoints failed')
}

function toBlockHex(blockNumber: number): string {
  let hex = blockNumber.toString(16)
  if (hex.length % 2 === 1) hex = `0${hex}`
  return `0x${hex}`
}

export async function getBlockNumber(): Promise<number> {
  const hex = await rpcCall<string>('eth_blockNumber', [])
  return parseInt(hex, 16)
}

export interface RawLog {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  logIndex: string
}

export async function getLogsChunked(params: {
  address: string
  topics?: (string | null)[]
  fromBlock: number
  toBlock: number
  initialChunk?: number
  rpcUrls?: string[]
}): Promise<{ logs: RawLog[]; finalChunkSize: number }> {
  const rpcUrls = params.rpcUrls ?? resolveRpcUrls()
  let chunk = params.initialChunk ?? DEFAULT_CHUNK_SIZE
  const logs: RawLog[] = []
  let cursor = params.fromBlock

  while (cursor <= params.toBlock) {
    const end = Math.min(cursor + chunk - 1, params.toBlock)
    try {
      const batch = await rpcCall<RawLog[]>(
        'eth_getLogs',
        [
          {
            address: params.address,
            topics: params.topics,
            fromBlock: `0x${cursor.toString(16)}`,
            toBlock: `0x${end.toString(16)}`,
          },
        ],
        rpcUrls,
      )
      logs.push(...batch)
      cursor = end + 1
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.toLowerCase().includes('limit')) throw e
      if (chunk > MIN_CHUNK_SIZE) {
        chunk = Math.max(MIN_CHUNK_SIZE, Math.floor(chunk / 2))
        continue
      }
      if (end > cursor) {
        chunk = 1
        continue
      }
      throw e
    }
  }

  return { logs, finalChunkSize: chunk }
}

const blockTsCache = new Map<number, number>()

export async function getBlockTimestamp(blockNumber: number): Promise<number> {
  if (blockTsCache.has(blockNumber)) return blockTsCache.get(blockNumber)!
  const hex = await rpcCall<{ timestamp: string }>('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, false])
  const ts = parseInt(hex.timestamp, 16)
  blockTsCache.set(blockNumber, ts)
  return ts
}

function decodeUint256(data: string, index: number): bigint {
  const raw = data.startsWith('0x') ? data.slice(2) : data
  const chunk = raw.slice(index * 64, (index + 1) * 64)
  return BigInt(`0x${chunk || '0'}`)
}

function formatAmount(value: bigint, decimals = 18): string {
  const n = Number(value) / 10 ** decimals
  if (!Number.isFinite(n)) return '0'
  return String(n)
}

export function normalizeSwapLog(log: RawLog, pairMeta: { token0: string; token1: string }): NormalizedIndexerEvent {
  const blockNumber = parseInt(log.blockNumber, 16)
  const logIndex = parseInt(log.logIndex, 16)
  const amount0In = decodeUint256(log.data, 0)
  const amount1In = decodeUint256(log.data, 1)
  const amount0Out = decodeUint256(log.data, 2)
  const amount1Out = decodeUint256(log.data, 3)
  const wallet = `0x${log.topics[1]?.slice(26) ?? '0'.repeat(40)}`
  return {
    chainId: 56,
    protocol: 'amm',
    eventType: 'Swap',
    contractAddress: log.address.toLowerCase(),
    pairAddress: log.address.toLowerCase(),
    token0: pairMeta.token0,
    token1: pairMeta.token1,
    amount0: formatAmount(amount0In + amount0Out),
    amount1: formatAmount(amount1In + amount1Out),
    amountIn: formatAmount(amount0In + amount1In),
    amountOut: formatAmount(amount0Out + amount1Out),
    wallet,
    txHash: log.transactionHash,
    logIndex,
    blockNumber,
    blockTimestamp: 0,
    explorerUrl: `https://bscscan.com/tx/${log.transactionHash}`,
    sourceStatus: 'incremental',
  }
}

export function normalizeMintBurnLog(
  log: RawLog,
  eventType: 'Mint' | 'Burn',
  pairMeta: { token0: string; token1: string },
): NormalizedIndexerEvent {
  const blockNumber = parseInt(log.blockNumber, 16)
  const logIndex = parseInt(log.logIndex, 16)
  const amount0 = decodeUint256(log.data, 0)
  const amount1 = decodeUint256(log.data, 1)
  const wallet = `0x${log.topics[1]?.slice(26) ?? '0'.repeat(40)}`
  return {
    chainId: 56,
    protocol: 'amm',
    eventType,
    contractAddress: log.address.toLowerCase(),
    pairAddress: log.address.toLowerCase(),
    token0: pairMeta.token0,
    token1: pairMeta.token1,
    amount0: formatAmount(amount0),
    amount1: formatAmount(amount1),
    wallet,
    txHash: log.transactionHash,
    logIndex,
    blockNumber,
    blockTimestamp: 0,
    explorerUrl: `https://bscscan.com/tx/${log.transactionHash}`,
    sourceStatus: 'incremental',
  }
}

export const AMM_TOPICS = {
  swap: SWAP_TOPIC,
  mint: MINT_TOPIC,
  burn: BURN_TOPIC,
  sync: SYNC_TOPIC,
}
