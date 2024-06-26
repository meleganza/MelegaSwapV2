import { Currency, CurrencyAmount } from '@pancakeswap/sdk'
import { Field } from 'state/swap/actions'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { useTranslation } from '@pancakeswap/localization'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useWeb3React } from '@pancakeswap/wagmi'

export function useDerivedBridgeInfoWithStableSwap(
  independentField: Field,
  typedValue: string,
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  min: string | undefined,
  enabled: boolean | undefined,
  // recipient: string,
): {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  // trade: TradeWithStableSwap<Currency, Currency, TradeType> | null
  inputError?: string
  min?: string
} {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  // const [singleHop] = useUserSingleHopOnly()

  // const to: string | null = (recipient === null ? account : isAddress(recipient) || null) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  // const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const parsedAmount = tryParseAmount(typedValue, independentCurrency ?? undefined)

  // const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  // const bestTradeWithStableSwap = useBestTrade(parsedAmount, dependentCurrency, tradeType, {
  //   maxHops: singleHop ? 1 : 3,
  // })
  // TODO add invariant make sure v2 trade has the same input & output amount as trade with stable swap

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = t('Connect Wallet')
  }

  if (!parsedAmount) {
    inputError = inputError ?? t('Enter an amount')
  }

  if (!currencies[Field.INPUT]) {
    inputError = inputError ?? t('Select a token')
  }

  // const formattedTo = isAddress(to)
  // if (!to || !formattedTo) {
  //   inputError = inputError ?? t('Enter a recipient')
  // } else if (
  //   BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
  //   (bestTradeWithStableSwap && involvesAddress(bestTradeWithStableSwap, formattedTo))
  // ) {
  //   inputError = inputError ?? t('Invalid recipient')
  // }

  // const [allowedSlippage] = useUserSlippageTolerance()

  // const slippageAdjustedAmounts =
  //   bestTradeWithStableSwap &&
  //   allowedSlippage &&
  //   computeSlippageAdjustedAmounts(bestTradeWithStableSwap, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn] = [
    currencyBalances[Field.INPUT],
    // slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
  ]
  if (balanceIn && balanceIn.lessThan(parsedAmount?? 0)) {
    inputError = t('Insufficient %symbol% balance', { symbol: balanceIn.currency.symbol })
  }

  if (parsedAmount ? parsedAmount.lessThan(min ?? 0) : false) {
    inputError = t('No enough bridge fee')
  }

  if (!enabled) {
    inputError = t('Disabled token')
  }

  return {
    // trade: bestTradeWithStableSwap,
    currencies,
    currencyBalances,
    parsedAmount,
    inputError,
  }
}
