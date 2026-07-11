import {
  DEFAULT_CHUNK_SIZE,
  MIN_CHUNK_SIZE,
  BURN_TOPIC,
  MINT_TOPIC,
  SWAP_TOPIC,
  SYNC_TOPIC,
  MAX_EVENTS_PER_SYNC,
} from '../constants'
import { assertIndexerEventTopicsValid } from '../eventTopicIntegrity'
import type { NormalizedIndexerEvent } from '../types'
import { toBlockQuantity, blockQuantityVariants } from './blockQuantity'
import {
  getProviderHealthSnapshot,
  isProviderQuarantined,
  recordProviderFailure,
  recordProviderSuccess,
} from './providerHealth'

let topicsValidated = false

function ensureEventTopicsValid(): void {
  if (topicsValidated) return
  assertIndexerEventTopicsValid()
  topicsValidated = true
}

const PUBLIC_LOG_FALLBACKS = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed2.defibit.io',
  'https://bsc-dataseed1.bnbchain.org',
  'https://bsc-dataseed1.ninicoin.io',
]

export function resolveRpcUrls(): string[] {
  return [
    process.env.BSC_RPC_URL,
    process.env.BSC_RPC_FALLBACK_URL,
    process.env.NEXT_PUBLIC_BSC_RPC_URL,
    ...PUBLIC_LOG_FALLBACKS.slice(0, 2),
  ].filter(Boolean) as string[]
}

/** Head / eth_call reads — QuickNode primary. */
export function resolveIndexerLogRpcUrls(): string[] {
  return [process.env.BSC_RPC_URL, process.env.BSC_RPC_FALLBACK_URL].filter(Boolean) as string[]
}

/**
 * R773 — featured-pair eth_getLogs routing.
 * 1. BSC_LOG_RPC_URL (optional future override)
 * 2. BSC_RPC_URL (QuickNode)
 * 3. BSC_RPC_FALLBACK_URL
 * 4. public seeds (degraded last resort)
 */
export function resolveFeaturedPairLogRpcUrls(): string[] {
  ensureEventTopicsValid()
  const ordered = [
    process.env.BSC_LOG_RPC_URL,
    process.env.BSC_RPC_URL,
    process.env.BSC_RPC_FALLBACK_URL,
    ...PUBLIC_LOG_FALLBACKS,
  ].filter(Boolean) as string[]
  const seen = new Set<string>()
  return ordered.filter((url) => {
    if (seen.has(url) || isProviderQuarantined(url)) return false
    seen.add(url)
    return true
  })
}

/** @deprecated Use resolveFeaturedPairLogRpcUrls — kept for smoke/back-compat imports. */
export function resolveLogFetchRpcUrls(): string[] {
  return resolveFeaturedPairLogRpcUrls()
}

export { getProviderHealthSnapshot }

function classifyRpcFailure(error: unknown, httpStatus?: number): string {
  const msg = error instanceof Error ? error.message : String(error)
  if (httpStatus === 404 || msg.includes('404')) return `HTTP 404: ${msg}`
  return msg
}

async function postRpc<T>(
  url: string,
  method: string,
  params: unknown[],
  label: string,
): Promise<T> {
  ensureEventTopicsValid()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = (await res.json()) as { result?: T; error?: { message: string } }
  if (!res.ok || json.error) {
    const reason = classifyRpcFailure(json.error?.message ?? `HTTP ${res.status}`, res.status)
    recordProviderFailure(url, label, reason)
    throw new Error(reason)
  }
  if (json.result === undefined) {
    const reason = `RPC ${method} empty result`
    recordProviderFailure(url, label, reason)
    throw new Error(reason)
  }
  recordProviderSuccess(url, label)
  return json.result
}

export async function rpcCallWithFailover<T>(
  method: string,
  params: unknown[],
  rpcUrls = resolveFeaturedPairLogRpcUrls(),
): Promise<{ result: T; url: string }> {
  ensureEventTopicsValid()
  let lastError: Error | undefined
  for (const url of rpcUrls) {
    if (isProviderQuarantined(url)) continue
    const label = url.includes('quiknode') ? 'quicknode' : url.includes('ankr') ? 'ankr' : 'public'
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const result = await postRpc<T>(url, method, params, label)
        return { result, url }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        if (isProviderQuarantined(url)) break
        const msg = lastError.message.toLowerCase()
        const delay = msg.includes('limit') ? 800 * 2 ** attempt : 250 * 2 ** attempt
        if (attempt < 2) await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError ?? new Error('All RPC endpoints failed')
}

export async function rpcCall<T>(method: string, params: unknown[], rpcUrls = resolveRpcUrls()): Promise<T> {
  let lastError: Error | undefined
  for (const url of rpcUrls) {
    if (isProviderQuarantined(url)) continue
    try {
      const label = url.includes('quiknode') ? 'quicknode' : url.includes('ankr') ? 'ankr' : 'public'
      return await postRpc<T>(url, method, params, label)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('All RPC endpoints failed')
}

function toBlockHex(blockNumber: number): string {
  return toBlockQuantity(blockNumber)
}

export async function getBlockNumber(rpcUrls?: string[]): Promise<number> {
  const hex = await rpcCall<string>('eth_blockNumber', [], rpcUrls ?? resolveRpcUrls())
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

async function fetchLogsForBlock(params: {
  blockNumber: number
  address: string
  topic: string
  logRpcUrls: string[]
}): Promise<{ logs: RawLog[]; url: string }> {
  ensureEventTopicsValid()
  const variants = blockQuantityVariants(params.blockNumber)
  let lastError: Error | undefined
  for (const url of params.logRpcUrls) {
    if (isProviderQuarantined(url)) continue
    for (const quantity of variants) {
      try {
        const { result, url: used } = await rpcCallWithFailover<RawLog[]>(
          'eth_getLogs',
          [
            {
              fromBlock: quantity,
              toBlock: quantity,
              address: params.address.toLowerCase(),
              topics: [params.topic],
            },
          ],
          [url],
        )
        return { logs: result, url: used }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
      }
    }
  }
  throw lastError ?? new Error(`eth_getLogs failed for block ${params.blockNumber}`)
}

export async function scanPairEventsFromHead(params: {
  address: string
  maxBlocks: number
  maxLogs?: number
  stopBeforeBlock?: number
  rpcUrls?: string[]
}): Promise<{ logs: RawLog[]; blockTimestamps: Map<number, number>; lastScannedBlock: number; providerUsed: string }> {
  const headRpcUrls = params.rpcUrls ?? resolveIndexerLogRpcUrls()
  const logRpcUrls = resolveFeaturedPairLogRpcUrls()
  if (!headRpcUrls.length) throw new Error('BSC_RPC_URL missing for log scan')
  if (!logRpcUrls.length) throw new Error('No healthy RPC endpoints for eth_getLogs')

  type BlockHeader = { hash: string; number: string; parentHash: string; timestamp: string }
  let block = await rpcCall<BlockHeader>('eth_getBlockByNumber', ['latest', false], headRpcUrls)
  const logs: RawLog[] = []
  const blockTimestamps = new Map<number, number>()
  let scanned = 0
  let providerUsed = logRpcUrls[0]
  const stopBefore = params.stopBeforeBlock ?? 0
  const topics = [SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC]

  while (scanned < params.maxBlocks && logs.length < (params.maxLogs ?? MAX_EVENTS_PER_SYNC)) {
    const blockNumber = parseInt(block.number, 16)
    if (blockNumber <= stopBefore) break
    blockTimestamps.set(blockNumber, parseInt(block.timestamp, 16))

    for (const topic of topics) {
      const batch = await fetchLogsForBlock({
        blockNumber,
        address: params.address,
        topic,
        logRpcUrls,
      })
      providerUsed = batch.url
      logs.push(...batch.logs)
      if (logs.length >= (params.maxLogs ?? MAX_EVENTS_PER_SYNC)) break
      await new Promise((r) => setTimeout(r, 40))
    }
    scanned += 1

    if (!block.parentHash || /^0x0+$/i.test(block.parentHash)) break
    block = await rpcCall<BlockHeader>('eth_getBlockByHash', [block.parentHash, false], headRpcUrls)
  }

  return { logs, blockTimestamps, lastScannedBlock: parseInt(block.number, 16), providerUsed }
}

export async function scanSwapLogsFromHead(params: {
  address: string
  topic: string
  maxBlocks: number
  maxLogs?: number
  stopBeforeBlock?: number
  rpcUrls?: string[]
}): Promise<{ logs: RawLog[]; blockTimestamps: Map<number, number>; lastScannedBlock: number }> {
  const rpcUrls = params.rpcUrls ?? resolveFeaturedPairLogRpcUrls()
  if (!rpcUrls.length) throw new Error('BSC_RPC_URL missing for log scan')

  type BlockHeader = { hash: string; number: string; parentHash: string; timestamp: string }
  let block = await rpcCall<BlockHeader>('eth_getBlockByNumber', ['latest', false], resolveIndexerLogRpcUrls())
  const logs: RawLog[] = []
  const blockTimestamps = new Map<number, number>()
  let scanned = 0
  const stopBefore = params.stopBeforeBlock ?? 0

  while (scanned < params.maxBlocks && logs.length < (params.maxLogs ?? MAX_EVENTS_PER_SYNC)) {
    const blockNumber = parseInt(block.number, 16)
    if (blockNumber <= stopBefore) break
    blockTimestamps.set(blockNumber, parseInt(block.timestamp, 16))

    const { result: batch } = await rpcCallWithFailover<RawLog[]>(
      'eth_getLogs',
      [{ blockHash: block.hash, address: params.address, topics: [params.topic] }],
      rpcUrls,
    )
    logs.push(...batch)
    scanned += 1

    if (!block.parentHash || /^0x0+$/i.test(block.parentHash)) break
    block = await rpcCall<BlockHeader>('eth_getBlockByHash', [block.parentHash, false], resolveIndexerLogRpcUrls())
  }

  return { logs, blockTimestamps, lastScannedBlock: parseInt(block.number, 16) }
}

export async function getLogsChunked(params: {
  address: string
  topics?: (string | null)[]
  fromBlock: number
  toBlock: number
  initialChunk?: number
  rpcUrls?: string[]
}): Promise<{ logs: RawLog[]; finalChunkSize: number }> {
  const rpcUrls = params.rpcUrls ?? resolveFeaturedPairLogRpcUrls()
  let chunk = Math.min(params.initialChunk ?? DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_SIZE)
  const logs: RawLog[] = []
  let cursor = params.fromBlock

  while (cursor <= params.toBlock) {
    const end = Math.min(cursor + chunk - 1, params.toBlock)
    try {
      if (chunk === 1 && cursor === end) {
        const block = await rpcCall<{ hash: string }>(
          'eth_getBlockByNumber',
          [toBlockHex(cursor), false],
          resolveIndexerLogRpcUrls(),
        )
        const batch = await rpcCall<RawLog[]>(
          'eth_getLogs',
          [
            {
              blockHash: block.hash,
              address: params.address,
              topics: params.topics,
            },
          ],
          rpcUrls,
        )
        logs.push(...batch)
      } else {
        const batch = await rpcCall<RawLog[]>(
          'eth_getLogs',
          [
            {
              address: params.address,
              topics: params.topics,
              fromBlock: toBlockHex(cursor),
              toBlock: toBlockHex(end),
            },
          ],
          rpcUrls,
        )
        logs.push(...batch)
      }
      cursor = end + 1
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.toLowerCase().includes('limit') && !msg.toLowerCase().includes('hex')) throw e
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
  const hex = await rpcCall<{ timestamp: string }>('eth_getBlockByNumber', [toBlockHex(blockNumber), false])
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
  const recipient = `0x${log.topics[2]?.slice(26) ?? '0'.repeat(40)}`
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
    recipient,
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
