import type { NextApiHandler } from 'next'
import { ethers } from 'ethers'
import masterchefABI from 'config/abi/masterchef.json'
import { BLOCKS_PER_DAY } from 'config'
import { MELEGA_PRODUCTION_CONTRACTS } from 'lib/data-truth/ontology'
import {
  computeTotalDailyMarco,
  decodePerBlockWei,
  resolveMasterChefStatus,
} from 'lib/data-truth/masterChefEmissionMath'

import { BSC_RPC_URLS } from 'config/constants/rpc'

function resolveMasterChefRpcUrls(): string[] {
  const candidates = [
    process.env.BSC_RPC_URL,
    process.env.BSC_RPC_FALLBACK_URL,
    'https://bsc-dataseed.binance.org',
    ...BSC_RPC_URLS,
  ].filter(
    (url): url is string =>
      Boolean(url?.trim()) && !url.includes('localhost') && !url.includes('127.0.0.1'),
  )
  return [...new Set(candidates)]
}

const MASTER_CHEF = MELEGA_PRODUCTION_CONTRACTS.masterChef
const MARCO_TOKEN = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const EMITTER_METHOD = 'dexTokenPerBlock'
const POOL_SCAN_LIMIT = 32

const erc20Abi = ['function decimals() view returns (uint8)']

let allocCache: { at: number; poolAllocations: Record<number, number> } | null = null
const ALLOC_CACHE_MS = 120_000

async function ethCall(provider: ethers.providers.JsonRpcProvider, to: string, data: string): Promise<string> {
  return provider.call({ to, data })
}

async function withRpcProvider<T>(fn: (provider: ethers.providers.JsonRpcProvider, rpcUrl: string) => Promise<T>): Promise<T> {
  const urls = resolveMasterChefRpcUrls()
  let lastError: unknown
  for (const url of urls) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(url)
      return await fn(provider, url)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError instanceof Error ? lastError : new Error('All BSC RPC endpoints failed')
}

async function scanPoolAllocations(
  provider: ethers.providers.JsonRpcProvider,
  iface: ethers.utils.Interface,
  poolLength: number,
  requestedPids: number[],
  perBlock: number,
  totalAllocPoint: number,
  bonusMultiplier: number,
): Promise<{
  poolAllocations: Record<number, number>
  examples: Array<{ pid: number; allocPoint: number; lpToken: string; dailyMarco: number; rawPoolInfoHex: string; calldata: string }>
  scanWarning?: string
}> {
  const poolAllocations: Record<number, number> = {}
  const examples: Array<{ pid: number; allocPoint: number; lpToken: string; dailyMarco: number; rawPoolInfoHex: string; calldata: string }> = []
  const scanUntil = Math.min(poolLength, POOL_SCAN_LIMIT)
  const pidsToRead = [...new Set([...Array.from({ length: scanUntil }, (_, i) => i), ...requestedPids])]

  try {
    for (const pid of pidsToRead) {
      const calldata = iface.encodeFunctionData('poolInfo', [pid])
      const rawHex = await ethCall(provider, MASTER_CHEF, calldata)
      const decoded = iface.decodeFunctionResult('poolInfo', rawHex)
      const allocPoint = Number(decoded[1].toString())
      const lpToken = ethers.utils.getAddress(decoded[0] as string)
      if (allocPoint > 0) poolAllocations[pid] = allocPoint
      if (examples.length < 3 && allocPoint > 0) {
        examples.push({
          pid,
          allocPoint,
          lpToken,
          dailyMarco:
            totalAllocPoint > 0
              ? computeTotalDailyMarco(perBlock, BLOCKS_PER_DAY, bonusMultiplier) * allocPoint / totalAllocPoint
              : 0,
          rawPoolInfoHex: rawHex,
          calldata,
        })
      }
    }
    return { poolAllocations, examples }
  } catch (e) {
    return {
      poolAllocations,
      examples,
      scanWarning: e instanceof Error ? e.message : 'poolInfo scan partial failure',
    }
  }
}

const handler: NextApiHandler = async (req, res) => {
  try {
    const requestedPids = String(req.query.pids ?? '')
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isInteger(v) && v >= 0)

    const result = await withRpcProvider(async (provider, rpcUrl) => {
      const iface = new ethers.utils.Interface(masterchefABI)
      const perBlockSig = iface.getSighash(EMITTER_METHOD)
      const totalAllocSig = iface.getSighash('totalAllocPoint')
      const poolLengthSig = iface.getSighash('poolLength')
      const bonusSig = iface.getSighash('BONUS_MULTIPLIER')

      const [rawPerBlockHex, rawTotalAllocHex, rawPoolLengthHex, rawBonusHex, blockNumber, chainIdHex] =
        await Promise.all([
          ethCall(provider, MASTER_CHEF, perBlockSig),
          ethCall(provider, MASTER_CHEF, totalAllocSig),
          ethCall(provider, MASTER_CHEF, poolLengthSig),
          ethCall(provider, MASTER_CHEF, bonusSig),
          provider.getBlockNumber(),
          provider.send('eth_chainId', []),
        ])

      const perBlockWei = ethers.BigNumber.from(rawPerBlockHex).toString()
      const totalAllocPoint = Number(ethers.BigNumber.from(rawTotalAllocHex).toString())
      const poolLength = Number(ethers.BigNumber.from(rawPoolLengthHex).toString())
      const bonusMultiplier = Number(ethers.BigNumber.from(rawBonusHex).toString())

      const decimalsRaw = await ethCall(provider, MARCO_TOKEN, new ethers.utils.Interface(erc20Abi).getSighash('decimals'))
      const rewardDecimals = Number(ethers.BigNumber.from(decimalsRaw).toString())

      const perBlock = decodePerBlockWei(perBlockWei, rewardDecimals)
      const perDay = computeTotalDailyMarco(perBlock, BLOCKS_PER_DAY, bonusMultiplier)
      const statusResolved = resolveMasterChefStatus({ perBlock, perDay })

      let poolAllocations: Record<number, number> = {}
      let examples: Array<{ pid: number; allocPoint: number; lpToken: string; dailyMarco: number; rawPoolInfoHex: string; calldata: string }> = []
      let scanWarning: string | undefined

      const cacheFresh = allocCache && Date.now() - allocCache.at < ALLOC_CACHE_MS
      if (cacheFresh) {
        poolAllocations = allocCache!.poolAllocations
      } else {
        const scanned = await scanPoolAllocations(
          provider,
          iface,
          poolLength,
          requestedPids,
          perBlock,
          totalAllocPoint,
          bonusMultiplier,
        )
        poolAllocations = scanned.poolAllocations
        examples = scanned.examples
        scanWarning = scanned.scanWarning
        if (Object.keys(poolAllocations).length > 0) {
          allocCache = { at: Date.now(), poolAllocations }
        }
      }

      return {
        status: statusResolved.status,
        masterChefAddress: MASTER_CHEF,
        emissionMethod: EMITTER_METHOD,
        rawEmissionPerBlock: rawPerBlockHex,
        normalizedEmissionPerBlock: perBlock,
        decimals: rewardDecimals,
        totalAllocPoint,
        poolLength,
        blocksPerDay: BLOCKS_PER_DAY,
        multiplier: bonusMultiplier,
        totalDailyEmission: perDay,
        currentBlock: blockNumber,
        reason: scanWarning ? `${statusResolved.reason ?? ''} ${scanWarning}`.trim() : statusResolved.reason,
        source: 'masterchef-rpc',
        rewardToken: MARCO_TOKEN,
        poolAllocations,
        examples,
        rpc: {
          eth_chainId: chainIdHex,
          eth_blockNumber: `0x${blockNumber.toString(16)}`,
          dexTokenPerBlock: { signature: EMITTER_METHOD, selector: perBlockSig, calldata: perBlockSig, raw: rawPerBlockHex, decodedWei: perBlockWei },
          totalAllocPoint: { selector: totalAllocSig, raw: rawTotalAllocHex, decoded: String(totalAllocPoint) },
          poolLength: { selector: poolLengthSig, raw: rawPoolLengthHex, decoded: String(poolLength) },
          BONUS_MULTIPLIER: { selector: bonusSig, raw: rawBonusHex, decoded: String(bonusMultiplier) },
          marcoDecimals: { contract: MARCO_TOKEN, raw: decimalsRaw, decoded: String(rewardDecimals) },
        },
        timestamp: new Date().toISOString(),
        provider: rpcUrl.replace(/\/\/[^@]+@/, '//***@'),
      }
    })

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json(result)
  } catch (e) {
    return res.status(503).json({
      status: 'unavailable',
      masterChefAddress: MASTER_CHEF,
      emissionMethod: EMITTER_METHOD,
      reason: e instanceof Error ? e.message : 'MasterChef read failed',
      source: 'masterchef-rpc',
    })
  }
}

export default handler
