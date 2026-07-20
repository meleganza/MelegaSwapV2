import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
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
import { Field as BurnField } from 'state/burn/actions'
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from 'state/burn/hooks'
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
import {
  buildLiquidityWalletPortfolio,
} from './buildLiquidityWalletPortfolio'
import type { WalletPortfolio } from 'lib/wallet-portfolio/contracts'
import useLiquidityTerminalData from './useLiquidityTerminalData'
import { buildMelegaLiquidityV1 } from 'lib/dex-gravity/buildLiquidityMachineV1'
import { consumeOpportunityRef, parseOpportunityRefFromQuery } from 'lib/dex-gravity/radarConsumption'
import { buildLiquidityCanonicalOwnership } from 'lib/liquidity-runtime/canonicalOwnership'
import { routeLiquidityInstruction } from 'lib/routing-layer/facade'
import { LP_SUBMIT_DEFERRAL } from 'lib/liquidity-runtime/lpSubmitDeferral'
import {
  LIQUIDITY_STUDIO_VIEW_BY_MODE,
  liquidityStudioModeFromView,
  type LiquidityStudioMode,
} from './liquidityStudioView'

export type { LiquidityStudioMode }
export { LIQUIDITY_STUDIO_VIEW_BY_MODE, liquidityStudioModeFromView }

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
  canonicalOwner: string
  liquiditySchema: ReturnType<typeof buildMelegaLiquidityV1>
  routingInstruction: ReturnType<typeof routeLiquidityInstruction>
  opportunityRef?: ReturnType<typeof consumeOpportunityRef>
  /** KAP-006E — accepted deferral; ingress does not support liquidity domain yet. */
  lpSubmitDeferral: typeof LP_SUBMIT_DEFERRAL.deferralReason
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
  /** WalletPortfolio assembled from the same producer rows — no second scan. */
  liquidityWalletPortfolio: WalletPortfolio
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
  const router = useRouter()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const native = useNativeCurrency()
  const gasPrice = useGasPrice()
  const [allowedSlippage] = useUserSlippageTolerance()
  const addTransaction = useTransactionAdder()
  const routerContract = useRouterContract()
  const deadline = useTransactionDeadline()

  const initialModeFromView = liquidityStudioModeFromView(router.query.view) ?? 'My Positions'
  const [mode, setModeState] = useState<LiquidityStudioMode>(initialModeFromView)
  const [currencyIdA, setCurrencyIdA] = useState<string | undefined>(undefined)
  const [currencyIdB, setCurrencyIdB] = useState<string | undefined>(undefined)
  const [selectedPositionId, setSelectedPositionId] = useState<string | undefined>(undefined)

  const defaultB = useMemo(() => {
    if (!chainId) return undefined
    return CAKE[chainId]?.address ?? USDC[chainId]?.address
  }, [chainId])

  const isRemoveMode = mode === 'Remove Liquidity'
  const isPositionsMode = mode === 'My Positions'
  const isBuildingMode = mode === 'Liquidity Building'

  // Remove Liquidity must not force BNB/MARCO while wallet LP ownership is the source of truth.
  // Liquidity Building uses its own token picker — do not force default mint pair.
  const resolvedIdA =
    currencyIdA ?? (isRemoveMode || isPositionsMode || isBuildingMode ? undefined : native.symbol)
  const resolvedIdB =
    currencyIdB ?? (isRemoveMode || isPositionsMode || isBuildingMode ? undefined : defaultB)

  const currencyA = useCurrency(resolvedIdA)
  const currencyB = useCurrency(resolvedIdB)

  const { independentField, typedValue, otherTypedValue } = useMintState()
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(undefined)
  const { onUserInput: onBurnInput } = useBurnActionHandlers()
  const { typedValue: burnTypedValue } = useBurnState()

  // LB024 — deep-link / refresh survival for Liquidity Building and other studio views.
  useEffect(() => {
    const fromQuery = liquidityStudioModeFromView(router.query.view)
    if (fromQuery && fromQuery !== mode) {
      setModeState(fromQuery)
      if (fromQuery === 'Remove Liquidity') onBurnInput('50')
    }
    // Only react to query changes (refresh / shared URL), not local mode loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: sync from URL
  }, [router.query.view])

  const setMode = useCallback(
    (next: LiquidityStudioMode) => {
      setModeState(next)
      if (next === 'Remove Liquidity') onBurnInput('50')
      const view = LIQUIDITY_STUDIO_VIEW_BY_MODE[next]
      const current = Array.isArray(router.query.view) ? router.query.view[0] : router.query.view
      if (current === view) return
      const nextQuery = { ...router.query, view }
      router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true }).catch(() => undefined)
    },
    [onBurnInput, router],
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

  const chainName = chainId === 56 ? 'BNB Chain' : chainId === 97 ? 'BNB Testnet' : 'Unknown'
  const liquidityWalletPortfolio = useMemo(
    () =>
      buildLiquidityWalletPortfolio({
        wallet: account ?? null,
        chainId: chainId ?? null,
        chainName,
        generatedAt: '1970-01-01T00:00:00.000Z',
        liquidityRows: positions,
        positionsLoading,
      }),
    [account, chainId, chainName, positions, positionsLoading],
  )
  const selectedPosition = useMemo(
    () => positions.find((p) => p.id === selectedPositionId) ?? (isRemoveMode || isPositionsMode ? positions[0] : undefined),
    [positions, selectedPositionId, isRemoveMode, isPositionsMode],
  )
  const positionDetails = useLiquidityPositionDetails(selectedPosition)

  // Auto-select the sole direct-wallet LP and sync burn currencies from that pair.
  useEffect(() => {
    if (!isRemoveMode && !isPositionsMode) return
    if (positionsLoading) return
    if (positions.length === 1) {
      const only = positions[0]
      if (selectedPositionId !== only.id) setSelectedPositionId(only.id)
    }
    if (positions.length === 0) {
      if (selectedPositionId) setSelectedPositionId(undefined)
      return
    }
  }, [isRemoveMode, isPositionsMode, positions, positionsLoading, selectedPositionId])

  useEffect(() => {
    if (!selectedPosition?.pair) return
    if (!isRemoveMode && !isPositionsMode) return
    const nextA = selectedPosition.pair.token0.address
    const nextB = selectedPosition.pair.token1.address
    if (currencyIdA !== nextA) setCurrencyIdA(nextA)
    if (currencyIdB !== nextB) setCurrencyIdB(nextB)
  }, [selectedPosition, isRemoveMode, isPositionsMode, currencyIdA, currencyIdB])

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
    if ((isPositions || isRemove) && selectedPosition) {
      const share = formatPercentShare(positionDetails.poolShare)
      const lpApr = lpAprData?.lpApr7d
      const removeParsed = burnInfo.parsedAmounts
      return {
        expectedLp: isRemove
          ? formatAmount(removeParsed[BurnField.LIQUIDITY], '0.0000') ||
            formatAmount(selectedPosition.lpBalance, '0.0000')
          : formatAmount(selectedPosition.lpBalance, '0.0000'),
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

    if (isRemove && !selectedPosition) {
      return {
        expectedLp: '—',
        poolShare: '—',
        apr: '—',
        feeTier,
        tokenAPct: 0,
        tokenBPct: 0,
        tokenASymbol: '—',
        tokenBSymbol: '—',
        impermanentLoss: '—',
      }
    }

    const removeParsed = burnInfo.parsedAmounts
    return {
      expectedLp: isRemove
        ? formatAmount(removeParsed[BurnField.LIQUIDITY], '0.0000')
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
    isRemove,
    selectedPosition,
    positionDetails,
    lpAprData,
    terminal,
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
    // KAP-006E: direct router submit — liquidityRuntime canonical; see lpSubmitDeferral.ts
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

  const opportunityRef = useMemo(
    () => consumeOpportunityRef(parseOpportunityRefFromQuery(router.query)),
    [router.query],
  )

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
      canonicalOwner: buildLiquidityCanonicalOwnership().owner,
      liquiditySchema: buildMelegaLiquidityV1({
        operation: isRemove ? 'burn' : isPositions ? 'positions' : 'mint',
        pair: pairLabel(currencyA, currencyB),
        poolAddress,
        wallet: account,
        chainId,
      }),
      routingInstruction: routeLiquidityInstruction({
        operation: isRemove ? 'burn' : 'mint',
        currencyA: currencyA?.symbol,
        currencyB: currencyB?.symbol,
        chainId,
      }),
      opportunityRef,
      lpSubmitDeferral: LP_SUBMIT_DEFERRAL.deferralReason,
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
      isRemove,
      isPositions,
      opportunityRef,
    ],
  )

  const loadingLabel =
    phase === 'calculating'
      ? 'Calculating…'
      : phase === 'reading_lp'
        ? 'Scanning wallet liquidity positions…'
        : phase === 'approval_required'
          ? 'Waiting Wallet…'
          : attemptingTxn
            ? 'Broadcasting…'
            : undefined

  const resolvedPairLabel = selectedPosition?.pairLabel
    || (currencyA && currencyB ? pairLabel(currencyA, currencyB) : isRemove ? 'Select a liquidity position' : pairLabel(currencyA, currencyB))

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
    pairLabel: resolvedPairLabel,
    noLiquidity,
    approvalA,
    approvalB,
    account,
    positions,
    positionsLoading,
    liquidityWalletPortfolio,
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
