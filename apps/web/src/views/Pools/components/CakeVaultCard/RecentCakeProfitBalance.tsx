import React from 'react'
import { Text, TooltipText, useTooltip } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Balance from 'components/Balance'

interface RecentCakeProfitBalanceProps {
  cakeToDisplay: number
  dollarValueToDisplay: number
  dateStringToDisplay: string
}

const RecentCakeProfitBalance: React.FC<RecentCakeProfitBalanceProps> = ({
  cakeToDisplay,
  dollarValueToDisplay,
  dateStringToDisplay,
}) => {
  const { t } = useTranslation()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <>
      <Balance fontSize="16px" color='#000' value={cakeToDisplay} decimals={3} bold prefix='' unit=" MARCO" />
      <Balance fontSize="16px" color='#000' value={dollarValueToDisplay} decimals={2} bold unit='' prefix="~$" />
      {t('Earned since your last action')}
      <Text color='#000'>{dateStringToDisplay}</Text>
    </>,
    {
      placement: 'bottom-end',
    },
  )

  return (
    <>
      {tooltipVisible && tooltip}
      <TooltipText ref={targetRef} small>
        <Balance fontSize="14px" value={cakeToDisplay} prefix='' unit='' />
      </TooltipText>
    </>
  )
}

export default RecentCakeProfitBalance
