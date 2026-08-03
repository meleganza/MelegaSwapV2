import { AtomBox } from '@pancakeswap/ui/components/AtomBox'
import { Heading, ModalV2, ModalWrapper, Text, ModalV2Props, Flex } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { chains } from 'utils/wagmi'
import { filterMelegaVisibleSwitcherChains } from 'config/constants/supportChains'
import { getMelegaPreparingChains } from 'config/melegaChainRegistry'
import { ChainLogo } from 'components/Logo/ChainLogo'

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SectionLabel = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 0 2px;
`

const SectionTitle = styled(Text)`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const SectionHint = styled(Text)`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSubtle};
  opacity: 0.85;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media screen and (min-width: 520px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const ChainCard = styled.button<{ $active: boolean; $preparing?: boolean }>`
  appearance: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 14px 12px;
  border-radius: 14px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.cardBorder)};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.backgroundAlt : theme.colors.background};
  box-shadow: ${({ $active }) => ($active ? '0 0 0 1px rgba(118, 69, 217, 0.35)' : 'none')};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.12s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: default;
    opacity: ${({ $preparing }) => ($preparing ? 1 : 0.55)};
  }
`

const ChainName = styled(Text)<{ $active: boolean }>`
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  color: ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.text)};
  line-height: 1.25;
`

const StatusPill = styled.span<{ $tone: 'live' | 'preparing' | 'active' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'live' ? '#0f7a3a' : $tone === 'active' ? '#5b2aa8' : '#8a6a1a'};
  background: ${({ $tone }) =>
    $tone === 'live'
      ? 'rgba(34, 160, 80, 0.14)'
      : $tone === 'active'
        ? 'rgba(118, 69, 217, 0.14)'
        : 'rgba(200, 150, 40, 0.16)'};
`

interface NetworkSwitchModalProps<T = unknown> extends ModalV2Props {
  switchNetwork: (x: number) => void
  chainId: number
}

export function NetworkSwitchModal<T = unknown>(props: NetworkSwitchModalProps<T>) {
  const { switchNetwork, chainId, ...rest } = props
  const { t } = useTranslation()
  const liveChains = filterMelegaVisibleSwitcherChains(chains)
  const preparing = getMelegaPreparingChains()

  return (
    <ModalV2 closeOnOverlayClick {...rest}>
      <ModalWrapper
        onDismiss={props.onDismiss}
        style={{ overflow: 'visible', border: 'none', maxWidth: '420px', width: '100%' }}
        data-testid="network-switch-modal"
      >
        <AtomBox position="relative">
          <AtomBox py="24px" px="20px">
            <Heading color="text" as="h4" mb="18px" style={{ fontSize: 20 }}>
              {t('Switch Network')}
            </Heading>

            <Body>
              <Section data-testid="network-switch-live">
                <SectionLabel>
                  <SectionTitle>{t('LIVE')}</SectionTitle>
                  <SectionHint>{t('Trading ready')}</SectionHint>
                </SectionLabel>
                <CardGrid>
                  {liveChains.map((chain) => {
                    const active = chainId === chain.id
                    return (
                      <ChainCard
                        key={`live-${chain.id}`}
                        type="button"
                        $active={active}
                        data-testid={`network-card-${chain.id}`}
                        data-active={active ? 'true' : 'false'}
                        onClick={() => {
                          if (chain.id !== chainId) {
                            switchNetwork(chain.id)
                            props.onDismiss?.()
                          }
                        }}
                      >
                        <Flex justifyContent="space-between" width="100%" alignItems="center">
                          <ChainLogo chainId={chain.id} width={32} height={32} />
                          {active ? <StatusPill $tone="active">{t('Active')}</StatusPill> : (
                            <StatusPill $tone="live">{t('LIVE')}</StatusPill>
                          )}
                        </Flex>
                        <ChainName $active={active}>{chain.name}</ChainName>
                      </ChainCard>
                    )
                  })}
                </CardGrid>
              </Section>

              {preparing.length > 0 && (
                <Section data-testid="network-switch-preparing">
                  <SectionLabel>
                    <SectionTitle>{t('PREPARING')}</SectionTitle>
                    <SectionHint>{t('Wallet switchable · product locked')}</SectionHint>
                  </SectionLabel>
                  <CardGrid>
                    {preparing.map((row) => {
                      const active = chainId === row.chainId
                      return (
                        <ChainCard
                          key={`preparing-${row.chainId}`}
                          type="button"
                          $active={active}
                          $preparing
                          data-testid={`network-card-${row.chainId}`}
                          data-active={active ? 'true' : 'false'}
                          data-status="PREPARING"
                          onClick={() => {
                            if (row.chainId !== chainId) {
                              switchNetwork(row.chainId)
                              props.onDismiss?.()
                            }
                          }}
                        >
                          <Flex justifyContent="space-between" width="100%" alignItems="center">
                            <ChainLogo chainId={row.chainId} width={32} height={32} />
                            {active ? (
                              <StatusPill $tone="active">{t('Active')}</StatusPill>
                            ) : (
                              <StatusPill $tone="preparing">{t('PREPARING')}</StatusPill>
                            )}
                          </Flex>
                          <ChainName $active={active}>{row.name}</ChainName>
                        </ChainCard>
                      )
                    })}
                  </CardGrid>
                </Section>
              )}
            </Body>
          </AtomBox>
        </AtomBox>
      </ModalWrapper>
    </ModalV2>
  )
}
