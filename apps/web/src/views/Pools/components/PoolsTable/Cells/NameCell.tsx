import { Text, TokenPairImage as UIKitTokenPairImage, useMatchBreakpoints, Skeleton, Pool } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { TokenPairImage } from 'components/TokenImage'
import { vaultPoolConfig } from 'config/constants/pools'
import { useTranslation } from '@pancakeswap/localization'
import { memo, useMemo } from 'react'
import { useVaultPoolByKey } from 'state/pools/hooks'
import { VaultKey, DeserializedLockedCakeVault } from 'state/types'
import styled from 'styled-components'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { getVaultPosition, VaultPosition, VaultPositionParams } from 'utils/cakePool'
import { Token } from '@pancakeswap/sdk'

interface NameCellProps {
  pool: Pool.DeserializedPool<Token>
}

const StyledCell = styled(Pool.BaseCell)`
  flex: 5;
  flex-direction: row;
  padding-left: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
    padding-left: 32px;
  }
`

const NameCell: React.FC<React.PropsWithChildren<NameCellProps>> = ({ pool }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { sousId, stakingToken, earningToken, userData, isFinished, vaultKey, totalStaked } = pool
  const vaultData = useVaultPoolByKey(pool.vaultKey)
  const {
    userData: { userShares },
    totalDexTokenInVault,
  } = vaultData
  const hasVaultShares = userShares.gt(0)

  const stakingTokenSymbol = stakingToken?.symbol
  const earningTokenSymbol = earningToken?.symbol

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const isStaked = stakedBalance.gt(0)

  const showStakedTag = vaultKey ? hasVaultShares : isStaked
  const isCakePool = earningToken?.symbol === 'MARCO' && stakingToken?.symbol === 'MARCO'

  const getHeadingPrefix = () => {
    if (isCakePool) {
      // manual cake
      return t('Manual')
    }
    // all other pools
    return t('Earn')
  }

  const getSubheading = () => {
    if (isCakePool) {
      // manual cake
      return t('Earn MARCO stake\n')
    }
    // all other pools
    return t('Stake')
  }

  let title: React.ReactNode = `${getHeadingPrefix()}\u00A0${earningTokenSymbol}`
  let subtitle: React.ReactNode = `${getSubheading()} ${stakingTokenSymbol}`
  const showSubtitle = sousId !== 0 || (sousId === 0 && !isMobile)

  if (vaultKey) {
    title = vaultPoolConfig[vaultKey].name
    subtitle = vaultPoolConfig[vaultKey].description
  }

  const isLoaded = useMemo(() => {
    if (pool.vaultKey) {
      return totalDexTokenInVault && totalDexTokenInVault.gte(0)
    }
    return totalStaked && totalStaked.gte(0)
  }, [pool.vaultKey, totalDexTokenInVault, totalStaked])

  const getImageUrlFromToken = (token: Token) => {
    const address = token?.isNative ? token.wrapped.address : token?.address
    return `/images/${token?.chainId}/tokens/${address}.png`
  }

  return (
    <StyledCell role="cell">
      {isLoaded ? (
        <>
          {vaultKey ? (
            <UIKitTokenPairImage
              primarySrc={getImageUrlFromToken(earningToken)}
              secondarySrc="/images/autorenew.svg"
              mr="8px"
              width={40}
              height={40}
            />
          ) : (
            <TokenPairImage primaryToken={earningToken} secondaryToken={stakingToken} mr="8px" width={40} height={40} />
          )}
          <Pool.CellContent>
            {showStakedTag &&
              (vaultKey === VaultKey.CakeVault ? (
                <StakedCakeStatus
                  userShares={userShares}
                  locked={(vaultData as DeserializedLockedCakeVault).userData.locked}
                  lockEndTime={(vaultData as DeserializedLockedCakeVault).userData.lockEndTime}
                />
              ) : (
                <Text fontSize="12px" bold color={isFinished ? 'failure' : 'secondary'} textTransform="uppercase">
                  {t('Staked')}
                </Text>
              ))}
            {vaultKey ?
              <Text bold={!isMobile} small={isMobile}>
                {title}
              </Text> :
              <>
                {isMobile ?
                  <>
                    <Text bold={!isMobile} small={isMobile}>
                      {`${getHeadingPrefix()}`}
                    </Text>
                    <Text bold={!isMobile} small={isMobile}>
                      {earningTokenSymbol}
                    </Text>
                  </> :
                  <Text bold={!isMobile} small={isMobile}>
                    {title}
                  </Text>
                }
              </>
            }
            {showSubtitle && (
              <Text fontSize="12px" color="textSubtle">
                {subtitle}
              </Text>
            )}
          </Pool.CellContent>
        </>
      ) : (
        <>
          <Skeleton mr="8px" width={36} height={36} variant="circle" />
          <Pool.CellContent>
            <Skeleton width={30} height={12} mb="4px" />
            <Skeleton width={65} height={12} />
          </Pool.CellContent>
        </>
      )}
    </StyledCell>
  )
}

export default NameCell

const stakedStatus = {
  [VaultPosition.None]: { text: '', color: 'secondary' },
  [VaultPosition.Locked]: { text: 'Locked', color: 'secondary' },
  [VaultPosition.LockedEnd]: { text: 'Locked End', color: 'secondary' },
  [VaultPosition.AfterBurning]: { text: 'After Burning', color: 'failure' },
  [VaultPosition.Flexible]: { text: 'Flexible', color: 'success' },
}

export const StakedCakeStatus: React.FC<React.PropsWithChildren<VaultPositionParams>> = memo(
  ({ userShares, locked, lockEndTime }) => {
    const vaultPosition = getVaultPosition({ userShares, locked, lockEndTime })
    const { t } = useTranslation()
    return (
      <Text fontSize="12px" bold color={stakedStatus[vaultPosition].color} textTransform="uppercase">
        {t(stakedStatus[vaultPosition].text)}
      </Text>
    )
  },
)
