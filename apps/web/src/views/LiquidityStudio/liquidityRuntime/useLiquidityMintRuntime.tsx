import { useCallback, useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Token } from '@pancakeswap/sdk'
import { CAKE, USDC } from '@pancakeswap/tokens'
import { useModal } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import { PairState } from 'hooks/usePairs'
import { Field } from 'state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from 'state/mint/hooks'
import { Field as BurnField, useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from 'state/burn/hooks'
import { useGasPrice, useUserSlippageTolerance } from 'state/user/hooks'
import { useLPApr } from 'state/swap/useLPApr'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, calculateSlippageAmount, useRouterContract } from 'utils/exchange'
import currencyId from 'utils/currencyId'
import { logError } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import ConfirmAddLiquidityModal from 'views/AddLiquidity/components/ConfirmAddLiquidityModal'
import ConfirmLiquidityModal from 'views/Swap/components/ConfirmRemoveLiquidityModal'
import {
  formatAmount,
  formatPct,
  formatPercentShare,
  formatSlippage,
  pairLabel,
  ratioLabels,
  estimateImpermanentLossPct,
} from './formatLiquidityRuntime'
import { runtimeErrorFromPhase, type LiquidityRuntimeError } from './liquidityRuntimeErrors'
import { useLiquidityPositions, useLiquidityPositionDetails, type LiquidityPositionRow } from './useLiquidityPositions'
import useLiquidityTerminalData from './useLiquidityTerminalData'

export type LiquidityStudioMode = 'Add Liquidity' | 'Remove Liquidity' | 'My Positions' | 'Simulation'

export type LiquidityRuntimePhase =
  | 'idle'
  | 'calculating'
  | 'ready'
  | 'wallet_required'
  | 'approval_required'
  | 'reading_lp'
  | 'error'

export interface LiquidityPreviewMetrics {
  expectedLp: string
  poolShare: string
  apr: string
  feeTier: string
  tokenAPct: number
  tokenBPct: number
  tokenASymbol: string
  tokenBSymbol: string
  impermanentLoss: string
  estimatedDailyFees?: string
  currentValue?: string
  walletContribution?: string
}

export interface LiquidityMachinePayload {
  status: LiquidityRuntimePhase
  mode: LiquidityStudioMode
  chainId?: number
  wallet?: string
  pair?: string
  poolAddress?: string
  approvalA?: string
  approvalB?: string
  expectedLp?: string
  poolShare?: string
  apr?: string
  error?: LiquidityRuntimeError | null
  timestamp: string
}

export interface LiquidityMintRuntime {
  mode: LiquidityStudioMode
  setMode: (mode: LiquidityStudioMode) => void
  phase: LiquidityRuntimePhase
  loadingLabel?: string
  error: LiquidityRuntimeError | null
  currencyA?: Currency
  currencyB?: Currency
  setCurrencyA: (currency: Currency) => void
  setCurrencyB: (currency: Currency) => void
  onFieldAInput: (value: string) => void
  onFieldBInput: (value: string) => void
  onSwapTokens: () => void
  typedValueA: string
  typedValueB: string
  slippageLabel: string
  preview: LiquidityPreviewMetrics
  pairLabel: string
  noLiquidity?: boolean
  approvalA: ApprovalState
  approvalB: ApprovalState
  account?: string
  positions: LiquidityPositionRow[]
  positionsLoading: boolean
  selectedPositionId?: string
  setSelectedPositionId: (id: string) => void
  selectedPosition?: LiquidityPositionRow
  positionDetails: ReturnType<typeof useLiquidityPositionDetails>
  terminal: ReturnType<typeof useLiquidityTerminalData>
  machine: LiquidityMachinePayload
  primaryCtaLabel: string
  onPrimaryAction: () => void
  onRemovePercent: (pct: string) => void
  removePercent: string
  openAddModal: () => void
  openRemoveModal: () => void
}

export function useLiquidityMintRuntime(): LiquidityMintRuntime {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const native = useNativeCurrency()
  const gasPrice = useGasPrice()
  const [allowedSlippage] = useUserSlippageTolerance()
  const addTransaction = useTransactionAdder()
  const routerContract = useRouterContract()
  const deadline = useTransactionDeadline()

  const [mode, setModeState] = useState<LiquidityStudioMode>('Add Liquidity')
  const [currencyIdA, setCurrencyIdA] = useState<string | undefined>(undefined)
  const [currencyIdB, setCurrencyIdB] = useState<string | undefined>(undefined)
  const [selectedPositionId, setSelectedPositionId] = useState<string | undefined>(undefined)

  const defaultB = useMemo(() => {
    if (!chainId) return undefined
    return CAKE[chainId]?.address ?? USDC[chainId]?.address
  }, [chainId])

  const resolvedIdA = currencyIdA ?? native.symbol
  const resolvedIdB = currencyIdB ?? defaultB

  const currencyA = useCurrency(resolvedIdA)
  const currencyB = useCurrency(resolvedIdB)

  const { independentField, typedValue, otherTypedValue } = useMintState()
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(undefined)
  const { onUserInput: onBurnInput } = useBurnActionHandlers()
  const { typedValue: burnTypedValue } = useBurnState()

  const setMode = useCallback(
    (next: LiquidityStudioMode) => {
      setModeState(next)
      if (next === 'Remove Liquidity') onBurnInput('50')
    },
    [onBurnInput],
  )

  const mintInfo = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const {
    pair,
    pairState,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error: mintError,
    currencies,
  } = mintInfo

  const burnInfo = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const lpAprData = useLPApr(pair ?? undefined)
  const poolAddress = pair?.liquidityToken?.address

  const { positions, isLoading: positionsLoading } = useLiquidityPositions()
  const selectedPosition = useMemo(
    () => positions.find((p) => p.id === selectedPositionId) ?? positions[0],
    [positions, selectedPositionId],
  )
  const positionDetails = useLiquidityPositionDetails(selectedPosition)

  const terminal = useLiquidityTerminalData(
    poolAddress,
    currencyA?.symbol,
    currencyB?.symbol,
  )

  const [approvalA, approveACallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_A],
    chainId ? ROUTER_ADDRESS[chainId] : undefined,
  )
  const [approvalB, approveBCallback] = useApproveCallback(
    parsedAmounts[Field.CURRENCY_B],
    chainId ? ROUTER_ADDRESS[chainId] : undefined,
  )
  const [liquidityApproval, approveLiquidityCallback] = useApproveCallback(
    burnInfo.parsedAmounts[BurnField.LIQUIDITY],
    chainId ? ROUTER_ADDRESS[chainId] : undefined,
  )

  const isRemove = mode === 'Remove Liquidity'
  const isPositions = mode === 'My Positions'
  const isSimulation = mode === 'Simulation'
  const calculating = pairState === PairState.LOADING || terminal.isLoadingPools

  const phase: LiquidityRuntimePhase = useMemo(() => {
    if (isSimulation) {
      if (!currencyA || !currencyB) return 'idle'
      if (calculating) return 'calculating'
      return 'ready'
    }
    if (isPositions) {
      if (!account) return 'wallet_required'
      if (positionsLoading) return 'reading_lp'
      return 'idle'
    }
    if (!currencyA || !currencyB) return 'idle'
    if (calculating) return 'calculating'
    if (!account && (typedValue || burnTypedValue)) return 'wallet_required'
    if (!isRemove) {
      if (
        approvalA === ApprovalState.NOT_APPROVED ||
        approvalB === ApprovalState.NOT_APPROVED
      ) {
        if (account && parsedAmounts[Field.CURRENCY_A] && parsedAmounts[Field.CURRENCY_B]) {
          return 'approval_required'
        }
      }
      if (mintError) return 'error'
      if (liquidityMinted && typedValue) return 'ready'
    } else {
      if (liquidityApproval === ApprovalState.NOT_APPROVED && burnInfo.parsedAmounts[BurnField.LIQUIDITY]) {
        return 'approval_required'
      }
      if (burnInfo.error) return 'error'
      if (burnTypedValue) return 'ready'
    }
    return 'idle'
  }, [
    isPositions,
    account,
    positionsLoading,
    currencyA,
    currencyB,
    isSimulation,
    calculating,
    typedValue,
    burnTypedValue,
    isRemove,
    approvalA,
    approvalB,
    parsedAmounts,
    mintError,
    liquidityMinted,
    burnInfo.error,
  ])

  const error = useMemo(
    () => runtimeErrorFromPhase(phase, isRemove ? burnInfo.error : mintError),
    [phase, isRemove, burnInfo.error, mintError],
  )

  const ratios = useMemo(
    () => ratioLabels(parsedAmounts[Field.CURRENCY_A], parsedAmounts[Field.CURRENCY_B], price),
    [parsedAmounts, price],
  )

  const typedValueA =
    independentField === Field.CURRENCY_A ? typedValue : otherTypedValue || parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) || '0.0'
  const typedValueB =
    independentField === Field.CURRENCY_B ? typedValue : otherTypedValue || parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) || '0.0'

  const preview = useMemo((): LiquidityPreviewMetrics => {
    const feeTier = '0.25%'
    if (isPositions && selectedPosition) {
      const share = formatPercentShare(positionDetails.poolShare)
      const lpApr = lpAprData?.lpApr7d
      return {
        expectedLp: formatAmount(selectedPosition.lpBalance, '0.0000'),
        poolShare: share,
        apr: lpApr != null ? `${lpApr.toFixed(2)}%` : '—',
        feeTier,
        tokenAPct: 50,
        tokenBPct: 50,
        tokenASymbol: selectedPosition.pair.token0.symbol ?? 'A',
        tokenBSymbol: selectedPosition.pair.token1.symbol ?? 'B',
        impermanentLoss: estimateImpermanentLossPct(terminal.selectedPool?.volumeUSDChange ?? 0),
        estimatedDailyFees: terminal.selectedPool?.lpFees24h
          ? `$${((terminal.selectedPool.lpFees24h * parseFloat(share)) / 100).toFixed(2)}`
          : undefined,
        currentValue: positionDetails.usdValue != null ? `$${positionDetails.usdValue.toFixed(2)}` : undefined,
        walletContribution: positionDetails.usdValue != null ? `$${positionDetails.usdValue.toFixed(2)}` : undefined,
      }
    }

    const removeParsed = burnInfo.parsedAmounts
    return {
      expectedLp: isRemove
        ? formatAmount(removeParsed[BurnField.LIQUIDITY] as Token | undefined, '0.0000')
        : formatAmount(liquidityMinted, '0.0000'),
      poolShare: isRemove
        ? formatPercentShare(removeParsed[BurnField.LIQUIDITY_PERCENT])
        : formatPercentShare(poolTokenPercentage),
      apr: lpAprData?.lpApr7d != null ? `${lpAprData.lpApr7d.toFixed(2)}%` : '—',
      feeTier,
      tokenAPct: ratios.leftPct,
      tokenBPct: ratios.rightPct,
      tokenASymbol: currencyA?.symbol ?? 'A',
      tokenBSymbol: currencyB?.symbol ?? 'B',
      impermanentLoss: estimateImpermanentLossPct(terminal.selectedPool?.volumeUSDChange ?? 0),
      estimatedDailyFees: terminal.selectedPool?.lpFees24h
        ? `$${terminal.selectedPool.lpFees24h.toFixed(2)}`
        : undefined,
      currentValue: undefined,
      walletContribution: undefined,
    }
  }, [
    isPositions,
    selectedPosition,
    positionDetails,
    lpAprData,
    terminal,
    isRemove,
    burnInfo.parsedAmounts,
    liquidityMinted,
    poolTokenPercentage,
    ratios,
    currencyA?.symbol,
    currencyB?.symbol,
  ])

  const setCurrencyA = useCallback((currency: Currency) => {
    setCurrencyIdA(currencyId(currency))
  }, [])

  const setCurrencyB = useCallback((currency: Currency) => {
    setCurrencyIdB(currencyId(currency))
  }, [])

  const onSwapTokens = useCallback(() => {
    const nextA = resolvedIdB
    const nextB = resolvedIdA
    setCurrencyIdA(nextA)
    setCurrencyIdB(nextB)
  }, [resolvedIdA, resolvedIdB])

  const onRemovePercent = useCallback(
    (pct: string) => {
      onBurnInput(pct)
    },
    [onBurnInput],
  )

  const [{ attemptingTxn, liquidityErrorMessage, txHash }, setLiquidityState] = useState({
    attemptingTxn: false,
    liquidityErrorMessage: undefined as string | undefined,
    txHash: undefined as string | undefined,
  })

  const onAdd = useCallback(async () => {
    if (!chainId || !account || !routerContract) return
    const parsedAmountA = parsedAmounts[Field.CURRENCY_A]
    const parsedAmountB = parsedAmounts[Field.CURRENCY_B]
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) return

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }

    let estimate: (...args: unknown[]) => Promise<BigNumber>
    let method: (...args: unknown[]) => Promise<TransactionResponse>
    let args: Array<string | string[] | number>
    let value: BigNumber | null

    if (currencyA.isNative || currencyB.isNative) {
      const tokenBIsNative = currencyB.isNative
      estimate = routerContract.estimateGas.addLiquidityETH
      method = routerContract.addLiquidityETH
      args = [
        (tokenBIsNative ? currencyA : currencyB).wrapped.address,
        (tokenBIsNative ? parsedAmountA : parsedAmountB).quotient.toString(),
        amountsMin[tokenBIsNative ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
        amountsMin[tokenBIsNative ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
        account,
        deadline.toHexString(),
      ]
      value = BigNumber.from((tokenBIsNative ? parsedAmountB : parsedAmountA).quotient.toString())
    } else {
      estimate = routerContract.estimateGas.addLiquidity
      method = routerContract.addLiquidity
      args = [
        currencyA.wrapped.address,
        currencyB.wrapped.address,
        parsedAmountA.quotient.toString(),
        parsedAmountB.quotient.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ]
      value = null
    }

    setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })
    try {
      const estimatedGasLimit = await estimate(...args, value ? { value } : {})
      const response = await method(...args, {
        ...(value ? { value } : {}),
        gasLimit: calculateGasMargin(estimatedGasLimit),
      })
      setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response.hash })
      addTransaction(response, {
        summary: `Add ${parsedAmountA.toSignificant(3)} ${currencyA.symbol} and ${parsedAmountB.toSignificant(3)} ${currencyB.symbol}`,
        type: 'add-liquidity',
      })
      onFieldAInput('')
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code
      if (code !== 4001) logError(err)
      setLiquidityState({
        attemptingTxn: false,
        liquidityErrorMessage:
          code !== 4001
            ? t('Add liquidity failed: %message%', {
                message: transactionErrorToUserReadableMessage(err, t),
              })
            : undefined,
        txHash: undefined,
      })
    }
  }, [
    chainId,
    account,
    routerContract,
    parsedAmounts,
    currencyA,
    currencyB,
    deadline,
    noLiquidity,
    allowedSlippage,
    addTransaction,
    onFieldAInput,
    t,
  ])

  const pendingText = t('Supplying %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencies[Field.CURRENCY_A]?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencies[Field.CURRENCY_B]?.symbol ?? '',
  })

  const [onPresentAddLiquidityModal] = useModal(
    <ConfirmAddLiquidityModal
      title={noLiquidity ? t('You are creating a trading pair') : t('You will receive')}
      customOnDismiss={() => {
        if (txHash) onFieldAInput('')
      }}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      pendingText={pendingText}
      currencyToAdd={pair?.liquidityToken}
      allowedSlippage={allowedSlippage}
      onAdd={onAdd}
      parsedAmounts={parsedAmounts}
      currencies={currencies}
      liquidityErrorMessage={liquidityErrorMessage}
      price={price}
      noLiquidity={noLiquidity}
      poolTokenPercentage={poolTokenPercentage}
      liquidityMinted={liquidityMinted}
    />,
    true,
    true,
    'liquidityStudioAddModal',
  )

  const onRemove = useCallback(async () => {
    if (!chainId || !account || !routerContract || !pair) return
    const liquidityAmount = burnInfo.parsedAmounts[BurnField.LIQUIDITY]
    const amountA = burnInfo.parsedAmounts[BurnField.CURRENCY_A]
    const amountB = burnInfo.parsedAmounts[BurnField.CURRENCY_B]
    if (!liquidityAmount || !amountA || !amountB || !deadline) return

    setLiquidityState({ attemptingTxn: true, liquidityErrorMessage: undefined, txHash: undefined })
    try {
      const tokenA = currencyA?.wrapped
      const tokenB = currencyB?.wrapped
      const amountsMin = {
        [BurnField.CURRENCY_A]: calculateSlippageAmount(amountA, allowedSlippage)[0],
        [BurnField.CURRENCY_B]: calculateSlippageAmount(amountB, allowedSlippage)[0],
      }
      let response: TransactionResponse
      if (currencyA?.isNative || currencyB?.isNative) {
        const tokenBIsNative = currencyB?.isNative
        const estimate = routerContract.estimateGas.removeLiquidityETH
        const method = routerContract.removeLiquidityETH
        const args = [
          (tokenBIsNative ? tokenA : tokenB)?.address ?? '',
          liquidityAmount.quotient.toString(),
          amountsMin[tokenBIsNative ? BurnField.CURRENCY_A : BurnField.CURRENCY_B].toString(),
          amountsMin[tokenBIsNative ? BurnField.CURRENCY_B : BurnField.CURRENCY_A].toString(),
          account,
          deadline.toHexString(),
        ]
        const estimatedGasLimit = await estimate(...args)
        response = await method(...args, { gasLimit: calculateGasMargin(estimatedGasLimit) })
      } else {
        const estimate = routerContract.estimateGas.removeLiquidity
        const method = routerContract.removeLiquidity
        const args = [
          tokenA?.address ?? '',
          tokenB?.address ?? '',
          liquidityAmount.quotient.toString(),
          amountsMin[BurnField.CURRENCY_A].toString(),
          amountsMin[BurnField.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ]
        const estimatedGasLimit = await estimate(...args)
        response = await method(...args, { gasLimit: calculateGasMargin(estimatedGasLimit) })
      }
      setLiquidityState({ attemptingTxn: false, liquidityErrorMessage: undefined, txHash: response.hash })
      addTransaction(response, {
        summary: `Remove ${currencyA?.symbol}/${currencyB?.symbol} liquidity`,
        type: 'remove-liquidity',
      })
      onBurnInput('')
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code
      if (code !== 4001) logError(err)
      setLiquidityState({
        attemptingTxn: false,
        liquidityErrorMessage:
          code !== 4001
            ? transactionErrorToUserReadableMessage(err, t)
            : undefined,
        txHash: undefined,
      })
    }
  }, [
    chainId,
    account,
    routerContract,
    pair,
    burnInfo.parsedAmounts,
    deadline,
    currencyA,
    currencyB,
    allowedSlippage,
    addTransaction,
    onBurnInput,
    t,
  ])

  const [onPresentRemoveLiquidityModal] = useModal(
    <ConfirmLiquidityModal
      title={t('You will receive')}
      customOnDismiss={() => {
        if (txHash) onBurnInput('')
      }}
      attemptingTxn={attemptingTxn}
      hash={txHash || ''}
      pendingText={t('Removing liquidity')}
      allowedSlippage={allowedSlippage}
      onRemove={onRemove}
      parsedAmounts={burnInfo.parsedAmounts}
      currencyA={currencyA}
      currencyB={currencyB}
      tokenA={currencyA?.wrapped!}
      tokenB={currencyB?.wrapped!}
      approval={liquidityApproval}
      liquidityErrorMessage={liquidityErrorMessage}
      isZap={false}
      toggleZapMode={() => undefined}
    />,
    true,
    true,
    'liquidityStudioRemoveModal',
  )

  const openAddModal = useCallback(() => onPresentAddLiquidityModal(), [onPresentAddLiquidityModal])
  const openRemoveModal = useCallback(() => onPresentRemoveLiquidityModal(), [onPresentRemoveLiquidityModal])

  const onPrimaryAction = useCallback(() => {
    if (isSimulation) return
    if (!account) return
    if (isRemove) {
      if (liquidityApproval === ApprovalState.NOT_APPROVED && burnInfo.parsedAmounts[BurnField.LIQUIDITY]) {
        approveLiquidityCallback()
        return
      }
      openRemoveModal()
      return
    }
    if (approvalA === ApprovalState.NOT_APPROVED && parsedAmounts[Field.CURRENCY_A]) {
      approveACallback()
      return
    }
    if (approvalB === ApprovalState.NOT_APPROVED && parsedAmounts[Field.CURRENCY_B]) {
      approveBCallback()
      return
    }
    openAddModal()
  }, [
    isSimulation,
    account,
    isRemove,
    approvalA,
    approvalB,
    liquidityApproval,
    burnInfo.parsedAmounts,
    parsedAmounts,
    approveACallback,
    approveBCallback,
    approveLiquidityCallback,
    openAddModal,
    openRemoveModal,
  ])

  const primaryCtaLabel = useMemo(() => {
    if (isSimulation) return 'Simulation only — no execution'
    if (!account) return 'Connect Wallet'
    if (phase === 'approval_required') return isRemove ? 'Approve LP Token' : 'Approve Token'
    if (isRemove) return 'Remove Liquidity'
    if (isPositions) return 'Manage on /liquidity'
    return 'Add Liquidity'
  }, [account, phase, isRemove, isPositions, isSimulation])

  const machine: LiquidityMachinePayload = useMemo(
    () => ({
      status: phase,
      mode,
      chainId,
      wallet: account,
      pair: pairLabel(currencyA, currencyB),
      poolAddress,
      approvalA:
        approvalA === ApprovalState.APPROVED
          ? 'APPROVED'
          : approvalA === ApprovalState.PENDING
            ? 'PENDING'
            : approvalA === ApprovalState.NOT_APPROVED
              ? 'NOT_APPROVED'
              : 'UNKNOWN',
      approvalB:
        approvalB === ApprovalState.APPROVED
          ? 'APPROVED'
          : approvalB === ApprovalState.PENDING
            ? 'PENDING'
            : approvalB === ApprovalState.NOT_APPROVED
              ? 'NOT_APPROVED'
              : 'UNKNOWN',
      expectedLp: preview.expectedLp,
      poolShare: preview.poolShare,
      apr: preview.apr,
      error,
      timestamp: new Date().toISOString(),
    }),
    [
      phase,
      mode,
      chainId,
      account,
      currencyA,
      currencyB,
      poolAddress,
      approvalA,
      approvalB,
      preview,
      error,
    ],
  )

  const loadingLabel =
    phase === 'calculating'
      ? 'Calculating…'
      : phase === 'reading_lp'
        ? 'Reading LP…'
        : phase === 'approval_required'
          ? 'Waiting Wallet…'
          : attemptingTxn
            ? 'Broadcasting…'
            : undefined

  return {
    mode,
    setMode,
    phase,
    loadingLabel,
    error,
    currencyA,
    currencyB,
    setCurrencyA,
    setCurrencyB,
    onFieldAInput,
    onFieldBInput,
    onSwapTokens,
    typedValueA: isRemove ? burnInfo.parsedAmounts[BurnField.CURRENCY_A]?.toSignificant(6) ?? '0.0' : typedValueA,
    typedValueB: isRemove ? burnInfo.parsedAmounts[BurnField.CURRENCY_B]?.toSignificant(6) ?? '0.0' : typedValueB,
    slippageLabel: formatSlippage(allowedSlippage),
    preview,
    pairLabel: pairLabel(currencyA, currencyB),
    noLiquidity,
    approvalA,
    approvalB,
    account,
    positions,
    positionsLoading,
    selectedPositionId: selectedPosition?.id,
    setSelectedPositionId,
    selectedPosition,
    positionDetails,
    terminal,
    machine,
    primaryCtaLabel,
    onPrimaryAction,
    onRemovePercent,
    removePercent: burnTypedValue || '50',
    openAddModal,
    openRemoveModal,
  }
}
