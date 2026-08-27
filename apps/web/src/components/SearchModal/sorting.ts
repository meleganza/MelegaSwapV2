import { Token, getTokenComparator } from '@pancakeswap/sdk'
import { useMemo } from 'react'

function useTokenComparator(inverted: boolean): (tokenA: Token, tokenB: Token) => number {
  // Do not fetch every listed token balance just to render the picker. Visible
  // virtualized rows resolve balances directly; the base list stays stable.
  const comparator = useMemo(() => getTokenComparator({}), [])
  return useMemo(() => {
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1
    }
    return comparator
  }, [inverted, comparator])
}

export default useTokenComparator
