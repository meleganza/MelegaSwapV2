import { Token } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { useAllTokenBalances } from 'state/wallet/hooks'
import { compareTokensByWalletBalance, rankTokensByWalletBalance } from './rankTokensByWalletBalance'

function useTokenComparator(inverted: boolean): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances()
  return useMemo(() => {
    return (tokenA: Token, tokenB: Token) => {
      const cmp = compareTokensByWalletBalance(tokenA, tokenB, balances)
      return inverted ? cmp * -1 : cmp
    }
  }, [inverted, balances])
}

export { rankTokensByWalletBalance }
export default useTokenComparator
