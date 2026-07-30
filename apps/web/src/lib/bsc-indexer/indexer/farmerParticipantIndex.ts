/**
 * Durable, resumable MasterChef farmer-participant index.
 * Unique wallets with farm participation across canonical Melega MasterChef farms.
 */
import fs from 'fs'
import path from 'path'
import { MELEGA_CHAIN_ID, MELEGA_MASTERCHEF_BSC } from '../constants'
import { getBlockNumber, getLogsChunked, type RawLog } from '../rpc/chunkedLogs'
import {
  MASTERCHEF_ACTIVITY_TOPICS,
  MASTERCHEF_CANONICAL,
  MASTERCHEF_DEPOSIT_TOPIC,
  MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC,
  MASTERCHEF_WITHDRAW_TOPIC,
} from './masterchefTopics'
import certifiedSeedState from '../seeds/farmer-participants/state.json'
import certifiedSeedWallets from '../seeds/farmer-participants/wallets.json'

const ZERO = '0x0000000000000000000000000000000000000000'
const SYSTEM_EXCLUDE = new Set<string>([ZERO, MELEGA_MASTERCHEF_BSC.toLowerCase()])

const INDEX_DIR = () =>
  process.env.FARMS_FARMER_INDEX_DIR ||
  path.join(process.cwd(), 'data', 'bsc-indexer', 'farmer-participants')

const STATE_FILE = () => path.join(INDEX_DIR(), 'state.json')
const WALLETS_FILE = () => path.join(INDEX_DIR(), 'wallets.json')

export type FarmerIndexStatus = 'idle' | 'indexing' | 'ready' | 'unavailable' | 'error'

export interface FarmerParticipantState {
  schema: 'melega.farms.farmer-participants.v1'
  chainId: number
  masterChef: string
  deploymentBlock: number
  creationTx: string
  lastIndexedBlock: number
  chainHead: number
  coveragePct: number
  status: FarmerIndexStatus
  uniqueParticipants: number
  uniqueLpParticipants: number
  historicalParticipants: number
  currentlyStakedWallets: number | null
  depositEventCount: number
  withdrawEventCount: number
  emergencyWithdrawEventCount: number
  rangesScanned: number
  lastError: string | null
  updatedAt: string
  source: 'masterchef-event-scan'
  note: string
}

export interface FarmerIndexAdvanceResult {
  state: FarmerParticipantState
  advancedBlocks: number
  newWallets: number
  eventsThisRun: number
}

function ensureDir() {
  fs.mkdirSync(INDEX_DIR(), { recursive: true })
}

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    return null
  }
}

function writeJson(file: string, data: unknown) {
  ensureDir()
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function certifiedSeedFallbackState(): FarmerParticipantState | null {
  const seedState = certifiedSeedState as FarmerParticipantState
  const seedWallets = certifiedSeedWallets as { all?: string[]; lp?: string[] }
  if (!seedState?.uniqueParticipants || !Array.isArray(seedWallets?.all) || seedWallets.all.length === 0) return null
  return {
    ...seedState,
    note: `${seedState.note || ''} · certified seed (in-memory fallback)`.trim(),
    updatedAt: new Date().toISOString(),
  }
}

function certifiedSeedFallbackWallets(): { all: string[]; lp: string[] } | null {
  const seedWallets = certifiedSeedWallets as { all?: string[]; lp?: string[] }
  if (!Array.isArray(seedWallets?.all) || seedWallets.all.length === 0) return null
  return { all: seedWallets.all, lp: Array.isArray(seedWallets.lp) ? seedWallets.lp : [] }
}

/**
 * When runtime index files are missing (Vercel/serverless cold start), copy the
 * certified seed into the runtime directory so KPIs can resolve factually.
 * Does not invent counts — seed is a prior full MasterChef scan artifact.
 *
 * Founder amendment P0-4: on a read-only or otherwise failing filesystem (e.g. a
 * frozen serverless bundle), the write is best-effort only — `loadFarmerParticipantState`
 * / `loadFarmerWallets` fall back to the certified seed in-memory regardless of
 * whether persistence succeeded, so a seed never degrades into a null skeleton.
 */
function hydrateRuntimeFromSeedIfMissing(): void {
  if (fs.existsSync(STATE_FILE()) && fs.existsSync(WALLETS_FILE())) return
  const seedState = certifiedSeedFallbackState()
  const seedWallets = certifiedSeedFallbackWallets()
  if (!seedState || !seedWallets) return
  try {
    ensureDir()
    if (!fs.existsSync(STATE_FILE())) {
      writeJson(STATE_FILE(), seedState)
    }
    if (!fs.existsSync(WALLETS_FILE())) {
      writeJson(WALLETS_FILE(), {
        all: seedWallets.all,
        lp: seedWallets.lp,
        updatedAt: seedState.updatedAt,
        source: 'certified-seed',
      })
    }
  } catch {
    // Filesystem write failed (read-only volume) — in-memory fallback in
    // loadFarmerParticipantState/loadFarmerWallets still serves the seed.
  }
}

function topicToAddress(topic?: string): string | null {
  if (!topic || topic.length < 66) return null
  const addr = `0x${topic.slice(26)}`.toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(addr)) return null
  if (SYSTEM_EXCLUDE.has(addr)) return null
  return addr
}

function topicToPid(topic?: string): number | null {
  if (!topic) return null
  try {
    return Number(BigInt(topic))
  } catch {
    return null
  }
}

function eventTypeFromTopic0(topic0: string): 'Deposit' | 'Withdraw' | 'EmergencyWithdraw' | null {
  const t = topic0.toLowerCase()
  if (t === MASTERCHEF_DEPOSIT_TOPIC.toLowerCase()) return 'Deposit'
  if (t === MASTERCHEF_WITHDRAW_TOPIC.toLowerCase()) return 'Withdraw'
  if (t === MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC.toLowerCase()) return 'EmergencyWithdraw'
  return null
}

function emptyState(chainHead = 0): FarmerParticipantState {
  const deploymentBlock = MASTERCHEF_CANONICAL.deploymentBlock
  return {
    schema: 'melega.farms.farmer-participants.v1',
    chainId: MELEGA_CHAIN_ID,
    masterChef: MELEGA_MASTERCHEF_BSC,
    deploymentBlock,
    creationTx: MASTERCHEF_CANONICAL.creationTx,
    lastIndexedBlock: deploymentBlock - 1,
    chainHead,
    coveragePct: 0,
    status: 'idle',
    uniqueParticipants: 0,
    uniqueLpParticipants: 0,
    historicalParticipants: 0,
    currentlyStakedWallets: null,
    depositEventCount: 0,
    withdrawEventCount: 0,
    emergencyWithdrawEventCount: 0,
    rangesScanned: 0,
    lastError: null,
    updatedAt: new Date().toISOString(),
    source: 'masterchef-event-scan',
    note: 'Index not started',
  }
}

function coveragePct(lastIndexed: number, deployment: number, head: number): number {
  const span = Math.max(1, head - deployment + 1)
  const done = Math.max(0, Math.min(span, lastIndexed - deployment + 1))
  return Math.min(100, Math.round((done / span) * 10000) / 100)
}

function finalizeStatus(state: FarmerParticipantState): FarmerParticipantState {
  const lag = Math.max(0, state.chainHead - state.lastIndexedBlock)
  const nearHead = lag <= 2048
  // Catch-up lag after a complete prior scan: keep ready when we already have a
  // full-coverage unique set so KPIs do not flap to a permanent skeleton.
  const completeUniqueSet =
    state.uniqueParticipants > 0 && state.coveragePct >= 99.5 && state.rangesScanned > 0
  let status: FarmerIndexStatus = state.status
  if (state.lastError && state.rangesScanned === 0 && state.uniqueParticipants === 0) {
    status = 'error'
  } else if ((nearHead || completeUniqueSet) && state.coveragePct >= 99.5) {
    status = 'ready'
  } else if (state.lastIndexedBlock >= state.deploymentBlock) {
    status = 'indexing'
  } else if (state.status === 'idle') {
    status = 'idle'
  }
  const note =
    status === 'ready'
      ? completeUniqueSet && !nearHead
        ? `Unique wallets that participated in Melega DEX farms · catch-up from block ${state.lastIndexedBlock} (head ${state.chainHead}).`
        : 'Unique wallets that participated in Melega DEX farms (MasterChef Deposit/Withdraw/EmergencyWithdraw).'
      : status === 'indexing'
        ? `Indexing… ${state.coveragePct}% coverage · block ${state.lastIndexedBlock} / ${state.chainHead}`
        : status === 'error'
          ? state.lastError || 'Farmer index error'
          : 'Farmer participant index unavailable'

  return {
    ...state,
    status,
    historicalParticipants: state.uniqueParticipants,
    note,
    updatedAt: new Date().toISOString(),
  }
}

export function loadFarmerParticipantState(): FarmerParticipantState {
  hydrateRuntimeFromSeedIfMissing()
  const existing = readJson<FarmerParticipantState>(STATE_FILE())
  if (existing) return finalizeStatus(existing)
  // Runtime file still missing (e.g. write failed on a read-only filesystem) —
  // never fall back to an empty/null skeleton while a certified seed exists.
  const seedFallback = certifiedSeedFallbackState()
  if (seedFallback) return finalizeStatus(seedFallback)
  return emptyState()
}

export function loadFarmerWallets(): { all: string[]; lp: string[] } {
  hydrateRuntimeFromSeedIfMissing()
  const raw = readJson<{ all?: string[]; lp?: string[] }>(WALLETS_FILE())
  if (raw && Array.isArray(raw.all) && raw.all.length > 0) {
    return { all: raw.all, lp: Array.isArray(raw.lp) ? raw.lp : [] }
  }
  const seedFallback = certifiedSeedFallbackWallets()
  if (seedFallback) return seedFallback
  return { all: [], lp: [] }
}

function persist(state: FarmerParticipantState, wallets: { all: Set<string>; lp: Set<string> }) {
  const next = finalizeStatus({
    ...state,
    uniqueParticipants: wallets.all.size,
    uniqueLpParticipants: wallets.lp.size,
    historicalParticipants: wallets.all.size,
  })
  writeJson(STATE_FILE(), next)
  writeJson(WALLETS_FILE(), {
    all: [...wallets.all].sort(),
    lp: [...wallets.lp].sort(),
    updatedAt: next.updatedAt,
  })
  return next
}

function ingestLogs(
  logs: RawLog[],
  wallets: { all: Set<string>; lp: Set<string> },
  counters: { deposit: number; withdraw: number; emergency: number },
) {
  for (const log of logs) {
    const type = eventTypeFromTopic0(log.topics?.[0] || '')
    if (!type) continue
    const user = topicToAddress(log.topics?.[1])
    const pid = topicToPid(log.topics?.[2])
    if (!user) continue
    wallets.all.add(user)
    if (pid != null && pid > 0) wallets.lp.add(user)
    if (type === 'Deposit') counters.deposit += 1
    else if (type === 'Withdraw') counters.withdraw += 1
    else counters.emergency += 1
  }
}

/**
 * Advance the index by scanning up to `maxBlocks` from the checkpoint toward chain head.
 * Persists after every successful chunk for crash-safe resume.
 */
export async function advanceFarmerParticipantIndex(options?: {
  maxBlocks?: number
  chunkSize?: number
  rpcUrls?: string[]
  shouldAbort?: () => boolean
}): Promise<FarmerIndexAdvanceResult> {
  const maxBlocks = options?.maxBlocks ?? 500_000
  const chunkSize = options?.chunkSize ?? 10_000
  let state = loadFarmerParticipantState()
  const loaded = loadFarmerWallets()
  const wallets = {
    all: new Set(loaded.all.map((w) => w.toLowerCase())),
    lp: new Set(loaded.lp.map((w) => w.toLowerCase())),
  }
  const counters = {
    deposit: state.depositEventCount,
    withdraw: state.withdrawEventCount,
    emergency: state.emergencyWithdrawEventCount,
  }

  let chainHead = state.chainHead
  try {
    chainHead = await getBlockNumber(options?.rpcUrls)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    state = persist({ ...state, status: 'error', lastError: msg, chainHead }, wallets)
    return { state, advancedBlocks: 0, newWallets: 0, eventsThisRun: 0 }
  }

  const startCursor = Math.max(state.deploymentBlock, state.lastIndexedBlock + 1)
  const hardEnd = Math.min(chainHead, startCursor + maxBlocks - 1)
  if (startCursor > chainHead) {
    state = persist(
      {
        ...state,
        chainHead,
        coveragePct: coveragePct(state.lastIndexedBlock, state.deploymentBlock, chainHead),
        lastError: null,
      },
      wallets,
    )
    return { state, advancedBlocks: 0, newWallets: 0, eventsThisRun: 0 }
  }

  const before = wallets.all.size
  let eventsThisRun = 0
  let cursor = startCursor

  try {
    while (cursor <= hardEnd) {
      if (options?.shouldAbort?.()) break
      const end = Math.min(cursor + chunkSize - 1, hardEnd)
      const { logs } = await getLogsChunked({
        address: MELEGA_MASTERCHEF_BSC,
        topics: [MASTERCHEF_ACTIVITY_TOPICS as unknown as string[]],
        fromBlock: cursor,
        toBlock: end,
        initialChunk: chunkSize,
        rpcUrls: options?.rpcUrls,
      })
      eventsThisRun += logs.length
      ingestLogs(logs, wallets, counters)
      cursor = end + 1
      state = persist(
        {
          ...state,
          chainHead,
          lastIndexedBlock: end,
          coveragePct: coveragePct(end, state.deploymentBlock, chainHead),
          depositEventCount: counters.deposit,
          withdrawEventCount: counters.withdraw,
          emergencyWithdrawEventCount: counters.emergency,
          rangesScanned: state.rangesScanned + 1,
          lastError: null,
          status: 'indexing',
        },
        wallets,
      )
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    state = persist(
      {
        ...state,
        chainHead,
        lastError: msg,
        status: 'error',
        coveragePct: coveragePct(state.lastIndexedBlock, state.deploymentBlock, chainHead),
      },
      wallets,
    )
  }

  return {
    state: loadFarmerParticipantState(),
    advancedBlocks: Math.max(0, loadFarmerParticipantState().lastIndexedBlock - (startCursor - 1)),
    newWallets: wallets.all.size - before,
    eventsThisRun,
  }
}

/** Public snapshot for API / KPI. Never invents a ready zero while incomplete. */
export function getFarmerParticipantSnapshot(): FarmerParticipantState & {
  primaryCount: number | null
  primaryLabel: string
  displayValue: string | null
  displayState: 'loading' | 'available' | 'unavailable' | 'zero'
} {
  const state = loadFarmerParticipantState()
  const primaryLabel = 'Unique wallets that participated in Melega DEX farms'
  // Surface a factual non-zero unique set even while catch-up indexing —
  // never a fabricated zero, never a permanent null skeleton when seed/runtime has count.
  if (
    (state.status === 'indexing' || state.status === 'idle') &&
    state.uniqueParticipants > 0 &&
    state.coveragePct >= 99.5
  ) {
    return {
      ...state,
      status: 'ready',
      primaryCount: state.uniqueParticipants,
      primaryLabel,
      displayValue: String(state.uniqueParticipants),
      displayState: 'available',
    }
  }
  if (state.status === 'indexing' || state.status === 'idle') {
    return {
      ...state,
      primaryCount: state.uniqueParticipants > 0 ? state.uniqueParticipants : null,
      primaryLabel,
      displayValue: state.uniqueParticipants > 0 ? String(state.uniqueParticipants) : null,
      displayState: state.uniqueParticipants > 0 ? 'available' : 'loading',
    }
  }
  if (state.status === 'ready') {
    return {
      ...state,
      primaryCount: state.uniqueParticipants,
      primaryLabel,
      displayValue: String(state.uniqueParticipants),
      displayState: state.uniqueParticipants === 0 ? 'zero' : 'available',
    }
  }
  return {
    ...state,
    primaryCount: null,
    primaryLabel,
    displayValue: null,
    displayState: 'unavailable',
  }
}

export function isExcludedFarmerAddress(addr: string): boolean {
  return SYSTEM_EXCLUDE.has(addr.toLowerCase())
}

export function decodeFarmerLog(log: RawLog): {
  type: 'Deposit' | 'Withdraw' | 'EmergencyWithdraw'
  user: string
  pid: number
} | null {
  const type = eventTypeFromTopic0(log.topics?.[0] || '')
  const user = topicToAddress(log.topics?.[1])
  const pid = topicToPid(log.topics?.[2])
  if (!type || !user || pid == null) return null
  return { type, user, pid }
}
