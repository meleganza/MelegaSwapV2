import { useMemo } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useProtocolTransactionsSWR } from 'state/info/hooks'
import { useAllActiveChainTransactions } from 'state/transactions/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getSettlementReference } from 'lib/treasury-handoff'
import type { TransactionDetails } from 'state/transactions/reducer'
import {
  buildProtocolHistoryRows,
  buildWalletHistoryRows,
  mergeTradeHistoryRows,
  type TradeHistoryRow,
} from './formatTradeHistory'

export interface TradeHistoryRuntime {
  account?: string
  rows: TradeHistoryRow[]
  emptyLabel: string
  sourceLabel: string
}

export function useTradeHistoryRuntime(): TradeHistoryRuntime {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const transactions = useAllActiveChainTransactions()
  const protocolTxs = useProtocolTransactionsSWR()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const walletTxList = useMemo((): TransactionDetails[] => {
    if (!account) return []
    return Object.values(transactions).filter((tx) => tx.from?.toLowerCase() === account.toLowerCase())
  }, [account, transactions])

  const settlementByHash = useMemo(() => {
    const map: Record<string, ReturnType<typeof getSettlementReference>> = {}
    if (!chainId) return map
    walletTxList.forEach((tx) => {
      const ref = getSettlementReference(chainId, tx.hash)
      if (ref) map[tx.hash] = ref
    })
    return map
  }, [chainId, walletTxList])

  const rows = useMemo(() => {
    const walletRows = account ? buildWalletHistoryRows(walletTxList, settlementByHash) : []
    const protocolRows = buildProtocolHistoryRows(
      protocolTxs,
      inputCurrency?.symbol,
      outputCurrency?.symbol,
    )
    if (account) return walletRows
    return protocolRows
  }, [account, walletTxList, settlementByHash, protocolTxs, inputCurrency?.symbol, outputCurrency?.symbol])

  const emptyLabel = account
    ? 'No swap history for this wallet yet.'
    : 'No recent protocol swaps for this pair.'

  const sourceLabel = account ? 'Wallet swap history' : 'Protocol recent swaps'

  return { account, rows, emptyLabel, sourceLabel }
}
