import { useTranslation } from '@pancakeswap/localization'
import {
  Farm as FarmUI,
  FarmTableLiquidityProps,
  FarmTableMultiplierProps,
  LinkExternal,
  Text,
  Box,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'

import { FarmWithStakedValue } from '@pancakeswap/farms'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useContext, useMemo } from 'react'
import { multiChainPaths } from 'state/info/constant'
import styled, { css, keyframes } from 'styled-components'
import { getBlockExploreLink } from 'utils'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'

import Apr, { AprProps } from '../Apr'
import { HarvestAction, HarvestActionContainer } from './HarvestAction'
import StakedAction, { StakedContainer } from './StakedAction'
import { ActionContainer as ActionContainerSection, ActionContent, ActionTitles } from './styles'
const { FarmAuctionTag, CoreTag } = FarmUI.Tags

const { Multiplier, Liquidity } = FarmUI.FarmTable

export interface ActionPanelProps {
  apr: AprProps
  multiplier: FarmTableMultiplierProps
  liquidity: FarmTableLiquidityProps
  details: FarmWithStakedValue
  userDataReady: boolean
  expanded: boolean
}

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 700px;
  }
`

const collapseAnimation = keyframes`
  from {
    max-height: 700px;
  }
  to {
    max-height: 0px;
  }
`

const Container = styled.div<{ expanded }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.dropdown};
  display: flex;
  width: 100%;
  flex-direction: column-reverse;
  padding: 24px;

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    align-items: center;
    padding: 16px 32px;
  }
`

const StyledLinkExternal = styled(LinkExternal)`
  font-weight: 400;
  font-size: 16px;
`

const StakeContainer = styled.div`
  color: ${({ theme }) => theme.colors.text};
  align-items: center;
  display: flex;
  justify-content: space-between;

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
  }
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    flex-basis: 0;
    flex-wrap: wrap;
  }
`

const InfoContainer = styled.div`
  min-width: 200px;
`

const ValueContainer = styled.div``

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0px;
`

const ActionPanel: React.FunctionComponent<React.PropsWithChildren<ActionPanelProps>> = ({
  details,
  apr,
  multiplier,
  liquidity,
  userDataReady,
  expanded,
}) => {
  const { chainId } = useActiveChainId()

  const farm = details

  const { isDesktop } = useMatchBreakpoints()

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const isActive = farm.multiplier !== '0X'
  const { quoteToken, token, stableSwapAddress } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: quoteToken.address,
    tokenAddress: token.address,
    chainId,
  })
  const { lpAddress } = farm
  const bsc = getBlockExploreLink(lpAddress, 'address', chainId)
  const base = getBlockExploreLink(lpAddress, 'address', chainId)
  const { stakedBalance, tokenBalance, proxy } = farm.userData

  const infoUrl = useMemo(() => {
    if (farm.isStable) {
      return `/info${multiChainPaths[chainId]}/pairs/${stableSwapAddress}?type=stableSwap&chain=${CHAIN_QUERY_NAME[chainId]}`
    }
    return `/info${multiChainPaths[chainId]}/pairs/${lpAddress}?chain=${CHAIN_QUERY_NAME[chainId]}`
  }, [chainId, farm.isStable, lpAddress, stableSwapAddress])

  return (
    <Container expanded={expanded}>
      <InfoContainer>
        <ValueContainer>
          {farm.isCommunity && farm.auctionHostingEndDate && (
            <ValueWrapper>
              <Text>{t('Auction Hosting Ends')}</Text>
              <Text paddingLeft="4px">
                {new Date(farm.auctionHostingEndDate).toLocaleString(locale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </ValueWrapper>
          )}
          {!isDesktop && (
            <>
              <ValueWrapper>
                <Text>{t('APR')}</Text>
                <Apr {...apr} useTooltipText={false} boosted={farm.boosted} />
              </ValueWrapper>
              <ValueWrapper>
                <Text>{t('Multiplier')}</Text>
                <Multiplier {...multiplier} />
              </ValueWrapper>
              <ValueWrapper>
                <Text>{t('Liquidity')}</Text>
                <Liquidity {...liquidity} />
              </ValueWrapper>
            </>
          )}
        </ValueContainer>
        {isActive && (
          <StakeContainer>
            <StyledLinkExternal href={farm.isTokenOnly ? `/swap?outputCurrency=${farm.token.address}` : `/add/${liquidityUrlPathParts}`}>
              {t('Get %symbol%', { symbol: lpLabel })}
            </StyledLinkExternal>
          </StakeContainer>
        )}
        {/* <StyledLinkExternal href={infoUrl}>{t('See Pair Info')}</StyledLinkExternal> */}
        <StyledLinkExternal isBscScan href={chainId == 56 ? bsc : base}>
          {t('View Contract')}
        </StyledLinkExternal>
        <Box style={{ marginRight: '16px', marginTop: '16px' }}>
          <CoreTag scale="sm" />
        </Box>
      </InfoContainer>
      <ActionContainer>
        <HarvestActionContainer {...farm} userDataReady={userDataReady}>
          {(props) => <HarvestAction {...props} />}
        </HarvestActionContainer>
        <StakedContainer {...farm} userDataReady={userDataReady} lpLabel={lpLabel} displayApr={apr.value}>
          {(props) => <StakedAction {...props} />}
        </StakedContainer>
      </ActionContainer>
    </Container>
  )
}

export default ActionPanel
