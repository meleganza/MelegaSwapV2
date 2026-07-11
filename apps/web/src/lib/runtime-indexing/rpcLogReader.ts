/** R767 — bounded BSC RPC log reader for swap events when subgraph is absent. */

import { SWAP_TOPIC } from 'lib/bsc-indexer/eventTopics'

export const MELEGA_FACTORY_BSC = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
export const MARCO_WBNB_PAIR_BSC = '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e'
export const WBNB_BSC = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
export const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'

/** Canonical Swap topic — re-exported from lib/bsc-indexer/eventTopics (R773). */
export const SWAP_EVENT_TOPIC = SWAP_TOPIC

const DEFAULT_RPC = 'https://bsc-dataseed.binance.org'

export interface RpcJsonResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

export async function rpcCall<T>(method: string, params: unknown[], rpcUrl = DEFAULT_RPC): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = (await res.json()) as RpcJsonResponse<T>
  if (json.error) throw new Error(json.error.message)
  if (json.result === undefined) throw new Error(`RPC ${method} returned no result`)
  return json.result
}

export async function getBlockNumber(rpcUrl?: string): Promise<number> {
  const hex = await rpcCall<string>('eth_blockNumber', [], rpcUrl)
  return parseInt(hex, 16)
}

export async function getLogs(
  filter: {
    address: string
    topics?: (string | null)[]
    fromBlock: string
    toBlock: string
  },
  rpcUrl?: string,
) {
  return rpcCall<
    Array<{
      address: string
      topics: string[]
      data: string
      blockNumber: string
      transactionHash: string
    }>
  >('eth_getLogs', [filter], rpcUrl)
}

export function decodeUint256(hex: string): bigint {
  return BigInt(hex)
}

/** Decode Swap log data: amount0In, amount1In, amount0Out, amount1Out (4 x uint256). */
export function decodeSwapAmounts(data: string): {
  amount0In: bigint
  amount1In: bigint
  amount0Out: bigint
  amount1Out: bigint
} {
  const raw = data.startsWith('0x') ? data.slice(2) : data
  const chunks = raw.match(/.{1,64}/g) ?? []
  return {
    amount0In: BigInt(`0x${chunks[0] ?? '0'}`),
    amount1In: BigInt(`0x${chunks[1] ?? '0'}`),
    amount0Out: BigInt(`0x${chunks[2] ?? '0'}`),
    amount1Out: BigInt(`0x${chunks[3] ?? '0'}`),
  }
}

export const BSC_RPC_FALLBACKS = [
  process.env.BSC_RPC_URL,
  process.env.NEXT_PUBLIC_BSC_RPC_URL,
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed.binance.org',
].filter(Boolean) as string[]

export async function getLogsWithFallback(
  filter: {
    address: string
    topics?: (string | null)[]
    fromBlock: string
    toBlock: string
  },
  rpcUrls: string[] = BSC_RPC_FALLBACKS,
) {
  let lastError: Error | undefined
  for (const rpcUrl of rpcUrls) {
    try {
      return await getLogs(filter, rpcUrl)
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('All RPC endpoints failed')
}

/** Scan backwards in small chunks to avoid eth_getLogs limits on public BSC RPC. */
export async function scanSwapLogs(params: {
  pairAddress: string
  chainHead: number
  maxBlocks?: number
  chunkSize?: number
  maxLogs?: number
  rpcUrls?: string[]
}) {
  const {
    pairAddress,
    chainHead,
    maxBlocks = 12_000,
    chunkSize = 1_500,
    maxLogs = 120,
    rpcUrls = BSC_RPC_FALLBACKS,
  } = params
  const collected: Awaited<ReturnType<typeof getLogs>> = []
  let scanned = 0
  let toBlock = chainHead

  while (scanned < maxBlocks && collected.length < maxLogs) {
    const fromBlock = Math.max(0, toBlock - chunkSize)
    const chunk = await getLogsWithFallback(
      {
        address: pairAddress,
        topics: [SWAP_EVENT_TOPIC],
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
      },
      rpcUrls,
    )
    collected.push(...chunk)
    scanned += toBlock - fromBlock
    toBlock = fromBlock - 1
    if (fromBlock <= 0) break
  }

  return { logs: collected.slice(-maxLogs), scannedFrom: Math.max(0, chainHead - scanned), chainHead }
}
