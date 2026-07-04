import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import type { TradePairStat } from '../useTradeTerminalData'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Card = styled.div`
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 12px 14px;
  min-height: 72px;
  box-sizing: border-box;
  animation: ${fadeIn} 180ms ease;
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8a8a8a;
`

const Value = styled.div`
  margin-top: 6px;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textPrimary};
  line-height: 1.25;
  word-break: break-word;
`

const Change = styled.div<{ $positive?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? colors.green : '#ef4444')};
`

export interface TradePairStatsProps {
  stats: TradePairStat[]
}

export const TradePairStats: React.FC<TradePairStatsProps> = ({ stats }) => (
  <Grid data-trade-pair-stats>
    {stats.map((stat) => (
      <Card key={stat.id}>
        <Label>{stat.label}</Label>
        <Value>{stat.value ?? '—'}</Value>
        {stat.change && <Change $positive={stat.changePositive}>{stat.change}</Change>}
      </Card>
    ))}
  </Grid>
)

export default TradePairStats
