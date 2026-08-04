import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Button, Text, Link, HelpIcon, Message, MessageText } from '@pancakeswap/uikit'
import { ChainId } from '@pancakeswap/sdk'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useLocalNetworkChain } from 'hooks/useActiveChainId'
import { headerChainLabel, headerChainTitle } from 'components/NetworkSwitcher'

const StyledLink = styled(Link)`
  width: 100%;
  &:hover {
    text-decoration: initial;
  }
`

interface WalletWrongNetworkProps {
  onDismiss: () => void
}

const WalletWrongNetwork: React.FC<React.PropsWithChildren<WalletWrongNetworkProps>> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const localChainId = useLocalNetworkChain() || ChainId.BSC
  const targetLabel = headerChainLabel(localChainId)
  const targetTitle = headerChainTitle(localChainId)

  const handleSwitchNetwork = async (): Promise<void> => {
    await switchNetworkAsync(localChainId)
    onDismiss?.()
  }

  return (
    <>
      <Text mb="12px">{t('You’re connected to the wrong network.')}</Text>
      <Text mb="16px" fontSize="13px" color="textSubtle">
        {t('This page expects')} {targetLabel} ({targetTitle}). {t('Switch network to continue — do not assume BSC.')}
      </Text>
      {canSwitch ? (
        <Button onClick={handleSwitchNetwork} mb="24px" data-testid="wallet-wrong-network-switch">
          {t('Switch to')} {targetLabel}
        </Button>
      ) : (
        <Message variant="danger">
          <MessageText>{t('Unable to switch network. Please try it on your wallet')}</MessageText>
        </Message>
      )}
      <StyledLink href="https://docs.melega.finance/setup-wallet" external>
        <Button width="100%" variant="secondary">
          {t('Learn How')}
          <HelpIcon color="primary" ml="6px" />
        </Button>
      </StyledLink>
    </>
  )
}

export default WalletWrongNetwork
