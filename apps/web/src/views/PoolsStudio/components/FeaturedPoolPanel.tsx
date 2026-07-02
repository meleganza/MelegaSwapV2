import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { PsGhostBtn, PsPanel, PsPrimaryBtn, PoolTokenIcon } from './poolsStudioPrimitives'
import StakeDonutChart from './StakeDonutChart'

const OfficialBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${poolsStudioColors.goldBg};
  border: 1px solid ${poolsStudioColors.gold};
  color: ${poolsStudioColors.goldBright};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  height: calc(100% - 8px);
  min-height: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Apr = styled.div`
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  color: ${poolsStudioColors.green};
  margin-bottom: ${poolsStudioLayout.featuredAprGap};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  margin-bottom: ${poolsStudioLayout.featuredMetricsBtnGap};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`

const PoolName = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

const MetricValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`

export const FeaturedPoolPanel: React.FC = () => (
  <PsPanel data-ps-panel data-ps-featured $height={poolsStudioLayout.featuredHeight} $radius="22px" style={{ padding: '22px' }}>
    <Inner>
      <Main>
        <TitleRow>
          <PoolTokenIcon symbol="MARCO" size={28} />
          <PoolName>MARCO STAKING</PoolName>
          <OfficialBadge>Official</OfficialBadge>
        </TitleRow>
        <Apr>36.08%</Apr>
        <Metrics>
          <Metric>
            <MetricLabel>Reward Token</MetricLabel>
            <MetricValue>MARCO</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Total Staked</MetricLabel>
            <MetricValue>$18.72M</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Lock</MetricLabel>
            <MetricValue>Flexible</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Participants</MetricLabel>
            <MetricValue>6.84K</MetricValue>
          </Metric>
          <Metric style={{ gridColumn: 'span 2' }}>
            <MetricLabel>Rewards Distributed</MetricLabel>
            <MetricValue>24.56M MARCO</MetricValue>
          </Metric>
        </Metrics>
        <BtnRow>
          <PsPrimaryBtn type="button" style={{ height: 40, minHeight: 40, padding: '0 20px' }}>
            Stake
          </PsPrimaryBtn>
          <PsGhostBtn type="button" style={{ height: 40, minHeight: 40 }}>
            Analyze
          </PsGhostBtn>
        </BtnRow>
      </Main>
      <StakeDonutChart />
    </Inner>
  </PsPanel>
)

export default FeaturedPoolPanel
