import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { displayStudioMetric } from 'design-system/melega'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import FeaturedPoolAllocation from './FeaturedPoolAllocation'
import { poolsFeaturedHero } from '../poolsStudioTokens'

const LiveCard = styled.section`
  position: relative;
  width: 100%;
  height: 300px;
  min-height: 300px;
  max-height: 300px;
  background: #141414;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 18px;
  padding: 30px 34px 28px;
  box-sizing: border-box;
  overflow: hidden;
  transition: box-shadow 180ms ease-out;

  &:hover {
    box-shadow:
      0 0 0 1px rgba(212, 175, 55, 0.35),
      0 12px 28px rgba(0, 0, 0, 0.28);
  }
`

const EmptyCard = styled.section`
  width: 100%;
  height: ${poolsFeaturedHero.height};
  min-height: ${poolsFeaturedHero.height};
  max-height: ${poolsFeaturedHero.height};
  background: #141414;
  border: 1px solid rgba(212, 175, 55, 0.42);
  border-radius: 22px;
  box-shadow: none;
  padding: 34px 38px;
  box-sizing: border-box;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  @media (max-width: 767px) {
    height: auto;
    min-height: 0;
    max-height: none;
    padding: 24px;
  }
`

const LiveGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 188px);
  column-gap: 32px;
  height: 100%;
  min-height: 0;
  align-items: stretch;
`

const LiveLeft = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
`

const LiveRight = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
`

const LiveApr = styled.div`
  font-family: Orbitron, sans-serif;
  font-size: ${poolsFeaturedHero.aprSize};
  font-weight: 800;
  line-height: ${poolsFeaturedHero.aprLineHeight};
  color: ${poolsFeaturedHero.aprColor};
  margin: 0 0 ${poolsFeaturedHero.gapAprName};
  white-space: nowrap;
  overflow: visible;
  flex-shrink: 0;
`

const LivePoolName = styled.h2`
  margin: 0 0 ${poolsFeaturedHero.gapNameBadges};
  max-width: 260px;
  font-family: Orbitron, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 28px;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
`

const LiveBadgeRow = styled.div`
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${poolsFeaturedHero.badgeGap};
  margin-bottom: ${poolsFeaturedHero.gapBadgesKpi};
  flex-shrink: 0;
`

const LiveBadge = styled.span<{ $variant: 'live' | 'official' | 'partner' | 'community' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid
    ${({ $variant }) => {
      if ($variant === 'live') return '#19f08a'
      if ($variant === 'official') return '#d4af37'
      if ($variant === 'partner') return '#4da3ff'
      return '#a86cff'
    }};
  color: ${({ $variant }) => {
    if ($variant === 'live') return '#19f08a'
    if ($variant === 'official') return '#d4af37'
    if ($variant === 'partner') return '#4da3ff'
    return '#a86cff'
  }};
  background: ${({ $variant }) => ($variant === 'live' ? 'rgba(25, 240, 138, 0.12)' : 'transparent')};
`

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, ${poolsFeaturedHero.kpiWidth});
  gap: 12px 14px;
  margin-bottom: ${poolsFeaturedHero.gapKpiButtons};
  flex-shrink: 0;
`

const KpiBox = styled.div`
  width: ${poolsFeaturedHero.kpiWidth};
  height: ${poolsFeaturedHero.kpiHeight};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 8px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  cursor: default;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;

  &:hover {
    background: #1a1a1a;
    border-color: rgba(212, 175, 55, 0.35);
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.08);
  }
`

const KpiLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7c7c7c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const KpiValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LiveBtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  flex-shrink: 0;
`

const LiveStakeBtn = styled.button`
  width: 156px;
  min-width: 156px;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f6d44a 0%, #d4af37 100%);
  color: #080808;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: box-shadow 180ms ease-out;

  &:hover {
    box-shadow: 0 0 24px rgba(212, 175, 55, 0.32);
  }
`

const LiveAnalyzeBtn = styled.button`
  width: 156px;
  min-width: 156px;
  height: 46px;
  border: 1px solid #d4af37;
  border-radius: 12px;
  background: transparent;
  color: #d4af37;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: box-shadow 180ms ease-out;

  &:hover {
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.35);
  }
`

const EmptyTitle = styled.h2`
  margin: 0 0 12px;
  font-family: Orbitron, sans-serif;
  font-size: 28px;
  line-height: 34px;
  font-weight: 800;
  color: #ffffff;
  max-width: 520px;
  white-space: nowrap;
  overflow: visible;

  @media (max-width: 767px) {
    font-size: 24px;
    line-height: 30px;
    white-space: normal;
  }
`

const EmptySubtitle = styled.p`
  margin: 0 0 24px;
  font-family: Inter, sans-serif;
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  color: #b8b8b8;
  max-width: 520px;

  @media (max-width: 767px) {
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 20px;
  }
`

const EmptyCtaRow = styled.div`
  display: flex;
  gap: 14px;
  flex-shrink: 0;
  overflow: visible;

  @media (max-width: 767px) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
`

const EmptyPrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  min-width: 168px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f6d44a 0%, #d4af37 100%);
  color: #080808;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const EmptyGhostBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  min-width: 168px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #d4af37;
  background: transparent;
  color: #d4af37;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const HiddenReason = styled.div`
  margin-top: 18px;
  font-family: Inter, sans-serif;
  font-size: 11px;
  line-height: 16px;
  color: #7a7a7a;
  letter-spacing: 0.4px;
`

function badgeVariant(badge?: string): 'official' | 'partner' | 'community' | null {
  const key = (badge ?? '').toLowerCase()
  if (key.includes('official')) return 'official'
  if (key.includes('partner')) return 'partner'
  if (key.includes('community')) return 'community'
  return null
}

export const FeaturedPoolHero: React.FC = () => {
  const { featured, hiddenPoolReasons, rewardingCount, poolReconciliation, machine } = usePoolsRuntime()
  const card = featured.card
  const isRewarding = Boolean(card?.lifecycle?.rewarding)
  const endedCount = machine?.integrity?.ended ?? poolReconciliation?.finished ?? 0
  const discoveredCount = poolReconciliation?.discovered ?? 0
  const aprText =
    isRewarding && card?.sustainableAprDisplay && !isForbiddenAprDisplay(card.sustainableAprDisplay)
      ? card.sustainableAprDisplay
      : isRewarding
        ? 'Rewards Active'
        : null
  const hiddenReason = hiddenPoolReasons.length ? hiddenPoolReasons.join(' · ') : null

  if (!card || !isRewarding || rewardingCount === 0) {
    const emptyTitle =
      discoveredCount === 0
        ? 'No pools discovered'
        : endedCount > 0
          ? 'Historical Pools'
          : 'No rewarding pools yet'
    const emptySubtitle =
      discoveredCount === 0
        ? 'Verified SmartChef contracts will appear when indexed from chain.'
        : endedCount > 0
          ? 'These pools have completed their reward campaigns. Browse historical configurations below.'
          : 'Create or fund a reward pool to activate staking opportunities.'
    const showCreateCta = discoveredCount === 0

    return (
      <EmptyCard
        data-ps-featured-hero
        data-ps-featured-empty
        data-r716-featured-empty
        data-r707-featured
        data-r707c-empty
        data-r707d-empty
        data-r707e-empty
      >
        <EmptyTitle data-ps-empty-title>{emptyTitle}</EmptyTitle>
        <EmptySubtitle data-ps-empty-subtitle>{emptySubtitle}</EmptySubtitle>
        {showCreateCta ? (
          <EmptyCtaRow data-ps-empty-cta>
            <EmptyPrimaryBtn to="/build-studio?intent=staking-pool#create-pool" data-ps-empty-create>
              Create Pool
            </EmptyPrimaryBtn>
            <EmptyGhostBtn to="/build-studio" data-ps-empty-studio>
              Open Build Studio
            </EmptyGhostBtn>
          </EmptyCtaRow>
        ) : null}
        {hiddenReason ? <HiddenReason data-ps-empty-hidden-reason>{hiddenReason}</HiddenReason> : null}
      </EmptyCard>
    )
  }

  const healthScore = card.healthScore ?? card.sustainabilityScore ?? 0
  const lockType = displayStudioMetric(card.visualType ?? card.poolTypeLabel ?? card.lockPeriod)
  const rewardBadge = badgeVariant(card.rewardBadge)

  return (
    <LiveCard
      data-ps-featured-hero
      data-ps-featured
      data-r707-featured
      data-r707b-live
      data-r719-featured-hero
      data-r720-featured-hero
      data-r721-featured-hero
    >
      <LiveGrid>
        <LiveLeft>
          <LiveApr data-ps-live-apr>{aprText}</LiveApr>
          <LivePoolName data-ps-live-pool-name>{card.name}</LivePoolName>
          <LiveBadgeRow data-ps-hero-badges>
            <LiveBadge $variant="live">LIVE</LiveBadge>
            {rewardBadge ? <LiveBadge $variant={rewardBadge}>{card.rewardBadge}</LiveBadge> : null}
          </LiveBadgeRow>
          <KpiGrid data-ps-hero-kpi-grid>
            <KpiBox data-ps-hero-kpi-box>
              <KpiLabel>Reward Token</KpiLabel>
              <KpiValue>{displayStudioMetric(card.rewardToken)}</KpiValue>
            </KpiBox>
            <KpiBox data-ps-hero-kpi-box>
              <KpiLabel>Remaining Rewards</KpiLabel>
              <KpiValue>{displayStudioMetric(card.remainingRewards)}</KpiValue>
            </KpiBox>
            <KpiBox data-ps-hero-kpi-box>
              <KpiLabel>Lock Type</KpiLabel>
              <KpiValue>{lockType}</KpiValue>
            </KpiBox>
            <KpiBox data-ps-hero-kpi-box>
              <KpiLabel>Pool Health</KpiLabel>
              <KpiValue>{healthScore}/100</KpiValue>
            </KpiBox>
          </KpiGrid>
          <LiveBtnRow data-ps-hero-btn-row>
            <LiveStakeBtn type="button" onClick={() => requestModal(card, 'stake')} data-ps-stake-btn>
              Stake
            </LiveStakeBtn>
            <LiveAnalyzeBtn type="button" data-ps-hero-analyze>
              Analyze
            </LiveAnalyzeBtn>
          </LiveBtnRow>
        </LiveLeft>
        <LiveRight>
          <FeaturedPoolAllocation />
        </LiveRight>
      </LiveGrid>
    </LiveCard>
  )
}

export default FeaturedPoolHero
