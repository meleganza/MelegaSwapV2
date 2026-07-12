import { put, head } from '@vercel/blob'
import {
  MELEGA_CHAIN_ID,
  MELEGA_MASTERCHEF_BSC,
  BSC_AVG_BLOCK_SECONDS,
} from '../constants'
import { getBlockNumber, getLogsChunked, getBlockTimestamp } from '../rpc/chunkedLogs'
import type { IndexerDeadline } from './indexerDeadline'

const DEPOSIT_TOPIC = '0x90890809c654f11f630942b0e6f67ee8cb438cbdfb1d1f45533e7576391dc195'
const WITHDRAW_TOPIC = '0x884edad9d98d948abe3ec11b0219356438e6b1a3177dd72c77492e294984e937'
const EMERGENCY_WITHDRAW_TOPIC = '0x692a3d7b60c25ad266c2e35b7d0894e6fe081d9121eb2f2b6d690c84242e8a85'
const ACTIVITY_KEY = 'melega-indexer/v2/protocol-activity/events.json'
const RECENT_BLOCKS = Math.floor((7 * 86_400) / BSC_AVG_BLOCK_SECONDS)

export interface ProtocolActivityEvent {
  chainId: number
  sourceType: 'amm' | 'masterchef' | 'smartchef'
  contractAddress: string
  eventType: string
  transactionHash: string
  logIndex: number
  blockNumber: number
  timestamp: number
  wallet?: string
  assetAddresses: string[]
  resolvedSymbols: string[]
  amounts: string[]
  pairOrPoolIdentity?: string
  explorerUrl: string
}

async function readEvents(): Promise<ProtocolActivityEvent[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return []
  try {
    const meta = await head(ACTIVITY_KEY, { token })
    const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) return []
    return (await res.json()) as ProtocolActivityEvent[]
  } catch {
    return []
  }
}

async function writeEvents(events: ProtocolActivityEvent[]) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return
  await put(ACTIVITY_KEY, JSON.stringify(events), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

/** R787 — bounded MasterChef recent activity sync. */
export async function syncProtocolActivityRecent(deadline?: IndexerDeadline) {
  if (deadline?.shouldStop()) {
    return { added: 0, scannedBlocks: 0, source: 'masterchef' as const }
  }

  const chainHead = await getBlockNumber()
  const fromBlock = Math.max(0, chainHead - RECENT_BLOCKS)
  const toBlock = chainHead
  const { logs } = await getLogsChunked({
    address: MELEGA_MASTERCHEF_BSC,
    topics: [[DEPOSIT_TOPIC, WITHDRAW_TOPIC, EMERGENCY_WITHDRAW_TOPIC]],
    fromBlock,
    toBlock,
    initialChunk: 200,
  })

  const existing = await readEvents()
  const seen = new Set(existing.map((e) => `${e.transactionHash}:${e.logIndex}`))
  const added: ProtocolActivityEvent[] = []

  for (const log of logs) {
    if (deadline?.shouldStop()) break
    const blockNumber = parseInt(log.blockNumber, 16)
    const logIndex = parseInt(log.logIndex, 16)
    const key = `${log.transactionHash}:${logIndex}`
    if (seen.has(key)) continue
    const topic = log.topics[0]?.toLowerCase()
    let eventType = 'Deposit'
    if (topic === WITHDRAW_TOPIC.toLowerCase()) eventType = 'Withdraw'
    if (topic === EMERGENCY_WITHDRAW_TOPIC.toLowerCase()) eventType = 'EmergencyWithdraw'
    const wallet = `0x${log.topics[1]?.slice(26) ?? '0'.repeat(40)}`
    const timestamp = await getBlockTimestamp(blockNumber)
    added.push({
      chainId: MELEGA_CHAIN_ID,
      sourceType: 'masterchef',
      contractAddress: MELEGA_MASTERCHEF_BSC.toLowerCase(),
      eventType,
      transactionHash: log.transactionHash,
      logIndex,
      blockNumber,
      timestamp,
      wallet,
      assetAddresses: [],
      resolvedSymbols: [],
      amounts: [],
      pairOrPoolIdentity: `MasterChef pid:${parseInt(log.topics[1]?.slice(-8) ?? '0', 16) || 0}`,
      explorerUrl: `https://bscscan.com/tx/${log.transactionHash}`,
    })
    seen.add(key)
  }

  if (added.length) {
    const merged = [...added, ...existing].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 500)
    await writeEvents(merged)
  }

  return { added: added.length, scannedBlocks: toBlock - fromBlock + 1, source: 'masterchef' as const }
}

export async function listProtocolActivityEvents(limit = 20): Promise<ProtocolActivityEvent[]> {
  const rows = await readEvents()
  return rows.slice(0, limit)
}
