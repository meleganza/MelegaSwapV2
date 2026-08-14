#!/usr/bin/env node
/**
 * Refresh the release snapshot for the BSC SmartChef pools currently exposed
 * by the Pools page. This runs during the Vercel build, where server-only RPC
 * and explorer credentials are available. Wallet addresses are held in memory
 * only; the generated artifact contains aggregate counts.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDirectory, '..')
const snapshotFile = path.join(webRoot, 'src', 'lib', 'yield-participants', 'yieldParticipants.generated.json')

const CHAIN_ID = 56
const MASTER_CHEF = '0x41d5487836452d23f2c467070244e5842b412794'
const RPC_URL = (process.env.BSC_RPC_URL || process.env.BSC_RPC_FALLBACK_URL || '').trim()
const BSCSCAN_API_KEY = (process.env.BSCSCAN_API_KEY || '').trim()
const BSCSCAN_API_URL = (process.env.BSCSCAN_API_URL || 'https://api.etherscan.io/v2/api').trim()
const PAGE_SIZE = 1000
const MAX_PAGES = 100

const TOPICS = {
  deposit: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
  withdraw: '0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364',
  emergency: '0x5fafa99d0643513820be26656b45130b01e1c03062e1266bf36f88cbd3bd9695',
}

// Canonical BSC SmartChef contracts currently published by the global Pools
// inventory. Start blocks come from pools-canonical-inventory.json.
const ACTIVE_BSC_POOLS = [
  ['0x9217d2bbdfe7ce23beaf4140d130c110e9ed6c7b', 41_304_978],
  ['0x46d2f9a96cbbddc7e73678c716a088fe5714a19a', 89_679_461],
  ['0xa81d9de67407269b7aa4c327f097edf50552a050', 55_483_928],
  ['0x1cd6e5d17c50aeadf9a076f7e59f1c9a0661ead8', 89_679_461],
  ['0x8675b64b606775d6f91d04f90736e3055bab9174', 89_677_284],
  ['0xed733d857f6c5eb082a1ca271317aeee725a5a21', 89_677_284],
  ['0x2bd7d2a773b525133c9a87910ae6baf8159d9484', 89_677_284],
  ['0x99a44d26defb3f0a5b4e306ce45538c66c05b69e', 89_681_294],
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function addressFromTopic(topic) {
  const address = `0x${String(topic || '').slice(-40)}`.toLowerCase()
  return /^0x[0-9a-f]{40}$/.test(address) && !/^0x0{40}$/.test(address) ? address : null
}

function amountFromData(data) {
  try {
    return BigInt(String(data || '0x0').slice(0, 66) || '0x0')
  } catch {
    return 0n
  }
}

function numberFromHex(value) {
  try {
    return Number(BigInt(value || '0x0'))
  } catch {
    return 0
  }
}

export function applySmartChefParticipantEvent(positions, kind, log) {
  const user = addressFromTopic(log.topics?.[1])
  if (!user) return
  const current = positions.get(user) || 0n
  const amount = amountFromData(log.data)
  if (kind === 'deposit') positions.set(user, current + amount)
  if (kind === 'withdraw') positions.set(user, current > amount ? current - amount : 0n)
  if (kind === 'emergency') positions.set(user, 0n)
}

async function rpc(method, params) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(30_000),
  })
  const body = await response.json()
  if (!response.ok || body.error) throw new Error(body.error?.message || `RPC HTTP ${response.status}`)
  return body.result
}

async function fetchTopicLogs(address, fromBlock, toBlock, topic0) {
  const rows = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(BSCSCAN_API_URL)
    if (url.hostname === 'api.etherscan.io') url.searchParams.set('chainid', String(CHAIN_ID))
    url.searchParams.set('module', 'logs')
    url.searchParams.set('action', 'getLogs')
    url.searchParams.set('fromBlock', String(fromBlock))
    url.searchParams.set('toBlock', String(toBlock))
    url.searchParams.set('address', address)
    url.searchParams.set('topic0', topic0)
    url.searchParams.set('page', String(page))
    url.searchParams.set('offset', String(PAGE_SIZE))
    url.searchParams.set('apikey', BSCSCAN_API_KEY)

    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
    const body = await response.json()
    const result = Array.isArray(body.result) ? body.result : []
    if (body.status === '0' && /no records found/i.test(String(body.message || body.result || ''))) break
    if (!response.ok || body.status !== '1' || !Array.isArray(body.result)) {
      throw new Error(String(body.result || body.message || `BscScan HTTP ${response.status}`))
    }
    rows.push(...result)
    if (result.length < PAGE_SIZE) break
    if (page === MAX_PAGES) throw new Error(`BscScan pagination limit reached for ${address}`)
    await sleep(240)
  }
  return rows
}

async function indexPool(address, startBlock, chainHead) {
  const batches = []
  for (const [kind, topic0] of Object.entries(TOPICS)) {
    batches.push({ kind, logs: await fetchTopicLogs(address, startBlock, chainHead, topic0) })
    await sleep(260)
  }
  const events = batches
    .flatMap(({ kind, logs }) => logs.map((log) => ({ kind, log })))
    .sort(
      (left, right) =>
        numberFromHex(left.log.blockNumber) - numberFromHex(right.log.blockNumber) ||
        numberFromHex(left.log.logIndex) - numberFromHex(right.log.logIndex),
    )
  const positions = new Map()
  for (const event of events) applySmartChefParticipantEvent(positions, event.kind, event.log)
  return [...positions.values()].filter((amount) => amount > 0n).length
}

async function main() {
  if (!RPC_URL || !BSCSCAN_API_KEY) {
    console.log(
      'Pools participant snapshot: server-only RPC/BscScan configuration unavailable; keeping honest pending state.',
    )
    return
  }

  try {
    const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'))
    const chainHead = numberFromHex(await rpc('eth_blockNumber', []))
    if (!chainHead) throw new Error('BSC chain head unavailable')
    const updatedAt = new Date().toISOString()
    const indexedPools = { ...(snapshot.pools || {}) }
    const manualMarco = snapshot.farms?.[`${CHAIN_ID}:${MASTER_CHEF}:0`]
    if (manualMarco) indexedPools[`${CHAIN_ID}:${MASTER_CHEF}`] = { ...manualMarco }

    for (const [address, startBlock] of ACTIVE_BSC_POOLS) {
      const participants = await indexPool(address, startBlock, chainHead)
      indexedPools[`${CHAIN_ID}:${address}`] = { participants, lastIndexedBlock: chainHead, chainHead, updatedAt }
      console.log(`Pools participant snapshot: ${address} -> ${participants}`)
      await sleep(260)
    }

    snapshot.updatedAt = updatedAt
    snapshot.pools = indexedPools
    fs.writeFileSync(snapshotFile, `${JSON.stringify(snapshot, null, 2)}\n`)
    console.log(
      `Pools participant snapshot: indexed ${ACTIVE_BSC_POOLS.length} BSC SmartChef contracts at ${chainHead}.`,
    )
  } catch (error) {
    // Participant indexing must never turn a data-provider outage into a broken
    // release. The committed snapshot deliberately renders "Indexing…".
    console.warn(`Pools participant snapshot unavailable: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
