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
  padding: 20px 22px;
  box-sizing: border-box;
  max-height: 210px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  margin-bottom: 8px;
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
  gap: 6px 16px;
`

const Cell = styled.div`
  min-width: 0;
  min-height: 64px;
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
    $tone === 'green' ? colors.green : $tone === 'gold' ? colors.gold : 'rgba(255,255,255,0.25)'};
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
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  color: #8a8a8a;
  line-height: 1.35;
`

const NetworkGold = styled.span`
  color: ${colors.gold};
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
        <NetworkGold>BNB Chain</NetworkGold>
        {' · '}
        Polygon · Ethereum · Base
      </Networks>
    </Shell>
  )
}

export default MarketPulsePanel
