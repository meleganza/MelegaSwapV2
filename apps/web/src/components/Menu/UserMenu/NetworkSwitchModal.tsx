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
  gap: 14px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media screen and (min-width: 480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media screen and (min-width: 640px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const ChainCard = styled.button<{ $active: boolean }>`
  appearance: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.cardBorder)};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.backgroundAlt : theme.colors.background};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 0 0 1px rgba(118, 69, 217, 0.35)' : 'none')};
  cursor: pointer;
  text-align: left;
  min-height: 52px;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`

const ChainMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const ChainName = styled(Text)<{ $active: boolean }>`
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  color: ${({ theme, $active }) => ($active ? theme.colors.secondary : theme.colors.text)};
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StatusPill = styled.span<{ $tone: 'live' | 'coming' | 'active' }>`
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
  const comingSoon = getMelegaPreparingChains()

  return (
    <ModalV2 closeOnOverlayClick {...rest}>
      <ModalWrapper
        onDismiss={props.onDismiss}
        style={{ overflow: 'visible', border: 'none', maxWidth: '700px', width: 'min(700px, 100%)' }}
        data-testid="network-switch-modal"
      >
        <AtomBox position="relative">
          <AtomBox py="20px" px="18px">
            <Heading color="text" as="h4" mb="14px" style={{ fontSize: 18 }}>
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
                        <ChainLogo chainId={chain.id} width={28} height={28} />
                        <ChainMeta>
                          <ChainName $active={active}>{chain.name}</ChainName>
                          <StatusPill $tone={active ? 'active' : 'live'}>
                            {active ? t('Active') : t('LIVE')}
                          </StatusPill>
                        </ChainMeta>
                      </ChainCard>
                    )
                  })}
                </CardGrid>
              </Section>

              {comingSoon.length > 0 && (
                <Section data-testid="network-switch-coming-soon">
                  <SectionLabel>
                    <SectionTitle>{t('COMING SOON')}</SectionTitle>
                    <SectionHint>{t('Wallet switchable · product locked')}</SectionHint>
                  </SectionLabel>
                  <CardGrid>
                    {comingSoon.map((row) => {
                      const active = chainId === row.chainId
                      return (
                        <ChainCard
                          key={`coming-${row.chainId}`}
                          type="button"
                          $active={active}
                          data-testid={`network-card-${row.chainId}`}
                          data-active={active ? 'true' : 'false'}
                          data-status="COMING_SOON"
                          onClick={() => {
                            if (row.chainId !== chainId) {
                              switchNetwork(row.chainId)
                              props.onDismiss?.()
                            }
                          }}
                        >
                          <ChainLogo chainId={row.chainId} width={28} height={28} />
                          <ChainMeta>
                            <ChainName $active={active}>{row.name}</ChainName>
                            <StatusPill $tone={active ? 'active' : 'coming'}>
                              {active ? t('Active') : t('COMING SOON')}
                            </StatusPill>
                          </ChainMeta>
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
