import React, { useMemo } from 'react'
import { TransactionType } from 'state/info/types'
import { useProtocolTransactionsSWR } from 'state/info/hooks'
import { HumanDynamicSection } from './HumanDynamicSection'

const formatSwapLabel = (token0: string, token1: string) => `${token0} ↔ ${token1}`

const HomeLiveSwaps: React.FC = () => {
  const transactions = useProtocolTransactionsSWR()

  const swaps = useMemo(() => {
    if (!transactions?.length) return []
    return transactions
      .filter((tx) => tx.type === TransactionType.SWAP)
      .slice(0, 6)
      .map((tx) => ({
        id: tx.hash,
        label: formatSwapLabel(tx.token0Symbol, tx.token1Symbol),
        meta: tx.amountUSD > 0 ? `$${tx.amountUSD.toFixed(2)}` : undefined,
        href: '/trade',
      }))
  }, [transactions])

  return (
    <HumanDynamicSection
      title="Latest swaps"
      seeAllHref="/trade"
      items={swaps}
      emptyMessage="No recent swaps indexed for this network yet. Open Swap to trade."
      layout="list"
    />
  )
}

export default HomeLiveSwaps
