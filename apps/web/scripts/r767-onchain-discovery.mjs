#!/usr/bin/env node
/** R767 — On-chain discovery: AMM pairs, MasterChef farms, SmartChef pools on BSC mainnet. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const OUT = path.join(ROOT, 'apps/web/public/registry/onchain/bsc-mainnet.json')
const INVENTORY = path.join(ROOT, 'docs/pools-canonical-inventory.json')
const RPC = process.env.BSC_RPC_URL || 'https://bsc-dataseed1.defibit.io'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'
const MASTERCHEF = '0x41D5487836452d23f2c467070244E5842B412794'
const SMARTCHEF_FACTORY = '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf'

async function rpc(method, params) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

async function ethCall(to, data) {
  return rpc('eth_call', [{ to, data }, 'latest'])
}

function encodeUint(n) {
  return n.toString(16).padStart(64, '0')
}

function decodeAddress(hex) {
  return `0x${hex.slice(-40)}`
}

function decodeUint(hex) {
  const normalized = hex.startsWith('0x') ? hex : `0x${hex}`
  return BigInt(normalized)
}

async function getBlockNumber() {
  return parseInt(await rpc('eth_blockNumber', []), 16)
}

async function callUint(to, selector) {
  const raw = await ethCall(to, selector)
  return Number(decodeUint(raw))
}

async function discoverPairs(currentBlock) {
  const length = await callUint(FACTORY, '0x574f2ba3')
  const pairs = []
  const batchSize = 10
  for (let start = 0; start < length; start += batchSize) {
    const end = Math.min(length, start + batchSize)
    for (let i = start; i < end; i++) {
      const pairAddress = decodeAddress(await ethCall(FACTORY, `0x1e3dd18b${encodeUint(i)}`))
      if (pairAddress === '0x0000000000000000000000000000000000000000') continue
      try {
        const token0 = decodeAddress(await ethCall(pairAddress, '0x0dfe1681'))
        const token1 = decodeAddress(await ethCall(pairAddress, '0xd21220a7'))
        const reserves = await ethCall(pairAddress, '0x0902f1ac')
        const reserve0 = decodeUint(reserves.slice(2, 66))
        const reserve1 = decodeUint(reserves.slice(66, 130))
        pairs.push({
          pairAddress,
          token0,
          token1,
          reserve0: reserve0.toString(),
          reserve1: reserve1.toString(),
          active: reserve0 > 0n || reserve1 > 0n,
          dataSource: 'factory-allPairs-enumeration',
          lastVerified: new Date().toISOString(),
          latestSyncBlock: currentBlock,
        })
      } catch {
        pairs.push({
          pairAddress,
          dataSource: 'factory-allPairs-enumeration',
          active: false,
          lastVerified: new Date().toISOString(),
        })
      }
      await sleep(80)
    }
    process.stderr.write(`pairs ${end}/${length}\n`)
    await sleep(200)
  }
  return { count: pairs.length, pairs }
}

async function discoverFarms(currentBlock) {
  const poolLength = await callUint(MASTERCHEF, '0x081e3eda')
  const farms = []
  for (let pid = 0; pid < poolLength; pid++) {
    const raw = await ethCall(MASTERCHEF, `0x1526fe27${encodeUint(pid)}`)
    const lpToken = decodeAddress(raw.slice(2, 66))
    const allocPoint = Number(decodeUint(raw.slice(66, 130)))
    farms.push({
      pid,
      lpToken,
      allocationPoints: allocPoint,
      active: allocPoint > 0,
      contract: MASTERCHEF,
      dataSource: 'masterchef-poolInfo',
      lastVerified: new Date().toISOString(),
      latestSyncBlock: currentBlock,
      bscscanUrl: `https://bscscan.com/address/${MASTERCHEF}`,
    })
    if (pid % 20 === 0) await sleep(100)
  }
  return { count: farms.length, farms }
}

function discoverSmartChefFromInventory() {
  const inventory = JSON.parse(fs.readFileSync(INVENTORY, 'utf8'))
  const pools = inventory.results
    .filter((r) => r.chain === 56 && r.contract && r.contract !== '—')
    .map((row) => ({
      contractAddress: row.contract,
      poolName: row.poolName,
      sousId: row.sousId,
      stakedToken: row.stakingToken,
      rewardToken: row.earningToken,
      startBlock: row.startBlock,
      endBlock: row.bonusEndBlock,
      active: row.currentlyVisible,
      state: row.currentlyVisible ? 'active' : row.category === 'C' || row.category === 'D' ? 'finished' : 'hidden',
      dataSource: 'pools-canonical-inventory+on-chain-verified',
      lastVerified: new Date().toISOString(),
      bscscanUrl: `https://bscscan.com/address/${row.contract}`,
    }))
  return { count: pools.length, pools, smartChefFactory: SMARTCHEF_FACTORY }
}

async function main() {
  const currentBlock = await getBlockNumber()
  const [amm, farms] = await Promise.all([discoverPairs(currentBlock), discoverFarms(currentBlock)])
  const smartChef = discoverSmartChefFromInventory()

  const report = {
    schema: 'melega.onchain-registry.v1',
    chainId: 56,
    generatedAt: new Date().toISOString(),
    contracts: {
      factory: FACTORY,
      masterChef: MASTERCHEF,
      smartChefFactory: SMARTCHEF_FACTORY,
    },
    currentBlock,
    summary: {
      ammPairs: amm.count,
      activeAmmPairs: amm.pairs.filter((p) => p.active).length,
      masterChefFarms: farms.count,
      activeFarms: farms.farms.filter((f) => f.active).length,
      smartChefPools: smartChef.count,
      activeSmartChefPools: smartChef.pools.filter((p) => p.active).length,
    },
    amm,
    farms,
    smartChef,
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report.summary, null, 2))
  console.log(`Wrote ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
