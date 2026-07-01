import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import useMarketPulseData from './useMarketPulseData'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Shell = styled.section`
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 18px 20px 16px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1.2;
  letter-spacing: -0.01em;
`

const Subtitle = styled.p`
  margin: 3px 0 0;
  font-size: 12px;
  color: #707070;
  line-height: 1.35;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 18px;
`

const Cell = styled.div`
  min-width: 0;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 4px;

  &:nth-last-child(-n + 2) {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const CellLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5f5f5f;
  line-height: 1.2;
`

const StatusDot = styled.span<{ $tone?: 'gold' | 'green' | 'neutral' }>`
  width: 5px;
  height: 5px;
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
  color: #8a8a8a;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Networks = styled.div`
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f5f5f;
  line-height: 1.35;
`

const NetworkGold = styled.span`
  color: ${colors.gold};
  font-weight: 700;
`

const NetworkNeutral = styled.span`
  color: #5f5f5f;
  font-weight: 600;
`

export const MarketPulsePanel: React.FC = () => {
  const { cells } = useMarketPulseData()

  return (
    <Shell data-market-pulse-panel>
      <Header>
        <Title>Market Pulse</Title>
        <Subtitle>Live market and chain signals.</Subtitle>
      </Header>
      <Grid>
        {cells.map((cell) => (
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
      <Networks>
        <NetworkGold>BNB</NetworkGold>
        <NetworkNeutral> · Polygon · Ethereum · Base</NetworkNeutral>
      </Networks>
    </Shell>
  )
}

export default MarketPulsePanel
