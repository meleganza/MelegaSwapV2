import styled from 'styled-components'

import { useAccount } from 'wagmi'
import { Heading, Flex, Image, Text, Link, FlexLayout, Loading, Pool, ViewMode } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { usePoolsPageFetch, usePoolsWithVault } from 'state/pools/hooks'
import Page from 'components/Layout/Page'
import { HumanPageHeader, HumanEarnNav } from 'views/HumanCore'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { Token } from '@pancakeswap/sdk'
import { TokenPairImage } from 'components/TokenImage'
import CardActions from './components/PoolCard/CardActions'
import AprRow from './components/PoolCard/AprRow'
import CardFooter from './components/PoolCard/CardFooter'
import CakeVaultCard from './components/CakeVaultCard'
import PoolControls from './components/PoolControls'
import PoolRow, { VaultPoolRow } from './components/PoolsTable/PoolRow'
import BountyCard from './components/BountyCard'
import useActiveWeb3React from 'hooks/useActiveWeb3React'

const CardLayout = styled(FlexLayout)`
  justify-content: center;
`

const FinishedTextContainer = styled(Flex)`
  padding-bottom: 32px;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const FinishedTextLink = styled(Link)`
  font-weight: 400;
  white-space: nowrap;
  text-decoration: underline;
`

const Pools: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chainId } = useActiveWeb3React()
  const { pools, userDataLoaded } = usePoolsWithVault(chainId)

  usePoolsPageFetch()
  // console.log(pools)
  
  return (
    <>
      <Page>
        <Flex flexDirection="column" maxWidth="1400px" margin="0 auto" px="16px" style={{ gap: '16px' }}>
          <HumanEarnNav />
          <HumanPageHeader
            title="Staking Pools"
            subtitle="Stake a token, earn rewards. Earn new tokens by staking MARCO when pools are live."
            primaryAction={{ href: '/launch', label: 'Reward MARCO holders' }}
          />
          <BountyCard />
        </Flex>
      </Page>
      <Page>
        <PoolControls pools={pools}>
          {({ chosenPools, viewMode, stakedOnly, normalizedUrlSearch, showFinishedPools }) => (
            <>
              {showFinishedPools && (
                <FinishedTextContainer>
                  <Text fontSize={['16px', null, '20px']} color="failure" pr="4px">
                    {t('These pools are no longer distributing rewards.')}
                  </Text>
                  <Text fontSize={['16px', null, '20px']} color="failure">
                    {t('Please unstake your tokens.')}.
                  </Text>
                </FinishedTextContainer>
              )}
              {account && !userDataLoaded && stakedOnly && (
                <Flex justifyContent="center" mb="4px">
                  <Loading />
                </Flex>
              )}
              {viewMode === ViewMode.CARD ? (
                <CardLayout>
                  {chosenPools.map((pool) =>
                    pool.vaultKey ? (
                      <CakeVaultCard key={pool.vaultKey} pool={pool} showStakedOnly={stakedOnly} />
                    ) : (
                      <Pool.PoolCard<Token>
                        key={pool.sousId}
                        pool={pool}
                        isStaked={Boolean(pool?.userData?.stakedBalance?.gt(0))}
                        cardContent={
                          account ? (
                            <CardActions pool={pool} stakedBalance={pool?.userData?.stakedBalance} />
                          ) : (
                            <>
                              <Text mb="10px" textTransform="uppercase" fontSize="12px" color="textSubtle" bold>
                                {t('Start earning')}
                              </Text>
                              <ConnectWalletButton />
                            </>
                          )
                        }
                        tokenPairImage={
                          <TokenPairImage
                            primaryToken={pool?.earningToken}
                            secondaryToken={pool?.stakingToken}
                            width={64}
                            height={64}
                          />
                        }
                        cardFooter={<CardFooter pool={pool} account={account} />}
                        aprRow={<AprRow pool={pool} stakedBalance={pool?.userData?.stakedBalance} />}
                      />
                    ),
                  )}
                </CardLayout>
              ) : (
                <Pool.PoolsTable>
                  {chosenPools.map((pool) =>
                    pool.vaultKey ? (
                      <VaultPoolRow
                        initialActivity={normalizedUrlSearch.toLowerCase() === pool?.earningToken?.symbol?.toLowerCase()}
                        key={pool.vaultKey}
                        vaultKey={pool.vaultKey}
                        account={account}
                      />
                    ) : (
                      <PoolRow
                        initialActivity={normalizedUrlSearch.toLowerCase() === pool?.earningToken?.symbol?.toLowerCase()}
                        key={pool.sousId}
                        sousId={pool.sousId}
                        account={account}
                      />
                    ),
                  )}
                </Pool.PoolsTable>
              )}
              <Image
                mx="auto"
                mt="12px"
                src="/images/melega.png"
                alt="Melega illustration"
                width={120}
                height={120}
              />
            </>
          )}
        </PoolControls>
      </Page>
    </>
  )
}

export default Pools
