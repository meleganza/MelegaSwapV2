import { useCallback, useState } from 'react'
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { TransactionResponse } from '@ethersproject/providers'
import { ToastDescriptionWithTx } from 'components/Toast'

import { logError, isUserRejected } from 'utils/sentry'
import useActiveWeb3React from './useActiveWeb3React'

export interface TransactionResponseForDeploy {
  address: string;

  deployTransaction: TransactionResponse
  deployed: () => void
}

interface Log {
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;

  removed: boolean;

  address: string;
  data: string;

  topics: Array<string>;

  transactionHash: string;
  logIndex: number;
}

interface TransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  root?: string
  gasUsed: BigNumber
  logsBloom: string
  blockHash: string
  transactionHash: string
  logs: Array<Log>
  blockNumber: number
  confirmations: number
  cumulativeGasUsed: BigNumber
  effectiveGasPrice: BigNumber
  byzantium: boolean
  type: number
  status?: number
  events?: Array<any>
}

export type TxResponse = TransactionResponse | null
export type TxResponseForDeploy = TransactionResponseForDeploy | null

export type CatchTxErrorReturn = {
  fetchWithCatchTxError: (fn: () => Promise<TxResponse>) => Promise<TransactionReceipt>
  fetchWithCatchTxErrorForDeploy: (fn: () => Promise<TxResponseForDeploy>) => Promise<TxResponseForDeploy>
  fetchTxResponse: (fn: () => Promise<TxResponse>) => Promise<TxResponse>
  loading: boolean
  txResponseLoading: boolean
}

type ErrorData = {
  code: number
  message: string
}

type TxError = {
  data: ErrorData
  error: string
}

// -32000 is insufficient funds for gas * price + value
const isGasEstimationError = (err: TxError): boolean => err?.data?.code === -32000

export default function useCatchTxError(): CatchTxErrorReturn {
  const { provider } = useActiveWeb3React()
  const { t } = useTranslation()
  const { toastError, toastSuccess } = useToast()
  const [loading, setLoading] = useState(false)
  const [txResponseLoading, setTxResponseLoading] = useState(false)

  const handleNormalError = useCallback(
    (error, tx?: TxResponse) => {
      logError(error)

      if (tx) {
        toastError(
          t('Error'),
          <ToastDescriptionWithTx txHash={tx.hash}>
            {t('Please try again. Confirm the transaction and make sure you are paying enough gas!')}
          </ToastDescriptionWithTx>,
        )
      } else {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      }
    },
    [t, toastError],
  )

  const fetchWithCatchTxError = useCallback(
    async (callTx: () => Promise<TxResponse>): Promise<TransactionReceipt | null> => {
      let tx: TxResponse = null

      try {
        setLoading(true)

        /**
         * https://github.com/vercel/swr/pull/1450
         *
         * wait for useSWRMutation finished, so we could apply SWR in case manually trigger tx call
         */
        tx = await callTx()

        toastSuccess(`${t('Transaction Submitted')}!`, <ToastDescriptionWithTx txHash={tx.hash} />)

        const receipt = await tx.wait()

        return receipt
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else {
            provider
              .call(tx, tx.blockNumber)
              .then(() => {
                handleNormalError(error, tx)
              })
              .catch((err: any) => {
                if (isGasEstimationError(err)) {
                  handleNormalError(error, tx)
                } else {
                  logError(err)

                  let recursiveErr = err

                  let reason: string | undefined

                  // for MetaMask
                  if (recursiveErr?.data?.message) {
                    reason = recursiveErr?.data?.message
                  } else {
                    // for other wallets
                    // Reference
                    // https://github.com/Uniswap/interface/blob/ac962fb00d457bc2c4f59432d7d6d7741443dfea/src/hooks/useSwapCallback.tsx#L216-L222
                    while (recursiveErr) {
                      reason = recursiveErr.reason ?? recursiveErr.message ?? reason
                      recursiveErr = recursiveErr.error ?? recursiveErr.data?.originalError
                    }
                  }

                  const REVERT_STR = 'execution reverted: '
                  const indexInfo = reason?.indexOf(REVERT_STR)
                  const isRevertedError = indexInfo >= 0

                  if (isRevertedError) reason = reason.substring(indexInfo + REVERT_STR.length)

                  toastError(
                    t('Failed'),
                    <ToastDescriptionWithTx txHash={tx.hash}>
                      {isRevertedError
                        ? t('Transaction failed with error: %reason%', { reason })
                        : t('Transaction failed. For detailed error message:')}
                    </ToastDescriptionWithTx>,
                  )
                }
              })
          }
        }
      } finally {
        setLoading(false)
      }

      return null
    },
    [handleNormalError, toastError, provider, toastSuccess, t],
  )

  const fetchWithCatchTxErrorForDeploy = useCallback(
    async (callTx: () => Promise<TransactionResponseForDeploy>): Promise<TxResponseForDeploy> => {
      let tx: TransactionResponseForDeploy = null

      try {
        setLoading(true)

        /**
         * https://github.com/vercel/swr/pull/1450
         *
         * wait for useSWRMutation finished, so we could apply SWR in case manually trigger tx call
         */
        tx = await callTx()
        await tx.deployed()

        toastSuccess(`${t('Transaction Submitted')}!`, <ToastDescriptionWithTx txHash={tx.deployTransaction.hash} />)

        return tx
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else {
            provider
              .call(tx.deployTransaction, tx.deployTransaction.blockNumber)
              .then(() => {
                handleNormalError(error, tx.deployTransaction)
              })
              .catch((err: any) => {
                if (isGasEstimationError(err)) {
                  handleNormalError(error, tx.deployTransaction)
                } else {
                  logError(err)

                  let recursiveErr = err

                  let reason: string | undefined

                  // for MetaMask
                  if (recursiveErr?.data?.message) {
                    reason = recursiveErr?.data?.message
                  } else {
                    // for other wallets
                    // Reference
                    // https://github.com/Uniswap/interface/blob/ac962fb00d457bc2c4f59432d7d6d7741443dfea/src/hooks/useSwapCallback.tsx#L216-L222
                    while (recursiveErr) {
                      reason = recursiveErr.reason ?? recursiveErr.message ?? reason
                      recursiveErr = recursiveErr.error ?? recursiveErr.data?.originalError
                    }
                  }

                  const REVERT_STR = 'execution reverted: '
                  const indexInfo = reason?.indexOf(REVERT_STR)
                  const isRevertedError = indexInfo >= 0

                  if (isRevertedError) reason = reason.substring(indexInfo + REVERT_STR.length)

                  toastError(
                    t('Failed'),
                    <ToastDescriptionWithTx txHash={tx.deployTransaction.hash}>
                      {isRevertedError
                        ? t('Transaction failed with error: %reason%', { reason })
                        : t('Transaction failed. For detailed error message:')}
                    </ToastDescriptionWithTx>,
                  )
                }
              })
          }
        }
      } finally {
        setLoading(false)
      }

      return null
    },
    [handleNormalError, toastError, provider, toastSuccess, t],
  )

  const fetchTxResponse = useCallback(
    async (callTx: () => Promise<TxResponse>): Promise<TxResponse> => {
      let tx: TxResponse = null

      try {
        setTxResponseLoading(true)

        /**
         * https://github.com/vercel/swr/pull/1450
         *
         * wait for useSWRMutation finished, so we could apply SWR in case manually trigger tx call
         */
        tx = await callTx()

        toastSuccess(`${t('Transaction Submitted')}!`, <ToastDescriptionWithTx txHash={tx.hash} />)

        return tx
      } catch (error: any) {
        if (!isUserRejected(error)) {
          if (!tx) {
            handleNormalError(error)
          } else {
            provider
              .call(tx, tx.blockNumber)
              .then(() => {
                handleNormalError(error, tx)
              })
              .catch((err: any) => {
                if (isGasEstimationError(err)) {
                  handleNormalError(error, tx)
                } else {
                  logError(err)

                  let recursiveErr = err

                  let reason: string | undefined

                  // for MetaMask
                  if (recursiveErr?.data?.message) {
                    reason = recursiveErr?.data?.message
                  } else {
                    // for other wallets
                    // Reference
                    // https://github.com/Uniswap/interface/blob/ac962fb00d457bc2c4f59432d7d6d7741443dfea/src/hooks/useSwapCallback.tsx#L216-L222
                    while (recursiveErr) {
                      reason = recursiveErr.reason ?? recursiveErr.message ?? reason
                      recursiveErr = recursiveErr.error ?? recursiveErr.data?.originalError
                    }
                  }

                  const REVERT_STR = 'execution reverted: '
                  const indexInfo = reason?.indexOf(REVERT_STR)
                  const isRevertedError = indexInfo >= 0

                  if (isRevertedError) reason = reason.substring(indexInfo + REVERT_STR.length)

                  toastError(
                    t('Failed'),
                    <ToastDescriptionWithTx txHash={tx.hash}>
                      {isRevertedError
                        ? t('Transaction failed with error: %reason%', { reason })
                        : t('Transaction failed. For detailed error message:')}
                    </ToastDescriptionWithTx>,
                  )
                }
              })
          }
        }
      } finally {
        setTxResponseLoading(false)
      }

      return null
    },
    [handleNormalError, toastError, provider, toastSuccess, t],
  )

  return {
    fetchWithCatchTxError,
    fetchWithCatchTxErrorForDeploy,
    fetchTxResponse,
    loading,
    txResponseLoading,
  }
}
