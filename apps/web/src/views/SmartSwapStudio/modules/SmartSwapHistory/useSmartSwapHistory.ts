/**
 * Module 005 — reads wallet swap txs + handoff context. No execution.
 */

import { useMemo, useState, useCallback } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useAllActiveChainTransactions } from 'state/transactions/hooks'
import type { TransactionDetails } from 'state/transactions/reducer'
import {
  buildSmartSwapHistory,
  SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE,
  type SmartSwapHistoryPage,
  type SmartSwapHistoryTxSnapshot,
} from 'lib/smart-swap-history'

function toSnapshot(tx: TransactionDetails): SmartSwapHistoryTxSnapshot {
  return {
    hash: tx.hash,
    type: tx.type,
    from: tx.from,
    summary: tx.summary ?? tx.translatableSummary?.text ?? null,
    addedTime: tx.addedTime,
    confirmedTime: tx.confirmedTime,
    receipt: tx.receipt ?? null,
    settlementHandoffContext: tx.settlementHandoffContext
      ? {
          amount: tx.settlementHandoffContext.amount,
          fee: tx.settlementHandoffContext.fee,
          asset: tx.settlementHandoffContext.asset,
          kerlConstitutional: tx.settlementHandoffContext.kerlConstitutional ?? null,
          smartRouter: tx.settlementHandoffContext.smartRouter ?? null,
        }
      : null,
    // Gas is not stored on SerializableTransactionReceipt — never estimate.
    gasUsed: null,
  }
}

export function useSmartSwapHistory(pageSize = SMART_SWAP_HISTORY_DEFAULT_PAGE_SIZE): {
  page: SmartSwapHistoryPage
  account?: string
  setPage: (page: number) => void
  refreshKey: number
  refresh: () => void
} {
  const { account } = useWeb3React()
  const transactions = useAllActiveChainTransactions()
  const [pageNum, setPageNum] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  const snapshots = useMemo(() => {
    if (!account) return [] as SmartSwapHistoryTxSnapshot[]
    return Object.values(transactions)
      .filter((tx) => tx.from?.toLowerCase() === account.toLowerCase())
      .map(toSnapshot)
  }, [account, transactions, refreshKey])

  const page = useMemo(
    () =>
      buildSmartSwapHistory({
        transactions: snapshots,
        account,
        page: pageNum,
        pageSize,
      }),
    [snapshots, account, pageNum, pageSize],
  )

  const setPage = useCallback((n: number) => {
    setPageNum(Math.max(1, n))
  }, [])

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return { page, account, setPage, refreshKey, refresh }
}
