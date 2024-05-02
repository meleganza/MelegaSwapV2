import React from 'react'
import { Flex, Text } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useCakeVault } from 'state/pools/hooks'
import { getCakeVaultEarnings } from 'views/Pools/helpers'
import RecentCakeProfitBalance from './RecentCakeProfitBalance'

const RecentCakeProfitCountdownRow = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const {
    pricePerFullShare,
    userData: { dexTokenAtLastUserAction, userShares, lastUserActionTime },
  } = useCakeVault()
  const cakePriceBusd = usePriceCakeBusd()
  const { hasAutoEarnings, autoCakeToDisplay, autoUsdToDisplay } = getCakeVaultEarnings(
    account,
    dexTokenAtLastUserAction,
    userShares,
    pricePerFullShare,
    cakePriceBusd.toNumber(),
  )

  const lastActionInMs = lastUserActionTime && parseInt(lastUserActionTime) * 1000
  const dateTimeLastAction = new Date(lastActionInMs)
  const dateStringToDisplay = dateTimeLastAction.toLocaleString()

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Text fontSize="14px">{`${t('Recent MARCO profit')}:`}</Text>
      {hasAutoEarnings && (
        <RecentCakeProfitBalance
          cakeToDisplay={autoCakeToDisplay}
          dollarValueToDisplay={autoUsdToDisplay}
          dateStringToDisplay={dateStringToDisplay}
        />
      )}
    </Flex>
  )
}

export default RecentCakeProfitCountdownRow
