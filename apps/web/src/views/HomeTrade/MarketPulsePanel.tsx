import React, { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import useMarketPulseData from './useMarketPulseData'
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
  min-height: 280px;

  @media (min-width: 768px) {
    height: 280px;
    max-height: 280px;
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
  grid-template-columns: 160px 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`

const GaugeColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  min-width: 150px;

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 20px;
  align-content: start;
`

const Cell = styled.div`
  min-width: 0;
  min-height: 54px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const CellLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #707070;
  line-height: 1.2;
`

const StatusDot = styled.span<{ $tone?: 'gold' | 'green' | 'neutral' }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $tone }) =>
    $tone === 'green' ? colors.green : $tone === 'gold' ? colors.gold : 'rgba(255,255,255,0.2)'};
`

const CellValue = styled.div`
  margin-top: 2px;
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  animation: ${fadeIn} 180ms ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CellMeta = styled.div`
  margin-top: 1px;
  font-size: 11px;
  color: #9e9e9e;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Networks = styled.div`
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  color: #8a8a8a;
  line-height: 1.4;
  flex-shrink: 0;
  height: 28px;
  box-sizing: content-box;
`

const NetworkGold = styled.span`
  color: ${colors.gold};
  font-weight: 700;
`

const NetworkNeutral = styled.span`
  color: #707070;
  font-weight: 500;
`

export const MarketPulsePanel: React.FC = () => {
  const { cells, fearGreed } = useMarketPulseData()

  const displayCells = useMemo(() => cells.filter((c) => c.id !== 'fng'), [cells])

  return (
    <Shell data-market-pulse-panel>
      <Header>
        <Title>Market Pulse</Title>
        <Subtitle>Live market and chain signals.</Subtitle>
      </Header>
      <Content>
        <Body>
          <GaugeColumn>
            <FearGreedGauge value={fearGreed?.value} classification={fearGreed?.classification} />
          </GaugeColumn>
          <Grid>
            {displayCells.map((cell) => (
              <Cell key={cell.id}>
                <CellLabel>
                  <StatusDot $tone={cell.status} aria-hidden />
                  {cell.label}
                </CellLabel>
                <CellValue key={cell.value ?? 'indexing'}>{cell.value ?? 'Indexing'}</CellValue>
                {cell.meta && <CellMeta>{cell.meta}</CellMeta>}
              </Cell>
            ))}
          </Grid>
        </Body>
        <Networks>
          <NetworkGold>BNB</NetworkGold>
          <NetworkNeutral> · Polygon · Ethereum · Base</NetworkNeutral>
          <span style={{ marginLeft: 8, color: '#8a8a8a' }}>
            BNB active now. Other networks indexed when liquidity is available.
          </span>
        </Networks>
      </Content>
    </Shell>
  )
}

export default MarketPulsePanel
