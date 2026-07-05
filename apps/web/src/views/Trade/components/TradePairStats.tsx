import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import { PREMIUM_EMPTY } from 'design-system/melega/tokens/premiumStudio'
import type { DataReasonCode } from 'lib/data-policy/dataReasonCodes'
import { DATA_REASON_LABELS } from 'lib/data-policy/dataReasonCodes'
import type { TradePairStat } from '../useTradeTerminalData'

const reasonSubline = (code?: DataReasonCode): string | undefined => {
  if (!code) return undefined
  return DATA_REASON_LABELS[code]
}

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
  background: #141414;
  border: 1px solid #2A2A2A;
  border-radius: 20px;
  padding: 24px;
  min-height: 120px;
  box-sizing: border-box;
  animation: ${fadeIn} 180ms ease;
  transition: border-color 180ms ease;

  &:hover {
    border-color: #D4AF37;
  }
`

const Label = styled.div`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8F8F8F;
`

const Value = styled.div<{ $muted?: boolean }>`
  margin-top: 8px;
  font-size: ${({ $muted }) => ($muted ? '14px' : '36px')};
  font-weight: ${({ $muted }) => ($muted ? 600 : 700)};
  color: ${({ $muted }) => ($muted ? '#8F8F8F' : colors.textPrimary)};
  line-height: 1.15;
  white-space: nowrap;
`

const Subline = styled.div`
  margin-top: 4px;
  font-size: 13px;
  color: #8F8F8F;
  line-height: 1.35;
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
    {stats.map((stat) => {
      const muted = !stat.value || stat.value === PREMIUM_EMPTY || stat.value === 'Unavailable'
      const subline = muted ? reasonSubline(stat.reasonCode) ?? 'Not indexed yet' : undefined
      return (
        <Card key={stat.id}>
          <Label>{stat.label}</Label>
          <Value $muted={muted}>{muted ? PREMIUM_EMPTY : stat.value}</Value>
          {subline ? <Subline>{subline}</Subline> : null}
          {stat.change && !muted ? (
            <Change $positive={stat.changePositive}>{stat.change}</Change>
          ) : null}
        </Card>
      )
    })}
  </Grid>
)

export default TradePairStats
