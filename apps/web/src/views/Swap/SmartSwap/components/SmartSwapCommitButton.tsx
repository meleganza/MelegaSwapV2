import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { Button, Text, useModal, confirmPriceImpactWithoutFee } from '@pancakeswap/uikit'

import { TradeWithStableSwap } from '@pancakeswap/smart-router/evm'
import { GreyCard } from 'components/Card'
import { CommitButton } from 'components/CommitButton'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { AutoRow } from 'components/Layout/Row'
import CircleLoader from 'components/Loader/CircleLoader'
import SettingsModal, { withCustomOnDismiss } from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import {
  BIG_INT_ZERO,
  PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
  ALLOWED_PRICE_IMPACT_HIGH,
} from 'config/constants/exchange'
import { ApprovalState } from 'hooks/useApproveCallback'
import { WrapType } from 'hooks/useWrapCallback'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { isKerlRoutingAuthorityEnforced, useKerlConstitutionalSwap } from 'lib/kerl-constitutional'
import { routeSmartSwapQuoteFromTrade } from 'lib/routing-layer/facade'
import { useSmartSwapExecution } from 'lib/execution-layer'
import { V2_PUBLIC_ACTION, selectSmartSwapCtaExecution } from 'lib/smartswap-universal-engine/v2UserExecutionPlan'
import type { SmartSwapV2CtaBinding } from '../hooks/useSmartSwapV2CtaBinding'
import {
  PINNED_V2_CONFIRMATION_STATUS,
  pinV2Confirmation,
  pinnedV2ConfirmationStatus,
  v2PlanReviewKey,
  type PinnedV2Confirmation,
  type SmartSwapV2ExecutionDisplay,
} from '../utils/v2ExecutionDisplay'
import { Field } from 'state/swap/actions'
import { useUserSingleHopOnly } from 'state/user/hooks'
import { warningSeverity } from 'utils/exchange'
import { resolveSwapActionCta } from '../../resolveSwapActionCta'
import { SwapCallbackError } from '../../components/styleds'
import { computeTradePriceBreakdown } from '../utils/exchange'
import ConfirmSwapModal from './ConfirmSwapModal'

const SettingsModalWithCustomDismiss = withCustomOnDismiss(SettingsModal)

interface SwapCommitButtonPropsType {
  swapIsUnsupported: boolean
  account: string
  showWrap: boolean
  wrapInputError: string
  onWrap: () => Promise<void>
  wrapType: WrapType
  approval: ApprovalState
  approveCallback: () => Promise<void>
  approvalSubmitted: boolean
  currencies: {
    INPUT?: Currency
    OUTPUT?: Currency
  }
  isExpertMode: boolean
  trade: TradeWithStableSwap<Currency, Currency, TradeType>
  swapInputError: string
  currencyBalances: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  recipient: string
  allowedSlippage: number
  parsedIndepentFieldAmount: CurrencyAmount<Currency>
  onUserInput: (field: Field, typedValue: string) => void
  /** Legacy V2-router CTA used as the pre-submission fallback when no certified V2 plan is active (BSC cutover). */
  legacyFallback?: ReactNode
  /** The form's single SmartSwap V2 CTA binding (same plan/latch/refresh lifecycle as the displayed economics). */
  v2Binding: SmartSwapV2CtaBinding
  /** The form's V2 execution display (same facts the page shows); pinned into the V2 confirmation at open. */
  v2ExecutionDisplay?: SmartSwapV2ExecutionDisplay | null
}

export default function SwapCommitButton({
  swapIsUnsupported,
  account,
  showWrap,
  wrapInputError,
  onWrap,
  wrapType,
  approval,
  approveCallback,
  approvalSubmitted: _approvalSubmitted,
  currencies,
  isExpertMode,
  trade,
  swapInputError,
  currencyBalances,
  recipient,
  allowedSlippage,
  parsedIndepentFieldAmount,
  onUserInput,
  legacyFallback,
  v2Binding,
  v2ExecutionDisplay,
}: SwapCommitButtonPropsType) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { address: wagmiAddress } = useAccount()
  /** Single connected truth across web3-react prop + wagmi (header SSOT). */
  const walletConnected = Boolean(account || wagmiAddress)
  const kerlEnforced = isKerlRoutingAuthorityEnforced(chainId)
  const [singleHopOnly] = useUserSingleHopOnly()
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade?.route ? trade : null)

  const kerlSwap = useKerlConstitutionalSwap({
    parsedAmount: parsedIndepentFieldAmount,
    inputCurrency: currencies[Field.INPUT],
    outputCurrency: currencies[Field.OUTPUT],
    allowedSlippage,
    recipient,
  })

  const executionInstruction = useMemo(
    () =>
      kerlEnforced || !trade?.route
        ? null
        : routeSmartSwapQuoteFromTrade({ trade, allowedSlippage, recipient }).instruction,
    [kerlEnforced, trade, allowedSlippage, recipient],
  )

  const { callback: dexSwapCallback, error: swapCallbackError } = useSmartSwapExecution(executionInstruction)
  const swapCallback = kerlEnforced ? kerlSwap.callback : dexSwapCallback
  const { decision: v2CtaDecision, plan: v2Plan, consumeIfGated, v2Pending, refreshV2Quote } = v2Binding
  /** BSC chain-scoped cutover: certified V2 plan is the execution path; legacy-only gates must not block it. */
  const v2Active = v2CtaDecision.publicAction === V2_PUBLIC_ACTION.V2_EXECUTE && v2Plan.ok
  const v2WinnerImpact = v2Plan.winnerPriceImpactPercent
  const v2PriceImpact = useMemo(
    () =>
      v2WinnerImpact != null && Number.isFinite(v2WinnerImpact) && v2WinnerImpact >= 0
        ? new Percent(Math.round(v2WinnerImpact * 100).toString(), '10000')
        : undefined,
    [v2WinnerImpact],
  )
  /** Never apply the legacy route's impact to a different winning V2 venue; V2 minUserOut stays enforced on-chain. */
  const effectivePriceImpact = v2Active ? v2PriceImpact : priceImpactWithoutFee
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: TradeWithStableSwap<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  // Handlers
  const handleSwap = useCallback(() => {
    if (
      effectivePriceImpact &&
      !confirmPriceImpactWithoutFee(
        effectivePriceImpact,
        PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
        ALLOWED_PRICE_IMPACT_HIGH,
        t,
      )
    ) {
      return
    }
    const selected = selectSmartSwapCtaExecution({
      decision: v2CtaDecision,
      plan: v2Plan,
      legacyCallback: swapCallback,
      consumeV2: consumeIfGated,
    })
    if (!selected.run) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    selected
      .run()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [effectivePriceImpact, swapCallback, tradeToConfirm, t, setSwapState, v2CtaDecision, v2Plan, consumeIfGated])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash, setSwapState])

  // V2 confirmation: the plan/display shown when the user clicked Swap, pinned for the modal's lifetime.
  const [v2Confirm, setV2Confirm] = useState<PinnedV2Confirmation | null>(null)
  const v2ConfirmRef = useRef<PinnedV2Confirmation | null>(null)
  v2ConfirmRef.current = v2Confirm
  const [v2ConfirmOpenRequest, setV2ConfirmOpenRequest] = useState(false)
  const [v2CloseRequest, setV2CloseRequest] = useState<string | null>(null)
  const v2ConfirmStatus = v2Confirm
    ? pinnedV2ConfirmationStatus(v2Confirm, { active: v2Active, plan: v2Plan }, Date.now())
    : null

  const handleConfirmDismiss = useCallback(() => {
    setV2Confirm(null)
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash, setSwapState])

  // End Handlers

  // Modals
  const [indirectlyOpenConfirmModalState, setIndirectlyOpenConfirmModalState] = useState(false)

  const [onPresentSettingsModal] = useModal(
    <SettingsModalWithCustomDismiss
      customOnDismiss={() => setIndirectlyOpenConfirmModalState(true)}
      mode={SettingsMode.SWAP_LIQUIDITY}
    />,
  )

  /** V2 Confirm: submits only if the pinned plan is still the current fresh plan; the consume re-validates freshness. */
  const handleV2Confirm = useCallback(() => {
    const pinned = v2ConfirmRef.current
    if (!pinned) return
    const status = pinnedV2ConfirmationStatus(pinned, { active: v2Active, plan: v2Plan }, Date.now())
    if (status !== PINNED_V2_CONFIRMATION_STATUS.CURRENT) {
      setV2CloseRequest(status)
      return
    }
    handleSwap()
  }, [v2Active, v2Plan, handleSwap])

  const [onPresentConfirmModal, onDismissConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      currencyBalances={currencyBalances}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      onConfirm={v2Confirm ? handleV2Confirm : handleSwap}
      swapErrorMessage={swapErrorMessage}
      customOnDismiss={handleConfirmDismiss}
      openSettingModal={onPresentSettingsModal}
      v2Execution={v2Confirm?.display}
      v2ConfirmDisabled={v2ConfirmStatus !== null && v2ConfirmStatus !== PINNED_V2_CONFIRMATION_STATUS.CURRENT}
    />,
    true,
    true,
    'confirmSwapModal',
  )
  // End Modals

  const onSwapHandler = useCallback(() => {
    if (isExpertMode) {
      handleSwap()
    } else if (v2Active) {
      // Non-expert V2: same ConfirmSwapModal shell in V2 mode, showing exactly the facts displayed at click time.
      const pinned = pinV2Confirmation(v2Plan, v2ExecutionDisplay)
      if (!pinned) return
      setSwapState({ tradeToConfirm: trade, attemptingTxn: false, swapErrorMessage: undefined, txHash: undefined })
      setV2Confirm(pinned)
      setV2ConfirmOpenRequest(true)
    } else {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined,
      })
      onPresentConfirmModal()
    }
  }, [isExpertMode, v2Active, v2Plan, v2ExecutionDisplay, handleSwap, onPresentConfirmModal, trade])

  // Present after the pin is committed, so the modal's first frame already renders the pinned V2 facts.
  useEffect(() => {
    if (v2ConfirmOpenRequest && v2Confirm) {
      setV2ConfirmOpenRequest(false)
      onPresentConfirmModal()
    }
  }, [v2ConfirmOpenRequest, v2Confirm, onPresentConfirmModal])

  // Pinned plan expired or replaced before Confirm: close (never submit it) and return to the fresh re-quote lifecycle.
  const v2PinStale =
    v2ConfirmStatus === PINNED_V2_CONFIRMATION_STATUS.EXPIRED || v2ConfirmStatus === PINNED_V2_CONFIRMATION_STATUS.REPLACED
  useEffect(() => {
    if (!v2Confirm || attemptingTxn || txHash || swapErrorMessage) return
    if (!v2PinStale && !v2CloseRequest) return
    const pinnedKey = v2Confirm.reviewKey
    setV2CloseRequest(null)
    setV2Confirm(null)
    onDismissConfirmModal()
    // Return to the same-request re-quote lifecycle: no-op when a newer fresh plan already exists or one is running.
    const currentKey = v2PlanReviewKey(v2Plan)
    const newerFreshPlan = v2Active && currentKey !== null && currentKey !== pinnedKey
    if (!newerFreshPlan && !v2Pending) refreshV2Quote?.()
  }, [
    v2Confirm,
    v2PinStale,
    v2CloseRequest,
    attemptingTxn,
    txHash,
    swapErrorMessage,
    onDismissConfirmModal,
    v2Active,
    v2Plan,
    v2Pending,
    refreshV2Quote,
  ])

  // useEffect
  useEffect(() => {
    if (indirectlyOpenConfirmModalState) {
      setIndirectlyOpenConfirmModalState(false)
      setSwapState((state) => ({
        ...state,
        swapErrorMessage: undefined,
      }))
      onPresentConfirmModal()
    }
  }, [indirectlyOpenConfirmModalState, onPresentConfirmModal, setSwapState])

  // warnings on slippage
  // warningSeverity(undefined) means "blocked"; for V2 an unknown winner impact is not invented (minUserOut enforced).
  const priceImpactSeverity = v2Active && !v2PriceImpact ? 0 : warningSeverity(effectivePriceImpact)

  if (legacyFallback && !v2Active && !(v2Pending && !swapInputError)) {
    // No certified V2 plan active (and none pending): pre-submission legacy fallback. An in-flight V2 consume keeps
    // v2Active latched, so this never replaces the CTA after a V2 submission started.
    return <>{legacyFallback}</>
  }

  if (swapIsUnsupported) {
    return (
      <Button width="100%" disabled>
        {t('Unsupported Asset')}
      </Button>
    )
  }

  if (!walletConnected) {
    return (
      <span data-wallet-connected="false" style={{ display: 'block', width: '100%' }}>
        <ConnectWalletButton width="100%" />
      </span>
    )
  }

  if (showWrap) {
    return (
      <CommitButton width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
        {wrapInputError ?? (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
      </CommitButton>
    )
  }

  if (v2Pending && !swapInputError) {
    // BSC V2 facts still resolving (bounded): hold the single Swap CTA instead of offering legacy approval.
    return (
      <CommitButton width="100%" disabled id="swap-button" data-swap-action-cta data-smartswap-public-action="V2_PENDING">
        <AutoRow gap="6px" justify="center">
          {t('Swap')} <CircleLoader stroke="white" />
        </AutoRow>
      </CommitButton>
    )
  }

  const noRoute = kerlEnforced ? !kerlSwap.executionRequest : !trade?.route

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedIndepentFieldAmount?.greaterThan(BIG_INT_ZERO),
  )

  if (noRoute && userHasSpecifiedInputOutput && !v2Active) {
    return (
      <GreyCard style={{ textAlign: 'center', padding: '0.75rem' }}>
        <Text color="textSubtle">{t('Insufficient liquidity for this trade.')}</Text>
        {singleHopOnly && <Text color="textSubtle">{t('Try enabling multi-hop trades.')}</Text>}
      </GreyCard>
    )
  }

  const actionCta = resolveSwapActionCta({
    approval,
    swapInputError,
    priceImpactSeverity,
    isExpertMode,
  })
  // V2 approvals (spender = ExecutorV2 only) run inside the V2 consume; never ask for legacy router approval.
  const showApproveFlow = !v2Active && actionCta.showApproveFlow

  const isValid = !swapInputError
  const approved = v2Active || approval === ApprovalState.APPROVED
  const legacyCallbackError = v2Active ? null : swapCallbackError

  if (showApproveFlow) {
    return (
      <>
        <div data-swap-approval-actions data-swap-action-count={actionCta.buttonCount}>
          <CommitButton
            variant="primary"
            onClick={approveCallback}
            disabled={actionCta.enableDisabled}
            width="100%"
            data-swap-action-cta
          >
            {actionCta.kind === 'enabling' ? (
              <AutoRow gap="6px" justify="center">
                {t('Enabling')} <CircleLoader stroke="white" />
              </AutoRow>
            ) : (
              t('Enable %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
            )}
          </CommitButton>
        </div>
        {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </>
    )
  }

  return (
    <>
      <CommitButton
        variant={isValid && priceImpactSeverity > 2 && !legacyCallbackError ? 'danger' : 'primary'}
        onClick={() => {
          onSwapHandler()
        }}
        id="swap-button"
        width="100%"
        data-swap-action-cta
        data-smartswap-public-action={v2CtaDecision.publicAction}
        disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!legacyCallbackError || !approved}
      >
        {swapInputError ||
          (priceImpactSeverity > 3 && !isExpertMode
            ? t('Price Impact Too High')
            : priceImpactSeverity > 2
            ? t('Swap Anyway')
            : t('Swap'))}
      </CommitButton>

      {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </>
  )
}
