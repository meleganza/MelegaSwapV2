import { useTranslation } from '@pancakeswap/localization'
import { ArrowDownIcon, Button, ConfirmationModalContent, Text } from '@pancakeswap/uikit'
import { AutoColumn } from 'components/Layout/Column'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { CurrencyLogo } from 'components/Logo'
import { useCallback } from 'react'
import { AdvancedSwapDetails } from '../../components/AdvancedSwapDetails'
import { TruncatedText } from '../../components/styleds'
import type { SmartSwapV2ExecutionDisplay } from '../utils/v2ExecutionDisplay'

/**
 * BSC SmartSwap V2 confirmation body (inside the existing ConfirmSwapModal shell).
 * Renders ONLY the pinned certified plan facts: input, factual winner output, intent.minUserOut, venue, SmartSwap fee,
 * router and path; price impact only when the winner factually reported one. No requote, no second minimum.
 * Sends nothing: Confirm calls the existing certified V2 consume path.
 */
export default function V2ConfirmSwapContent({
  v2,
  onConfirm,
  disabledConfirm,
}: {
  v2: SmartSwapV2ExecutionDisplay
  onConfirm: () => void
  disabledConfirm: boolean
}) {
  const { t } = useTranslation()

  const topContent = useCallback(
    () => (
      <AutoColumn gap="md" data-smartswap-v2-confirm>
        <RowBetween align="flex-end">
          <RowFixed gap="4px">
            <CurrencyLogo currency={v2.inputAmount.currency} size="24px" style={{ marginRight: '12px' }} />
            <TruncatedText fontSize="24px">{v2.inputAmount.toSignificant(6)}</TruncatedText>
          </RowFixed>
          <RowFixed gap="0px">
            <Text fontSize="24px" ml="10px">
              {v2.inputAmount.currency.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <ArrowDownIcon width="16px" ml="4px" />
        </RowFixed>
        <RowBetween align="flex-end">
          <RowFixed gap="4px">
            <CurrencyLogo currency={v2.outputAmount.currency} size="24px" />
            <TruncatedText fontSize="24px" data-smartswap-v2-confirm-output>
              {v2.outputAmount.toSignificant(6)}
            </TruncatedText>
          </RowFixed>
          <RowFixed>
            <Text fontSize="24px" ml="10px">
              {v2.outputAmount.currency.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <Text small color="textSubtle" textAlign="left" style={{ maxWidth: '320px' }}>
          {t('Output is estimated. You will receive at least %amount% %symbol% or the transaction will revert.', {
            amount: v2.minimumReceived.toSignificant(6),
            symbol: v2.outputAmount.currency.symbol,
          })}
        </Text>
      </AutoColumn>
    ),
    [t, v2],
  )

  const bottomContent = useCallback(
    () => (
      <AutoColumn gap="12px" style={{ marginTop: '24px' }}>
        <AdvancedSwapDetails
          hasStablePair={false}
          path={v2.path}
          priceImpactWithoutFee={v2.priceImpact}
          slippageAdjustedAmounts={{ INPUT: v2.inputAmount, OUTPUT: v2.minimumReceived }}
          inputAmount={v2.inputAmount}
          outputAmount={v2.outputAmount}
          tradeType={v2.tradeType}
          v2Execution={{ venueLabel: v2.venueLabel, router: v2.router, feeAmount: v2.feeAmount, feeBps: v2.feeBps }}
        />
        <Button variant="primary" onClick={onConfirm} disabled={disabledConfirm} id="confirm-swap-or-send" width="100%">
          {t('Confirm Swap')}
        </Button>
      </AutoColumn>
    ),
    [t, v2, onConfirm, disabledConfirm],
  )

  return <ConfirmationModalContent topContent={topContent} bottomContent={bottomContent} />
}
