/**
 * Discover factual SmartChef position holders from on-chain Deposit/Withdraw logs
 * + eth_call userInfo verification. Excludes MasterChef (Farms domain).
 */
import { createRequire } from 'module'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const { utils, BigNumber } = require('/Users/marcomelega/Projects/MelegaSwapV2/node_modules/ethers')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
mkdirSync(OUT, { recursive: true })

const MASTERCHEF = '0x41d5487836452d23f2c467070244e5842b412794'
const RPC =
  process.env.BSC_RPC_URL ||
  process.env.BSC_LOG_RPC_URL ||
  readFileSync('/tmp/melega-qn-clean.txt', 'utf8').split('\n').filter(Boolean)[0]

const DEPOSIT = utils.id('Deposit(address,uint256)')
const WITHDRAW = utils.id('Withdraw(address,uint256)')
const EMERGENCY = utils.id('EmergencyWithdraw(address,uint256)')

const userInfoIface = new utils.Interface([
  'function userInfo(address) view returns (uint256 amount, uint256 rewardDebt)',
  'function pendingReward(address) view returns (uint256)',
  'function bonusEndBlock() view returns (uint256)',
  'function startBlock() view returns (uint256)',
  'function stakedToken() view returns (address)',
  'function rewardToken() view returns (address)',
  'function syrup() view returns (address)',
])

const CHUNK = Number(process.env.SCAN_CHUNK || 25000)
const MAX_POOLS = Number(process.env.MAX_POOLS || 0) // 0 = all
const CONCURRENCY = Number(process.env.CONCURRENCY || 4)

async function rpc(method, params) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body })
    const json = await res.json()
    if (!json.error) return json.result
    const msg = String(json.error.message || json.error)
    if (/rate|limit|429|timeout|busy/i.test(msg) && attempt < 5) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
      continue
    }
    throw new Error(`${method}: ${msg}`)
  }
}

function topicToAddress(topic) {
  if (!topic || topic.length < 66) return null
  return utils.getAddress('0x' + topic.slice(26))
}

function decodeAmount(data) {
  try {
    return BigNumber.from(data).toString()
  } catch {
    return '0'
  }
}

async function getLogsChunked(address, fromBlock, toBlock, topic) {
  const logs = []
  let from = fromBlock
  while (from <= toBlock) {
    const to = Math.min(from + CHUNK - 1, toBlock)
    let attemptFrom = from
    let attemptTo = to
    for (;;) {
      try {
        const part = await rpc('eth_getLogs', [
          {
            address,
            fromBlock: utils.hexValue(attemptFrom),
            toBlock: utils.hexValue(attemptTo),
            topics: [topic],
          },
        ])
        logs.push(...(part || []))
        break
      } catch (e) {
        const msg = String(e.message || e)
        if (/limit|range|too many|response size/i.test(msg) && attemptTo > attemptFrom) {
          attemptTo = attemptFrom + Math.max(1, Math.floor((attemptTo - attemptFrom) / 2))
          continue
        }
        throw e
      }
    }
    from = to + 1
  }
  return logs
}

async function mapPool(limit, items, fn) {
  const results = []
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

const registry = JSON.parse(
  readFileSync(
    path.join(__dirname, '../../../public/registry/onchain/bsc-mainnet.json'),
    'utf8',
  ),
)

let pools = (registry.smartChef?.pools || []).filter(
  (p) => String(p.contractAddress).toLowerCase() !== MASTERCHEF,
)
// Prefer recently ended / with numeric startBlock
pools = pools
  .map((p) => ({
    ...p,
    start: Number(p.startBlock) || 0,
    end: Number(p.endBlock) || 0,
  }))
  .filter((p) => p.start > 0)
  .sort((a, b) => b.end - a.end)

if (MAX_POOLS > 0) pools = pools.slice(0, MAX_POOLS)

const latestHex = await rpc('eth_blockNumber', [])
const latest = parseInt(latestHex, 16)

console.log(
  JSON.stringify({
    rpcHost: new URL(RPC).host,
    pools: pools.length,
    latest,
    chunk: CHUNK,
  }),
)

const scanReport = {
  mission: 'MELEGA_DEX_V1_POOLS_WALLET_FIXTURE_DISCOVERY_AND_3_CYCLE_UNBLOCK',
  scannedAt: new Date().toISOString(),
  latestBlock: latest,
  masterChefExcluded: MASTERCHEF,
  poolsScanned: 0,
  depositEvents: 0,
  withdrawEvents: 0,
  emergencyEvents: 0,
  candidatesEvaluated: 0,
  pools: [],
  failures: [],
}

const net = new Map() // key wallet|pool -> {dep,wd,em}

await mapPool(CONCURRENCY, pools, async (pool) => {
  const address = utils.getAddress(pool.contractAddress)
  const fromBlock = pool.start
  const toBlock = Math.min(latest, pool.end > 0 ? pool.end + 500000 : latest)
  const entry = {
    contractAddress: address,
    sousId: pool.sousId,
    poolName: pool.poolName,
    stakedToken: pool.stakedToken,
    rewardToken: pool.rewardToken,
    startBlock: fromBlock,
    endBlock: pool.end || null,
    active: pool.active,
    state: pool.state,
    scanFrom: fromBlock,
    scanTo: toBlock,
    deposits: 0,
    withdraws: 0,
    emergencies: 0,
    uniqueDepositors: 0,
    error: null,
  }
  try {
    const [dLogs, wLogs, eLogs] = await Promise.all([
      getLogsChunked(address, fromBlock, toBlock, DEPOSIT),
      getLogsChunked(address, fromBlock, toBlock, WITHDRAW),
      getLogsChunked(address, fromBlock, toBlock, EMERGENCY),
    ])
    entry.deposits = dLogs.length
    entry.withdraws = wLogs.length
    entry.emergencies = eLogs.length
    scanReport.depositEvents += dLogs.length
    scanReport.withdrawEvents += wLogs.length
    scanReport.emergencyEvents += eLogs.length

    const users = new Set()
    for (const log of dLogs) {
      const user = topicToAddress(log.topics[1])
      if (!user) continue
      users.add(user)
      const key = `${user.toLowerCase()}|${address.toLowerCase()}`
      const cur = net.get(key) || {
        wallet: user,
        smartChef: address,
        sousId: pool.sousId,
        poolName: pool.poolName,
        stakedToken: pool.stakedToken,
        rewardToken: pool.rewardToken,
        state: pool.state,
        active: Boolean(pool.active),
        deposits: BigNumber.from(0),
        withdraws: BigNumber.from(0),
        emergencies: BigNumber.from(0),
        sourceBlocks: { firstDeposit: null, lastEvent: null },
      }
      cur.deposits = cur.deposits.add(decodeAmount(log.data))
      const bn = parseInt(log.blockNumber, 16)
      if (cur.sourceBlocks.firstDeposit == null || bn < cur.sourceBlocks.firstDeposit)
        cur.sourceBlocks.firstDeposit = bn
      cur.sourceBlocks.lastEvent = Math.max(cur.sourceBlocks.lastEvent || 0, bn)
      net.set(key, cur)
    }
    for (const log of wLogs) {
      const user = topicToAddress(log.topics[1])
      if (!user) continue
      const key = `${user.toLowerCase()}|${address.toLowerCase()}`
      const cur = net.get(key)
      if (!cur) continue
      cur.withdraws = cur.withdraws.add(decodeAmount(log.data))
      cur.sourceBlocks.lastEvent = Math.max(
        cur.sourceBlocks.lastEvent || 0,
        parseInt(log.blockNumber, 16),
      )
    }
    for (const log of eLogs) {
      const user = topicToAddress(log.topics[1])
      if (!user) continue
      const key = `${user.toLowerCase()}|${address.toLowerCase()}`
      const cur = net.get(key)
      if (!cur) continue
      cur.emergencies = cur.emergencies.add(decodeAmount(log.data))
      cur.sourceBlocks.lastEvent = Math.max(
        cur.sourceBlocks.lastEvent || 0,
        parseInt(log.blockNumber, 16),
      )
    }
    entry.uniqueDepositors = users.size
    if (dLogs.length) console.log('pool hits', pool.sousId, address.slice(0, 10), 'deposits', dLogs.length)
  } catch (e) {
    entry.error = String(e.message || e)
    scanReport.failures.push({ pool: address, error: entry.error })
    console.warn('pool fail', address, entry.error)
  }
  scanReport.pools.push(entry)
  scanReport.poolsScanned++
})

// Prefer positive netPrincipal candidates, then verify on-chain userInfo
const candidates = [...net.values()]
  .map((c) => {
    const netPrincipal = c.deposits.sub(c.withdraws).sub(c.emergencies)
    return {
      ...c,
      deposits: c.deposits.toString(),
      withdraws: c.withdraws.toString(),
      emergencies: c.emergencies.toString(),
      netPrincipalFromEvents: netPrincipal.toString(),
      netPositive: netPrincipal.gt(0),
    }
  })
  .filter((c) => c.netPositive)
  .sort((a, b) => {
    // active first, then larger principal
    if (a.active !== b.active) return a.active ? -1 : 1
    const d = BigNumber.from(b.netPrincipalFromEvents).sub(a.netPrincipalFromEvents)
    return d.gt(0) ? 1 : d.lt(0) ? -1 : 0
  })

scanReport.candidatesEvaluated = candidates.length
console.log('net-positive event candidates', candidates.length)

const verified = []
const verifyFailures = []

for (const c of candidates.slice(0, 80)) {
  try {
    const data = userInfoIface.encodeFunctionData('userInfo', [c.wallet])
    const raw = await rpc('eth_call', [{ to: c.smartChef, data }, 'latest'])
    const [amount, rewardDebt] = userInfoIface.decodeFunctionResult('userInfo', raw)
    let pending = null
    try {
      const pdata = userInfoIface.encodeFunctionData('pendingReward', [c.wallet])
      const praw = await rpc('eth_call', [{ to: c.smartChef, data: pdata }, 'latest'])
      pending = userInfoIface.decodeFunctionResult('pendingReward', praw)[0].toString()
    } catch {
      pending = null
    }
    const row = {
      wallet: c.wallet,
      smartChef: c.smartChef,
      sousId: c.sousId,
      poolName: c.poolName,
      stakedToken: c.stakedToken,
      rewardToken: c.rewardToken,
      active: c.active,
      state: c.state,
      onChainPrincipal: amount.toString(),
      rewardDebt: rewardDebt.toString(),
      claimableReward: pending,
      netPrincipalFromEvents: c.netPrincipalFromEvents,
      sourceBlocks: c.sourceBlocks,
      verifiedAt: new Date().toISOString(),
      verification: amount.gt(0) ? 'userInfo.amount>0' : 'userInfo.amount==0',
    }
    if (amount.gt(0)) verified.push(row)
    else verifyFailures.push({ ...row, reason: 'events_net_positive_but_userInfo_zero' })
  } catch (e) {
    verifyFailures.push({
      wallet: c.wallet,
      smartChef: c.smartChef,
      reason: String(e.message || e),
    })
  }
}

verified.sort((a, b) => {
  if (a.active !== b.active) return a.active ? -1 : 1
  return BigNumber.from(b.onChainPrincipal).gt(a.onChainPrincipal) ? 1 : -1
})

const fixture = {
  mission: 'MELEGA_DEX_V1_POOLS_WALLET_FIXTURE_DISCOVERY_AND_3_CYCLE_UNBLOCK',
  selectedAt: new Date().toISOString(),
  chainId: 56,
  emptyFixtureWallet: '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513',
  emptyFixtureNote:
    'Has AMM LP (Liquidity domain) but no SmartChef stake — valid SUCCESS_EMPTY for Pools.',
  positiveFixture: verified[0] || null,
  alternatives: verified.slice(1, 5),
  verifiedCount: verified.length,
  scanSummary: {
    poolsScanned: scanReport.poolsScanned,
    depositEvents: scanReport.depositEvents,
    withdrawEvents: scanReport.withdrawEvents,
    emergencyEvents: scanReport.emergencyEvents,
    eventNetPositiveCandidates: candidates.length,
    ethCallVerifiedPositive: verified.length,
  },
}

writeFileSync(path.join(OUT, 'pool-contract-scan.json'), JSON.stringify(scanReport, null, 2))
writeFileSync(path.join(OUT, 'pools-wallet-fixture.json'), JSON.stringify(fixture, null, 2))
writeFileSync(
  path.join(OUT, 'verify-failures.json'),
  JSON.stringify({ verifyFailures: verifyFailures.slice(0, 50), verifiedSample: verified.slice(0, 10) }, null, 2),
)

console.log(
  JSON.stringify(
    {
      poolsScanned: scanReport.poolsScanned,
      depositEvents: scanReport.depositEvents,
      verified: verified.length,
      positive: fixture.positiveFixture && {
        wallet: fixture.positiveFixture.wallet,
        smartChef: fixture.positiveFixture.smartChef,
        sousId: fixture.positiveFixture.sousId,
        principal: fixture.positiveFixture.onChainPrincipal,
        state: fixture.positiveFixture.state,
      },
    },
    null,
    2,
  ),
)
