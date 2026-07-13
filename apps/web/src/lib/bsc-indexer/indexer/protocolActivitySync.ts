import { put, head } from '@vercel/blob'
import {
  MELEGA_CHAIN_ID,
  MELEGA_MASTERCHEF_BSC,
  MAX_BLOCKS_PER_SYNC,
} from '../constants'
import { getBlockNumber, getLogsChunked, getBlockTimestamp } from '../rpc/chunkedLogs'
import type { IndexerDeadline } from './indexerDeadline'
import { resolveProtocolActivityScanWindow } from './protocolActivityBounds'

export { resolveProtocolActivityScanWindow } from './protocolActivityBounds'
/** Minimum remaining orchestrator budget before protocol activity starts. */
export const PROTOCOL_ACTIVITY_MIN_REMAINING_MS = 12_000

import {
  MASTERCHEF_ACTIVITY_TOPICS,
  MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC,
  MASTERCHEF_DEPOSIT_TOPIC,
  MASTERCHEF_WITHDRAW_TOPIC,
} from './masterchefTopics'
const ACTIVITY_KEY = 'melega-indexer/v2/protocol-activity/events.json'
const CURSOR_KEY = 'melega-indexer/v2/protocol-activity/cursor.json'

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

interface ProtocolActivityCursor {
  lastScannedBlock: number
  updatedAt: string
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

async function loadCursor(): Promise<ProtocolActivityCursor | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return null
  try {
    const meta = await head(CURSOR_KEY, { token })
    const res = await fetch(meta.url, { headers: { authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return (await res.json()) as ProtocolActivityCursor
  } catch {
    return null
  }
}

async function saveCursor(lastScannedBlock: number) {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) return
  const payload: ProtocolActivityCursor = {
    lastScannedBlock,
    updatedAt: new Date().toISOString(),
  }
  await put(CURSOR_KEY, JSON.stringify(payload), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    token,
  })
}

/** R787/R789 — bounded MasterChef recent activity sync under orchestrator deadline. */
export async function syncProtocolActivityRecent(deadline?: IndexerDeadline) {
  if (deadline?.shouldStop()) {
    return { added: 0, scannedBlocks: 0, source: 'masterchef' as const, partial: true }
  }
  if (deadline && deadline.remainingMs() <= PROTOCOL_ACTIVITY_MIN_REMAINING_MS) {
    return { added: 0, scannedBlocks: 0, source: 'masterchef' as const, skipped: true as const }
  }

  const chainHead = await getBlockNumber()
  const stored = await loadCursor()
  const window = resolveProtocolActivityScanWindow({
    chainHead,
    storedCursor: stored?.lastScannedBlock ?? null,
  })
  if (window.caughtUp) {
    return { added: 0, scannedBlocks: 0, source: 'masterchef' as const, caughtUp: true as const }
  }

  const { logs, aborted } = await getLogsChunked({
    address: MELEGA_MASTERCHEF_BSC,
    topics: [[MASTERCHEF_DEPOSIT_TOPIC, MASTERCHEF_WITHDRAW_TOPIC, MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC]],
    fromBlock: window.fromBlock,
    toBlock: window.toBlock,
    initialChunk: 200,
    shouldAbort: () => deadline?.shouldStop() ?? false,
  })

  const existing = await readEvents()
  const seen = new Set(existing.map((e) => `${e.chainId}:${e.transactionHash}:${e.logIndex}`))
  const added: ProtocolActivityEvent[] = []

  for (const log of logs) {
    if (deadline?.shouldStop()) break
    const blockNumber = parseInt(log.blockNumber, 16)
    const logIndex = parseInt(log.logIndex, 16)
    const key = `${MELEGA_CHAIN_ID}:${log.transactionHash}:${logIndex}`
    if (seen.has(key)) continue
    const topic = log.topics[0]?.toLowerCase()
    let eventType = 'Deposit'
    if (topic === MASTERCHEF_WITHDRAW_TOPIC.toLowerCase()) eventType = 'Withdraw'
    if (topic === MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC.toLowerCase()) eventType = 'EmergencyWithdraw'
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

  if (!aborted) {
    await saveCursor(window.toBlock)
  }

  return {
    added: added.length,
    scannedBlocks: window.toBlock - window.fromBlock + 1,
    source: 'masterchef' as const,
    partial: Boolean(aborted),
    fromBlock: window.fromBlock,
    toBlock: window.toBlock,
  }
}

export async function listProtocolActivityEvents(limit = 20): Promise<ProtocolActivityEvent[]> {
  const rows = await readEvents()
  return rows.slice(0, limit)
}
