import { useTranslation } from '@pancakeswap/localization'
import { Flex, ModalV2, LinkExternal } from '@pancakeswap/uikit'
import { Route, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import DisclaimerModal from 'components/DisclaimerModal'
import { ConnectorNames, getDocLink } from 'config/wallet'
import { ExtendEthereum } from 'global'
import { useState, useCallback } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { HumanEarnChrome } from 'views/HumanCore'
import Page from 'components/Layout/Page'
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
  return (
    <>
      <Page data-melega-trading-page="true">
        <Flex flexDirection="column" maxWidth="1400px" margin="0 auto" px="16px" style={{ gap: '16px' }}>
          <HumanEarnChrome
            sectionTitle="Farms"
            sectionSubtitle="Stake LP tokens, earn rewards."
            primaryAction={{ href: '/liquidity', label: 'Add liquidity' }}
          />
        </Flex>
      </Page>
      <Farms>{children}</Farms>
    </>
  )
}

export { FarmsContext }
