import { BURN_TOPIC, MINT_TOPIC, SWAP_TOPIC } from '../constants'
import type { RawLog } from './chunkedLogs'
import { getBlockNumber, rpcCallWithFailover, resolveIndexerLogRpcUrls } from './chunkedLogs'
import { toBlockQuantity } from './blockQuantity'

export type BlockHeader = { hash: string; number: string; timestamp: string }

const EVENT_TOPICS = [SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC] as const

export async function fetchBlockHeader(blockNumber: number, rpcUrls?: string[]): Promise<BlockHeader> {
  const urls = rpcUrls ?? resolveIndexerLogRpcUrls()
  const { result } = await rpcCallWithFailover<BlockHeader>(
    'eth_getBlockByNumber',
    [toBlockQuantity(blockNumber), false],
    urls,
  )
  return result
}

/** Per-block blockHash eth_getLogs — compatible with QuickNode Discover 1-block filter. */
export async function scanBlockRangeEvents(params: {
  address: string
  fromBlock: number
  toBlock: number
  rpcUrls?: string[]
}): Promise<{ logs: RawLog[]; blockTimestamps: Map<number, number>; providerUsed: string }> {
  const urls = params.rpcUrls ?? resolveIndexerLogRpcUrls()
  if (!urls.length) throw new Error('BSC_RPC_URL missing for featured-pair log scan')

  const logs: RawLog[] = []
  const blockTimestamps = new Map<number, number>()
  let providerUsed = urls[0]

  for (let bn = params.fromBlock; bn <= params.toBlock; bn += 1) {
    const { result: block, url } = await rpcCallWithFailover<BlockHeader>(
      'eth_getBlockByNumber',
      [toBlockQuantity(bn), false],
      urls,
    )
    providerUsed = url
    const blockNumber = parseInt(block.number, 16)
    blockTimestamps.set(blockNumber, parseInt(block.timestamp, 16))

    for (const topic of EVENT_TOPICS) {
      const { result: batch } = await rpcCallWithFailover<RawLog[]>(
        'eth_getLogs',
        [{ blockHash: block.hash, address: params.address.toLowerCase(), topics: [topic] }],
        urls,
      )
      logs.push(...batch)
    }
  }

  return { logs, blockTimestamps, providerUsed }
}

export async function estimateBootstrapStartBlock(days: number): Promise<{ chainHead: number; bootstrapStartBlock: number }> {
  const chainHead = await getBlockNumber()
  const blocksPerDay = Math.floor(86400 / 3)
  const bootstrapStartBlock = Math.max(0, chainHead - days * blocksPerDay)
  return { chainHead, bootstrapStartBlock }
}
