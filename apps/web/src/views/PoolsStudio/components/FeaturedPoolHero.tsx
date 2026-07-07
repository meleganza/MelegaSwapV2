import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { OpenNewIcon } from '@pancakeswap/uikit'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { isForbiddenAprDisplay } from '../poolsRuntime/poolsAprRules'
import FeaturedPoolAllocation from './FeaturedPoolAllocation'

const Card = styled.section`
  width: 100%;
  max-width: 1240px;
  height: 356px;
  min-height: 356px;
  max-height: 356px;
  background: #141414;
  border: 1px solid #353535;
  border-radius: 22px;
  padding: 32px 36px;
  box-sizing: border-box;
  overflow: hidden;
`

const LiveCard = styled(Card)`
  overflow: visible;
`

const EmptyCard = styled.section`
  width: 100%;
  max-width: 1240px;
  height: 300px;
  min-height: 300px;
  max-height: 300px;
  background: #141414;
  border: 1px solid rgba(212, 175, 55, 0.55);
  border-radius: 22px;
  box-shadow: none;
  padding: 32px 40px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
`

const LiveGrid = styled.div`
  display: grid;
  grid-template-columns: 58% 1px 42%;
  column-gap: 32px;
  height: 100%;
  min-height: 0;
  align-items: start;
`

const Divider = styled.div`
  width: 1px;
  height: 292px;
  background: #2b2b2b;
  align-self: center;
  flex-shrink: 0;
`

const LiveLeft = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: visible;
`

const LiveRight = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: visible;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  height: 42px;
  min-height: 42px;
  max-height: 42px;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
`

const LivePoolName = styled.h2`
  margin: 0;
  flex: 0 1 auto;
  max-width: 360px;
  font-family: Orbitron, sans-serif;
  font-size: 30px;
  font-weight: 700;
  line-height: 34px;
  letter-spacing: 0;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LiveBadgeRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  overflow: hidden;
`

const LiveBadge = styled.span<{ $variant: 'live' | 'gold' | 'grey' }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid
    ${({ $variant }) => ($variant === 'live' ? '#16E67A' : $variant === 'gold' ? '#F2C94C' : '#6B6B6B')};
  color: ${({ $variant }) => ($variant === 'live' ? '#16E67A' : $variant === 'gold' ? '#F2C94C' : '#A0A0A0')};
  background: transparent;
`

const LiveApr = styled.div`
  margin-top: 18px;
  font-family: Orbitron, sans-serif;
  font-size: 72px;
  font-weight: 700;
  line-height: 78px;
  color: #16e67a;
  white-space: nowrap;
  overflow: visible;
`

const LiveDaily = styled.div`
  margin-top: 6px;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  color: #b8b8b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LiveMetrics = styled.div`
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  row-gap: 14px;
  column-gap: 24px;
`

const LiveMetricCell = styled.div`
  min-width: 0;
  overflow: hidden;
`

const LiveMetricLabel = styled.div`
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #777777;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LiveMetricValue = styled.div`
  margin-top: 2px;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LiveContractLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
  text-decoration: none;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #f2c94c;
  }
`

const LiveBtnRow = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 24px;
  flex-shrink: 0;
`

const LiveStakeBtn = styled.button`
  width: 176px;
  min-width: 176px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #f2c94c;
  color: #121212;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 150ms ease;

  &:hover {
    background: #ffd256;
  }
`

const LiveAnalyzeBtn = styled.button`
  width: 150px;
  min-width: 150px;
  height: 48px;
  border: 1px solid #f2c94c;
  border-radius: 12px;
  background: transparent;
  color: #f2c94c;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 150ms ease;

  &:hover {
    background: rgba(242, 201, 76, 0.08);
  }
`

const EmptyTitle = styled.h2`
  margin: 0 0 8px 0;
  font-family: Orbitron, sans-serif;
  font-size: 28px;
  line-height: 34px;
  font-weight: 700;
  color: #ffffff;
  max-width: 520px;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
`

const EmptySubtitle = styled.p`
  margin: 0 0 18px 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #a8a8a8;
  max-width: 520px;
`

const EmptyCtaRow = styled.div`
  display: flex;
  gap: 16px;
  height: 44px;
  margin-top: 0;
  flex-shrink: 0;
  overflow: visible;
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
  background: linear-gradient(180deg, #f7d44a 0%, #d7a900 100%);
  color: #050505;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
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
  color: #f7d44a;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
`

const HiddenReason = styled.div`
  margin-top: 14px;
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 16px;
  color: #777777;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

function shortenContract(address?: string, label?: string): string {
  if (label && label.includes('...')) return label
  if (!address || address.length < 10) return label ?? '—'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDailyReward(value?: string): string {
  if (!value || value === '—') return '—'
  if (value.startsWith('≈')) return value
  return `≈ ${value}`
}

function durationBadge(visualType?: string, lockPeriod?: string): string | null {
  const source = visualType ?? lockPeriod ?? ''
  if (/90/i.test(source)) return '90 Days'
  if (/30/i.test(source)) return '30 Days'
  if (/180/i.test(source)) return '180 Days'
  if (/365/i.test(source)) return '365 Days'
  if (source && source !== 'Flexible') return source
  return null
}

export const FeaturedPoolHero: React.FC = () => {
  const { featured, requestModal, hiddenPoolReasons } = usePoolsRuntime()
  const card = featured.card
  const isLive = card?.displayStatus === 'LIVE' && card?.status === 'live'
  const aprText =
    isLive && card?.sustainableAprDisplay && !isForbiddenAprDisplay(card.sustainableAprDisplay)
      ? card.sustainableAprDisplay
      : null
  const hiddenReason = hiddenPoolReasons.length ? hiddenPoolReasons.join(' · ') : null

  if (!card || !isLive || !aprText) {
    return (
      <EmptyCard
        data-ps-featured-hero
        data-ps-featured-empty
        data-r707-featured
        data-r707c-empty
        data-r707d-empty
        data-r707e-empty
      >
        <EmptyTitle data-ps-empty-title>No funded reward pools</EmptyTitle>
        <EmptySubtitle data-ps-empty-subtitle>
          Create or fund a reward pool to activate staking opportunities.
        </EmptySubtitle>
        <EmptyCtaRow data-ps-empty-cta>
          <EmptyPrimaryBtn to="/build-studio?intent=staking-pool#create-pool" data-ps-empty-create>
            Create Pool
          </EmptyPrimaryBtn>
          <EmptyGhostBtn to="/build-studio" data-ps-empty-studio>
            Open Build Studio
          </EmptyGhostBtn>
        </EmptyCtaRow>
        {hiddenReason ? <HiddenReason data-ps-empty-hidden-reason>{hiddenReason}</HiddenReason> : null}
      </EmptyCard>
    )
  }

  const contractShort = shortenContract(card.contractAddress, card.contractLabel)
  const duration = durationBadge(card.visualType, card.lockPeriod)

  return (
    <LiveCard data-ps-featured-hero data-ps-featured data-r707-featured data-r707b-live>
      <LiveGrid>
        <LiveLeft>
          <TitleRow>
            <LivePoolName>{card.name}</LivePoolName>
            <LiveBadgeRow>
              <LiveBadge $variant="live">LIVE</LiveBadge>
              {card.rewardBadge ? <LiveBadge $variant="gold">{card.rewardBadge}</LiveBadge> : null}
              {duration ? <LiveBadge $variant="grey">{duration}</LiveBadge> : null}
            </LiveBadgeRow>
          </TitleRow>
          <LiveApr data-ps-live-apr>{aprText}</LiveApr>
          <LiveDaily>{formatDailyReward(featured.estimatedDailyReward)}</LiveDaily>
          <LiveMetrics>
            <LiveMetricCell>
              <LiveMetricLabel>Stake token</LiveMetricLabel>
              <LiveMetricValue>{card.stakeToken ?? '—'}</LiveMetricValue>
            </LiveMetricCell>
            <LiveMetricCell>
              <LiveMetricLabel>Reward token</LiveMetricLabel>
              <LiveMetricValue>{card.rewardToken ?? '—'}</LiveMetricValue>
            </LiveMetricCell>
            <LiveMetricCell>
              <LiveMetricLabel>Lock</LiveMetricLabel>
              <LiveMetricValue>{card.lockPeriod ?? '—'}</LiveMetricValue>
            </LiveMetricCell>
            <LiveMetricCell>
              <LiveMetricLabel>Cooldown</LiveMetricLabel>
              <LiveMetricValue>{card.cooldown ?? '—'}</LiveMetricValue>
            </LiveMetricCell>
            <LiveMetricCell>
              <LiveMetricLabel>Remaining rewards</LiveMetricLabel>
              <LiveMetricValue>{card.remainingRewards ?? '—'}</LiveMetricValue>
            </LiveMetricCell>
            <LiveMetricCell>
              <LiveMetricLabel>Contract</LiveMetricLabel>
              {card.explorerUrl ? (
                <LiveContractLink href={card.explorerUrl} target="_blank" rel="noopener noreferrer">
                  {contractShort}
                  <OpenNewIcon color="#F2C94C" width="14px" />
                </LiveContractLink>
              ) : (
                <LiveMetricValue>{contractShort}</LiveMetricValue>
              )}
            </LiveMetricCell>
          </LiveMetrics>
          <LiveBtnRow>
            <LiveStakeBtn type="button" onClick={() => requestModal(card, 'stake')} data-ps-stake-btn>
              Stake
            </LiveStakeBtn>
            <LiveAnalyzeBtn type="button">Analyze</LiveAnalyzeBtn>
          </LiveBtnRow>
        </LiveLeft>
        <Divider aria-hidden />
        <LiveRight>
          <FeaturedPoolAllocation />
        </LiveRight>
      </LiveGrid>
    </LiveCard>
  )
}

export default FeaturedPoolHero
