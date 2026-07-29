/**
 * FARMS_MODULE_005 — Finished farm card (446×250 desktop).
 */

import React, { useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsFinished } from './farmsFinishedFarmsTokens'
import type { FarmsFinishedAction, FinishedFarmPosition } from './farmsFinishedFarmsTypes'

const Card = styled.article<{ $emergency?: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${farmsFinished.cardW};
  height: ${farmsFinished.cardH};
  box-sizing: border-box;
  padding: ${farmsFinished.cardPad};
  border-radius: ${farmsFinished.cardRadius};
  border: ${({ $emergency }) => ($emergency ? farmsFinished.emergencyBorder : farmsFinished.cardBorder)};
  background: ${farmsFinished.cardBg};
  box-shadow: ${farmsFinished.cardShadow};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${farmsFinished.tabletBreak}) {
    max-width: none;
    height: auto;
    min-height: ${farmsFinished.cardH};
  }

  @media (max-width: ${farmsFinished.mobileBreak}) {
    max-width: none;
    min-height: ${farmsFinished.mobileCardMinH};
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
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
  margin-left: ${({ $offset, $reward }) => ($reward ? '8px' : $offset ? `${farmsFinished.logoOverlap}px` : '0')};
  position: relative;
  z-index: ${({ $reward }) => ($reward ? 3 : 2)};
  ${({ $reward }) =>
    $reward
      ? `
    outline: 2px solid rgba(13,13,13,0.98);
    border-radius: 999px;
  `
      : ''}
`

const TextCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 17px;
  line-height: 22px;
  font-weight: 750;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.54);
`

const EndedDate = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.45);
`

const Status = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  color: ${({ $tone }) => {
    if ($tone === 'Emergency') return '#FF8A65'
    if ($tone === 'Withdraw') return '#F4C430'
    if ($tone === 'Partial') return '#E0B85A'
    if ($tone === 'Unavailable') return 'rgba(255,255,255,0.55)'
    return '#B39DDB'
  }};
  background: ${({ $tone }) => {
    if ($tone === 'Emergency') return 'rgba(255,138,101,0.14)'
    if ($tone === 'Withdraw') return 'rgba(244,196,48,0.14)'
    if ($tone === 'Partial') return 'rgba(224,184,90,0.12)'
    if ($tone === 'Unavailable') return 'rgba(255,255,255,0.06)'
    return 'rgba(179,157,219,0.12)'
  }};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  flex: 1;
  min-width: 0;
`

const Metric = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.5);
`

const MetricValue = styled.span`
  font-size: 14px;
  line-height: 18px;
  font-weight: 700;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MetricSupport = styled.span`
  font-size: 10px;
  line-height: 13px;
  color: rgba(255, 255, 255, 0.45);
`

const Recovery = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
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
  gap: 8px;
  margin-top: auto;
`

const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  appearance: none;
  cursor: pointer;
  flex: 1 1 0;
  min-width: 0;
  min-height: ${farmsFinished.touchMin};
  height: 40px;
  border-radius: 10px;
  border: 1px solid
    ${({ $danger, $primary }) =>
      $danger ? 'rgba(255,138,101,0.45)' : $primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)'};
  background: ${({ $danger, $primary }) =>
    $danger ? 'rgba(255,138,101,0.14)' : $primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $danger, $primary }) => ($danger ? '#FF8A65' : $primary ? farmsFinished.gold : '#F5F5F5')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 700;

  &:focus-visible {
    outline: ${farmsFinished.focusRing};
    outline-offset: ${farmsFinished.focusOffset};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: ${farmsFinished.mobileBreak}) {
    &:only-child {
      width: 100%;
    }
  }
`

const ConnectWrap = styled.div`
  flex: 1;
  & > button {
    width: 100%;
    min-height: ${farmsFinished.touchMin};
    height: 40px;
  }
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

function busyLabel(kind: FarmsFinishedAction['kind']): string {
  if (kind === 'withdraw' || kind === 'emergency_withdraw') return 'Withdrawing…'
  if (kind === 'claim') return 'Harvesting…'
  return ''
}

export const FarmsFinishedFarmCard: React.FC<{ position: FinishedFarmPosition }> = ({ position }) => {
  const { requestModal } = useFarmsRuntime()
  const { switchNetworkAsync } = useSwitchNetwork()
  const [busy, setBusy] = useState<FarmsFinishedAction['kind'] | null>(null)

  const logoDesc = `${position.token0.symbol} and ${position.token1.symbol} LP earning ${position.rewardToken.symbol} rewards`

  const onAction = async (action: FarmsFinishedAction) => {
    if (!action.enabled) return
    if (action.kind === 'switch_network') {
      try {
        await switchNetworkAsync?.(position.chainId)
      } catch {
        /* user rejected */
      }
      return
    }
    if (!action.modalAction) return
    setBusy(action.kind)
    try {
      requestModal(position.sourceCard, action.modalAction)
    } finally {
      window.setTimeout(() => setBusy(null), 1200)
    }
  }

  return (
    <Card
      data-testid="farms-finished-card"
      data-position-id={position.positionId}
      data-position-status={position.positionStatus}
      $emergency={position.positionStatus === 'EMERGENCY'}
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
                size={farmsFinished.lpLogo}
                radius="circle"
              />
            </Logo>
            <Logo $offset>
              <MelegaTokenAvatar
                name={position.token1.symbol}
                symbol={position.token1.symbol}
                address={position.token1.address ?? undefined}
                chainId={position.chainId}
                size={farmsFinished.lpLogo}
                radius="circle"
              />
            </Logo>
            <Logo $reward data-reward-token="true">
              <MelegaTokenAvatar
                name={position.rewardToken.symbol}
                symbol={position.rewardToken.symbol}
                address={position.rewardToken.address ?? undefined}
                chainId={position.chainId}
                size={farmsFinished.rewardLogo}
                radius="circle"
              />
            </Logo>
          </Logos>
          <TextCol>
            <Title title={position.title}>{position.title}</Title>
            <Subtitle>{position.subtitle}</Subtitle>
            <EndedDate>{position.endedDateLabel}</EndedDate>
          </TextCol>
        </Identity>
        <Status $tone={position.statusLabel} aria-label={`Status ${position.statusLabel}`}>
          {position.statusLabel}
        </Status>
      </Header>

      <VisuallyHidden>{logoDesc}</VisuallyHidden>

      <Metrics>
        <Metric>
          <MetricLabel>LP to Withdraw</MetricLabel>
          <MetricValue>{position.stakedFormatted}</MetricValue>
          {position.stakedValue ? <MetricSupport>{position.stakedValue}</MetricSupport> : null}
        </Metric>
        <Metric>
          <MetricLabel>Rewards to Claim</MetricLabel>
          <MetricValue>{position.pendingFormatted}</MetricValue>
          {position.pendingFormatted === '—' ? (
            <MetricSupport>Reward data unavailable</MetricSupport>
          ) : position.pendingValue ? (
            <MetricSupport>{position.pendingValue}</MetricSupport>
          ) : null}
        </Metric>
      </Metrics>

      <Recovery>{position.recoveryLine}</Recovery>

      <ContractLinks>
        {position.masterbuilder ? (
          <ContractLink
            href={`https://bscscan.com/address/${position.masterbuilder}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="farms-finished-farm-contract"
          >
            Farm Contract ↗
          </ContractLink>
        ) : null}
        {position.lpToken?.address ? (
          <ContractLink
            href={`https://bscscan.com/address/${position.lpToken.address}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="farms-finished-lp-contract"
          >
            LP Contract ↗
          </ContractLink>
        ) : null}
      </ContractLinks>

      <Actions>
        {position.actions.map((action, i) =>
          action.kind === 'connect' ? (
            <ConnectWrap key={action.kind}>
              <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
            </ConnectWrap>
          ) : (
            <Btn
              key={`${action.kind}-${action.label}`}
              type="button"
              $primary={i === 0 && action.kind !== 'emergency_withdraw'}
              $danger={action.kind === 'emergency_withdraw'}
              disabled={!action.enabled || busy === action.kind}
              aria-label={action.accessibleName}
              onClick={() => {
                void onAction(action)
              }}
            >
              {busy === action.kind ? busyLabel(action.kind) || action.label : action.label}
            </Btn>
          ),
        )}
      </Actions>
    </Card>
  )
}

export default FarmsFinishedFarmCard
