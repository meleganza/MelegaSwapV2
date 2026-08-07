/**
 * FARMS_MODULE_004 — Explore farm card (446×268 desktop).
 */

import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { ChainSwitchConfirmDialog, chainDisplayName } from 'components/ChainSwitchConfirmDialog'
import { YieldActivitySparkline } from 'components/YieldActivitySparkline'
import { truthDash } from 'lib/data-truth'
import { GLOBAL_DATA_TRUTH_PIPELINE } from 'lib/data-truth'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { getBlockExploreLink } from 'utils'
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
  /* Founder amendment P0-6: tighter vertical rhythm for denser grids. */
  gap: 8px;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 10px;
  flex: 1;
  min-width: 0;
`

const Metric = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 4px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.5);
`

const MetricValue = styled.span`
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
`

const MetricSupport = styled.span`
  grid-column: 1 / -1;
  font-size: 10px;
  line-height: 12px;
  color: rgba(255, 255, 255, 0.42);
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
  gap: 6px 10px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: auto;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? farmsExplore.gold : '#F5F5F5')};
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
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

const LinkBtn = styled.a<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;

  &:focus-visible {
    outline: ${farmsExplore.focusRing};
    outline-offset: ${farmsExplore.focusOffset};
  }
`

const ConnectWrap = styled.div`
  grid-column: 1 / -1;
  min-width: 0;
  & > button {
    width: 100%;
    min-height: 36px;
    height: 36px;
  }
`

const ActivityPulse = styled.span<{ $tone: 'live' | 'partial' | 'neutral' }>`
  display: none;
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
  const [switchOpen, setSwitchOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const pendingActionRef = useRef<'approve' | 'stake' | null>(null)

  const accessibleName = `Stake ${farm.token0.symbol} ${farm.token1.symbol} LP in farm earning ${farm.rewardToken.symbol}`
  const logoDesc = `${farm.token0.symbol} and ${farm.token1.symbol} LP earning ${farm.rewardToken.symbol}`

  const resumeStake = () => {
    const next = pendingActionRef.current ?? 'stake'
    pendingActionRef.current = null
    setBusy(next)
    try {
      requestModal(farm.sourceCard, 'stake')
    } finally {
      window.setTimeout(() => setBusy(null), 1200)
    }
  }

  const onPrimary = async () => {
    if (farm.primaryAction === 'Farm Unavailable') return
    if (farm.primaryAction === 'Switch Network') {
      setSwitchOpen(true)
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

  const onConfirmSwitch = async () => {
    setSwitching(true)
    pendingActionRef.current = 'stake'
    try {
      await switchNetworkAsync?.(farm.chainId)
      setSwitchOpen(false)
      // Preserve selected farm — reopen stake after switch when wallet lands on target.
      window.setTimeout(() => resumeStake(), 400)
    } catch {
      pendingActionRef.current = null
      /* user rejected — keep card + dialog cancel path */
      setSwitchOpen(false)
    } finally {
      setSwitching(false)
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
          <MelegaExploreChainBadge chainId={farm.chainId} />
          <Status $tone={farm.statusLabel} aria-label={`Status ${farm.statusLabel}`}>
            {farm.statusLabel}
          </Status>
          {farm.multiplier ? <MultiBadge aria-label={`${farm.multiplier} multiplier`}>{farm.multiplier}</MultiBadge> : null}
        </Badges>
      </Header>

      <VisuallyHidden>{logoDesc}</VisuallyHidden>

      <Metrics data-truth-pipeline={GLOBAL_DATA_TRUTH_PIPELINE}>
        <Metric>
          <MetricLabel>{farm.aprLabel}</MetricLabel>
          <MetricValue>{truthDash(farm.apr)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>TVL</MetricLabel>
          <MetricValue>{truthDash(farm.tvl)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>24H Vol</MetricLabel>
          <MetricValue>{truthDash(farm.volume24h)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>24H Fees</MetricLabel>
          <MetricValue>{truthDash(farm.fees24h)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Reward</MetricLabel>
          <MetricValue>{truthDash(farm.rewardToken.symbol)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Remaining</MetricLabel>
          <MetricValue>{truthDash(farm.rewardsRemaining)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Duration</MetricLabel>
          <MetricValue>{truthDash(farm.rewardDuration)}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Participants</MetricLabel>
          <MetricValue>{truthDash(farm.participants)}</MetricValue>
        </Metric>
      </Metrics>

      <WalletLine>
        {walletLpLine(farm)}
        {farm.allowanceState !== 'Disconnected' && farm.allowanceState !== 'Unavailable'
          ? ` · ${farm.allowanceState}`
          : ''}
      </WalletLine>

      <YieldActivitySparkline
        pairAddress={farm.lpToken.address}
        testId="farms-explore-activity-spark"
      />

      <Actions data-testid="farms-explore-actions">
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
            data-testid="farms-explore-stake"
            onClick={() => {
              void onPrimary()
            }}
          >
            {farm.primaryAction === 'Switch Network'
              ? 'Switch Network'
              : farm.primaryAction === 'Approve LP'
                ? 'Approve LP'
                : farm.primaryAction === 'Farm Unavailable'
                  ? 'Unavailable'
                  : primaryLabel.includes('Stake')
                    ? 'Stake'
                    : primaryLabel}
          </Btn>
        )}
        <Btn
          type="button"
          disabled={farm.primaryAction === 'Farm Unavailable' || farm.primaryAction === 'Connect Wallet'}
          data-testid="farms-explore-manage"
          onClick={() => {
            if (farm.primaryAction === 'Switch Network') {
              setSwitchOpen(true)
              return
            }
            requestModal(farm.sourceCard, 'stake')
          }}
        >
          Manage
        </Btn>
        {farm.masterbuilder ? (
          <LinkBtn
            href={getBlockExploreLink(farm.masterbuilder, 'address', farm.chainId)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="farms-explore-view-farm"
          >
            View Farm
          </LinkBtn>
        ) : (
          <Btn type="button" disabled data-testid="farms-explore-view-farm">
            View Farm
          </Btn>
        )}
        {farm.lpToken?.address ? (
          <LinkBtn
            href={getBlockExploreLink(farm.lpToken.address, 'address', farm.chainId)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="farms-explore-view-lp"
          >
            View LP
          </LinkBtn>
        ) : (
          <Btn type="button" disabled data-testid="farms-explore-view-lp">
            View LP
          </Btn>
        )}
      </Actions>
      <ChainSwitchConfirmDialog
        open={switchOpen}
        targetChainId={farm.chainId}
        productLabel={`This farm is on ${chainDisplayName(farm.chainId)}. Switch network to continue?`}
        busy={switching}
        onCancel={() => {
          pendingActionRef.current = null
          setSwitchOpen(false)
        }}
        onConfirm={() => {
          void onConfirmSwitch()
        }}
      />
    </Card>
  )
}

export default FarmsExploreFarmCard
