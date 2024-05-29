import {
  Box,
  Button,
  Flex,
  InjectedModalProps,
  LinkExternal,
  // Message,
  Skeleton,
  Text,
  CopyAddress,
} from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { ChainId, WNATIVE } from '@pancakeswap/sdk'
import { FetchStatus } from 'config/constants/types'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import useAuth from 'hooks/useAuth'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { ChainLogo } from 'components/Logo/ChainLogo'
// import NextLink from 'next/link'

// import { useProfile } from 'state/profile/hooks'

import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { formatBigNumber } from '@pancakeswap/utils/formatBalance'
import { useBalance } from 'wagmi'

// const COLORS = {
//   ETH: '#627EEA',
//   BNB: '#14151A',
// }

interface WalletInfoProps {
  hasLowNativeBalance?: boolean
  switchView: (newIndex: number) => void
  onDismiss: InjectedModalProps['onDismiss']
}

const WalletInfo: React.FC<WalletInfoProps> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const { account, chainId, chain } = useWeb3React()
  
  const isBSC = chainId === ChainId.BSC
  // const bnbBalance = useBalance({ address: account, chainId: ChainId.BSC })
  const nativeBalance = useBalance({ address: account, chainId })
  
  const native = useNativeCurrency()
  // const wNativeToken = !isBSC ? WNATIVE[chainId] : null
  // const wBNBToken = WNATIVE[ChainId.BSC]
  // const { balance: wNativeBalance, fetchStatus: wNativeFetchStatus } = useTokenBalance(wNativeToken?.address)
  // const { balance: wBNBBalance, fetchStatus: wBNBFetchStatus } = useTokenBalance(wBNBToken?.address, true)
  const accountEllipsis = account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : null;
  const { logout } = useAuth()

  // const { isInitialized, isLoading, profile } = useProfile()
  // const hasProfile = isInitialized && !!profile

  const handleLogout = () => {
    onDismiss?.()
    logout()
  }

  return (
    <>
      {/* <Text color="secondary" fontSize="12px" textTransform="uppercase" fontWeight="bold" mb="8px"> */}
      <Box mb="8px">
        <Flex justifyContent="space-between" alignItems="center" mb="8px">
          <Text color="secondary" fontSize="14px" fontWeight="bold">
            {t('Connected with')} {accountEllipsis}
          </Text>
          <CopyAddress tooltipMessage={t('Copied')} account={account} />
        </Flex>
      </Box>
      {/* <CopyAddress tooltipMessage={t('Copied')} account={account} mb="24px" /> */}
      {/* {hasLowNativeBalance && (
        <Message variant="warning" mb="24px">
          <Box>
            <Text fontWeight="bold">
              {t('%currency% Balance Low', {
                currency: native.symbol,
              })}
            </Text>
            <Text as="p">
              {t('You need %currency% for transaction fees.', {
                currency: native.symbol,
              })}
            </Text>
          </Box>
        </Message>
      )} */}
      {/* {!isBSC && chain && (
        <Box mb="12px">
          <Flex justifyContent="space-between" alignItems="center" mb="8px">
            <Flex bg={COLORS.ETH} borderRadius="16px" pl="4px" pr="8px" py="2px">
              <ChainLogo chainId={chain.id} />
              <Text color="white" ml="4px">
                {chain.name}
              </Text>
            </Flex>
            <CopyAddress tooltipMessage={t('Copied')} account={account} />
            <LinkExternal href={getBlockExploreLink(account, 'address', chainId)}>
              {getBlockExploreName(chainId)}
            </LinkExternal>
          </Flex>
          <Flex alignItems="center" justifyContent="space-between">
            <Text color="textSubtle">
              {native.symbol} {t('Balance')}
            </Text>
            {!nativeBalance.isFetched ? (
              <Skeleton height="22px" width="60px" />
            ) : (
              <Text>{formatBigNumber(nativeBalance.data.value, 6)}</Text>
            )}
          </Flex>
          {wNativeBalance.gt(0) && (
            <Flex alignItems="center" justifyContent="space-between">
              <Text color="textSubtle">
                {wNativeToken.symbol} {t('Balance')}
              </Text>
              {wNativeFetchStatus !== FetchStatus.Fetched ? (
                <Skeleton height="22px" width="60px" />
              ) : (
                <Text>{getFullDisplayBalance(wNativeBalance, wNativeToken.decimals, 6)}</Text>
              )}
            </Flex>
          )}
        </Box>
      )} */}
      {chain && <Box mb="8px">
        <Flex justifyContent="space-between" alignItems="center" mb="8px">
          <Flex borderRadius="16px" pl="4px" pr="8px" py="2px">
              <ChainLogo chainId={chain.id} />
              <Text color="primary" ml="4px">
                {chain.name}
              </Text>
          </Flex>
          <LinkExternal href={getBlockExploreLink(account, 'address', chainId)}>
            {getBlockExploreName(chainId)}
          </LinkExternal>
        </Flex>
        <Flex alignItems="center" justifyContent="space-between">
          <Text color="primary">{native.symbol} {t('Balance')}</Text>
          {!nativeBalance.isFetched ? (
            <Skeleton height="22px" width="60px" />
          ) : (
            <Text>{formatBigNumber(nativeBalance?.data?.value, 6)}</Text>
          )}
        </Flex>
        {/* {chainId !== ChainId.ETHEREUM && <Flex alignItems="center" justifyContent="space-between">
          <Text color="primary">{t('MARCO Balance')}</Text>
          {cakeFetchStatus !== FetchStatus.Fetched ? (
            <Skeleton height="22px" width="60px" />
          ) : (
            <Text>{formatBigNumber(cakeBalance, 3)}</Text>
          )}
        </Flex>} */}
      </Box>}
      <Button variant="secondary" width="100%" minHeight={48} onClick={handleLogout} my="12px">
        {t('Disconnect Wallet')}
      </Button>
    </>
  )
}

export default WalletInfo
