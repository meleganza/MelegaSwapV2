#!/usr/bin/env node
/**
 * Generate the release snapshot of current MasterChef participants per PID.
 *
 * The candidate wallet set starts from the certified full event scan bundled
 * with the repository, is advanced to the current head, and is then checked
 * against MasterChef.userInfo(pid, wallet). Only counts are shipped to the UI.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Interface } from '@ethersproject/abi'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDirectory, '..')
const seedDirectory = path.join(webRoot, 'src', 'lib', 'bsc-indexer', 'seeds', 'farmer-participants')
const outputFile = path.join(webRoot, 'src', 'lib', 'yield-participants', 'yieldParticipants.generated.json')

const CHAIN_ID = 56
const MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'.toLowerCase()
const POOL_LENGTH_SELECTOR = '0x081e3eda'
const USER_INFO_SELECTOR = '0x93f1a40b'
const MULTICALL = '0xca11bde05977b3631167028862be2a173976ca11'
const multicallInterface = new Interface([
  'function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) payable returns (tuple(bool success,bytes returnData)[] returnData)',
])
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ACTIVITY_TOPICS = [
  '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15',
  '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568',
  '0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595',
]

const rpcUrl = process.env.BSC_RPC_URL || process.env.BSC_LOG_RPC_URL || ''
if (!rpcUrl) {
  console.error('BSC_RPC_URL (or BSC_LOG_RPC_URL) is required.')
  process.exit(1)
}

const logChunk = Math.max(100, Number(process.env.FARMS_PARTICIPANT_LOG_CHUNK || 5_000))
const concurrency = Math.max(1, Math.min(8, Number(process.env.FARMS_PARTICIPANT_CONCURRENCY || 4)))

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function atomicWriteJson(file, value) {
  const temporaryFile = `${file}.tmp`
  fs.writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temporaryFile, file)
}

function blockHex(value) {
  return `0x${Math.max(0, value).toString(16)}`
}

function addressFromTopic(topic) {
  const address = `0x${String(topic || '').slice(-40)}`.toLowerCase()
  return /^0x[0-9a-f]{40}$/.test(address) && address !== ZERO_ADDRESS ? address : null
}

async function rpc(payload) {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  })
  const body = await response.json()
  if (!response.ok || (!Array.isArray(body) && body.error)) {
    throw new Error((!Array.isArray(body) && body.error?.message) || `RPC HTTP ${response.status}`)
  }
  return body
}

async function rpcCall(method, params) {
  const body = await rpc({ jsonrpc: '2.0', id: 1, method, params })
  return body.result
}

async function advanceCandidateWallets(wallets, fromBlock, chainHead) {
  let cursor = fromBlock
  let chunk = logChunk
  while (cursor <= chainHead) {
    const end = Math.min(chainHead, cursor + chunk - 1)
    let logs
    try {
      logs = await rpcCall('eth_getLogs', [
        {
          address: MASTER_CHEF,
          fromBlock: blockHex(cursor),
          toBlock: blockHex(end),
          topics: [ACTIVITY_TOPICS],
        },
      ])
    } catch (error) {
      if (chunk > 50 && /limit|range|too many|exceed|timeout/i.test(String(error?.message || error))) {
        chunk = Math.max(50, Math.floor(chunk / 2))
        continue
      }
      throw error
    }
    for (const log of logs) {
      const wallet = addressFromTopic(log.topics?.[1])
      if (wallet) wallets.add(wallet)
    }
    cursor = end + 1
    if (logs.length < 100 && chunk < logChunk) chunk = Math.min(logChunk, chunk * 2)
  }
}

/**
 * Public BscScan transaction pages are the bounded fallback when public BNB
 * RPCs disable eth_getLogs. We only need senders since the certified seed
 * checkpoint; userInfo remains the on-chain authority for the final count.
 */
async function advanceCandidateWalletsFromBscScan(wallets, fromBlock) {
  const base = `https://bscscan.com/txs?a=${MASTER_CHEF}&ps=100`
  for (let page = 1; page <= 100; page += 1) {
    const response = await fetch(`${base}&p=${page}`, {
      headers: { 'user-agent': 'MelegaSwap participant release index/1.0' },
      signal: AbortSignal.timeout(60_000),
    })
    if (!response.ok) throw new Error(`BscScan HTTP ${response.status}`)
    const html = await response.text()
    const rows = html.match(/<tr>[\s\S]*?<\/tr>/gi) || []
    let oldestBlock = Number.POSITIVE_INFINITY
    let parsedRows = 0
    for (const row of rows) {
      const blockMatch = row.match(/href="\/block\/(\d+)"/i)
      if (!blockMatch) continue
      const blockNumber = Number(blockMatch[1])
      if (!Number.isFinite(blockNumber)) continue
      parsedRows += 1
      oldestBlock = Math.min(oldestBlock, blockNumber)
      if (blockNumber < fromBlock) continue
      const senderMatch = row.match(/data-highlight-target="(0x[0-9a-f]{40})"/i)
      const sender = senderMatch?.[1]?.toLowerCase()
      if (sender && sender !== ZERO_ADDRESS && sender !== MASTER_CHEF) wallets.add(sender)
    }
    if (!parsedRows) throw new Error(`BscScan page ${page} contained no transaction rows`)
    if (oldestBlock < fromBlock) return
  }
  throw new Error('BscScan recent transaction window did not reach the certified checkpoint')
}

function userInfoCalldata(pid, wallet) {
  return `${USER_INFO_SELECTOR}${pid.toString(16).padStart(64, '0')}${wallet.slice(2).padStart(64, '0')}`
}

function positiveUserInfo(result) {
  if (typeof result !== 'string' || result === '0x') return false
  try {
    return BigInt(`0x${result.slice(2, 66) || '0'}`) > 0n
  } catch {
    return false
  }
}

async function countCurrentParticipants(wallets, poolLength) {
  const counts = Array(poolLength).fill(0)
  let nextPid = 0
  let completed = 0

  async function worker() {
    while (nextPid < poolLength) {
      const pid = nextPid++
      const aggregateData = multicallInterface.encodeFunctionData('aggregate3', [
        wallets.map((wallet) => ({
          target: MASTER_CHEF,
          allowFailure: false,
          callData: userInfoCalldata(pid, wallet),
        })),
      ])
      let rawResult
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          rawResult = await rpcCall('eth_call', [
            { to: MULTICALL, data: aggregateData },
            // Official public BNB nodes prune historical state aggressively and
            // can reject the captured head with "missing trie node" while this
            // bounded scan is still running. Latest remains a factual live read.
            'latest',
          ])
          break
        } catch (error) {
          if (attempt === 4) throw error
          await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)))
        }
      }
      const [results] = multicallInterface.decodeFunctionResult('aggregate3', rawResult)
      for (const result of results) {
        if (!result.success) throw new Error(`MasterChef userInfo multicall failed for PID ${pid}`)
        if (positiveUserInfo(result.returnData)) counts[pid] += 1
      }
      completed += 1
      if (completed % 25 === 0 || completed === poolLength) {
        console.log(JSON.stringify({ pids: `${completed}/${poolLength}` }))
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return counts
}

const seedState = readJson(path.join(seedDirectory, 'state.json'))
const seedWallets = readJson(path.join(seedDirectory, 'wallets.json'))
const candidates = new Set([...(seedWallets.all || []), ...(seedWallets.lp || [])].map((wallet) => wallet.toLowerCase()))
const chainHead = Number(BigInt(await rpcCall('eth_blockNumber', [])))

const candidateFromBlock = Number(seedState.lastIndexedBlock) + 1
try {
  await advanceCandidateWallets(candidates, candidateFromBlock, chainHead)
} catch (error) {
  console.warn(`RPC log catch-up unavailable; using bounded BscScan fallback: ${String(error?.message || error)}`)
  await advanceCandidateWalletsFromBscScan(candidates, candidateFromBlock)
}

const rawPoolLength = await rpcCall('eth_call', [
  { to: MASTER_CHEF, data: POOL_LENGTH_SELECTOR },
  blockHex(chainHead),
])
const poolLength = Number(BigInt(rawPoolLength || '0x0'))
if (!Number.isInteger(poolLength) || poolLength <= 0) throw new Error('Invalid MasterChef poolLength')

console.log(JSON.stringify({ chainHead, poolLength, candidateWallets: candidates.size }))
const counts = await countCurrentParticipants([...candidates].sort(), poolLength)
const finalChainHead = Number(BigInt(await rpcCall('eth_blockNumber', [])))
const updatedAt = new Date().toISOString()
const farms = {}
for (let pid = 0; pid < poolLength; pid += 1) {
  farms[`${CHAIN_ID}:${MASTER_CHEF}:${pid}`] = {
    participants: counts[pid],
    lastIndexedBlock: finalChainHead,
    chainHead: finalChainHead,
    updatedAt,
  }
}

const previous = readJson(outputFile)
const snapshot = {
  ...previous,
  schema: 'melega.yield-participants.v1',
  // This release completes Farms only. Preserve the global indexing state
  // until the separate SmartChef pool census is also populated.
  status: Object.keys(previous.pools || {}).length > 0 ? 'ready' : 'indexing',
  updatedAt,
  source: 'masterchef-smartchef-event-index',
  farms,
  pools: previous.pools || {},
}
atomicWriteJson(outputFile, snapshot)

console.log(
  JSON.stringify({
    status: snapshot.status,
    updatedAt,
    farms: Object.keys(farms).length,
    activeFarms: counts.filter((count) => count > 0).length,
    totalCurrentPositions: counts.reduce((sum, count) => sum + count, 0),
    outputFile,
  }),
)
