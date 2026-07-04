import React, { useEffect, useRef } from 'react'
import {
  buildExecutionReceiptPayload,
  shouldAttemptHandoff,
  submitSettlementHandoff,
} from 'lib/treasury-handoff'
import { useAllChainTransactions } from './hooks'
import { TransactionDetails } from './reducer'

function isConfirmedSwap(tx: TransactionDetails): boolean {
  return tx.type === 'swap' && tx.receipt?.status === 1 && Boolean(tx.settlementHandoffContext)
}

export const TreasuryHandoffUpdater: React.FC<{ chainId: number }> = ({ chainId }) => {
  const transactions = useAllChainTransactions(chainId)
  const inFlight = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!chainId) return

    Object.values(transactions).forEach((tx) => {
      if (!isConfirmedSwap(tx)) return
      if (!shouldAttemptHandoff(chainId, tx.hash)) return
      if (inFlight.current.has(tx.hash)) return

      inFlight.current.add(tx.hash)

      const payload = buildExecutionReceiptPayload({
        chainId,
        transactionHash: tx.hash,
        wallet: tx.from,
        receiptStatus: tx.receipt?.status,
        confirmedTime: tx.confirmedTime ?? tx.addedTime,
        context: tx.settlementHandoffContext!,
      })

      submitSettlementHandoff(payload)
        .catch((error) => {
          console.warn('[treasury-handoff] unexpected handoff error', error)
        })
        .finally(() => {
          inFlight.current.delete(tx.hash)
        })
    })
  }, [chainId, transactions])

  return null
}

export default TreasuryHandoffUpdater
