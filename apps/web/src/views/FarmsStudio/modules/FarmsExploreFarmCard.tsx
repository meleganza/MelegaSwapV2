/**
 * FARMS_MODULE_004 — Explore farm card (446×268 desktop).
 */

import React, { useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { farmsExplore } from './farmsExploreFarmsTokens'
import type { ExploreFarmViewModel } from './farmsExploreFarmsTypes'

const Card = styled.article`
  position: relative;
  width: 100%;
  max-width: ${farmsExplore.cardW};
  height: ${farmsExplore.cardH};
  box-sizing: border-box;
  padding: ${farmsExplore.cardPad};
  border-radius: ${farmsExplore.cardRadius};
  border: ${farmsExplore.cardBorder};
  background: ${farmsExplore.cardBg};
  box-shadow: ${farmsExplore.cardShadow};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;

  &:hover {
    border: ${farmsExplore.cardHoverBorder};
    box-shadow: ${farmsExplore.cardHoverShadow};
    transform: translateY(-${farmsExplore.cardHoverLift});
  }

  @media (max-width: ${farmsExplore.tabletBreak}) {
    max-width: none;
    height: auto;
    min-height: ${farmsExplore.cardH};
  }

  @media (max-width: ${farmsExplore.mobileBreak}) {
    max-width: none;
    min-height: ${farmsExplore.mobileCardMinH};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  min-height: ${farmsExplore.cardHeaderH};
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
  margin-left: ${({ $offset }) => ($offset ? `${farmsExplore.logoOverlap}px` : '0')};
  position: relative;
  z-index: ${({ $reward }) => ($reward ? 3 : 2)};
  ${({ $reward }) =>
    $reward
      ? `
    margin-left: 8px;
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
  font-size: ${farmsExplore.pairTitleSize};
  line-height: ${farmsExplore.pairTitleLine};
  font-weight: ${farmsExplore.pairTitleWeight};
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Earn = styled.p`
  margin: 0;
  font-size: ${farmsExplore.earnSize};
  line-height: ${farmsExplore.earnLine};
  color: ${farmsExplore.earnColor};
`

const Badges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`

const Status = styled.span<{ $tone: string }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'Active' ? '#6DDC8C' : $tone === 'Partial' ? '#E0B85A' : 'rgba(255,255,255,0.55)'};
  background: ${({ $tone }) =>
    $tone === 'Active'
      ? 'rgba(109,220,140,0.12)'
      : $tone === 'Partial'
        ? 'rgba(224,184,90,0.12)'
        : 'rgba(255,255,255,0.06)'};
`

const MultiBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: ${farmsExplore.gold};
  background: rgba(244, 196, 48, 0.12);
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

const WalletLine = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ContractLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  min-width: 0;
`

const ContractLink = styled.a`
  color: rgba(244, 196, 48, 0.92);
  font-size: 11px;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  flex: 1 1 0;
  min-height: ${farmsExplore.touchMin};
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? farmsExplore.gold : '#F5F5F5')};
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ConnectWrap = styled.div`
  flex: 1 1 0;
  min-width: 0;
  & > button {
    width: 100%;
    min-height: ${farmsExplore.touchMin};
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

function walletLpLine(farm: ExploreFarmViewModel): string {
  if (farm.userWalletLpBalanceState === 'disconnected') return 'Connect wallet to view LP balance'
  if (farm.userWalletLpBalanceState === 'unavailable') return 'LP balance unavailable'
  if (farm.userWalletLpBalance) return `Wallet LP: ${farm.userWalletLpBalance}`
  return 'LP balance unavailable'
}

export const FarmsExploreFarmCard: React.FC<{ farm: ExploreFarmViewModel }> = ({ farm }) => {
  const { requestModal } = useFarmsRuntime()
  const { switchNetworkAsync } = useSwitchNetwork()
  const [busy, setBusy] = useState<'approve' | 'stake' | null>(null)

  const accessibleName = `Stake ${farm.token0.symbol} ${farm.token1.symbol} LP in farm earning ${farm.rewardToken.symbol}`
  const logoDesc = `${farm.token0.symbol} and ${farm.token1.symbol} LP earning ${farm.rewardToken.symbol}`

  const onPrimary = async () => {
    if (farm.primaryAction === 'Farm Unavailable') return
    if (farm.primaryAction === 'Switch Network') {
      try {
        await switchNetworkAsync?.(farm.chainId)
      } catch {
        /* user rejected — keep card stable */
      }
      return
    }
    if (farm.primaryAction === 'Approve LP' || farm.primaryAction === 'Stake LP') {
      setBusy(farm.primaryAction === 'Approve LP' ? 'approve' : 'stake')
      try {
        requestModal(farm.sourceCard, 'stake')
      } finally {
        window.setTimeout(() => setBusy(null), 1200)
      }
    }
  }

  const primaryLabel =
    busy === 'approve' ? 'Approving…' : busy === 'stake' ? 'Staking…' : farm.primaryAction

  return (
    <Card
      data-testid="farms-explore-card"
      data-farm-id={farm.farmId}
      data-explore-status={farm.status}
      data-stake-enabled={farm.stakeEnabled ? 'true' : 'false'}
    >
      <Header>
        <Identity>
          <Logos aria-hidden="true">
            <Logo>
              <MelegaTokenAvatar
                name={farm.token0.symbol}
                symbol={farm.token0.symbol}
                address={farm.token0.address ?? undefined}
                chainId={farm.chainId}
                size={farmsExplore.lpLogo}
                radius="circle"
              />
            </Logo>
            <Logo $offset>
              <MelegaTokenAvatar
                name={farm.token1.symbol}
                symbol={farm.token1.symbol}
                address={farm.token1.address ?? undefined}
                chainId={farm.chainId}
                size={farmsExplore.lpLogo}
                radius="circle"
              />
            </Logo>
            <Logo $reward data-reward-token="true">
              <MelegaTokenAvatar
                name={farm.rewardToken.symbol}
                symbol={farm.rewardToken.symbol}
                address={farm.rewardToken.address ?? undefined}
                chainId={farm.chainId}
                size={farmsExplore.rewardLogo}
                radius="circle"
              />
            </Logo>
          </Logos>
          <TextCol>
            <Title title={farm.title}>{farm.title}</Title>
            <Earn>{farm.earnLine}</Earn>
          </TextCol>
        </Identity>
        <Badges>
          <Status $tone={farm.statusLabel} aria-label={`Status ${farm.statusLabel}`}>
            {farm.statusLabel}
          </Status>
          {farm.multiplier ? <MultiBadge aria-label={`${farm.multiplier} multiplier`}>{farm.multiplier}</MultiBadge> : null}
        </Badges>
      </Header>

      <VisuallyHidden>{logoDesc}</VisuallyHidden>

      <Metrics>
        <Metric>
          <MetricLabel>{farm.aprLabel}</MetricLabel>
          <MetricValue>{farm.apr}</MetricValue>
          <MetricSupport>{farm.aprState === 'Live' ? 'Live' : farm.aprState}</MetricSupport>
        </Metric>
        <Metric>
          <MetricLabel>TVL</MetricLabel>
          <MetricValue>{farm.tvl}</MetricValue>
          {farm.tvlState !== 'Live' ? <MetricSupport>{farm.tvlState}</MetricSupport> : null}
        </Metric>
        <Metric>
          <MetricLabel>Rewards</MetricLabel>
          <MetricValue>{farm.rewardToken.symbol}</MetricValue>
          {farm.rewardRate ? <MetricSupport>{farm.rewardRate}</MetricSupport> : null}
        </Metric>
      </Metrics>

      <WalletLine>
        {walletLpLine(farm)}
        {farm.allowanceState !== 'Disconnected' && farm.allowanceState !== 'Unavailable'
          ? ` · ${farm.allowanceState}`
          : ''}
      </WalletLine>

      <ContractLinks>
        {farm.masterbuilder ? (
          <ContractLink
            href={`https://bscscan.com/address/${farm.masterbuilder}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="farms-explore-farm-contract"
          >
            Farm Contract ↗
          </ContractLink>
        ) : null}
        {farm.lpToken?.address ? (
          <ContractLink
            href={`https://bscscan.com/address/${farm.lpToken.address}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="farms-explore-lp-contract"
          >
            LP Contract ↗
          </ContractLink>
        ) : null}
      </ContractLinks>

      <Actions>
        {farm.primaryAction === 'Connect Wallet' ? (
          <ConnectWrap>
            <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton>
          </ConnectWrap>
        ) : (
          <Btn
            type="button"
            $primary
            disabled={farm.primaryAction === 'Farm Unavailable' || busy != null}
            aria-label={accessibleName}
            onClick={() => {
              void onPrimary()
            }}
          >
            {primaryLabel}
          </Btn>
        )}
        {farm.detailsHref ? (
          <Btn
            type="button"
            aria-label={`Details for ${farm.title}`}
            onClick={() => {
              window.location.href = farm.detailsHref!
            }}
          >
            Details
          </Btn>
        ) : null}
      </Actions>
    </Card>
  )
}

export default FarmsExploreFarmCard
