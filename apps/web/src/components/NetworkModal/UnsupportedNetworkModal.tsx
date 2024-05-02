import { Box, Button, Flex, Grid, Message, MessageText, Modal, Text } from '@pancakeswap/uikit'
// import { useLocalNetworkChain } from 'hooks/useActiveChainId'
import { useTranslation } from '@pancakeswap/localization'
import { useSwitchNetwork, useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import Image from 'next/image'
import useAuth from 'hooks/useAuth'
import { useMenuItems } from 'components/Menu/hooks/useMenuItems'
import { useRouter } from 'next/router'
import { getActiveMenuItem, getActiveSubMenuItem } from 'components/Menu/utils'
import { useAccount } from 'wagmi'
import { chains } from 'utils/wagmi'
import { useMemo } from 'react'
import { ChainId } from '@pancakeswap/sdk'
import Dots from '../Loader/Dots'

// Where chain is not supported or page not supported
export function UnsupportedNetworkModal({ pageSupportedChains }: { pageSupportedChains: number[] }) {
  const { switchNetworkAsync, isLoading, canSwitch } = useSwitchNetwork()
  const switchNetworkLocal = useSwitchNetworkLocal()
  // const { chains } = useNetwork()
  // const chainId = useLocalNetworkChain() || ChainId.ARBITRUM
  const { isConnected } = useAccount()
  const { logout } = useAuth()
  const { t } = useTranslation()
  const menuItems = useMenuItems()
  const { pathname } = useRouter()

  const title = useMemo(() => {
    const activeMenuItem = getActiveMenuItem({ menuConfig: menuItems, pathname })
    const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

    return activeSubMenuItem?.label || activeMenuItem?.label
  }, [menuItems, pathname])

  const supportedMainnetChains = useMemo(
    () => chains.filter((chain) => !chain.testnet && pageSupportedChains?.includes(chain.id)),
    [pageSupportedChains],
  )

  return (
    <Modal title={t('Check your network')} hideCloseButton>
      <Grid style={{ gap: '16px' }} maxWidth="336px">
        <Text>
          {t('Currently %feature% only supported in', { feature: typeof title === 'string' ? title : 'this page' })}{' '}
          {supportedMainnetChains?.map((c) => c.name).join(', ')}
        </Text>
        <Flex justifyContent="center">
          {supportedMainnetChains?.map((chain) => {
            const chainId_ = [8453, 42161, 324, 10].includes(chain.id) ? `${chain.id}-1` : chain.id
            return <Box p="5px" key={chain.name}>
              <Image
                layout="fixed"
                width={194/supportedMainnetChains.length}
                height={194/supportedMainnetChains.length}
                src={`/images/chains/${chainId_}.png`}
                alt="check your network"
              />
            </Box>
          })}          
        </Flex>
        <Message variant="warning">
          <MessageText>{t('Please switch your network to continue.')}</MessageText>
        </Message>
        {canSwitch ? (
          <>
          {supportedMainnetChains.map((chain) => {
            return <Button
              key={chain.name}
              isLoading={isLoading}
              onClick={() => {
                switchNetworkAsync(chain.id)
              }}
            >
              {isLoading ? <Dots>{t(`Switch to ${chain.name}`)}</Dots> : t(`Switch to ${chain.name}`)}
            </Button>
          })}
        </>
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
                switchNetworkLocal(ChainId.BSC)
              })
            }
          >
            {t('Disconnect Wallet')}
          </Button>
        )}
      </Grid>
    </Modal>
  )
}
