#!/usr/bin/env node
/**
 * R783 Phase 3 — MasterChef RPC proof (no credentials).
 * Run: node apps/web/scripts/r783-masterchef-rpc-proof.mjs
 */
import { ethers } from 'ethers'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../docs/runtime/r783-masterchef-rpc-proof.json')

const MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const RPC = 'https://bsc-dataseed.binance.org'
const BLOCKS_PER_DAY = 28800
const EMITTER_METHOD = 'dexTokenPerBlock'

const masterchefABI = [
  'function dexTokenPerBlock() view returns (uint256)',
  'function totalAllocPoint() view returns (uint256)',
  'function poolLength() view returns (uint256)',
  'function BONUS_MULTIPLIER() view returns (uint256)',
  'function poolInfo(uint256) view returns (address,uint256,uint256,uint256)',
]
const erc20Abi = ['function decimals() view returns (uint8)']

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(RPC)
  const iface = new ethers.utils.Interface(masterchefABI)
  const ts = new Date().toISOString()
  const blockNumber = await provider.getBlockNumber()
  const chainId = await provider.send('eth_chainId', [])

  async function read(name, sig, to = MASTER_CHEF, encodeArgs = null) {
    const calldata = encodeArgs ? iface.encodeFunctionData(name, encodeArgs) : sig
    const raw = await provider.call({ to, data: calldata })
    let decoded = null
    try {
      decoded = iface.decodeFunctionResult(name, raw)
    } catch {
      try {
        decoded = new ethers.utils.Interface(erc20Abi).decodeFunctionResult(name, raw)
      } catch {
        decoded = ethers.BigNumber.from(raw).toString()
      }
    }
    return { contract: to, method: name, calldata, rawHex: raw, decoded: decoded?.map?.((d) => d.toString()) ?? String(decoded), blockNumber, timestamp: ts, provider: RPC, success: true }
  }

  const perBlockRead = await read('dexTokenPerBlock', iface.getSighash('dexTokenPerBlock'))
  const totalAllocRead = await read('totalAllocPoint', iface.getSighash('totalAllocPoint'))
  const poolLengthRead = await read('poolLength', iface.getSighash('poolLength'))
  const bonusRead = await read('BONUS_MULTIPLIER', iface.getSighash('BONUS_MULTIPLIER'))
  const decimalsRead = await read('decimals', new ethers.utils.Interface(erc20Abi).getSighash('decimals'), MARCO)

  const perBlockWei = perBlockRead.decoded[0]
  const decimals = Number(decimalsRead.decoded[0] ?? decimalsRead.decoded)
  const perBlock = Number(ethers.utils.formatUnits(perBlockWei, decimals))
  const totalAllocPoint = Number(totalAllocRead.decoded[0])
  const multiplier = Number(bonusRead.decoded[0])
  const totalDailyMarco = perBlock * BLOCKS_PER_DAY * multiplier

  const activeSamples = []
  for (let pid = 0; pid < 30; pid++) {
    const row = await read('poolInfo', iface.getSighash('poolInfo'), MASTER_CHEF, [pid])
    const allocPoint = Number(row.decoded[1])
    if (allocPoint > 0) {
      activeSamples.push({
        pid,
        allocPoint,
        lpToken: row.decoded[0],
        farmDailyMarco: (totalDailyMarco * allocPoint) / totalAllocPoint,
        poolInfo: row,
      })
    }
    if (activeSamples.length >= 3) break
  }

  const proof = {
    mission: 'R783',
    emissionMethod: EMITTER_METHOD,
    masterChefAddress: MASTER_CHEF,
    marcoToken: MARCO,
    eth_chainId: { raw: chainId, decoded: Number.parseInt(chainId, 16) },
    eth_blockNumber: { raw: `0x${blockNumber.toString(16)}`, decoded: blockNumber },
    reads: [perBlockRead, totalAllocRead, poolLengthRead, bonusRead, decimalsRead],
    computed: {
      normalizedEmissionPerBlock: perBlock,
      blocksPerDay: BLOCKS_PER_DAY,
      multiplier,
      totalDailyMarco,
    },
    activeFarmExamples: activeSamples,
    timestamp: ts,
  }

  await mkdir(path.dirname(OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(proof, null, 2))
  console.log(JSON.stringify(proof, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
