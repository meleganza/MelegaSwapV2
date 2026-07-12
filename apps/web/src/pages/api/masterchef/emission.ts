import type { NextApiHandler } from 'next'
import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import masterchefABI from 'config/abi/masterchef.json'
import { BLOCKS_PER_DAY } from 'config'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { MELEGA_PRODUCTION_CONTRACTS } from 'lib/data-truth/ontology'

const handler: NextApiHandler = async (_req, res) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')
    const contract = new ethers.Contract(MELEGA_PRODUCTION_CONTRACTS.masterChef, masterchefABI, provider)
    const [perBlockRaw, totalAllocPoint, blockNumber] = await Promise.all([
      contract.dexTokenPerBlock(),
      contract.totalAllocPoint(),
      provider.getBlockNumber(),
    ])
    const perBlock = getBalanceNumber(new BigNumber(perBlockRaw.toString()), 18)
    const perDay = perBlock * BLOCKS_PER_DAY
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    return res.status(200).json({
      contract: MELEGA_PRODUCTION_CONTRACTS.masterChef,
      perBlock,
      perDay,
      totalAllocPoint: totalAllocPoint.toString(),
      blockNumber,
      source: 'MasterChef.dexTokenPerBlock eth_call',
    })
  } catch (e) {
    return res.status(503).json({
      error: e instanceof Error ? e.message : 'MasterChef read failed',
    })
  }
}

export default handler
