import React from 'react'
import styled from 'styled-components'
import { Flex, LinkExternal, Image, Text, PrizeIcon, Skeleton, WalletIcon } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { PublicIfoData3 } from 'views/Ilos/types'
import { Ifo } from 'config/constants/types'
import { BIG_TEN } from 'utils/bigNumber'
import { getFullDisplayBalance } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'

const MIN_DOLLAR_FOR_ACHIEVEMENT = BIG_TEN

interface Props {
  publicIfoData: PublicIfoData3
}

const Container = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
    align-items: initial;
  }
`

const AchievementFlex = styled(Flex)<{ isFinished: boolean }>`
  ${({ isFinished }) => (isFinished ? 'filter: grayscale(100%)' : '')};
`

const StyledLinkExternal = styled(LinkExternal)`
  margin-top: 32px;
  font-size: 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    margin-top: 0;
  }
`

const Achievement: React.FC<Props> = ({ publicIfoData }) => {
  const { t } = useTranslation()

  return (
    <Container>
      <AchievementFlex isFinished={publicIfoData.status === 0} alignItems="center" flexGrow={1}>
        <Flex flexDirection="column">
          <Flex>
            <Text bold mr="8px">
              {t('Listing Price:')}
            </Text>
            <Flex alignItems="center" mr="8px">
              <Text color="textSubtle">1 BNB = &nbsp;</Text>
              <Text color="textSubtle">
                {(1000000000000000000 / publicIfoData.listingPrice).toFixed(0)}&nbsp;{publicIfoData.symbol}
              </Text>
            </Flex>
          </Flex>
          <StyledLinkExternal href={publicIfoData.link} mb="8px">
            {t('Learn more about %title%', { title: publicIfoData._name })}
          </StyledLinkExternal>
        </Flex>
      </AchievementFlex>
      <Flex alignItems="flex-end" flexDirection="column">
        <Flex>
          <Text bold mr="8px">
            {t('Soft Cap: ')}
          </Text>
          <Flex alignItems="center" mr="8px">
            <Text color="textSubtle">{Number(publicIfoData.softcap) / 1000000000000000000}&nbsp;BNB</Text>
          </Flex>
        </Flex>
        <Flex>
          <Text bold mr="8px">
            {t('Hard Cap: ')}
          </Text>
          <Flex alignItems="center" mr="8px">
            <Text color="textSubtle">{Number(publicIfoData.hardcap) / 1000000000000000000}&nbsp;BNB</Text>
          </Flex>
        </Flex>
        <StyledLinkExternal href={'https://bscscan.com/address/'.concat(publicIfoData.ILOToken.toString())}>
          {t('View Contract')}
        </StyledLinkExternal>
      </Flex>
    </Container>
  )
}

export default Achievement
