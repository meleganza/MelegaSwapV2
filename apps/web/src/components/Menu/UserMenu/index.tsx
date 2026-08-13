import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import {
  Box,
  Flex,
  LogoutIcon,
  RefreshIcon,
  useModal,
  UserMenu as UIKitUserMenu,
  UserMenuDivider,
  UserMenuItem,
  UserMenuVariant,
} from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Trans from 'components/Trans'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useEffect, useState, useCallback } from 'react'
// import { useProfile } from 'state/profile/hooks'
import { usePendingTransactions } from 'state/transactions/hooks'
import { useAccount } from 'wagmi'
// import ProfileUserMenuItem from './ProfileUserMenuItem'
import WalletUserMenuItem from './WalletUserMenuItem'

const WalletModal = dynamic(() => import('./WalletModal'), { ssr: false, loading: () => null })
const WALLET_INFO_VIEW = 0
const TRANSACTIONS_VIEW = 1
const WRONG_NETWORK_VIEW = 2

const UserMenuItems = () => {
  const { t } = useTranslation()
  const { chainId, isWrongNetwork } = useActiveChainId()
  const { logout } = useAuth()
  const { address: account } = useAccount()
  const { hasPendingTransactions } = usePendingTransactions()
  // const { isInitialized, isLoading, profile } = useProfile()
  const [onPresentWalletModal] = useModal(<WalletModal initialView={WALLET_INFO_VIEW} />)
  const [onPresentTransactionModal] = useModal(<WalletModal initialView={TRANSACTIONS_VIEW} />)
  const [onPresentWrongNetworkModal] = useModal(<WalletModal initialView={WRONG_NETWORK_VIEW} />)
  // const hasProfile = isInitialized && !!profile

  const onClickWalletMenu = useCallback((): void => {
    if (isWrongNetwork) {
      onPresentWrongNetworkModal()
    } else {
      onPresentWalletModal()
    }
  }, [isWrongNetwork, onPresentWalletModal, onPresentWrongNetworkModal])

  return (
    <>
      <WalletUserMenuItem isWrongNetwork={isWrongNetwork} onPresentWalletModal={onClickWalletMenu} />
      <UserMenuItem as="button" disabled={isWrongNetwork} onClick={onPresentTransactionModal}>
        {t('Recent Transactions')}
        {hasPendingTransactions && <RefreshIcon spin />}
      </UserMenuItem>
      <UserMenuDivider />
      <NextLink href={`/profile/${account?.toLowerCase()}`} passHref>
        <UserMenuItem as="a" disabled={isWrongNetwork || chainId !== ChainId.BSC}>
          {t('Your NFTs')}
        </UserMenuItem>
      </NextLink>
      {/* <ProfileUserMenuItem
        isLoading={isLoading}
        hasProfile={hasProfile}
        disabled={isWrongNetwork || chainId !== ChainId.BSC}
      /> */}
      <UserMenuDivider />
      <UserMenuItem as="button" onClick={logout}>
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          {t('Disconnect')}
          <LogoutIcon />
        </Flex>
      </UserMenuItem>
    </>
  )
}

const UserMenu = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { isWrongNetwork } = useActiveChainId()
  const { hasPendingTransactions, pendingNumber } = usePendingTransactions()
  // const { profile } = useProfile()
  // const avatarSrc = profile?.nft?.image?.thumbnail
  const avatarSrc = undefined
  const [userMenuText, setUserMenuText] = useState<string>('')
  const [userMenuVariable, setUserMenuVariable] = useState<UserMenuVariant>('default')
  const [onPresentWalletModal] = useModal(<WalletModal initialView={WALLET_INFO_VIEW} />)

  useEffect(() => {
    if (hasPendingTransactions) {
      setUserMenuText(t('%num% Pending', { num: pendingNumber }))
      setUserMenuVariable('pending')
    } else {
      setUserMenuText('')
      setUserMenuVariable('default')
    }
  }, [hasPendingTransactions, pendingNumber, t])

  if (account) {
    return (
      // <UIKitUserMenu account={account} avatarSrc={avatarSrc} text={userMenuText} variant={userMenuVariable}>
      <UIKitUserMenu
        account={account}
        avatarSrc={avatarSrc}
        text={userMenuText}
        variant={userMenuVariable}
        onClick={onPresentWalletModal}
      >
        {({ isOpen }) => (isOpen ? <UserMenuItems /> : null)}
      </UIKitUserMenu>
    )
  }

  if (isWrongNetwork) {
    return (
      <UIKitUserMenu text={t('Network')} variant="danger">
        {({ isOpen }) => (isOpen ? <UserMenuItems /> : null)}
      </UIKitUserMenu>
    )
  }

  return (
    <ConnectWalletButton scale="sm" variant="primary">
      <Box display={['none', , , 'block']}>
        <Trans>Connect Wallet</Trans>
      </Box>
      <Box display={['block', , , 'none']}>
        <Trans>Connect</Trans>
      </Box>
    </ConnectWalletButton>
  )
}

export default UserMenu
