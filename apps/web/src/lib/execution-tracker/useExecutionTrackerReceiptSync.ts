import { useEffect } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'

import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAllActiveChainTransactions } from 'state/transactions/hooks'

import type { InstructionForEvidence } from '../execution-contract/evidence'
import { getExecutionTracker } from './tracker'

/**
 * Observes persisted Redux transactions and updates tracker receipt state.
 * Does not alter receipt polling — read-only sync from existing transaction store.
 */
export function useExecutionTrackerReceiptSync(instruction: InstructionForEvidence | null): void {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const transactions = useAllActiveChainTransactions()

  useEffect(() => {
    if (!instruction) {
      return
    }
    getExecutionTracker(account ?? undefined, chainId).syncPendingReceipts(
      instruction,
      transactions,
      chainId,
    )
  }, [instruction, transactions, account, chainId])
}
