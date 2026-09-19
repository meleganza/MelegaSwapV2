import { Contract, providers, utils } from 'ethers'
import contracts from 'config/constants/contracts'
import masterchefABI from 'config/abi/masterchef.json'
import { resolveMasterChefStatus } from './masterChefEmissionMath'

/** Read chain-bound Ethereum emissions; never reuse BSC's rate or allocation cache. */
export async function readEthereumFarmEmission(provider: providers.JsonRpcProvider) {
  if ((await provider.getNetwork()).chainId !== 1) throw new Error('ETHEREUM_CHAIN_REQUIRED')
  const masterChefAddress = contracts.masterChef[1]
  const rewardToken = contracts.marco[1]
  const chef = new Contract(masterChefAddress, masterchefABI, provider)
  const token = new Contract(rewardToken, ['function decimals() view returns(uint8)'], provider)
  const currentBlock = await provider.getBlockNumber()
  const at = { blockTag: currentBlock }
  const [raw, total, length, multiplier, decimals] = await Promise.all([
    chef.dexTokenPerBlock(at),
    chef.totalAllocPoint(at),
    chef.poolLength(at),
    chef.BONUS_MULTIPLIER(at),
    token.decimals(at),
  ])
  const poolLength = length.toNumber()
  if (poolLength > 1000) throw new Error('UNEXPECTED_POOL_LENGTH')
  const pools = await Promise.all(Array.from({ length: poolLength }, (_, pid) => chef.poolInfo(pid, at)))
  const normalizedEmissionPerBlock = Number(utils.formatUnits(raw, decimals))
  const blocksPerDay = 86400 / 12
  const totalDailyEmission = normalizedEmissionPerBlock * blocksPerDay * multiplier.toNumber()
  return {
    chainId: 1,
    masterChefAddress,
    rewardToken,
    emissionMethod: 'dexTokenPerBlock',
    rawEmissionPerBlock: raw.toHexString(),
    rawPerBlockWei: raw.toString(),
    normalizedEmissionPerBlock,
    totalDailyEmission,
    decimals,
    blocksPerDay,
    totalAllocPoint: total.toNumber(),
    poolLength,
    multiplier: multiplier.toNumber(),
    currentBlock,
    poolAllocations: Object.fromEntries(pools.map((pool, pid) => [pid, pool.allocPoint.toNumber()])),
    ...resolveMasterChefStatus({ perBlock: normalizedEmissionPerBlock, perDay: totalDailyEmission }),
    source: 'ethereum-masterchef-rpc',
  }
}
