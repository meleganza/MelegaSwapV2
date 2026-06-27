import React from 'react'
import { Heading, Flex, Text, ChartIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useGetStats } from 'hooks/api'
import useTheme from 'hooks/useTheme'
import { formatLocalisedCompactNumber } from 'utils/formatBalance'
import IconCard, { IconCardData } from '../IconCard'
import StatCardContent from './StatCardContent'
import GradientLogo from '../GradientLogoSvg'

const Stats = () => {
  const { t } = useTranslation()
  const data = useGetStats()
  const { theme } = useTheme()

  const tvlString = data ? formatLocalisedCompactNumber(data.tvl) : '—'

  const StakedCardData: IconCardData = {
    icon: <ChartIcon color="failure" width="36px" />,
  }

  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column" px="16px">
      <GradientLogo height="48px" width="48px" mb="24px" />
      <Heading textAlign="center" scale="xl">
        {t('Multi-chain liquidity.')}
      </Heading>
      <Heading textAlign="center" scale="xl" mb="32px">
        {t('Classic DEX tools.')}
      </Heading>
      <Text textAlign="center" color="textSubtle" mb="24px">
        {t('Melega DEX connects swap, liquidity, farms, and pools across supported networks.')}
      </Text>

      <Flex flexDirection={['column', null, null, 'row']} justifyContent="center">
        <IconCard {...StakedCardData}>
          <StatCardContent
            headingText={data ? t('$%tvl% TVL', { tvl: tvlString }) : t('TVL unavailable')}
            bodyText={t('Total Value Locked')}
            highlightColor={theme.colors.failure}
          />
        </IconCard>
      </Flex>

      <Text textAlign="center" color="textDisabled" fontSize="12px" mt="16px">
        {t('Source: on-chain aggregate')}
        {!data && ` · ${t('Loading live data')}`}
      </Text>
    </Flex>
  )
}

export default Stats
