import styled from 'styled-components'
import { Tag, Flex, Heading, Box, Skeleton, Farm as FarmUI } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { TokenImage, TokenPairImage } from 'components/TokenImage'

const { FarmAuctionTag, CoreTag, StableFarmTag } = FarmUI.Tags

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  isCommunityFarm?: boolean
  token: Token
  quoteToken: Token
  boosted?: boolean
  isStable?: boolean
  isTokenOnly?: boolean
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 4px;
  }
`

const MultiplierTag = styled(Tag)`
  margin-left: 4px;
  background-color: ${({ theme }) => theme.colors.bg};
`

const CardHeading: React.FC<React.PropsWithChildren<ExpandableSectionProps>> = ({
  lpLabel,
  multiplier,
  isCommunityFarm,
  token,
  quoteToken,
  boosted,
  isStable,
  isTokenOnly
}) => {
  const isReady = multiplier !== undefined
  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      {isReady ? (
        isTokenOnly ?
        <TokenImage token={token} width={64} height={64} />
        :
        <TokenPairImage variant="inverted" primaryToken={token} secondaryToken={quoteToken} width={64} height={64} />
      ) : (
        <Skeleton mr="8px" width={63} height={63} variant="circle" />
      )}
      <Flex flexDirection="column" alignItems="flex-end">
        {isReady ? <Heading mb="4px">{isTokenOnly ? token.symbol : lpLabel.split(' ')[0]}</Heading> : <Skeleton mb="4px" width={60} height={18} />}
        <Flex justifyContent="center">
          {isStable ? <StableFarmTag mr="4px" /> : null}
          {isReady ? <Box>{isCommunityFarm ? <FarmAuctionTag /> : <CoreTag />}</Box> : null}
          {isReady ? (
            <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>
          ) : (
            <Skeleton ml="4px" width={42} height={28} />
          )}
        </Flex>
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
