import React from 'react'
import { CardHeader, Heading, Text, Flex, TokenPairImage as UIKitTokenPairImage } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Token } from 'config/constants/types'
import { TokenPairImage } from 'components/TokenImage'
import { isAutoAccessorPropertyDeclaration } from 'typescript'
import { useChainId } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'

const Wrapper = styled(CardHeader)<{ isFinished?: boolean; background?: string }>`
  background: black;
  border-radius: ${({ theme }) => `${theme.radii.card} ${theme.radii.card} 0 0`};
`

const StyledCardHeader: React.FC<{
  earningToken: Token
  stakingToken: Token
  isAutoVault?: boolean
  isFinished?: boolean
  isStaking?: boolean
}> = ({ earningToken, stakingToken, isFinished = false, isAutoVault = false, isStaking = false }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const isCakePool = earningToken.symbol === 'MARCO' && stakingToken.symbol === 'MARCO'
  const background = isStaking ? 'darkColor' : 'bubblegum'

  const getHeadingPrefix = () => {
    if (isAutoVault) {
      // vault
      return t('Auto')
    }
    if (isCakePool) {
      // manual cake
      return t('Manual')
    }
    // all other pools
    return t('Earn')
  }

  const getSubHeading = () => {
    if (isAutoVault) {
      return t('Automatic restaking')
    }
    if (isCakePool) {
      return t('Earn MARCO, stake MARCO')
    }
    return t('Stake %symbol%', { symbol: stakingToken.symbol })
  }
  
  const getImageUrlFromToken = (token?: Token) => {
    const address = token?.isNative ? token.wrapped.address : token.address
    return `/images/${chainId}/tokens/${address}.png`
  }  

  return (
    <Wrapper isFinished={isFinished} background={background}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex flexDirection="column">
          <Heading color={isFinished ? 'textDisabled' : 'body'} scale="lg">
            {`${getHeadingPrefix()} ${earningToken.symbol}`}
          </Heading>
          <Text color={isFinished ? 'textDisabled' : 'textSubtle'}>{getSubHeading()}</Text>
        </Flex>
        {isAutoVault ? (
          <UIKitTokenPairImage
            primarySrc={getImageUrlFromToken(earningToken)}
            secondarySrc="/images/autorenew.svg"
            width={64}
            height={64}
          />
        ) : (
          <TokenPairImage primaryToken={earningToken} secondaryToken={stakingToken} width={64} height={64} />
        )}
      </Flex>
    </Wrapper>
  )
}

export default StyledCardHeader
