import type { NextApiRequest, NextApiResponse } from 'next'
import { Interface } from '@ethersproject/abi'
import { SECURITY_HEADERS } from '../../lib/betaGate'
import { EARN_NETWORKS } from '../../lib/earnCatalog'
import { assertReadonlyRpc, DEFAULT_BSC_READONLY_RPC } from '../../lib/bscQuote'
import { decodePoolInfo, encodePoolInfo, EARN_MASTER_CHEF } from '../../lib/earnRead'
import farmList from '../../../../packages/farms/lists/56.json'

const MELEGA = 'https://www.melega.finance'
const INDEX = 'https://yields.llama.fi/pools'
const ADDRESS = /^0x[0-9a-f]{40}$/i
const UUID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i
const MULTICALL = '0xcA11bde05977b3631167028862bE2a173976CA11'
const multicall = new Interface(['function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) returns (tuple(bool success,bytes returnData)[] results)'])
const nativeLabels = new Map(farmList.map((farm) => [farm.lpAddress.toLowerCase(), farm.lpSymbol]))
const tokenLabels = new Map(farmList.flatMap((farm) => [farm.token, farm.quoteToken].map((token) => [token.address.toLowerCase(), token.symbol] as const)))
tokenLabels.set('0x963556de0eb8138e97a85f0a86ee0acd159d210b', 'MARCO')
const networkNames: Record<number, string> = { 56: 'BSC', 1: 'Ethereum', 8453: 'Base', 137: 'Polygon', 42161: 'Arbitrum', 43114: 'Avalanche' }

type RecordData = Record<string, unknown>
type Opportunity = { id: string; name: string; venue: string; apy: number | null; tvl: number | null; href: string }
type Feed = { rows: Opportunity[]; asOf?: string; unavailable?: boolean; partial?: boolean }
const cache = new Map<string, { expires: number; result: Promise<Feed> }>()

async function read(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(9500), headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('Source unavailable')
  return response.json()
}

function rows(value: unknown): RecordData[] {
  return Array.isArray(value) ? value.filter((row): row is RecordData => row !== null && typeof row === 'object') : []
}

function metric(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function farmOpportunity(pid: number, token: string): Opportunity {
  return { id: String(pid), name: nativeLabels.get(token.toLowerCase()) ?? `Farm #${pid}`, venue: 'Melega Farm', apy: null, tvl: null, href: MELEGA + '/farms?view=explore' }
}

async function bscReader(url = process.env.BETA_BSC_READONLY_RPC ?? DEFAULT_BSC_READONLY_RPC) {
  const rpc = assertReadonlyRpc(url)
  const signal = AbortSignal.timeout(6500)
  const request = async (calls: Array<{ id: number; method: string; params: unknown[] }>) => {
    const response = await fetch(rpc, {
      method: 'POST', signal, headers: { 'content-type': 'application/json' },
      body: JSON.stringify(calls.map((call) => ({ jsonrpc: '2.0', ...call }))),
    })
    if (!response.ok) throw new Error('RPC unavailable')
    const replies = await response.json()
    if (!Array.isArray(replies)) throw new Error('Batch unsupported')
    return new Map(rows(replies).map((item) => [item.id, item.result]))
  }
  const initial = await request([
    { id: 0, method: 'eth_chainId', params: [] },
    { id: 1, method: 'eth_blockNumber', params: [] },
  ])
  const tip = initial.get(1)
  if (initial.get(0) !== '0x38' || typeof tip !== 'string' || !/^0x[\da-f]+$/i.test(tip) || BigInt(tip) <= 3n) throw new Error('Wrong chain or block')
  const height = BigInt(tip) - 3n
  const block = `0x${height.toString(16)}`
  const call = async (to: string, data: string) => (await request([{ id: 0, method: 'eth_call', params: [{ to, data }, block] }])).get(0)
  const aggregate = async (calls: Array<[string, string]>): Promise<Array<[boolean, string]>> => {
    const data = multicall.encodeFunctionData('aggregate3', [calls.map(([to, calldata]) => [to, true, calldata])])
    const reply = await call(MULTICALL, data)
    if (typeof reply !== 'string') throw new Error('Multicall unavailable')
    return multicall.decodeFunctionResult('aggregate3', reply)[0]
  }
  return { height, call, aggregate }
}

async function liveFarms(url?: string): Promise<Feed> {
  const { call, aggregate } = await bscReader(url)
  const countHex = await call(EARN_MASTER_CHEF, '0x081e3eda')
  const count = typeof countHex === 'string' && /^0x[\da-f]+$/i.test(countHex) ? Number(BigInt(countHex)) : NaN
  if (!Number.isSafeInteger(count) || count < 1 || count > 1024) throw new Error('Unexpected farm count')
  const batchSize = 80
  const batches = Array.from({ length: Math.ceil(count / batchSize) }, (_, group) => Array.from({ length: Math.min(batchSize, count - group * batchSize) }, (_, index) => group * batchSize + index))
  const results = await Promise.all(batches.map(async (pids) => {
    const decoded = await aggregate(pids.map((pid) => [EARN_MASTER_CHEF, encodePoolInfo(pid)]))
    return pids.flatMap((pid, index) => {
      const [success, value] = decoded[index] ?? []
      const farm = success && typeof value === 'string' && /^0x[\da-f]+$/i.test(value) ? decodePoolInfo(value.toLowerCase()) : null
      if (!farm) throw new Error('Incomplete farm scan')
      return BigInt(farm.allocPoint) > 0n ? [farmOpportunity(pid, farm.lpToken)] : []
    })
  }))
  return { rows: results.flat() }
}

async function verifyKnownPools(candidates: RecordData[]): Promise<Feed> {
  const { height, aggregate } = await bscReader('https://bsc-rpc.publicnode.com')
  const addresses = [...new Set(candidates.flatMap((pool) => typeof pool.contractAddress === 'string' && ADDRESS.test(pool.contractAddress) ? [pool.contractAddress.toLowerCase()] : []))]
  const selectors = ['0x8ae39cac', '0x48cd4cb1', '0x1aed6553', '0xcc7a262e']
  const groups = Array.from({ length: Math.ceil(addresses.length / 40) }, (_, i) => addresses.slice(i * 40, (i + 1) * 40))
  const results = await Promise.all(groups.map(async (group) => {
    const decoded = await aggregate(group.flatMap((address) => selectors.map((selector): [string, string] => [address, selector])))
    return group.flatMap((address, i) => {
      const values = decoded.slice(i * 4, i * 4 + 4).map(([ok, value]) => ok && /^0x[\da-f]{64}$/i.test(value) ? value : null)
      const [reward, start, end, asset] = values
      if (!reward || !start || !end || BigInt(reward) === 0n || BigInt(start) > height || (BigInt(end) > 0n && BigInt(end) <= height)) return []
      const symbol = asset ? tokenLabels.get('0x' + asset.slice(-40).toLowerCase()) : undefined
      return [{ id: address, name: symbol ? `${symbol} staking` : `Staking pool ${address.slice(0, 8)}`, venue: 'Melega Pool', apy: null, tvl: null, href: MELEGA + '/pools?view=explore' }]
    })
  }))
  return { rows: results.flat(), partial: true }
}

async function native(kind: 'farms' | 'pools'): Promise<Feed> {
  if (kind === 'farms') {
    const live = await Promise.any([liveFarms(), liveFarms('https://bsc-rpc.publicnode.com')]).catch(() => null)
    if (live) return live
    const data = await read(MELEGA + '/registry/onchain/bsc-mainnet.json')
    if (data?.schema !== 'melega.onchain-registry.v1' || data.chainId !== 56 || !Array.isArray(data.farms?.farms)) throw new Error('Invalid registry')
    return {
      asOf: typeof data.generatedAt === 'string' ? data.generatedAt : undefined,
      rows: rows(data.farms.farms).flatMap((farm) => {
        if (farm.active !== true || typeof farm.pid !== 'number' || !Number.isSafeInteger(farm.pid) || farm.pid < 0 || typeof farm.lpToken !== 'string' || !ADDRESS.test(farm.lpToken)) return []
        return [farmOpportunity(farm.pid, farm.lpToken)]
      }),
    }
  }
  const live = await read(MELEGA + '/api/pools/classification').catch(() => null)
  const liveRows = Array.isArray(live?.rows)
  const data = liveRows ? live : await read(MELEGA + '/registry/onchain/bsc-mainnet.json')
  if (!liveRows && (data?.schema !== 'melega.onchain-registry.v1' || data.chainId !== 56 || !Array.isArray(data.smartChef?.pools))) throw new Error('Invalid pool inventory')
  if (!liveRows) {
    const inventory = await read(MELEGA + '/registry/pools-canonical-inventory.json').catch(() => null)
    const candidates = rows(inventory?.results)
      .filter((pool) => pool.chain === 56 && typeof pool.contract === 'string' && pool.contract.toLowerCase() !== EARN_MASTER_CHEF.toLowerCase())
      .map((pool) => ({ contractAddress: pool.contract }))
    const verified = await verifyKnownPools([...rows(data.smartChef.pools), ...candidates]).catch(() => null)
    if (verified?.rows.length) return verified
  }
  return {
    partial: !liveRows,
    asOf: typeof data.generatedAt === 'string' ? data.generatedAt : undefined,
    rows: rows(liveRows ? data.rows : data.smartChef.pools).flatMap((pool) => {
      const address = liveRows ? pool.address : pool.contractAddress
      if (pool.active !== true || (liveRows && pool.callable !== true) || pool.ended === true || pool.invalid === true || typeof address !== 'string' || !ADDRESS.test(address)) return []
      const staked = typeof pool.stakedToken === 'string' ? tokenLabels.get(pool.stakedToken.toLowerCase()) : undefined
      const name = staked ? `${staked} staking` : typeof pool.poolName === 'string' ? pool.poolName : `Staking pool ${address.slice(0, 8)}`
      return [{ id: address.toLowerCase(), name, venue: 'Melega Pool', apy: null, tvl: null, href: MELEGA + '/pools?view=explore' }]
    }),
  }
}

async function indexed(chain: number): Promise<Feed> {
  const payload = await read(INDEX)
  if (payload?.status !== 'success' || !Array.isArray(payload.data)) throw new Error('Invalid yield index')
  return {
    rows: rows(payload.data).flatMap((pool) => {
      if (pool.chain !== networkNames[chain] || pool.exposure === 'unknown' || typeof pool.pool !== 'string' || !UUID.test(pool.pool) || typeof pool.symbol !== 'string' || typeof pool.project !== 'string') return []
      const apy = metric(pool.apy)
      const tvl = metric(pool.tvlUsd)
      if (apy === null || tvl === null || tvl <= 0) return []
      return [{ id: pool.pool, name: pool.symbol, venue: pool.project, apy, tvl, href: `https://defillama.com/yields/pool/${pool.pool}` }]
    }),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(key, value)
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }
  const { kind, chainId, query, offset } = req.query
  const chain = Number(chainId ?? 56)
  if (!EARN_NETWORKS.some(({ id }) => id === chain) || (kind !== 'farms' && kind !== 'pools' && kind !== 'index') || (kind !== 'index' && chain !== 56)) return res.status(422).json({ rows: [], unavailable: true })
  const key = `${kind}:${chain}`
  let entry = cache.get(key)
  if (!entry || entry.expires <= Date.now()) {
    const result = (kind === 'index' ? indexed(chain) : native(kind)).catch((): Feed => {
      cache.delete(key)
      return { rows: [], unavailable: true }
    })
    entry = { expires: Date.now() + 120_000, result }
    cache.set(key, entry)
  }
  const feed = await entry.result
  const term = typeof query === 'string' ? query.trim().toLowerCase().slice(0, 80) : ''
  const filtered = feed.rows.filter(({ name, venue, id }) => `${name} ${venue} ${id}`.toLowerCase().includes(term))
  if (kind === 'index') filtered.sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
  const rawOffset = Number(offset ?? 0)
  const start = Number.isSafeInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0
  return res.status(feed.unavailable ? 503 : 200).json({ ...feed, rows: filtered.slice(start, start + 12), count: filtered.length })
}
