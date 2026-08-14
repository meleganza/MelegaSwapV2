import { Button, Modal, Text, Grid, Message, MessageText } from '@pancakeswap/uikit'
// import Image from 'next/image'
import { useSwitchNetwork, useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import { useWeb3React } from '@pancakeswap/wagmi'
import { chains } from 'utils/wagmi'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'
import { useHistory } from 'contexts/HistoryContext'
// import NextLink from 'next/link'
import { useMenuItems } from 'components/Menu/hooks/useMenuItems'
import { getActiveMenuItem, getActiveSubMenuItem } from 'components/Menu/utils'
import { useRouter } from 'next/router'
import useAuth from 'hooks/useAuth'
import { useActiveChainId, useLocalNetworkChain } from 'hooks/useActiveChainId'

export function PageNetworkSupportModal() {
  const { t } = useTranslation()
  const { switchNetworkAsync, isLoading, canSwitch } = useSwitchNetwork()
  const switchNetworkLocal = useSwitchNetworkLocal()
  const { isConnected } = useWeb3React()
  const { isWrongNetwork, chainId } = useActiveChainId()
  const localChainId = useLocalNetworkChain()
  const { logout } = useAuth()

  const foundChain = useMemo(() => chains.find((c) => c.id === chainId), [chainId])
  const targetChain = useMemo(
    () => chains.find((c) => c.id === (localChainId || chainId)) ?? foundChain,
    [localChainId, chainId, foundChain],
  )
  const historyManager = useHistory()

  const lastValidPath = historyManager?.history?.find((h) => ['/swap', 'liquidity', '/', '/info'].includes(h))

  const menuItems = useMenuItems()
  const { pathname, push } = useRouter()

  const { title,  } = useMemo(() => {
    const activeMenuItem = getActiveMenuItem({ menuConfig: menuItems, pathname })
    const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

    return {
      title: activeSubMenuItem?.disabled ? activeSubMenuItem?.label : activeMenuItem?.label,
      image: activeSubMenuItem?.image || activeMenuItem?.image,
    }
  }, [menuItems, pathname])

  return (
    <Modal title={title || t('Check your network')} hideCloseButton >
      <Grid style={{ gap: '16px' }} maxWidth="360px">
        <Text bold>{t('Check your network')}</Text>

        {/* {image && (
          <Box mx="auto" my="8px" position="relative" width="100%" minHeight="250px">
            <Image src={image} alt="feature" fill style={{ objectFit: 'contain' }} unoptimized />
          </Box>
        )} */}
        <Text small>
          {t('This feature is available on a different network. Switch to continue.')}
        </Text>
        {canSwitch ? (
          <Button
            variant={foundChain && lastValidPath ? 'secondary' : 'primary'}
            isLoading={isLoading}
            onClick={() => {
              // Prefer local/session chain — never hard-force BSC as error fallback.
              const preferred = targetChain?.id ?? localChainId
              if (!preferred) return
              if (isWrongNetwork) {
                switchNetworkLocal(preferred)
              } else {
                void switchNetworkAsync(preferred)
              }
            }}
          >
            {t('Switch to %chain%', { chain: targetChain?.name ?? 'supported network' })}
          </Button>
        ) : (
          <Message variant="danger">
            <MessageText>{t('Unable to switch network. Please try it on your wallet')}</MessageText>
          </Message>
        )}
        {isConnected && (
          <Button
            variant="secondary"
            onClick={() =>
              logout().then(() => {
                push('/')
              })
            }
          >
            {t('Disconnect Wallet')}
          </Button>
        )}
        {/* {foundChain && lastValidPath && (
          <NextLink href={lastValidPath ?? ''} passHref>
            <Button width="100%" as="a">
              {t('Stay on %chain%', { chain: foundChain.name })}
            </Button>
          </NextLink>
        )} */}
      </Grid>
    </Modal>
  )
}
