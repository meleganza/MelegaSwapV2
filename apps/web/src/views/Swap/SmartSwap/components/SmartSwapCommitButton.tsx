import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
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
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { isKerlRoutingAuthorityEnforced, useKerlConstitutionalSwap } from 'lib/kerl-constitutional'
import { routeSmartSwapQuoteFromTrade } from 'lib/routing-layer/facade'
import { useSmartSwapExecution } from 'lib/execution-layer'
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
      priceImpactWithoutFee &&
      !confirmPriceImpactWithoutFee(
        priceImpactWithoutFee,
        PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
        ALLOWED_PRICE_IMPACT_HIGH,
        t,
      )
    ) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
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
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, t, setSwapState])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash, setSwapState])

  const handleConfirmDismiss = useCallback(() => {
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

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      currencyBalances={currencyBalances}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      customOnDismiss={handleConfirmDismiss}
      openSettingModal={onPresentSettingsModal}
    />,
    true,
    true,
    'confirmSwapModal',
  )
  // End Modals

  const onSwapHandler = useCallback(() => {
    if (isExpertMode) {
      handleSwap()
    } else {
      setSwapState({
        tradeToConfirm: trade,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined,
      })
      onPresentConfirmModal()
    }
  }, [isExpertMode, handleSwap, onPresentConfirmModal, trade])

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
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

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

  const noRoute = kerlEnforced ? !kerlSwap.executionRequest : !trade?.route

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedIndepentFieldAmount?.greaterThan(BIG_INT_ZERO),
  )

  if (noRoute && userHasSpecifiedInputOutput) {
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
  const showApproveFlow = actionCta.showApproveFlow

  const isValid = !swapInputError
  const approved = approval === ApprovalState.APPROVED

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
        variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
        onClick={() => {
          onSwapHandler()
        }}
        id="swap-button"
        width="100%"
        data-swap-action-cta
        disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError || !approved}
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
