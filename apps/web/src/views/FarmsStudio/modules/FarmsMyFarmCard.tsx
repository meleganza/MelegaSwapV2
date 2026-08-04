import React, { useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { getBlockExploreLink } from 'utils'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import type { FarmsPositionAction, FarmsWalletPosition } from './farmsMyFarmsTypes'

const Card = styled.article`
  width: 100%;
  max-width: ${farmsMyFarms.cardW};
  height: auto;
  min-height: ${farmsMyFarms.cardH};
  box-sizing: border-box;
  padding: ${farmsMyFarms.cardPad};
  border-radius: ${farmsMyFarms.cardRadius};
  border: ${farmsMyFarms.cardBorder};
  background: ${farmsMyFarms.cardBg};
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: ${typography.fontFamily.body};
  @media (max-width: ${farmsMyFarms.tabletBreak}) {
    max-width: none;
    min-height: ${farmsMyFarms.cardH};
  }
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`
const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`
const Logos = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`
const Logo = styled.span<{ $offset?: boolean; $reward?: boolean }>`
  display: inline-flex;
  margin-left: ${({ $offset }) => ($offset ? '-8px' : '0')};
  position: relative;
  z-index: ${({ $reward }) => ($reward ? 3 : 2)};
`
const Title = styled.h3`
  margin: 0;
  font-size: 17px;
  line-height: 22px;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
`
const Badge = styled.span<{ $tone: string }>`
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'Active' ? '#6DDC8C' : $tone === 'Emergency' ? '#FF8A65' : $tone === 'Finished' ? '#FF6B6B' : '#F4C430'};
  background: ${({ $tone }) => ($tone === 'Finished' ? 'rgba(255,107,107,.14)' : 'rgba(244,196,48,.12)')};
`
const Metrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
`
const Label = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
`
const Value = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 15px;
  line-height: 20px;
  font-weight: 700;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Support = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
`
const State = styled.p`
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
`
const ContractLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
`
const ContractLink = styled.a`
  color: rgba(244, 196, 48, 0.92);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
`
const Button = styled.button<{ $primary?: boolean }>`
  flex: 1 1 calc(50% - 4px);
  min-width: 96px;
  height: 36px;
  min-height: ${farmsMyFarms.touchMin};
  border-radius: 10px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,.45)' : 'rgba(255,255,255,.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,.16)' : 'rgba(255,255,255,.04)')};
  color: ${({ $primary }) => ($primary ? farmsMyFarms.gold : '#f5f5f5')};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`
const ScanLink = styled.a`
  flex: 1 1 calc(50% - 4px);
  min-width: 96px;
  height: 36px;
  min-height: ${farmsMyFarms.touchMin};
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

function busyLabel(action: FarmsPositionAction) {
  return action.kind === 'claim' ? 'Harvesting…' : action.kind === 'unstake' ? 'Withdrawing…' : action.label
}
function chainShort(chainId: number) {
  if (chainId === 56) return 'BNB'
  if (chainId === 8453) return 'Base'
  if (chainId === 137) return 'Polygon'
  if (chainId === 1) return 'Ethereum'
  if (chainId === 42161) return 'Arbitrum'
  if (chainId === 43114) return 'Avalanche'
  return `chain ${chainId}`
}

export const FarmsMyFarmCard: React.FC<{ position: FarmsWalletPosition }> = ({ position }) => {
  const { requestModal } = useFarmsRuntime()
  const [busy, setBusy] = useState<FarmsPositionAction['kind'] | null>(null)
  const onAction = (action: FarmsPositionAction) => {
    if (!action.enabled || !action.modalAction) return
    setBusy(action.kind)
    try {
      requestModal(position.sourceCard, action.modalAction)
    } finally {
      window.setTimeout(() => setBusy(null), 1200)
    }
  }
  const farmExplorer = position.masterChef
    ? getBlockExploreLink(position.masterChef, 'address', position.chainId)
    : null
  const lpExplorer = position.lpToken?.address
    ? getBlockExploreLink(position.lpToken.address, 'address', position.chainId)
    : null
  return (
    <Card
      data-testid="farms-my-farm-card"
      data-position-id={position.positionId}
      data-position-status={position.positionStatus}
      data-position-chain={position.chainId}
    >
      <Header>
        <Identity>
          <Logos aria-hidden="true">
            <Logo>
              <MelegaTokenAvatar
                name={position.token0.symbol}
                symbol={position.token0.symbol}
                address={position.token0.address ?? undefined}
                chainId={position.chainId}
                size={farmsMyFarms.stakeLogo}
                radius="circle"
              />
            </Logo>
            <Logo $offset>
              <MelegaTokenAvatar
                name={position.token1.symbol}
                symbol={position.token1.symbol}
                address={position.token1.address ?? undefined}
                chainId={position.chainId}
                size={farmsMyFarms.stakeLogo}
                radius="circle"
              />
            </Logo>
            <Logo $offset $reward>
              <MelegaTokenAvatar
                name={position.rewardToken.symbol}
                symbol={position.rewardToken.symbol}
                address={position.rewardToken.address ?? undefined}
                chainId={position.chainId}
                size={farmsMyFarms.rewardLogo}
                radius="circle"
              />
            </Logo>
          </Logos>
          <div style={{ minWidth: 0 }}>
            <Title title={position.title}>{position.title}</Title>
            <Subtitle>{position.subtitle}</Subtitle>
          </div>
        </Identity>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <MelegaExploreChainBadge chainId={position.chainId} />
          <Badge $tone={position.statusLabel}>{position.statusLabel}</Badge>
        </div>
      </Header>
      <Metrics>
        <div>
          <Label>Deposited LP</Label>
          <Value>{position.stakedFormatted || 'Unavailable'}</Value>
          <Support>{position.stakedValue ? position.stakedValue.replace(/[()]/g, '') : 'USD unavailable'}</Support>
        </div>
        <div>
          <Label>Pending rewards</Label>
          <Value>{position.pendingFormatted || 'Unavailable'}</Value>
          {position.pendingValue ? (
            <Support>{position.pendingValue}</Support>
          ) : position.pendingFormatted &&
            position.pendingFormatted !== '—' &&
            !position.pendingFormatted.startsWith('0 ') ? (
            <Support>USD value unavailable</Support>
          ) : null}
        </div>
        <div>
          <Label>APR</Label>
          <Value>{position.apr && position.apr !== '0%' ? position.apr : 'Unavailable'}</Value>
        </div>
        <State data-testid="farms-my-farm-chain-note">
          This farm is on {chainShort(position.chainId)}.
          {position.farmStateLine ? ` · ${position.farmStateLine}` : ''}
          {position.pid != null ? ` · pid ${position.pid}` : ''}
        </State>
      </Metrics>
      <ContractLinks>
        {farmExplorer ? (
          <ContractLink href={farmExplorer} target="_blank" rel="noopener noreferrer" data-testid="farms-my-farm-contract">
            View Farm ↗
          </ContractLink>
        ) : null}
        {lpExplorer ? (
          <ContractLink href={lpExplorer} target="_blank" rel="noopener noreferrer" data-testid="farms-my-lp-contract">
            View LP ↗
          </ContractLink>
        ) : null}
      </ContractLinks>
      {(position.actions.length > 0 || (position.statusLabel === 'Finished' && farmExplorer)) && (
        <Actions>
          {position.actions.map((action, i) => (
            <Button
              key={`${action.kind}-${action.label}`}
              type="button"
              $primary={i === 0}
              disabled={busy === action.kind || !action.enabled}
              aria-label={action.accessibleName}
              onClick={() => onAction(action)}
            >
              {busy === action.kind ? busyLabel(action) : action.label}
            </Button>
          ))}
          {position.statusLabel === 'Finished' && farmExplorer ? (
            <ScanLink
              href={farmExplorer}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="farms-my-farm-card-explorer"
              aria-label={`View ${position.title} farm contract on explorer`}
            >
              Explorer ↗
            </ScanLink>
          ) : null}
        </Actions>
      )}
    </Card>
  )
}
export default FarmsMyFarmCard
