import { useMemo } from 'react'
import { formatTradeSettlementMetadata, getSettlementReference } from 'lib/treasury-handoff'
import { useAllActiveChainTransactions } from 'state/transactions/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useWeb3React } from '@pancakeswap/wagmi'

export function useTradeSettlementMetadata() {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const transactions = useAllActiveChainTransactions()

  return useMemo(() => {
    const swapTxs = Object.values(transactions)
      .filter((tx) => tx.type === 'swap' && tx.receipt?.status === 1)
      .sort((a, b) => (b.confirmedTime ?? b.addedTime) - (a.confirmedTime ?? a.addedTime))

    const latest = swapTxs[0]
    if (!chainId || !latest) {
      return formatTradeSettlementMetadata({ chainId })
    }

    const ref = getSettlementReference(chainId, latest.hash)
    if (ref) {
      return {
        txHash: ref.txHash,
        settlementStatus: ref.settlementStatus,
        settlementId: ref.settlementId,
        machineCode: ref.machineCode,
        treasuryRuntimeEndpointStatus: ref.treasuryRuntimeEndpointStatus,
      }
    }

    return formatTradeSettlementMetadata({ chainId, latestTxHash: latest.hash })
  }, [account, chainId, transactions])
}
