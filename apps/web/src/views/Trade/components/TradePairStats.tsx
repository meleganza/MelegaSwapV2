import React from 'react'
import styled, { css, keyframes } from 'styled-components'
import { RUNTIME_LOADING_LABEL, RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import { tradeUiReasonLabel } from 'lib/data-policy/uiReasonLabels'
import { tradeColors, tradeLayout, tradeTypography } from '../tradeTokens'
import type { TradePairStat } from '../useTradeTerminalData'

const shimmer = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.65; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: 100%;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Card = styled.div`
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${tradeLayout.cardRadius};
  padding: 14px 16px;
  min-height: ${tradeLayout.statCardMinHeight};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: border-color 180ms ease;
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};

  &:hover {
    border-color: ${tradeColors.cardBorderHover};
  }
`

const Label = styled.div`
  font-size: ${tradeTypography.statLabel.size};
  font-weight: ${tradeTypography.statLabel.weight};
  line-height: ${tradeTypography.statLabel.lineHeight};
  color: ${tradeColors.muted};
`

const ValueSlot = styled.div`
  margin-top: 8px;
  min-height: ${tradeLayout.statValueMinHeight};
  display: flex;
  align-items: center;
`

const Value = styled.div<{ $muted?: boolean; $loading?: boolean }>`
  font-size: ${tradeTypography.statValue.size};
  font-weight: ${tradeTypography.statValue.weight};
  line-height: ${tradeTypography.statValue.lineHeight};
  color: ${({ $muted, $loading }) =>
    $loading ? tradeColors.gold : $muted ? tradeColors.muted : tradeColors.text};
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};
  ${({ $loading }) =>
    $loading &&
    css`
      animation: ${shimmer} 1.8s ease-in-out infinite;
    `}
`

const Subline = styled.div`
  margin-top: 6px;
  font-size: ${tradeTypography.statSubline.size};
  font-weight: ${tradeTypography.statSubline.weight};
  line-height: ${tradeTypography.statSubline.lineHeight};
  color: ${tradeColors.muted};
`

const Change = styled.div<{ $positive?: boolean }>`
  margin-top: 4px;
  font-size: ${tradeTypography.statSubline.size};
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? tradeColors.green : tradeColors.red)};
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};
`

const reasonSubline = (stat: TradePairStat): string | undefined => {
  if (stat.reasonCode === 'SUBGRAPH_LOADING') {
    return stat.id === 'holders'
      ? 'BscScan holder count request in progress'
      : 'Subgraph request in progress'
  }
  return tradeUiReasonLabel(stat.reasonCode)
}

const isLoadingStat = (stat: TradePairStat): boolean =>
  stat.reasonCode === 'SUBGRAPH_LOADING' ||
  stat.value === RUNTIME_LOADING_LABEL ||
  (stat.id === 'holders' && stat.value === RUNTIME_LOADING_LABEL)

const isUnavailableStat = (stat: TradePairStat): boolean => {
  if (isLoadingStat(stat)) return false
  return (
    !stat.value ||
    stat.value === RUNTIME_UNAVAILABLE_LABEL ||
    stat.value === 'Unavailable' ||
    stat.value.startsWith('Unavailable')
  )
}

export interface TradePairStatsProps {
  stats: TradePairStat[]
}

export const TradePairStats: React.FC<TradePairStatsProps> = ({ stats }) => (
  <Grid data-trade-pair-stats>
    {stats.map((stat) => {
      const loading = isLoadingStat(stat)
      const unavailable = isUnavailableStat(stat)
      const muted = loading || unavailable
      const subline = muted ? reasonSubline(stat) : undefined
      const displayValue = loading
        ? RUNTIME_LOADING_LABEL
        : unavailable
          ? RUNTIME_UNAVAILABLE_LABEL
          : stat.value

      return (
        <Card key={stat.id}>
          <Label>{stat.label}</Label>
          <ValueSlot>
            <Value $muted={unavailable} $loading={loading}>
              {displayValue}
            </Value>
          </ValueSlot>
          {subline ? <Subline>{subline}</Subline> : null}
          {stat.change && !muted && Math.abs(parseFloat(stat.change.replace(/[^0-9.-]/g, '') || '0')) > 0.0001 ? (
            <Change $positive={stat.changePositive}>{stat.change}</Change>
          ) : null}
        </Card>
      )
    })}
  </Grid>
)

export default TradePairStats
