#!/usr/bin/env node
/**
 * Build the release participant snapshot used by Farms and Pools.
 *
 * Participants are wallets with a positive current position, reconstructed
 * from canonical Deposit / Withdraw / EmergencyWithdraw events. The generated
 * frontend artifact contains counts only; wallet addresses remain in the local
 * resumable state file and are never shipped to the browser.
 *
 *   BSC_LOG_RPC_URL=https://dedicated-archive-rpc \
 *     yarn workspace web yield:participants:backfill
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDirectory, '..')
const inventoryFile = path.join(webRoot, 'public', 'registry', 'pools-canonical-inventory.json')
const outputFile = path.join(webRoot, 'src', 'lib', 'yield-participants', 'yieldParticipants.generated.json')
const stateDirectory = path.join(webRoot, 'data', 'bsc-indexer', 'yield-participants')
const stateFile = path.join(stateDirectory, 'state.json')

const CHAIN_ID = 56
const MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'.toLowerCase()
const MASTER_CHEF_DEPLOYMENT_BLOCK = 20_330_833
const MASTER_CHEF_POOL_LENGTH_SELECTOR = '0x081e3eda'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const FARM_TOPICS = {
  deposit: '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15',
  withdraw: '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568',
  emergency: '0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595',
}

const POOL_TOPICS = {
  deposit: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
  withdraw: '0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364',
  emergency: '0x5fafa99d0643513820be26656b45130b01e1c03062e1266bf36f88cbd3bd9695',
}

const rpcUrl = process.env.BSC_LOG_RPC_URL || process.env.BSC_RPC_URL || ''
if (!rpcUrl) {
  console.error('BSC_LOG_RPC_URL (or BSC_RPC_URL) is required; use an archive/log-capable dedicated endpoint.')
  process.exit(1)
}

const configuredChunk = Math.max(100, Number(process.env.YIELD_PARTICIPANT_CHUNK || 25_000))
const minimumChunk = Math.max(1, Number(process.env.YIELD_PARTICIPANT_MIN_CHUNK || 100))
const requestDelayMs = Math.max(0, Number(process.env.YIELD_PARTICIPANT_DELAY_MS || 20))
const mode = String(process.env.YIELD_PARTICIPANT_MODE || 'all').toLowerCase()
const includeFarms = mode === 'all' || mode === 'farms'
const includePools = mode === 'all' || mode === 'pools'

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function atomicWriteJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temporaryFile = `${file}.tmp`
  fs.writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temporaryFile, file)
}

async function rpc(method, params) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(60_000),
  })
  const body = await response.json()
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || `RPC HTTP ${response.status}`)
  }
  return body.result
}

function blockHex(value) {
  return `0x${Math.max(0, value).toString(16)}`
}

function addressFromTopic(topic) {
  const address = `0x${String(topic || '').slice(-40)}`.toLowerCase()
  return /^0x[0-9a-f]{40}$/.test(address) && address !== ZERO_ADDRESS ? address : null
}

function uintFromData(data) {
  try {
    const word = String(data || '0x0').slice(0, 66)
    return BigInt(word || '0x0')
  } catch {
    return 0n
  }
}

function eventKind(topic, topics) {
  const normalized = String(topic || '').toLowerCase()
  if (normalized === topics.deposit) return 'deposit'
  if (normalized === topics.withdraw) return 'withdraw'
  if (normalized === topics.emergency) return 'emergency'
  return null
}

function updatePosition(positions, key, kind, amount) {
  const current = BigInt(positions[key] || '0')
  if (kind === 'deposit') positions[key] = (current + amount).toString()
  if (kind === 'withdraw') positions[key] = (current > amount ? current - amount : 0n).toString()
  if (kind === 'emergency') positions[key] = '0'
}

function sortLogs(logs) {
  return logs.sort((left, right) => {
    const blockDelta = Number(BigInt(left.blockNumber || '0x0') - BigInt(right.blockNumber || '0x0'))
    if (blockDelta !== 0) return blockDelta
    return Number(BigInt(left.logIndex || '0x0') - BigInt(right.logIndex || '0x0'))
  })
}

function retryableRangeError(error) {
  return /block range|limit|too many|response size|query returned more|exceed|timeout|timed out|413|429/i.test(
    String(error?.message || error),
  )
}

async function scanAddress({ address, fromBlock, toBlock, topics, onLogs, checkpoint }) {
  if (fromBlock > toBlock) return toBlock
  let cursor = fromBlock
  let chunk = configuredChunk

  while (cursor <= toBlock) {
    const end = Math.min(toBlock, cursor + chunk - 1)
    try {
      const logs = await rpc('eth_getLogs', [
        {
          address,
          fromBlock: blockHex(cursor),
          toBlock: blockHex(end),
          topics: [[topics.deposit, topics.withdraw, topics.emergency]],
        },
      ])
      onLogs(sortLogs(logs))
      cursor = end + 1
      checkpoint(end)
      if (logs.length < 100 && chunk < configuredChunk) chunk = Math.min(configuredChunk, chunk * 2)
      if (requestDelayMs) await new Promise((resolve) => setTimeout(resolve, requestDelayMs))
    } catch (error) {
      if (chunk > minimumChunk && retryableRangeError(error)) {
        chunk = Math.max(minimumChunk, Math.floor(chunk / 2))
        continue
      }
      throw error
    }
  }
  return toBlock
}

function emptyState() {
  return {
    schema: 'melega.yield-participant-backfill.v1',
    chainId: CHAIN_ID,
    chainHead: 0,
    farms: { lastIndexedBlock: MASTER_CHEF_DEPLOYMENT_BLOCK - 1, poolLength: null, positions: {} },
    pools: {},
    errors: {},
    updatedAt: null,
  }
}

const state = readJson(stateFile, emptyState())
const inventory = readJson(inventoryFile, { results: [] })
const chainHead = Number.parseInt(await rpc('eth_blockNumber', []), 16)
state.chainHead = chainHead

function persistState() {
  state.updatedAt = new Date().toISOString()
  atomicWriteJson(stateFile, state)
}

if (includeFarms) {
  console.log(`Farms: ${state.farms.lastIndexedBlock + 1} -> ${chainHead}`)
  await scanAddress({
    address: MASTER_CHEF,
    fromBlock: Math.max(MASTER_CHEF_DEPLOYMENT_BLOCK, state.farms.lastIndexedBlock + 1),
    toBlock: chainHead,
    topics: FARM_TOPICS,
    onLogs: (logs) => {
      for (const log of logs) {
        const user = addressFromTopic(log.topics?.[1])
        const kind = eventKind(log.topics?.[0], FARM_TOPICS)
        if (!user || !kind) continue
        let pid
        try {
          pid = Number(BigInt(log.topics?.[2] || '0x0'))
        } catch {
          continue
        }
        updatePosition(state.farms.positions, `${pid}:${user}`, kind, uintFromData(log.data))
      }
    },
    checkpoint: (block) => {
      state.farms.lastIndexedBlock = block
      persistState()
    },
  })
  const rawPoolLength = await rpc('eth_call', [
    { to: MASTER_CHEF, data: MASTER_CHEF_POOL_LENGTH_SELECTOR },
    blockHex(chainHead),
  ])
  state.farms.poolLength = Number(BigInt(rawPoolLength || '0x0'))
  delete state.errors.farms
  persistState()
}

const poolInventory = new Map()
for (const row of inventory.results || []) {
  if (Number(row.chain) !== CHAIN_ID) continue
  const contract = String(row.contract || '').toLowerCase()
  if (!/^0x[0-9a-f]{40}$/.test(contract) || contract === MASTER_CHEF) continue
  const startBlock = Number(row.startBlock)
  if (!Number.isFinite(startBlock) || startBlock <= 0) continue
  const previous = poolInventory.get(contract)
  poolInventory.set(contract, previous ? Math.min(previous, startBlock) : startBlock)
}

if (includePools) {
  let poolNumber = 0
  for (const [contract, startBlock] of poolInventory) {
    poolNumber += 1
    const poolState = state.pools[contract] || { lastIndexedBlock: startBlock - 1, positions: {} }
    state.pools[contract] = poolState
    try {
      console.log(
        `Pool ${poolNumber}/${poolInventory.size}: ${contract} ${poolState.lastIndexedBlock + 1} -> ${chainHead}`,
      )
      await scanAddress({
        address: contract,
        fromBlock: Math.max(startBlock, poolState.lastIndexedBlock + 1),
        toBlock: chainHead,
        topics: POOL_TOPICS,
        onLogs: (logs) => {
          for (const log of logs) {
            const user = addressFromTopic(log.topics?.[1])
            const kind = eventKind(log.topics?.[0], POOL_TOPICS)
            if (!user || !kind) continue
            updatePosition(poolState.positions, user, kind, uintFromData(log.data))
          }
        },
        checkpoint: (block) => {
          poolState.lastIndexedBlock = block
          persistState()
        },
      })
      delete state.errors[contract]
    } catch (error) {
      state.errors[contract] = String(error?.message || error)
      persistState()
    }
  }
}

const updatedAt = new Date().toISOString()
const farmIndexComplete =
  state.farms.lastIndexedBlock >= chainHead && Number.isInteger(state.farms.poolLength) && state.farms.poolLength >= 0
const poolIndexComplete = [...poolInventory.keys()].every(
  (contract) => state.pools[contract]?.lastIndexedBlock >= chainHead,
)
const relevantErrors = [
  state.errors.farms,
  ...[...poolInventory.keys()].map((contract) => state.errors[contract]),
].filter(Boolean)
const snapshot = {
  schema: 'melega.yield-participants.v1',
  status: farmIndexComplete && poolIndexComplete && relevantErrors.length === 0 ? 'ready' : 'indexing',
  updatedAt,
  source: 'masterchef-smartchef-event-index',
  farms: {},
  pools: {},
}

const participantsByPid = new Map()
const farmPids = new Set()
if (farmIndexComplete) {
  for (const [positionKey, rawAmount] of Object.entries(state.farms.positions)) {
    const separator = positionKey.indexOf(':')
    const pid = Number(positionKey.slice(0, separator))
    if (!Number.isInteger(pid)) continue
    if (BigInt(rawAmount) > 0n) participantsByPid.set(pid, (participantsByPid.get(pid) || 0) + 1)
  }
  // A PID with no events is still a fully indexed farm with zero active
  // participants. poolLength prevents that valid zero from being confused with
  // a missing/incomplete entity.
  for (let pid = 0; pid < state.farms.poolLength; pid += 1) farmPids.add(pid)
  for (const pid of farmPids) {
    snapshot.farms[`${CHAIN_ID}:${MASTER_CHEF}:${pid}`] = {
      participants: participantsByPid.get(pid) || 0,
      lastIndexedBlock: state.farms.lastIndexedBlock,
      chainHead,
      updatedAt,
    }
  }
}

for (const [contract, poolState] of Object.entries(state.pools)) {
  if (poolState.lastIndexedBlock < chainHead) continue
  const participants = Object.values(poolState.positions).filter((amount) => BigInt(amount) > 0n).length
  snapshot.pools[`${CHAIN_ID}:${contract}`] = {
    participants,
    lastIndexedBlock: poolState.lastIndexedBlock,
    chainHead,
    updatedAt,
  }
}

// Manual MARCO is MasterChef PID 0 exposed through the Pools surface.
const manualFarm = snapshot.farms[`${CHAIN_ID}:${MASTER_CHEF}:0`]
if (manualFarm) snapshot.pools[`${CHAIN_ID}:${MASTER_CHEF}`] = { ...manualFarm }

persistState()
atomicWriteJson(outputFile, snapshot)
console.log(
  JSON.stringify(
    {
      status: snapshot.status,
      chainHead,
      farms: Object.keys(snapshot.farms).length,
      pools: Object.keys(snapshot.pools).length,
      errors: Object.keys(state.errors).length,
      outputFile,
    },
    null,
    2,
  ),
)

process.exit(snapshot.status === 'ready' ? 0 : 3)
