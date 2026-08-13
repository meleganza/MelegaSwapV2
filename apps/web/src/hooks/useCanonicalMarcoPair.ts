import { CurrencyAmount, Pair, Token } from '@pancakeswap/sdk'
import { Interface } from '@ethersproject/abi'
import useSWR from 'swr'

import IPancakePairABI from 'config/abi/IPancakePair.json'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import { provider } from 'utils/wagmi'

const BSC_CHAIN_ID = 56
const MARCO_BSC = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const WBNB_BSC = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const PAIR_INTERFACE = new Interface(IPancakePairABI)

export function isCanonicalMarcoPair(tokenA?: Token, tokenB?: Token): boolean {
  if (!tokenA || !tokenB || tokenA.chainId !== BSC_CHAIN_ID || tokenB.chainId !== BSC_CHAIN_ID) return false
  const addresses = [tokenA.address.toLowerCase(), tokenB.address.toLowerCase()].sort()
  return addresses[0] === MARCO_BSC && addresses[1] === WBNB_BSC
}

export function buildCanonicalMarcoPair(tokenA: Token, tokenB: Token, encodedReserves: string): Pair {
  const [reserve0, reserve1] = PAIR_INTERFACE.decodeFunctionResult('getReserves', encodedReserves)
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
  return new Pair(
    CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
    CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
  )
}

/**
 * The canonical MARCO/WBNB pool is a public Melega V2 pair. Keep the normal
 * multicall discovery as the primary source, but read this single known pair
 * directly when the shared multicall cache has not hydrated yet. The SWR key
 * deduplicates the form and preview consumers into one RPC read.
 */
export function useCanonicalMarcoPair(tokenA?: Token, tokenB?: Token): Pair | null {
  const enabled = isCanonicalMarcoPair(tokenA, tokenB)
  const { data } = useSWR(
    enabled ? ['canonical-marco-wbnb-reserves', MARCO_WBNB_PAIR_BSC] : null,
    async () => {
      const encoded = PAIR_INTERFACE.encodeFunctionData('getReserves')
      const result = await provider({ chainId: BSC_CHAIN_ID }).call({
        to: MARCO_WBNB_PAIR_BSC,
        data: encoded,
      })
      return buildCanonicalMarcoPair(tokenA!, tokenB!, result)
    },
    {
      dedupingInterval: 12_000,
      refreshInterval: 12_000,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  )

  return data ?? null
}
