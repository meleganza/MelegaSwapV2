import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { MelegaModal } from 'design-system/melega'
import { chains } from 'utils/wagmi'
import { filterMelegaVisibleSwitcherChains } from 'config/constants/supportChains'
import { getMelegaPreparingChains } from 'config/melegaChainRegistry'
import { ChainLogo } from 'components/Logo/ChainLogo'
import { headerChainLabel, headerChainTitle } from 'components/NetworkSwitcher'

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px 2px 4px;
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
  padding: 0 4px;
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
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $active }) => ($active ? 'rgba(244, 196, 48, 0.55)' : theme.colors.cardBorder)};
  background: ${({ theme, $active }) =>
    $active ? 'rgba(244, 196, 48, 0.12)' : 'rgba(255,255,255,0.03)'};
  box-shadow: ${({ $active }) =>
    $active
      ? 'inset 0 0 0 1px rgba(244, 196, 48, 0.22), 0 6px 16px rgba(0,0,0,0.28)'
      : '0 2px 8px rgba(0,0,0,0.18)'};
  cursor: pointer;
  text-align: left;
  min-height: 48px;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    border-color: rgba(244, 196, 48, 0.45);
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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

type NetworkSwitchModalProps = {
  isOpen: boolean
  onDismiss?: () => void
  switchNetwork: (chainId: number) => void
  chainId: number
}

export function NetworkSwitchModal({ isOpen, onDismiss, switchNetwork, chainId }: NetworkSwitchModalProps) {
  const { t } = useTranslation()
  const liveChains = filterMelegaVisibleSwitcherChains(chains)
  const preparing = getMelegaPreparingChains()

  const safePick = (next: number) => {
    try {
      if (next !== chainId) {
        switchNetwork(next)
        onDismiss?.()
      }
    } catch {
      // Never crash the chain selector — wallet rejection stays silent here.
    }
  }

  return (
    <MelegaModal
      open={isOpen}
      onClose={() => onDismiss?.()}
      title={t('Switch Network')}
      subtitle={t('Choose a supported network. No redirect.')}
      size="sm"
      testId="network-switch-modal"
      ariaLabel={t('Switch Network')}
    >
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
                  onClick={() => safePick(chain.id)}
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
                    onClick={() => safePick(row.chainId)}
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
    </MelegaModal>
  )
}
