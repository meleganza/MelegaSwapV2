import { useTranslation } from '@pancakeswap/localization'
import {
  ArrowForwardIcon,
  Button,
  Flex,
  Heading,
  Link,
  LinkExternal,
  ModalV2,
  PageHeader,
  Text,
} from '@pancakeswap/uikit'
import { Route, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import DisclaimerModal from 'components/DisclaimerModal'
import { ConnectorNames, getDocLink } from 'config/wallet'
import { ExtendEthereum } from 'global'
import { useState, useCallback } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { FarmsContext } from './context'
import Farms from './Farms'

export function useIsBloctoETH() {
  const { chain } = useNetwork()
  const { isConnected, connector } = useAccount()
  const isETH = chain?.id === mainnet.id
  return (
    (connector?.id === ConnectorNames.Blocto ||
      (typeof window !== 'undefined' && Boolean((window.ethereum as ExtendEthereum)?.isBlocto))) &&
    isConnected &&
    isETH
  )
}

// Blocto EVM address is different across chains
function BloctoWarning() {
  const isBloctoETH = useIsBloctoETH()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()

  const [close, setClose] = useState(false)

  const handleSuccess = useCallback(() => {
    setClose(true)
  }, [])

  return (
    <ModalV2 isOpen={isBloctoETH && !close} closeOnOverlayClick={false}>
      <DisclaimerModal
        id="blocto-eth"
        modalHeader={t('Unsupported Wallet')}
        header={
          <>
            {t(
              'Crosschain farming on Ethereum does NOT support Blocto wallet, as you won’t be able to harvest MARCO rewards.',
            )}
            <LinkExternal href={getDocLink(code)} mt="4px">
              {t('Check out our wallet guide for the list of supported wallets.')}
            </LinkExternal>
          </>
        }
        subtitle={t('If you have previously deposited any LP tokens, please unstake.')}
        checks={[
          {
            key: 'blocto-understand',
            content: t('I understand'),
          },
        ]}
        onSuccess={handleSuccess}
      />
    </ModalV2>
  )
}

export const FarmsPageLayout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader>
        <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
          <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
            <Heading as="h1" scale="xxl" color="secondary" mb="24px">
              {t('Farms')}
            </Heading>
            <Heading scale="lg" color="text">
              {t('Stake LP tokens to earn.')}
            </Heading>
            <Link className="active" id="lottery-pot-banner">
              <Button p="0" variant="text">
                <Text color="primary" bold={true} fontSize="16px" mr="4px">
                  {t('Community Auctions')}
                </Text>
                <ArrowForwardIcon color="primary" />
              </Button>
            </Link>
          </Flex>
        </Flex>
      </PageHeader>
      <Farms>{children}</Farms>
    </>
  )
}

export { FarmsContext }
