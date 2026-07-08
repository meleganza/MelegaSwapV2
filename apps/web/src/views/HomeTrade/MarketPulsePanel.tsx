import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import { formatCompactDisplay } from 'design-system/melega/utils/formatCompactNumber'
import useMarketPulseData, { type MarketPulseMetric } from './useMarketPulseData'
import FearGreedGauge from './FearGreedGauge'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Shell = styled.section`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 300px;

  @media (min-width: 768px) {
    height: 300px;
    max-height: 300px;
  }

  @media (max-width: 767px) {
    height: auto;
    max-height: none;
  }
`

const Header = styled.div`
  margin-bottom: 10px;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: ${colors.textPrimary};
  line-height: 1.2;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #9e9e9e;
  line-height: 1.35;
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const Body = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr 1fr;
  gap: 20px 28px;
  flex: 1;
  min-height: 0;
  align-items: start;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

const GaugeColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 130px;
  min-width: 130px;
  padding-top: 8px;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    padding-top: 0;
  }
`

const DataColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`

const ColumnTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a8a8a;
  line-height: 1.2;
`

const MetricBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MetricLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8a8a8a;
  line-height: 1.2;
`

const MetricValue = styled.div<{ $compact?: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.05;
  animation: ${fadeIn} 180ms ease;
  white-space: nowrap;
  overflow: ${({ $compact }) => ($compact ? 'visible' : 'hidden')};
  text-overflow: ${({ $compact }) => ($compact ? 'clip' : 'ellipsis')};
`

const MetricChange = styled.div<{ $positive?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#00e676' : '#ff4d4d')};
  line-height: 1.2;
`

const MetricRow: React.FC<{ metric: MarketPulseMetric }> = ({ metric }) => {
  const isBlock = metric.label === 'Latest Block'
  const displayValue = metric.value ? formatCompactDisplay(metric.value) : undefined
  return (
    <MetricBlock>
      <MetricLabel>{metric.label}</MetricLabel>
      <MetricValue $compact={isBlock}>{displayValue ?? metric.unavailableReason ?? 'Source unavailable'}</MetricValue>
      {metric.change && <MetricChange $positive={metric.changePositive}>{metric.change}</MetricChange>}
    </MetricBlock>
  )
}

export const MarketPulsePanel: React.FC = () => {
  const { cryptoMarket, bnbChain, fearGreed, diagnostic } = useMarketPulseData()

  return (
    <Shell data-market-pulse-panel>
      <Header>
        <Title>Market Pulse</Title>
        <Subtitle>
          Live market and chain signals.
          {diagnostic
            ? ` Source: ${diagnostic.source} · Indexer: ${diagnostic.indexer} · Reason: ${diagnostic.reason}`
            : ''}
        </Subtitle>
      </Header>
      <Content>
        <Body>
          <GaugeColumn>
            <FearGreedGauge value={fearGreed?.value} classification={fearGreed?.classification} />
          </GaugeColumn>
          <DataColumn>
            <ColumnTitle>Crypto Market</ColumnTitle>
            {cryptoMarket.map((metric) => (
              <MetricRow key={metric.label} metric={metric} />
            ))}
          </DataColumn>
          <DataColumn>
            <ColumnTitle>BNB Chain</ColumnTitle>
            {bnbChain.map((metric) => (
              <MetricRow key={metric.label} metric={metric} />
            ))}
          </DataColumn>
        </Body>
      </Content>
    </Shell>
  )
}

export default MarketPulsePanel
