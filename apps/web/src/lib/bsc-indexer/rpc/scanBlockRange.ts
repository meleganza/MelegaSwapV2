import { BURN_TOPIC, MINT_TOPIC, SWAP_TOPIC } from '../constants'
import type { RawLog } from './chunkedLogs'
import { getBlockNumber, rpcCallWithFailover, resolveIndexerLogRpcUrls, resolveLogFetchRpcUrls } from './chunkedLogs'
import { blockQuantityVariants } from './blockQuantity'

export type BlockHeader = { hash: string; number: string; timestamp: string }

const EVENT_TOPICS = [SWAP_TOPIC, MINT_TOPIC, BURN_TOPIC] as const

async function fetchBlockHeaderWithVariants(
  blockNumber: number,
  rpcUrls?: string[],
): Promise<{ block: BlockHeader; url: string }> {
  const urls = rpcUrls ?? resolveIndexerLogRpcUrls()
  let lastError: Error | undefined
  for (const quantity of blockQuantityVariants(blockNumber)) {
    try {
      const { result, url } = await rpcCallWithFailover<BlockHeader>(
        'eth_getBlockByNumber',
        [quantity, false],
        urls,
      )
      return { block: result, url }
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error(`eth_getBlockByNumber failed for block ${blockNumber}`)
}

export async function fetchBlockHeader(blockNumber: number, rpcUrls?: string[]): Promise<BlockHeader> {
  return (await fetchBlockHeaderWithVariants(blockNumber, rpcUrls)).block
}

/** Per-block blockHash eth_getLogs — compatible with QuickNode Discover 1-block filter. */
export async function scanBlockRangeEvents(params: {
  address: string
  fromBlock: number
  toBlock: number
  rpcUrls?: string[]
}): Promise<{ logs: RawLog[]; blockTimestamps: Map<number, number>; providerUsed: string }> {
  const urls = params.rpcUrls ?? resolveIndexerLogRpcUrls()
  const logUrls = resolveLogFetchRpcUrls()
  if (!urls.length) throw new Error('BSC_RPC_URL missing for featured-pair log scan')

  const logs: RawLog[] = []
  const blockTimestamps = new Map<number, number>()
  let providerUsed = urls[0]

  for (let bn = params.fromBlock; bn <= params.toBlock; bn += 1) {
    const { block, url } = await fetchBlockHeaderWithVariants(bn, urls)
    providerUsed = url
    const blockNumber = parseInt(block.number, 16)
    blockTimestamps.set(blockNumber, parseInt(block.timestamp, 16))

    for (const topic of EVENT_TOPICS) {
      const variants = blockQuantityVariants(bn)
      const ordered = [variants[variants.length - 1], ...variants.slice(0, -1)].filter(
        (v, i, a) => a.indexOf(v) === i,
      )
      let batch: RawLog[] = []
      for (const quantity of ordered) {
        try {
          const res = await rpcCallWithFailover<RawLog[]>(
            'eth_getLogs',
            [
              {
                fromBlock: quantity,
                toBlock: quantity,
                address: params.address.toLowerCase(),
                topics: [topic],
              },
            ],
            logUrls,
          )
          providerUsed = res.url
          batch = res.result
          break
        } catch {
          continue
        }
      }
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
