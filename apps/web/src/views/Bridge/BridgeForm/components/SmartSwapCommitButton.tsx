import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { CommitButton } from 'components/CommitButton'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Column from 'components/Layout/Column'
import { AutoRow, RowBetween } from 'components/Layout/Row'
import CircleLoader from 'components/Loader/CircleLoader'
import { ApprovalState } from 'hooks/useApproveCallback'
import { Field } from 'state/swap/actions'
import ProgressSteps from 'views/Swap/components/ProgressSteps'
import useCatchTxError from 'hooks/useCatchTxError'
import { ToastDescriptionWithTx } from 'components/Toast'
import useBurnToken from 'views/Bridge/hooks/useBurnToken'

interface SwapCommitButtonPropsType {
  account: string
  approval: ApprovalState
  approveCallback: () => Promise<void>
  approvalSubmitted: boolean
  setApprovalSubmitted: (b: boolean) => void
  currencies: {
    INPUT?: Currency
    OUTPUT?: Currency
  }
  swapInputError: string
  currencyBalances?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  parsedAmount: CurrencyAmount<Currency>
  onUserInput?: (field: Field, typedValue: string) => void
  pid: number
  isNative: boolean
}

export default function BridgeCommitButton({
  account,
  approval,
  approveCallback,
  approvalSubmitted,
  setApprovalSubmitted,
  currencies,
  swapInputError,
  // currencyBalances,
  parsedAmount,
  // onUserInput,
  pid,
  isNative
}: SwapCommitButtonPropsType) {
  const { t } = useTranslation()
  // const [singleHopOnly] = useUserSingleHopOnly()
  // const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  // the callback to execute the swap

  // const [pendingTx, setPendingTx] = useState(false);

  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()

  const { onStake } = useBurnToken(pid, isNative)

  // const [pendingTx, setPendingTx] = useState(false);

  // const swapCalls = useSwapCallArguments(trade, allowedSlippage, recipient)

  // const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
  //   trade,
  //   allowedSlippage,
  //   recipient,
  //   swapCalls,
  // )
  // const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
  //   tradeToConfirm: TradeWithStableSwap<Currency, Currency, TradeType> | undefined
  //   attemptingTxn: boolean
  //   swapErrorMessage: string | undefined
  //   txHash: string | undefined
  // }>({
  //   tradeToConfirm: undefined,
  //   attemptingTxn: false,
  //   swapErrorMessage: undefined,
  //   txHash: undefined,
  // })

  // Handlers
  const handleSwap = async () => {
    // if (
    //   priceImpactWithoutFee &&
    //   !confirmPriceImpactWithoutFee(
    //     priceImpactWithoutFee,
    //     PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
    //     ALLOWED_PRICE_IMPACT_HIGH,
    //     t,
    //   )
    // ) {
    //   return
    // }
    const receipt = await fetchWithCatchTxError(() => onStake(parsedAmount.toFixed(0)))
    setApprovalSubmitted(false)

    if (receipt?.status) {
      toastSuccess(
        `${t('Bridged!')}!`,
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('Your funds have been locked in the bridge pool. You will receive the funds in 1~2 minutes')}
        </ToastDescriptionWithTx>,
      )
    }
  }

  // const handleAcceptChanges = useCallback(() => {
  //   setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  // }, [attemptingTxn, swapErrorMessage, trade, txHash, setSwapState])

  // const handleConfirmDismiss = useCallback(() => {
  //   setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
  //   // if there was a tx hash, we want to clear the input
  //   if (txHash) {
  //     onUserInput(Field.INPUT, '')
  //   }
  // }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash, setSwapState])

  // End Handlers

  // Modals
  // const [indirectlyOpenConfirmModalState, setIndirectlyOpenConfirmModalState] = useState(false)

  // const [onPresentSettingsModal] = useModal(
  //   <SettingsModalWithCustomDismiss
  //     customOnDismiss={() => setIndirectlyOpenConfirmModalState(true)}
  //     mode={SettingsMode.SWAP_LIQUIDITY}
  //   />,
  // )

  // const [onPresentConfirmModal] = useModal(
  //   <ConfirmBridgeModal
  //     trade={trade}
  //     originalTrade={tradeToConfirm}
  //     currencyBalances={currencyBalances}
  //     onAcceptChanges={handleAcceptChanges}
  //     attemptingTxn={attemptingTxn}
  //     txHash={txHash}
  //     recipient={recipient}
  //     allowedSlippage={allowedSlippage}
  //     onConfirm={handleSwap}
  //     swapErrorMessage={swapErrorMessage}
  //     customOnDismiss={handleConfirmDismiss}
  //     openSettingModal={onPresentSettingsModal}
  //   />,
  //   true,
  //   true,
  //   'confirmSwapModal',
  // )
  // End Modals

  // const onSwapHandler = useCallback(() => {
  //   handleSwap()
  // }, [handleSwap])

  // useEffect
  // useEffect(() => {
  //   if (indirectlyOpenConfirmModalState) {
  //     setIndirectlyOpenConfirmModalState(false)
  //     setSwapState((state) => ({
  //       ...state,
  //       swapErrorMessage: undefined,
  //     }))
  //     onPresentConfirmModal()
  //   }
  // }, [indirectlyOpenConfirmModalState, onPresentConfirmModal, setSwapState])

  // warnings on slippage
  // const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // if (swapIsUnsupported) {
  //   return (
  //     <Button width="100%" disabled>
  //       {t('Unsupported Asset')}
  //     </Button>
  //   )
  // }

  if (!account) {
    return <ConnectWalletButton width="100%" />
  }

  // if (showWrap) {
  //   return (
  //     <CommitButton width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
  //       {wrapInputError ?? (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
  //     </CommitButton>
  //   )
  // }

  // const noRoute = !trade?.route

  // const userHasSpecifiedInputOutput = Boolean(
  //   currencies[Field.INPUT] && parsedIndepentFieldAmount?.greaterThan(BIG_INT_ZERO),
  // )

  // if (noRoute && userHasSpecifiedInputOutput) {
  //   return (
  //     <GreyCard style={{ textAlign: 'center', padding: '0.75rem' }}>
  //       <Text color="textSubtle">{t('Insufficient liquidity for this trade.')}</Text>
  //       {singleHopOnly && <Text color="textSubtle">{t('Try enabling multi-hop trades.')}</Text>}
  //     </GreyCard>
  //   )
  // }

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED))

  const isValid = !swapInputError
  const approved = approval === ApprovalState.APPROVED

  // console.log("approved", approval)
  // console.log("swapInputError", swapInputError)
  // console.log("pendingTx", pendingTx)

  if (showApproveFlow) {
    return (
      <>
        <RowBetween>
          <CommitButton
            variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
            onClick={approveCallback}
            disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
            width="48%"
          >
            {approval === ApprovalState.PENDING ? (
              <AutoRow gap="6px" justify="center">
                {t('Enabling')} <CircleLoader stroke="white" />
              </AutoRow>
            ) : approvalSubmitted && approved ? (
              t('Enabled')
            ) : (
              t('Enable %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
            )}
          </CommitButton>
          <CommitButton
            variant='primary'
            onClick={handleSwap}
            width="48%"
            id="swap-button"
            disabled={!isValid || !approved || pendingTx}
          >
            {
              pendingTx ? 
                <AutoRow gap="6px" justify="center">
                  {t('Bridging')} <CircleLoader stroke="white" />
                </AutoRow> 
              : 
                t('Bridge')
            }
          </CommitButton>
        </RowBetween>
        <Column style={{ marginTop: '1rem' }}>
          <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
        </Column>
        {/* {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
      </>
    )
  }

  return (
    <>
      <CommitButton
        variant='primary'
        onClick={handleSwap}
        id="swap-button"
        width="100%"
        disabled={!isValid || !approved || pendingTx}
      >
        {swapInputError ||
          (pendingTx ? 
            <AutoRow gap="6px" justify="center">
              {t('Bridging')} <CircleLoader stroke="white" />
            </AutoRow>
          : 
          t('Bridge'))}
      </CommitButton>

      {/* {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null} */}
    </>
  )
}
