import { AtomBox } from '@pancakeswap/ui/components/AtomBox'
import { Heading, ModalV2, ModalWrapper, Text, ModalV2Props } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { chains } from 'utils/wagmi'
import { filterMelegaVisibleSwitcherChains } from 'config/constants/supportChains'
import { getMelegaPreparingChains } from 'config/melegaChainRegistry'
import { ChainLogo } from 'components/Logo/ChainLogo'
import { headerChainLabel, headerChainTitle } from 'components/NetworkSwitcher'

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SectionLabel = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 0 2px;
`

const SectionTitle = styled(Text)`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const SectionHint = styled(Text)`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSubtle};
  opacity: 0.8;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;

  @media screen and (min-width: 420px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const ChainCard = styled.button<{ $active: boolean }>`
  appearance: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? 'rgba(244, 196, 48, 0.55)' : theme.colors.cardBorder)};
  background: ${({ theme, $active }) =>
    $active ? 'rgba(244, 196, 48, 0.1)' : theme.colors.background};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 0 0 1px rgba(244, 196, 48, 0.25)' : 'none')};
  cursor: pointer;
  text-align: left;
  min-height: 44px;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: rgba(244, 196, 48, 0.45);
  }
`

const ChainMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const ChainName = styled(Text)<{ $active: boolean }>`
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  color: ${({ theme, $active }) => ($active ? '#F4C430' : theme.colors.text)};
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StatusPill = styled.span<{ $tone: 'live' | 'preparing' | 'active' }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'live' ? '#0f7a3a' : $tone === 'active' ? '#8a6a00' : '#8a6a1a'};
  background: ${({ $tone }) =>
    $tone === 'live'
      ? 'rgba(34, 160, 80, 0.14)'
      : $tone === 'active'
        ? 'rgba(244, 196, 48, 0.16)'
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
        style={{ overflow: 'visible', border: 'none', maxWidth: '440px', width: 'min(440px, 100%)' }}
        data-testid="network-switch-modal"
      >
        <AtomBox position="relative">
          <AtomBox py="16px" px="14px">
            <Heading color="text" as="h4" mb="12px" style={{ fontSize: 16 }}>
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
                        title={headerChainTitle(chain.id)}
                        onClick={() => {
                          if (chain.id !== chainId) {
                            switchNetwork(chain.id)
                            props.onDismiss?.()
                          }
                        }}
                      >
                        <ChainLogo chainId={chain.id} width={22} height={22} />
                        <ChainMeta>
                          <ChainName $active={active}>{headerChainLabel(chain.id)}</ChainName>
                          <StatusPill $tone={active ? 'active' : 'live'}>
                            {active ? t('Active') : t('LIVE')}
                          </StatusPill>
                        </ChainMeta>
                      </ChainCard>
                    )
                  })}
                </CardGrid>
              </Section>

              <Section data-testid="network-switch-preparing" data-network-switch-coming-soon>
                <SectionLabel>
                  <SectionTitle>{t('PREPARING')}</SectionTitle>
                  <SectionHint>{t('Wallet switchable · product locked')}</SectionHint>
                </SectionLabel>
                {preparing.length > 0 ? (
                  <CardGrid>
                    {preparing.map((row) => {
                      const active = chainId === row.chainId
                      return (
                        <ChainCard
                          key={`preparing-${row.chainId}`}
                          type="button"
                          $active={active}
                          data-testid={`network-card-${row.chainId}`}
                          data-active={active ? 'true' : 'false'}
                          data-status="PREPARING"
                          title={row.name}
                          onClick={() => {
                            if (row.chainId !== chainId) {
                              switchNetwork(row.chainId)
                              props.onDismiss?.()
                            }
                          }}
                        >
                          <ChainLogo chainId={row.chainId} width={22} height={22} />
                          <ChainMeta>
                            <ChainName $active={active}>{headerChainLabel(row.chainId)}</ChainName>
                            <StatusPill $tone={active ? 'active' : 'preparing'}>
                              {active ? t('Active') : t('PREPARING')}
                            </StatusPill>
                          </ChainMeta>
                        </ChainCard>
                      )
                    })}
                  </CardGrid>
                ) : (
                  <Text fontSize="12px" color="textSubtle" px="2px">
                    {t('All product chains are LIVE.')}
                  </Text>
                )}
              </Section>
            </Body>
          </AtomBox>
        </AtomBox>
      </ModalWrapper>
    </ModalV2>
  )
}
