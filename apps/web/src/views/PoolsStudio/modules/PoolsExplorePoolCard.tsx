/**
 * POOLS_MODULE_004 — Explore pool card (430×248 desktop).
 */

import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolsExplore } from './poolsExplorePoolsTokens'
import type { PoolsExplorePoolCardModel } from './poolsExplorePoolsTypes'
import { poolBscScanContractUrl, resolvePoolContractAddress } from './poolContractLink'

const Card = styled.article`
  position: relative;
  width: 100%;
  max-width: ${poolsExplore.cardW};
  height: ${poolsExplore.cardH};
  box-sizing: border-box;
  padding: ${poolsExplore.cardPad};
  border-radius: ${poolsExplore.cardRadius};
  border: ${poolsExplore.cardBorder};
  background: ${poolsExplore.cardBg};
  box-shadow: ${poolsExplore.cardShadow};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsExplore.tabletBreak}) {
    max-width: none;
    height: auto;
    min-height: ${poolsExplore.cardH};
  }

  @media (max-width: ${poolsExplore.mobileBreak}) {
    max-width: none;
    min-height: 220px;
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

const LogoStack = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const RewardWrap = styled.span`
  margin-left: -8px;
  position: relative;
  z-index: 1;
  display: inline-flex;
`

const TextCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Title = styled.h3`
  margin: 0;
  font-size: ${poolsExplore.titleSize};
  line-height: ${poolsExplore.titleLine};
  font-weight: ${poolsExplore.titleWeight};
  color: ${poolsExplore.titleColor};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Desc = styled.p`
  margin: 0;
  font-size: ${poolsExplore.descSize};
  line-height: ${poolsExplore.descLine};
  color: ${poolsExplore.descColor};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  color: ${({ $tone }) => ($tone === 'Active' ? '#6DDC8C' : $tone === 'Partial' ? '#E0B85A' : 'rgba(255,255,255,0.55)')};
  background: ${({ $tone }) =>
    $tone === 'Active' ? 'rgba(109,220,140,0.12)' : $tone === 'Partial' ? 'rgba(224,184,90,0.12)' : 'rgba(255,255,255,0.06)'};
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

const LockLine = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.55);
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
  min-height: ${poolsExplore.touchMin};
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? poolsExplore.gold : '#F5F5F5')};
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 700;

  &:focus-visible {
    outline: ${poolsExplore.focusRing};
    outline-offset: ${poolsExplore.focusOffset};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PoolsExplorePoolCard: React.FC<{ pool: PoolsExplorePoolCardModel }> = ({ pool }) => {
  const { requestModal } = usePoolsRuntime()
  const contractAddress = resolvePoolContractAddress({
    contractAddress: pool.contractAddress || pool.sourceCard.contractAddress,
    explorerUrl: pool.contractExplorerUrl || pool.sourceCard.explorerUrl,
    contractExplorerUrl: pool.sourceCard.analyzePreview?.contractExplorerUrl,
  })
  const contractUrl = poolBscScanContractUrl(contractAddress)

  return (
    <Card
      data-testid="pools-explore-card"
      data-pool-id={pool.poolId}
      data-explore-status={pool.status}
      data-stake-enabled={pool.stakeEnabled ? 'true' : 'false'}
    >
      <Header>
        <Identity>
          <LogoStack aria-hidden="true">
            <PoolTokenIcon
              symbol={pool.stakeToken.symbol}
              address={pool.stakeToken.address ?? undefined}
              chainId={pool.stakeToken.chainId ?? undefined}
              size={32}
            />
            <RewardWrap>
              <PoolTokenIcon
                symbol={pool.rewardToken.symbol}
                address={pool.rewardToken.address ?? undefined}
                chainId={pool.rewardToken.chainId ?? undefined}
                size={24}
              />
            </RewardWrap>
          </LogoStack>
          <TextCol>
            <Title title={pool.title}>{pool.title}</Title>
            <Desc>{pool.description}</Desc>
          </TextCol>
        </Identity>
        <Status $tone={pool.statusLabel} aria-label={`Status ${pool.statusLabel}`}>
          {pool.statusLabel}
        </Status>
      </Header>

      <span
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
      >
        {pool.stakeToken.symbol} stake token and {pool.rewardToken.symbol} reward token
      </span>

      <Metrics>
        <Metric>
          <MetricLabel>APR</MetricLabel>
          <MetricValue>{pool.aprDisplay}</MetricValue>
          {pool.aprSupport ? <MetricSupport>{pool.aprSupport}</MetricSupport> : null}
        </Metric>
        <Metric>
          <MetricLabel>TVL</MetricLabel>
          <MetricValue>{pool.tvlDisplay}</MetricValue>
          {pool.tvlSupport ? <MetricSupport>{pool.tvlSupport}</MetricSupport> : null}
        </Metric>
        <Metric>
          <MetricLabel>Participants</MetricLabel>
          <MetricValue>{pool.participantsDisplay}</MetricValue>
        </Metric>
      </Metrics>

      <LockLine>Lock · {pool.lockType}</LockLine>

      <Actions>
        <Btn
          type="button"
          $primary
          disabled={!pool.stakeEnabled}
          aria-label={
            pool.stakeEnabled
              ? `Stake in ${pool.title}`
              : `Stake unavailable for ${pool.title}`
          }
          onClick={() => {
            if (!pool.stakeEnabled) return
            requestModal(pool.sourceCard, 'stake')
          }}
        >
          {pool.stakeLabel}
        </Btn>
        {contractUrl ? (
          <Btn
            type="button"
            data-testid="pools-explore-view-contract"
            data-ps-bscscan-btn
            aria-label={`View contract for ${pool.title} on BscScan`}
            onClick={() => {
              window.open(contractUrl, '_blank', 'noopener,noreferrer')
            }}
          >
            View Contract
          </Btn>
        ) : null}
        {pool.detailsHref ? (
          <Btn
            type="button"
            aria-label={`Details for ${pool.title}`}
            onClick={() => {
              window.location.href = pool.detailsHref!
            }}
          >
            Details
          </Btn>
        ) : null}
      </Actions>
    </Card>
  )
}

export default PoolsExplorePoolCard
