import {
  Flex,
  Link,
  LinkExternal,
  Skeleton,
  Text,
  TimerIcon,
  Balance,
  Pool,
  useTooltip,
  TooltipText,
  HelpIcon,
} from '@pancakeswap/uikit'
import AddToWalletButton, { AddToWalletTextOptions } from 'components/AddToWallet/AddToWalletButton'
import { bsc } from 'wagmi/chains'
import { base, polygon1 } from '../../../utils/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { ChainId, Token } from '@pancakeswap/sdk'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { memo } from 'react'
import { useCurrentBlock } from 'state/block/hooks'
import { useVaultPoolByKey } from 'state/pools/hooks'
import { VaultKey } from 'state/types'
import { getBlockExploreLink } from 'utils'
import { getAddress, getVaultPoolAddress } from 'utils/addressHelpers'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import MaxStakeRow from './MaxStakeRow'
import { AprInfo, DurationAvg, PerformanceFee, TotalLocked } from './Stat'
import { useActiveChainId } from 'hooks/useActiveChainId'

interface ExpandedFooterProps {
  pool: Pool.DeserializedPool<Token>
  account: string
  showTotalStaked?: boolean
  alignLinksToRight?: boolean
}

const PoolStatsInfo: React.FC<React.PropsWithChildren<ExpandedFooterProps>> = ({
  pool,
  account,
  showTotalStaked = true,
  alignLinksToRight = true,
}) => {
  const { t } = useTranslation()
  const currentBlock = useCurrentBlock()

  const {
    stakingToken,
    earningToken,
    totalStaked,
    startBlock,
    endBlock,
    stakingLimit,
    stakingLimitEndBlock,
    contractAddress,
    vaultKey,
    profileRequirement,
    isFinished,
    userData: poolUserData,
  } = pool
  const stakedBalance = poolUserData?.stakedBalance ? poolUserData.stakedBalance : BIG_ZERO
  const { chainId } = useActiveChainId()
  const {
    totalDexTokenInVault,
    totalLockedAmount,
    fees: { performanceFeeAsDecimal },
    userData,
  } = useVaultPoolByKey(vaultKey ? vaultKey : VaultKey.CakeVault)

  const tokenAddress = earningToken?.address || ''
  const poolContractAddress = getAddress(contractAddress, chainId)
  const cakeVaultContractAddress = getVaultPoolAddress(vaultKey, chainId)
  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('Total amount of %symbol% staked in this pool', { symbol: stakingToken.symbol }),
    {
      placement: 'bottom',
    },
  )

  return (
    <>
      {profileRequirement && (profileRequirement.required || profileRequirement.thresholdPoints.gt(0)) && (
        <Flex mb="8px" justifyContent="space-between">
          <Text small>{t('Requirement')}:</Text>
          <Text small textAlign="right">
            {profileRequirement.required && t('Pancake Profile')}{' '}
            {profileRequirement.thresholdPoints.gt(0) && (
              <Text small>
                {profileRequirement.thresholdPoints.toNumber().toLocaleString()} {t('Profile Points')}
              </Text>
            )}
          </Text>
        </Flex>
      )}
      {showTotalStaked && (
        <Flex alignItems="center">

          <Pool.TotalStaked
            totalStaked={vaultKey ? totalDexTokenInVault : (pool.sousId === 0 ? totalStaked.minus(totalDexTokenInVault) : totalStaked)}
            tokenDecimals={stakingToken.decimals}
            symbol={stakingToken.symbol}
            decimalsToShow={0}
          />
          <TooltipText ref={targetRef} small>
            <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
          </TooltipText>
        </Flex>
      )}
      {tooltipVisible && tooltip}
      {/* {vaultKey === VaultKey.CakeVault && <TotalLocked totalLocked={totalLockedAmount} lockedToken={stakingToken} />} */}
      {/* {vaultKey === VaultKey.CakeVault && <DurationAvg />} */}
      {!isFinished && stakingLimit && stakingLimit.gt(0) && (
        <MaxStakeRow
          small
          currentBlock={currentBlock}
          hasPoolStarted={hasPoolStarted}
          stakingLimit={stakingLimit}
          stakingLimitEndBlock={stakingLimitEndBlock}
          stakingToken={stakingToken}
        />
      )}
      {shouldShowBlockCountdown && (
        <Flex mb="2px" justifyContent="space-between" alignItems="center">
          <Text small>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</Text>
          {blocksRemaining || blocksUntilStart ? (
            <Flex alignItems="center">
              <Link external href={getBlockExploreLink(hasPoolStarted ? endBlock : startBlock, 'countdown')}>
                <Balance small value={blocksToDisplay} decimals={0} color="primary" />
                <Text small ml="4px" color="primary" textTransform="lowercase">
                  {t('Blocks')}
                </Text>
                <TimerIcon ml="4px" color="primary" />
              </Link>
            </Flex>
          ) : (
            <Skeleton width="54px" height="21px" />
          )}
        </Flex>
      )}
      {vaultKey && <PerformanceFee userData={userData} performanceFeeAsDecimal={performanceFeeAsDecimal} />}
      {/* <Flex mb="2px" justifyContent={alignLinksToRight ? 'flex-end' : 'flex-start'}>
        <LinkExternal href={`/info/token/${earningToken.address}`} bold={false} small>
          {t('See Token Info')}
        </LinkExternal>
      </Flex> */}
      {(
        <Flex mb="2px" justifyContent={alignLinksToRight ? 'flex-end' : 'flex-start'}>
          <LinkExternal href={earningToken.projectLink} bold={false} small>
            {t('View Project Site')}
          </LinkExternal>
        </Flex>
      )}
      {/*{vaultKey && (
        <Flex mb="2px" justifyContent={alignLinksToRight ? 'flex-end' : 'flex-start'}>
          <LinkExternal href="https://docs.pancakeswap.finance/products/syrup-pool/new-cake-pool" bold={false} small>
            {t('View Tutorial')}
          </LinkExternal>
        </Flex>
      )}*/}
      {poolContractAddress && (
        <Flex mb="2px" justifyContent={alignLinksToRight ? 'flex-end' : 'flex-start'}>
          <LinkExternal
            isBscScan
            href={`${chainId == 56 ? bsc.blockExplorers.default.url :
              chainId == 137 ? polygon1.blockExplorers.default.url :
                base.blockExplorers.default.url}/address/${vaultKey ? cakeVaultContractAddress : poolContractAddress
              }`}
            bold={false}
            small
          >
            {t('View Contract')}
          </LinkExternal>
        </Flex>
      )}
      {account && tokenAddress && (
        <Flex justifyContent={alignLinksToRight ? 'flex-end' : 'flex-start'}>
          <AddToWalletButton
            variant="text"
            p="0"
            height="auto"
            style={{ fontSize: '14px', fontWeight: '400', lineHeight: 'normal' }}
            marginTextBetweenLogo="4px"
            textOptions={AddToWalletTextOptions.TEXT}
            tokenAddress={tokenAddress}
            tokenSymbol={earningToken.symbol}
            tokenDecimals={earningToken.decimals}
            tokenLogo={`/images/${chainId}/tokens/${tokenAddress}.png`}
          />
        </Flex>
      )}
    </>
  )
}

export default memo(PoolStatsInfo)
