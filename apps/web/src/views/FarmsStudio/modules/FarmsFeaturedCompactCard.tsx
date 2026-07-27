/**
 * Compact Featured Farm — sits near Why Farm (not a giant bottom panel).
 */
import React from 'react'
import styled from 'styled-components'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { displayFarmMetric } from '../farmsStudioDisplay'
import { farmsHero } from './farmsHeroTokens'

const Card = styled.aside`
  width: ${farmsHero.trustBoxW};
  max-width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: linear-gradient(145deg, rgba(28, 24, 12, 0.95) 0%, rgba(14, 14, 14, 0.96) 100%);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: ${farmsHero.mobileBreak}) {
    width: min(100%, ${farmsHero.mobileTrustW});
  }
`

const Eyebrow = styled.div`
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsHero.gold};
`

const Pair = styled.div`
  font-size: 15px;
  font-weight: 750;
  color: #f7f7f7;
  line-height: 1.2;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`

const Metric = styled.div`
  min-width: 0;
`

const Label = styled.div`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const Value = styled.div`
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: #f7f7f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Empty = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
`

export const FarmsFeaturedCompactCard: React.FC = () => {
  const { featured } = useFarmsRuntime()
  const hasPair = Boolean(featured.card && featured.pair && featured.pair !== '—')

  if (!hasPair) {
    return (
      <Card data-testid="farms-featured-compact" data-featured-compact="empty">
        <Eyebrow>Featured Farm</Eyebrow>
        <Empty>No featured farm available</Empty>
      </Card>
    )
  }

  return (
    <Card data-testid="farms-featured-compact" data-featured-compact="ready">
      <Eyebrow>Featured Farm</Eyebrow>
      <Pair>{featured.pair}</Pair>
      <Metrics>
        <Metric>
          <Label>APR</Label>
          <Value>{displayFarmMetric(featured.apr)}</Value>
        </Metric>
        <Metric>
          <Label>TVL</Label>
          <Value>{displayFarmMetric(featured.tvl)}</Value>
        </Metric>
        <Metric>
          <Label>Rewards</Label>
          <Value>{displayFarmMetric(featured.dailyRewards)}</Value>
        </Metric>
      </Metrics>
    </Card>
  )
}

export default FarmsFeaturedCompactCard
