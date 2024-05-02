import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, NATIVE, Percent, ChainId, } from '@pancakeswap/sdk'
import {
  Box,
  Swap as SwapUI,
} from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useBridgeActionHandlers } from 'state/swap/useSwapActionHandlers'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import addresses from 'config/constants/contracts'

import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { AutoColumn } from 'components/Layout/Column'
import { AutoRow } from 'components/Layout/Row'
import { CommonBasesType } from 'components/SearchModal/types'
import { useCurrency, useCurrencyBridge } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import useBridgePool from 'hooks/useBridgePool'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useAtomValue } from 'jotai'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import CurrencyInputPanelForBridge from 'components/CurrencyInputPanel/bridge'
import { Wrapper } from 'views/Swap/components/styleds'
import useRefreshBlockNumberID from 'views/Swap/hooks/useRefreshBlockNumber'
import useWarningImport from 'views/Bridge/hooks/useWarningImport'
import { useDerivedBridgeInfoWithStableSwap } from './hooks/useDerivedSwapInfoWithStableSwap'
import SmartSwapCommitButton from './components/SmartSwapCommitButton'
import CurrencyInputHeader from '../components/CurrencyInputHeader'
import { combinedTokenMapFromOfficialsUrlsAtom } from '../../../state/lists/hooks'

const getPID = (symbol?: string, chainId?: number) => {
  if (symbol === "MATIC") {
    return chainId === ChainId.ARBITRUM ? {pid: 0, isNative: true} : {pid: 0, isNative: false}
  }
  if (symbol === "KNB") {
    return chainId === ChainId.ARBITRUM ? {pid: 1, isNative: true} : {pid: 1, isNative: false}
  }
  if (symbol === "XKR") {
    return {pid: 2, isNative: false}
  }
  if (symbol === "USDT") {
    return {pid: 3, isNative: false}
  }
  return {pid: undefined, isNative: undefined}
}

export const BridgeForm: React.FC<Record<string, never>> = () => {
  // const { isAccessTokenSupported } = useContext(SwapFeaturesContext)
  const { t } = useTranslation()
  const { refreshBlockNumber, isLoading } = useRefreshBlockNumberID()
  const warningSwapHandler = useWarningImport()
  const tokenMap = useAtomValue(combinedTokenMapFromOfficialsUrlsAtom)

  const { account, chainId } = useActiveWeb3React()

  const sourceChain = chainId === ChainId.ETHEREUM ? chainId : ChainId.ARBITRUM
  const targetChain = sourceChain === ChainId.ETHEREUM ? ChainId.ARBITRUM : ChainId.ETHEREUM

  const { switchNetworkAsync } = useSwitchNetwork()

  // swap state & price data

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrencyBridge(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency ?? undefined,
      [Field.OUTPUT]: outputCurrency ?? undefined,
    }),
    [inputCurrency, outputCurrency],
  )

  replaceBrowserHistory('token', inputCurrency?.symbol)

  const {pid, isNative} = getPID(inputCurrency?.symbol, sourceChain)

  const poolInfo = useBridgePool(pid)



  // const [isStableSwapByDefault] = useStableSwapByDefault()

  // const { v2Trade, inputError: swapInputError } = useDerivedSwapInfo(
  //   independentField,
  //   typedValue,
  //   inputCurrency,
  //   outputCurrency,
  //   recipient,
  // )
  const {
    // trade: tradeWithStableSwap,
    currencyBalances,
    parsedAmount,
    inputError: stableSwapInputError,
  } = useDerivedBridgeInfoWithStableSwap(independentField, typedValue, inputCurrency, outputCurrency, poolInfo?.min.toString(), poolInfo?.enabled)

  // const isSmartRouterBetter = useIsSmartRouterBetter({ trade: tradeWithStableSwap, v2Trade })

  // const tradeInfo = useTradeInfo({
  //   trade: tradeWithStableSwap,
  //   v2Trade,
  //   useSmartRouter: (allowUseSmartRouter || isStableSwapByDefault) && isSmartRouterBetter,
  //   allowedSlippage,
  //   chainId,
  //   swapInputError,
  //   stableSwapInputError,
  // })

  // const {
  //   wrapType,
  //   execute: onWrap,
  //   inputError: wrapInputError,
  // } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  // const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  // const parsedAmounts = showWrap
  //   ? {
  //       [Field.INPUT]: parsedAmount,
  //       [Field.OUTPUT]: parsedAmount,
  //     }
  //   : {
  //       [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : parsedAmount,
  //       [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : parsedAmount,
  //     }

  const { onCurrencySelection, onUserInput } = useBridgeActionHandlers()

  // const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  // const handleTypeOutput = useCallback(
  //   (value: string) => {
  //     onUserInput(Field.OUTPUT, value)
  //   },
  //   [onUserInput],
  // )

  const formattedAmounts = {
    [independentField]: typedValue,
    // [dependentField]: showWrap
    //   ? parsedAmounts[independentField]?.toExact() ?? ''
    //   : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // const amountToApprove = parsedAmount
  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallback(parsedAmount, addresses.bridge[sourceChain])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  const handleInputSelect = useCallback(
    (newCurrencyInput) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, newCurrencyInput?.symbol)

      // warningSwapHandler(newCurrencyInput)

      // const newCurrencyInputId = currencyId(newCurrencyInput)
      // if (newCurrencyInputId === outputCurrencyId) {
      //   replaceBrowserHistory('outputCurrency', inputCurrencyId)
      // }
      // replaceBrowserHistory('token', newCurrencyInput?.symbol)
    },
    // [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
    [inputCurrencyId, outputCurrencyId, onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const handlePercentInput = useCallback(
    (percent) => {
      if (maxAmountInput) {
        onUserInput(Field.INPUT, maxAmountInput.multiply(new Percent(percent, 100)).toExact())
      }
    },
    [maxAmountInput, onUserInput],
  )

  const hasAmount = Boolean(parsedAmount)

  const onRefreshPrice = useCallback(() => {
    if (hasAmount) {
      refreshBlockNumber()
    }
  }, [hasAmount, refreshBlockNumber])

  // const smartRouterOn = !!tradeInfo && !tradeInfo.fallbackV2

  // Switch from exact out to exact in if smart router trade is better and user already allowed to use smart swap
  // useEffect(() => {
  //   if (smartRouterOn && independentField === Field.OUTPUT && v2Trade) {
  //     onUserInput(Field.INPUT, v2Trade.inputAmount.toSignificant(6))
  //   }
  // }, [smartRouterOn, independentField, onUserInput, v2Trade])

  // useEffect(() => {
  //   // Reset approval submit state after switch between old router and new router
  //   setApprovalSubmitted(false)
  // }, [smartRouterOn])

  // const onUseSmartRouterChecked = useCallback(() => setAllowUseSmartRouter(!allowUseSmartRouter), [allowUseSmartRouter])

  // const allowRecipient = isExpertMode && !showWrap && !smartRouterOn

  // const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)
  
  const fee = poolInfo?.fee ?? 30

  return (
    <>
      <CurrencyInputHeader
        title={t('Bridge')}
        // subtitle={t('Trade tokens in an instant')}
        // hasAmount={hasAmount}
        onRefreshPrice={onRefreshPrice}
      />
      <Wrapper id="swap-page" style={{ minHeight: '412px' }}>
        <AutoColumn gap="sm">
          <CurrencyInputPanelForBridge
            label={independentField === Field.OUTPUT && t('From')}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton
            maxAmount={maxAmountInput}
            showQuickInputButton
            currency={currencies[Field.INPUT]}
            onUserInput={handleTypeInput}
            onPercentInput={handlePercentInput}
            onMax={handleMaxInput}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            id="swap-currency-input"
            showCommonBases
            showBUSD={!!tokenMap[chainId]?.[inputCurrencyId] || inputCurrencyId === NATIVE[chainId]?.symbol}
            commonBasesType={CommonBasesType.SWAP_LIMITORDER}
            chainId={sourceChain}
            isTargetChain={false}
          />

          <AutoColumn justify="space-between">
            <AutoRow justify='center' style={{ padding: '0 1rem' }}>
              <SwapUI.SwitchButton
                onClick={() => {
                  setApprovalSubmitted(false) // reset 2 step UI for approvals
                  // onSwitchTokens()
                  switchNetworkAsync(targetChain);
                  // replaceBrowserHistory('outputCurrency', inputCurrencyId)
                }}
              />
              {/* {allowRecipient && recipient === null ? (
                <Button variant="text" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                  {t('+ Add a send (optional)')}
                </Button>
              ) : null} */}
            </AutoRow>
          </AutoColumn>
          <CurrencyInputPanelForBridge
            label={independentField === Field.OUTPUT && t('From')}
            value={formattedAmounts[Field.INPUT] ? (Number(formattedAmounts[Field.INPUT]) * (10000-fee) / 10000).toString() : formattedAmounts[Field.INPUT]}
            showMaxButton={false}
            maxAmount={maxAmountInput}
            showQuickInputButton={false}
            currency={currencies[Field.INPUT]}
            onUserInput={handleTypeInput}
            onPercentInput={handlePercentInput}
            onMax={handleMaxInput}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            id="swap-currency-input"
            showCommonBases
            showBUSD={!!tokenMap[chainId]?.[inputCurrencyId] || inputCurrencyId === NATIVE[chainId]?.symbol}
            commonBasesType={CommonBasesType.SWAP_LIMITORDER}
            chainId={targetChain}
            isTargetChain
          />

          {/* {isAccessTokenSupported && outputCurrency?.isToken && (
            <Box>
              <AccessRisk token={outputCurrency} />
            </Box>
          )} */}

          {/* {isSmartRouterBetter && !isStableSwapByDefault && (
            <AutoColumn>
              {allowUseSmartRouter && (
                <Message variant="warning" mb="8px">
                  <MessageText>{t('This route includes StableSwap and can’t edit output')}</MessageText>
                </Message>
              )}
              <Flex alignItems="center" onClick={onUseSmartRouterChecked}>
                <Checkbox
                  scale="sm"
                  name="allowUseSmartRouter"
                  type="checkbox"
                  checked={allowUseSmartRouter}
                  onChange={onUseSmartRouterChecked}
                />
                <Text ml="8px" style={{ userSelect: 'none' }}>
                  {t('Use StableSwap for better fees')}
                </Text>
              </Flex>
            </AutoColumn>
          )} */}

          {/* {allowRecipient && recipient !== null ? (
            <>
              <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable={false}>
                  <ArrowDownIcon width="16px" />
                </ArrowWrapper>
                <Button variant="text" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                  {t('- Remove send')}
                </Button>
              </AutoRow>
              <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
            </>
          ) : null} */}

          {/* {showWrap ? null : (
            <SwapUI.Info
              price={
                Boolean(tradeInfo) && (
                  <>
                    <SwapUI.InfoLabel>{t('Price')}</SwapUI.InfoLabel>
                    {isLoading ? (
                      <Skeleton width="100%" ml="8px" height="24px" />
                    ) : (
                      <SwapUI.TradePrice price={tradeInfo?.executionPrice} />
                    )}
                  </>
                )
              }
              allowedSlippage={allowedSlippage}
              onSlippageClick={onPresentSettingsModal}
            />
          )} */}
          {/* {!swapIsUnsupported ? (
            !showWrap &&
            tradeInfo && (
              <AdvancedSwapDetailsDropdown
                hasStablePair={smartRouterOn}
                pairs={tradeInfo.route.pairs}
                path={tradeInfo.route.path}
                priceImpactWithoutFee={tradeInfo.priceImpactWithoutFee}
                realizedLPFee={tradeInfo.realizedLPFee}
                slippageAdjustedAmounts={tradeInfo.slippageAdjustedAmounts}
                inputAmount={tradeInfo.inputAmount}
                outputAmount={tradeInfo.outputAmount}
                tradeType={tradeInfo.tradeType}
              />
            )
          ) : (
            <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />
          )} */}
        </AutoColumn>

        <Box mt="0.25rem">
          <SmartSwapCommitButton
              account={account}
              approval={approval}
              approveCallback={approveCallback}
              approvalSubmitted={approvalSubmitted}
              setApprovalSubmitted={setApprovalSubmitted}
              currencies={currencies}
              swapInputError={stableSwapInputError}
              // currencyBalances={currencyBalances}
              // onUserInput={onUserInput}
              pid={pid}
              isNative={isNative}
              parsedAmount={parsedAmount}
            />
        </Box>
      </Wrapper>
    </>
  )
}
