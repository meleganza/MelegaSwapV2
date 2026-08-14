#!/usr/bin/env node
/**
 * Self-contained MasterChef farmer participant backfill (no TS loader required).
 *
 *   BSC_RPC_URL=... node scripts/farms-farmer-index-backfill.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '..')
const OUT = path.join(webRoot, 'data', 'bsc-indexer', 'farmer-participants')
const STATE = path.join(OUT, 'state.json')
const WALLETS = path.join(OUT, 'wallets.json')

const MC = '0x41D5487836452d23f2c467070244E5842B412794'
const DEPLOY = 20_330_833
const CREATION_TX = '0x3f270e4b4485d2a3023467a9cede6e8c39c5625250b10f2bcbfb01de80ee71f8'
const DEPOSIT = '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15'
const WITHDRAW = '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568'
const EMERGENCY = '0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595'
const TOPICS = [[DEPOSIT, WITHDRAW, EMERGENCY]]
const ZERO = '0x0000000000000000000000000000000000000000'
const EXCLUDE = new Set([ZERO, MC.toLowerCase()])

const rpc =
  process.env.BSC_RPC_URL ||
  process.env.BSC_RPC_FALLBACK_URL ||
  process.env.NEXT_PUBLIC_BSC_RPC_URL ||
  ''
if (!rpc) {
  console.error('BSC_RPC_URL required')
  process.exit(1)
}

const CHUNK = Number(process.env.FARMER_INDEX_CHUNK || 10_000)
const CONCURRENCY = Math.max(1, Number(process.env.FARMER_INDEX_CONCURRENCY || 6))
const TIME_BUDGET_MS = Number(process.env.FARMER_INDEX_TIME_MS || 3 * 60 * 60 * 1000)

function ensureDir() {
  fs.mkdirSync(OUT, { recursive: true })
}
function loadState() {
  if (!fs.existsSync(STATE)) {
    return {
      schema: 'melega.farms.farmer-participants.v1',
      chainId: 56,
      masterChef: MC,
      deploymentBlock: DEPLOY,
      creationTx: CREATION_TX,
      lastIndexedBlock: DEPLOY - 1,
      chainHead: 0,
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
  return JSON.parse(fs.readFileSync(STATE, 'utf8'))
}
function loadWallets() {
  if (!fs.existsSync(WALLETS)) return { all: new Set(), lp: new Set() }
  const raw = JSON.parse(fs.readFileSync(WALLETS, 'utf8'))
  return {
    all: new Set((raw.all || []).map((w) => w.toLowerCase())),
    lp: new Set((raw.lp || []).map((w) => w.toLowerCase())),
  }
}
function coverage(last, head) {
  const span = Math.max(1, head - DEPLOY + 1)
  const done = Math.max(0, Math.min(span, last - DEPLOY + 1))
  return Math.min(100, Math.round((done / span) * 10000) / 100)
}
function save(state, wallets) {
  ensureDir()
  const lag = Math.max(0, state.chainHead - state.lastIndexedBlock)
  const ready = lag <= 2048 && state.coveragePct >= 99.5
  state.status = ready ? 'ready' : 'indexing'
  state.uniqueParticipants = wallets.all.size
  state.uniqueLpParticipants = wallets.lp.size
  state.historicalParticipants = wallets.all.size
  state.updatedAt = new Date().toISOString()
  state.note = ready
    ? 'Unique wallets that participated in Melega DEX farms (MasterChef Deposit/Withdraw/EmergencyWithdraw).'
    : `Indexing… ${state.coveragePct}% coverage · block ${state.lastIndexedBlock} / ${state.chainHead}`
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2))
  fs.writeFileSync(
    WALLETS,
    JSON.stringify({ all: [...wallets.all].sort(), lp: [...wallets.lp].sort(), updatedAt: state.updatedAt }, null, 2),
  )
}

async function rpcCall(method, params) {
  const r = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(60_000),
  })
  const j = await r.json()
  if (j.error) throw new Error(JSON.stringify(j.error))
  return j.result
}

function decode(log) {
  const t0 = (log.topics?.[0] || '').toLowerCase()
  let type = null
  if (t0 === DEPOSIT) type = 'Deposit'
  else if (t0 === WITHDRAW) type = 'Withdraw'
  else if (t0 === EMERGENCY) type = 'EmergencyWithdraw'
  if (!type) return null
  const user = `0x${(log.topics[1] || '').slice(26)}`.toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(user) || EXCLUDE.has(user)) return null
  const pid = Number(BigInt(log.topics[2] || '0x0'))
  return { type, user, pid }
}

async function fetchRange(from, to) {
  let chunk = to - from + 1
  let cursor = from
  const logs = []
  while (cursor <= to) {
    const end = Math.min(cursor + chunk - 1, to)
    try {
      const batch = await rpcCall('eth_getLogs', [
        {
          address: MC,
          topics: TOPICS,
          fromBlock: '0x' + cursor.toString(16),
          toBlock: '0x' + end.toString(16),
        },
      ])
      logs.push(...batch)
      cursor = end + 1
    } catch (e) {
      const msg = String(e.message || e)
      if (chunk > 500 && /limit|range|too many|exceed/i.test(msg)) {
        chunk = Math.max(500, Math.floor(chunk / 2))
        continue
      }
      throw e
    }
  }
  return logs
}

const state = loadState()
const wallets = loadWallets()
const head = parseInt(await rpcCall('eth_blockNumber', []), 16)
state.chainHead = head
console.log(
  JSON.stringify({
    rpc: rpc.replace(/\/\/([^/@]+)@/, '//***@').slice(0, 64),
    head,
    resumeFrom: state.lastIndexedBlock + 1,
    deploy: DEPLOY,
    concurrency: CONCURRENCY,
    chunk: CHUNK,
  }),
)

const started = Date.now()
let cursor = Math.max(DEPLOY, state.lastIndexedBlock + 1)

while (cursor <= head) {
  if (Date.now() - started > TIME_BUDGET_MS) {
    console.log('TIME_BUDGET')
    break
  }
  const jobs = []
  for (let i = 0; i < CONCURRENCY && cursor <= head; i++) {
    const from = cursor
    const to = Math.min(cursor + CHUNK - 1, head)
    cursor = to + 1
    jobs.push(
      fetchRange(from, to).then((logs) => ({ from, to, logs })).catch((e) => ({ from, to, error: String(e.message || e) })),
    )
  }
  const results = await Promise.all(jobs)
  results.sort((a, b) => a.from - b.from)
  // Apply in order; stop at first error to keep contiguous checkpoint
  for (const r of results) {
    if (r.error) {
      state.lastError = r.error
      console.error('CHUNK_ERROR', r.from, r.to, r.error.slice(0, 120))
      // rewind cursor to failed from for resume
      cursor = r.from
      save(state, wallets)
      // brief backoff then continue loop
      await new Promise((res) => setTimeout(res, 1500))
      break
    }
    for (const log of r.logs) {
      const d = decode(log)
      if (!d) continue
      wallets.all.add(d.user)
      if (d.pid > 0) wallets.lp.add(d.user)
      if (d.type === 'Deposit') state.depositEventCount += 1
      else if (d.type === 'Withdraw') state.withdrawEventCount += 1
      else state.emergencyWithdrawEventCount += 1
    }
    state.lastIndexedBlock = r.to
    state.rangesScanned += 1
    state.coveragePct = coverage(state.lastIndexedBlock, head)
    state.lastError = null
    state.chainHead = head
  }
  save(state, wallets)
  if (state.rangesScanned % 10 === 0 || results.some((r) => (r.logs || []).length)) {
    console.log(
      JSON.stringify({
        lastIndexedBlock: state.lastIndexedBlock,
        coveragePct: state.coveragePct,
        unique: wallets.all.size,
        uniqueLp: wallets.lp.size,
        deposits: state.depositEventCount,
        withdraws: state.withdrawEventCount,
        emergency: state.emergencyWithdrawEventCount,
        elapsedSec: Math.round((Date.now() - started) / 1000),
      }),
    )
  }
}

// refresh head and finalize
const head2 = parseInt(await rpcCall('eth_blockNumber', []), 16)
state.chainHead = head2
state.coveragePct = coverage(state.lastIndexedBlock, head2)
save(state, wallets)
console.log('FINAL', JSON.stringify(state, null, 2))
process.exit(state.status === 'ready' ? 0 : 3)
