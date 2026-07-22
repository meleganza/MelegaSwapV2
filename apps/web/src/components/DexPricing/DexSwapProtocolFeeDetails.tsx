import { useMemo } from 'react'
import { Currency } from '@pancakeswap/sdk'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { FSC_01_POLICY_REF, formatProtocolFeePercent, resolveSwapProtocolFeeContext } from 'lib/d87-pricing'

type Props = {
  trade: {
    inputAmount: { currency: Currency }
    outputAmount: { currency: Currency }
  }
}

/** D87 protocol fee row — LP fee remains separate (unaffected). */
export function DexSwapProtocolFeeDetails({ trade }: Props) {
  const { t } = useTranslation()
  const ctx = useMemo(() => resolveSwapProtocolFeeContext(trade), [trade])

  return (
    <>
      <Text fontSize="14px">
        - {t('Protocol fee %amount% (Treasury via FSC-01)', {
          amount: formatProtocolFeePercent(ctx.protocolFeeBps),
        })}
      </Text>
      {ctx.buyMarcoApplied ? (
        <Text fontSize="14px" color="#F4C430">
          - {t('MARCO buy incentive — reduced protocol fee applied')}
        </Text>
      ) : null}
      <Text fontSize="12px" color="textSubtle">
        {FSC_01_POLICY_REF}
      </Text>
    </>
  )
}

export default DexSwapProtocolFeeDetails
