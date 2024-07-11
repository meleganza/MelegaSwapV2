import React from 'react'
import styled from 'styled-components'
import useTotalSupply from 'hooks/useTotalSupply'
import { useToken } from 'hooks/Tokens'
import { useBurnedBalance } from 'hooks/useTokenBalance'
import { getMarcoAddress } from 'utils/addressHelpers'
import { getBalanceNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { Flex, Text, Heading, Skeleton, Button } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import BigNumber from 'bignumber.js'
import Balance from 'components/Balance'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'

const OuterDiv = styled('div')`
  display: flex;
  flex-direction: column;
  min-width: 100%;
  width: 100%;
  color: #fff;
  justify-content: center;
  ${({ theme }) => theme.mediaQueries.lg} {
    display: flex;
    min-width: 100%;
    width: 100%;
    color: #fff;
    flex-direction: row;
  }
`
const InnerDiv1 = styled('div')`
  min-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  ${({ theme }) => theme.mediaQueries.lg} {
    min-width: 40%;
    width: 40%;
  }
`
const InnerDiv2 = styled('div')`
  min-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;

  ${({ theme }) => theme.mediaQueries.lg} {
    min-width: 45%;
    width: 45%;
  }
`
const InnerDiv3 = styled('div')`
  min-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.lg} {
    min-width: 15%;
    width: 15%;
  }
`

const MaximizeDiv = styled('div')`
  display: flex;
  padding: 1px;
  flex-direction: column;
  justify-content: center;
  ${({ theme }) => theme.mediaQueries.sm} {
    display: flex;
    padding: 1px;
    flex-direction: row;
    justify-content: space-between;
  }
`

const emissionsPerBlock = 0.162118

const CakeDataRow = () => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const tokenTotalSupply = new BigNumber(useTotalSupply(useToken(getMarcoAddress(chainId)))?.toFixed(0))
  const totalSupply = tokenTotalSupply ? new BigNumber(tokenTotalSupply.toFixed(0)) : 0
  const burnedBalance = getBalanceNumber(useBurnedBalance(getMarcoAddress(chainId)))
  const cakeSupply = totalSupply ? totalSupply.toNumber() - burnedBalance : 0
  const cakePriceBusd = usePriceCakeBusd()
  const mcap = cakePriceBusd.times(cakeSupply)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber())
  const { isMobile } = useMatchBreakpoints()
  
  return (
    <OuterDiv style={{ textAlign: 'center' }}>
      <InnerDiv1 style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid', borderRadius: '1rem' }}>
        <MaximizeDiv>
          <Flex flexDirection="column">
            <Flex padding="1rem" style={{ textAlign: 'center', alignItems: 'center' }}>
              <img alt="logo" src="/images/melega.png" style={{ width: '32px' }} />
              <div style={{ marginRight: "4px" }}>{cakePriceBusd ? <p>&nbsp;&nbsp;&nbsp;${cakePriceBusd.toFixed(6)}</p> : <Skeleton />}</div>
            </Flex>
            <br />
            <Flex padding="1rem" style={{ textAlign: 'center', alignItems: 'center' }}>
              <img alt="logo" src="/metmaskicon.png" style={{ width: '32px' }} />
              &nbsp;&nbsp;&nbsp;
              <a href="/swap">
                <Button>Buy</Button>
              </a>
            </Flex>
          </Flex>
          <Flex flexDirection="column">
            <Flex padding="1rem" justifyContent="space-between" style={{ textAlign: 'center', alignItems: 'center' }}>
              <p>Max Supply:</p>
              <Flex justifyContent="flex-end">
                {totalSupply ? (
                  <p>{totalSupply.toString()}</p>
                ) : (
                  <>
                    <Skeleton />
                  </>
                )}
                {/* TODO: Remove the hardcoded number "1000000000" once getting totalSupply is working */}
              </Flex>
            </Flex>
            <Flex padding="1rem" justifyContent="space-between" style={{ textAlign: 'center', alignItems: 'center' }}>
              <p>Market Cap:</p>
              <Flex justifyContent="flex-end">
                {mcap && mcap > new BigNumber(0) ? (
                  <p>{mcapString}</p>
                ) : (
                  <>
                    <Skeleton />
                  </>
                )}
                {/* TODO: Remove the hardcoded number once getting mcap is working */}
              </Flex>
            </Flex>
            <Flex padding="1rem" justifyContent="space-between" style={{ textAlign: 'center', alignItems: 'center' }}>
              <p>Total Burned:</p>
              <Flex justifyContent="flex-end">
                {burnedBalance ? <p>&nbsp;{burnedBalance.toFixed(4)}</p> : <Skeleton />}
              </Flex>
            </Flex>
          </Flex>
        </MaximizeDiv>
      </InnerDiv1>
      <br />
      <InnerDiv2>
        <Flex flexDirection="column" style={{ textAlign: 'center', minWidth: '33.333%' }}>
          <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>Products</h1>
          <br />
          <a style={{ margin: '0.5rem' }} href="/swap">
            Exchange
          </a>
          <a style={{ margin: '0.5rem' }} href="/add">
            Liquidity
          </a>
          <a style={{ margin: '0.5rem' }} href="/farms">
            Farms
          </a>
          <a style={{ margin: '0.5rem' }} href="/pools">
            Pools
          </a>
        </Flex>
        <br />
        <Flex flexDirection="column" style={{ textAlign: 'center', minWidth: '33.333%' }}>
          <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>About</h1>
          <br />
          <a style={{ margin: '0.5rem' }} href="mailto:hello@melegaswap.finance">
            Info
          </a>
          <a style={{ margin: '0.5rem' }} href="https://www.melegaswap.finance/about">
            Docs
          </a>
          <a style={{ margin: '0.5rem' }} href="https://www.melegaswap.finance/marco-token">
            MARCO Token
          </a>
          <a style={{ margin: '0.5rem' }} href="https://www.melegaswap.finance/babymarco">
            BabyMarco
          </a>
        </Flex>
        <br />
        <Flex flexDirection="column" style={{ textAlign: 'center', minWidth: '33.333%' }}>
          <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem' }}>Services</h1>
          <br />
          <a style={{ margin: '0.5rem' }} href="https://www.melegaswap.finance/apply">
            Apply for listing
          </a>
          <a style={{ margin: '0.5rem' }} href="https://melega.space/">
            Melega Space
          </a>
        </Flex>
      </InnerDiv2>
      <br />
      <InnerDiv3 style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Community</h1>
        <br />
        <Flex width="100%" style={{ justifyContent: 'center' }}>
          <a style={{ margin: '0.5rem' }} href="https://t.me/melegacommunity">
            <img alt="logo" src="/teleicon.png" style={{ width: '16px' }} />
          </a>
          <a style={{ margin: '0.5rem' }} href="https://www.instagram.com/melega.finance/">
            <img alt="logo" src="/instaicon.png" style={{ width: '16px' }} />
          </a>
          <a style={{ margin: '0.5rem' }} href="https://twitter.com/meleganews">
            <img alt="logo" src="/twiticon.png" style={{ width: '16px' }} />
          </a>
          <a style={{ margin: '0.5rem' }} href="https://medium.com/@melega">
            <img alt="logo" src="/medicon.png" style={{ width: '16px' }} />
          </a>
          <a style={{ margin: '0.5rem' }} href="https://www.youtube.com/channel/UC_kjHoXOkPSSB4HeHNZMq-Q">
            <img alt="logo" src="/youicon.png" style={{ width: '16px' }} />
          </a>
        </Flex>
      </InnerDiv3>
    </OuterDiv>
  )
}

export default CakeDataRow
