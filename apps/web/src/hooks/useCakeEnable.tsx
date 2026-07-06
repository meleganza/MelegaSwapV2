import { useState, useCallback, useMemo, useEffect } from 'react'
import { useIsTransactionPending } from 'state/transactions/hooks'
import { getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'
import { useAppDispatch } from 'state'
import { ChainId, Native } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useTradeExactOut } from 'hooks/Trades'
import { useWeb3React } from '@pancakeswap/wagmi'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import BigNumber from 'bignumber.js'
import { routeV2SwapQuote } from 'lib/routing-layer/facade'
import { useV2SwapExecution } from 'lib/execution-layer'
import { useActiveChainId } from './useActiveChainId'

/**
 * Internal CAKE-enable utility — routes through canonical routing facade
 * and execution-ingress via useV2SwapExecution (same boundary as swap commit buttons).
 */
export const useCakeEnable = (enableAmount: BigNumber) => {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const dispatch = useAppDispatch()
  const [pendingEnableTx, setPendingEnableTx] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string>()
  const isTransactionPending = useIsTransactionPending(transactionHash)
  const swapAmount = useMemo(() => getFullDisplayBalance(enableAmount), [enableAmount])

  const parsedAmount = tryParseAmount(swapAmount, CAKE[chainId])

  const trade = useTradeExactOut(Native.onChain(ChainId.BSC), parsedAmount)

  const executionInstruction = useMemo(
    () =>
      trade
        ? routeV2SwapQuote({ trade, allowedSlippage: INITIAL_ALLOWED_SLIPPAGE, recipient: null }).instruction
        : null,
    [trade],
  )

  const { callback: swapCallback } = useV2SwapExecution(executionInstruction)

  useEffect(() => {
    if (pendingEnableTx && transactionHash && !isTransactionPending) {
      setPendingEnableTx(isTransactionPending)
    }
  }, [account, dispatch, transactionHash, pendingEnableTx, isTransactionPending])

  const handleEnable = useCallback(() => {
    if (!swapCallback) {
      return
    }
    setPendingEnableTx(true)
    swapCallback()
      .then((hash) => {
        setTransactionHash(hash)
      })
      .catch(() => {
        setPendingEnableTx(false)
      })
  }, [swapCallback])

  return { handleEnable, pendingEnableTx }
}
