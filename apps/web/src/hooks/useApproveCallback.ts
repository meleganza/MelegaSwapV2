import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Trade, TradeType } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { logError } from 'utils/sentry'
import { Field } from '../state/swap/actions'
import { useHasPendingApproval, useTransactionAdder } from '../state/transactions/hooks'
import { calculateGasMargin } from '../utils'
import { computeSlippageAdjustedAmounts } from '../utils/exchange'
// import useGelatoLimitOrdersLib from './limitOrders/useGelatoLimitOrdersLib'
import { useCallWithGasPrice } from './useCallWithGasPrice'
import { useTokenContract } from './useContract'
import useTokenAllowance from './useTokenAllowance'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

type AllowanceComparable = {
  lessThan: (other: CurrencyAmount<Currency>) => boolean
}

/** Pure approval-state reducer. Kept in-file so the hook stays the only runtime owner. */
export function resolveApprovalState(input: {
  amountToApprove?: CurrencyAmount<Currency>
  spender?: string
  currentAllowance?: AllowanceComparable | null
  effectivePendingApproval: boolean
  unknownAllowanceTimedOut: boolean
}): ApprovalState {
  if (!input.amountToApprove || !input.spender) return ApprovalState.UNKNOWN
  if (input.amountToApprove.currency?.isNative) return ApprovalState.APPROVED
  if (!input.currentAllowance) {
    if (!input.unknownAllowanceTimedOut) return ApprovalState.UNKNOWN
    return input.effectivePendingApproval ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED
  }
  return input.currentAllowance.lessThan(input.amountToApprove)
    ? input.effectivePendingApproval
      ? ApprovalState.PENDING
      : ApprovalState.NOT_APPROVED
    : ApprovalState.APPROVED
}

export type ApproveCallbackOptions = {
  /**
   * Bounded escape hatch for safety-critical actions. If every allowance read
   * is unavailable, treat the token as requiring approval instead of leaving
   * the user permanently blocked in UNKNOWN. The approval transaction remains
   * explicit and wallet-signed.
   */
  unknownAllowanceTimeoutMs?: number
  /** Refresh allowance directly while a locally recorded approval is pending. */
  pendingAllowancePollMs?: number
  /** Stop trusting an unconfirmed local transaction record after this bounded interval. */
  pendingApprovalTimeoutMs?: number
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string,
  options?: ApproveCallbackOptions,
): [ApprovalState, () => Promise<void>] {
  const { address: account } = useAccount()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { t } = useTranslation()
  const { toastError } = useToast()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const [unknownAllowanceTimedOut, setUnknownAllowanceTimedOut] = useState(false)
  const [pendingApprovalTimedOut, setPendingApprovalTimedOut] = useState(false)
  const [pendingApprovalCycle, setPendingApprovalCycle] = useState(0)
  const approvalRequestKey =
    amountToApprove && spender
      ? `${amountToApprove.currency.chainId}:${amountToApprove.currency.wrapped.address}:${amountToApprove.quotient}:${spender}`
      : undefined

  useEffect(() => {
    setPendingApprovalTimedOut(false)
    if (!pendingApproval || !options?.pendingApprovalTimeoutMs) return undefined
    const timer = window.setTimeout(() => setPendingApprovalTimedOut(true), options.pendingApprovalTimeoutMs)
    return () => window.clearTimeout(timer)
  }, [pendingApproval, pendingApprovalCycle, options?.pendingApprovalTimeoutMs])

  const effectivePendingApproval = pendingApproval && !pendingApprovalTimedOut
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender, {
    pollIntervalMs: effectivePendingApproval ? options?.pendingAllowancePollMs : undefined,
  })

  useEffect(() => {
    setUnknownAllowanceTimedOut(false)
    if (
      !options?.unknownAllowanceTimeoutMs ||
      !amountToApprove ||
      !spender ||
      amountToApprove.currency?.isNative ||
      currentAllowance
    ) {
      return undefined
    }
    const timer = window.setTimeout(() => setUnknownAllowanceTimedOut(true), options.unknownAllowanceTimeoutMs)
    return () => window.clearTimeout(timer)
  }, [
    approvalRequestKey,
    amountToApprove?.currency?.isNative,
    spender,
    currentAllowance,
    options?.unknownAllowanceTimeoutMs,
  ])

  // check the current approval status
  const approvalState: ApprovalState = useMemo(
    () =>
      resolveApprovalState({
        amountToApprove,
        spender,
        currentAllowance,
        effectivePendingApproval,
        unknownAllowanceTimedOut,
      }),
    [amountToApprove, currentAllowance, effectivePendingApproval, spender, unknownAllowanceTimedOut],
  )

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      toastError(t('Error'), t('Approve was called unnecessarily'))
      console.error('approve was called unnecessarily')
      return undefined
    }
    if (!token) {
      toastError(t('Error'), t('No token'))
      console.error('no token')
      return undefined
    }

    if (!tokenContract) {
      toastError(t('Error'), t('Cannot find contract of the token %tokenAddress%', { tokenAddress: token?.address }))
      console.error('tokenContract is null')
      return undefined
    }

    if (!amountToApprove) {
      toastError(t('Error'), t('Missing amount to approve'))
      console.error('missing amount to approve')
      return undefined
    }

    if (!spender) {
      toastError(t('Error'), t('No spender'))
      console.error('no spender')
      return undefined
    }

    let useExact = false

    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString()).catch(() => {
        console.error('estimate gas failure')
        toastError(t('Error'), t('Unexpected error. Could not estimate gas for the approve.'))
        return null
      })
    })

    if (!estimatedGas) return undefined

    return callWithGasPrice(
      tokenContract,
      'approve',
      [spender, useExact ? amountToApprove.quotient.toString() : MaxUint256],
      {
        gasLimit: calculateGasMargin(estimatedGas),
      },
    )
      .then((response: TransactionResponse) => {
        setPendingApprovalCycle((cycle) => cycle + 1)
        addTransaction(response, {
          summary: `Approve ${amountToApprove.currency.symbol}`,
          translatableSummary: { text: 'Approve %symbol%', data: { symbol: amountToApprove.currency.symbol } },
          approval: { tokenAddress: token.address, spender },
          type: 'approve',
        })
      })
      .catch((error: any) => {
        logError(error)
        console.error('Failed to approve token', error)
        if (error?.code !== 4001) {
          toastError(t('Error'), error.message)
        }
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction, callWithGasPrice, t, toastError])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade?: Trade<Currency, Currency, TradeType>,
  allowedSlippage = 0,
  chainId?: number,
) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )

  return useApproveCallback(amountToApprove, ROUTER_ADDRESS[chainId])
}

// Wraps useApproveCallback in the context of a Gelato Limit Orders
// export function useApproveCallbackFromInputCurrencyAmount(currencyAmountIn: CurrencyAmount<Currency> | undefined) {
//   const gelatoLibrary = useGelatoLimitOrdersLib()

//   return useApproveCallback(currencyAmountIn, gelatoLibrary?.erc20OrderRouter.address ?? undefined)
// }
