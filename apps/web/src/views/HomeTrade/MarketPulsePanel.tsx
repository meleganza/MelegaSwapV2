import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import useMarketPulseData from './useMarketPulseData'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Shell = styled.section`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 22px;
  box-sizing: border-box;
  max-height: 210px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1.2;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #a8a8a8;
  line-height: 1.35;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;

  @media (max-width: 767px) {
    gap: 6px 12px;
  }
`

const Cell = styled.div`
  min-width: 0;

  @media (max-width: 767px) {
    min-height: 64px;
  }
`

const CellLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
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
    $tone === 'green' ? colors.green : $tone === 'gold' ? colors.gold : 'rgba(255,255,255,0.25)'};
`

const CellValue = styled.div`
  margin-top: 3px;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  animation: ${fadeIn} 180ms ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CellMeta = styled.div`
  margin-top: 1px;
  font-size: 12px;
  color: #9e9e9e;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Networks = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: #8a8a8a;
  line-height: 1.4;
`

const NetworkGold = styled.span`
  color: ${colors.gold};
  font-weight: 600;
`

const NetworkNote = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: #707070;
  line-height: 1.35;
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
        Supported networks:{' '}
        <NetworkGold>BNB Chain</NetworkGold>
        {' · '}
        Polygon · Ethereum · Base
        <NetworkNote>BNB active now. Other networks are indexed when liquidity is available.</NetworkNote>
      </Networks>
    </Shell>
  )
}

export default MarketPulsePanel
