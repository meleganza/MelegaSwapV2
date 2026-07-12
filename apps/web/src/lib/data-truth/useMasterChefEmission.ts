import { useMemo } from 'react'
import useSWR from 'swr'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import masterchefABI from 'config/abi/masterchef.json'
import { BLOCKS_PER_DAY } from 'config'
import { getBalanceAmount, getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { MELEGA_PRODUCTION_CONTRACTS } from './ontology'
import { useFarms } from 'state/farms/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'

const MASTER_CHEF_BSC = MELEGA_PRODUCTION_CONTRACTS.masterChef

async function readDexTokenPerBlock(chainId: number): Promise<number | undefined> {
  if (chainId !== 56) return undefined
  try {
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')
    const contract = new ethers.Contract(MASTER_CHEF_BSC, masterchefABI, provider)
    const raw = await contract.dexTokenPerBlock()
    const bn = getBalanceAmount(new BigNumber(raw.toString()))
    const n = bn.toNumber()
    return Number.isFinite(n) && n > 0 ? n : undefined
  } catch (e) {
    console.error('[useMasterChefEmission] dexTokenPerBlock read failed', e)
    return undefined
  }
}

export interface MasterChefEmission {
  perBlock: number
  perDay: number
  perDayLabel: string
  source: string
  contract: string
  readError?: string
}

/** Canonical MARCO emission from MasterChef dexTokenPerBlock with Redux + direct RPC fallback. */
export function useMasterChefEmission(): MasterChefEmission {
  const { chainId } = useActiveChainId()
  const { regularCakePerBlock } = useFarms()
  const { data: directPerBlock } = useSWR(
    chainId === 56 ? ['masterchef-dexTokenPerBlock', chainId] : null,
    () => readDexTokenPerBlock(chainId!),
    { revalidateOnFocus: false, dedupingInterval: 120_000 },
  )

  return useMemo(() => {
    const perBlock =
      regularCakePerBlock > 0 ? regularCakePerBlock : directPerBlock != null && directPerBlock > 0 ? directPerBlock : 0
    const perDayBn = new BigNumber(perBlock).times(BLOCKS_PER_DAY)
    const perDay = getBalanceNumber(perDayBn, 18)
    const source =
      regularCakePerBlock > 0
        ? 'MasterChef dexTokenPerBlock via Redux farms state'
        : directPerBlock != null && directPerBlock > 0
          ? 'MasterChef dexTokenPerBlock via direct eth_call'
          : 'unavailable'
    return {
      perBlock,
      perDay,
      perDayLabel: perBlock > 0 ? `${perDay.toLocaleString(undefined, { maximumFractionDigits: 2 })} MARCO` : '',
      source,
      contract: MASTER_CHEF_BSC,
      readError: perBlock <= 0 ? 'dexTokenPerBlock returned zero or RPC read failed' : undefined,
    }
  }, [regularCakePerBlock, directPerBlock])
}
