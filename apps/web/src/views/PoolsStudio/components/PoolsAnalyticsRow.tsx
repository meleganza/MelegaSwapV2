import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MARCO_LOGO_URI } from 'design-system/melega'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { PsPanel } from './poolsStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${poolsStudioLayout.pageGridGap};
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    overflow-x: auto;
  }
`

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const shimmer = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`

const Bars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 72px;
`

const Bar = styled.div<{ $h: number }>`
  flex: 1;
  height: ${({ $h }) => $h}%;
  min-height: 8px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, ${poolsStudioColors.goldBright}, ${poolsStudioColors.gold});
  animation: ${shimmer} 8s ease-in-out infinite;
`

const TokenBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenLogo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`

const TokenPct = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${poolsStudioColors.gold};
  line-height: 1;
`

const TokenSub = styled.div`
  font-size: 12px;
  color: ${poolsStudioColors.secondary};
  margin-top: 4px;
`

const LineChart = styled.svg`
  width: 100%;
  height: 72px;
  animation: ${shimmer} 8s ease-in-out infinite;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${poolsStudioColors.muted};
`

export const PoolsAnalyticsRow: React.FC = () => {
  const { analytics, loadingLabel } = usePoolsRuntime()
  const linePoints = analytics.topStakedPool.sparkline
  const max = Math.max(...linePoints, 1)
  const w = 200
  const h = 72
  const d = linePoints
    .map((p, i) => {
      const x = (i / Math.max(linePoints.length - 1, 1)) * w
      const y = h - (p / max) * (h - 8) - 4
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  if (loadingLabel) {
    return (
      <Row data-ps-analytics>
        <PsPanel $height={poolsStudioLayout.analyticsHeight} style={{ padding: '16px 18px', gridColumn: '1 / -1' }}>
          <LoadingLine>{loadingLabel}</LoadingLine>
        </PsPanel>
      </Row>
    )
  }

  return (
    <Row data-ps-analytics>
      <PsPanel data-ps-analytics-card $height={poolsStudioLayout.analyticsHeight} style={{ padding: '16px 18px' }}>
        <Title>Rewards Emission (live)</Title>
        <Bars>
          {analytics.rewardBars.map((barH, i) => (
            <Bar key={i} $h={barH} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </Bars>
      </PsPanel>

      <PsPanel data-ps-analytics-card $height={poolsStudioLayout.analyticsHeight} style={{ padding: '16px 18px' }}>
        <Title>Top Reward Token</Title>
        <TokenBlock>
          <TokenLogo src={MARCO_LOGO_URI} alt={analytics.topRewardToken.symbol} />
          <div>
            <TokenPct>{analytics.topRewardToken.pct}</TokenPct>
            <TokenSub>of pools · {analytics.topRewardToken.symbol}</TokenSub>
          </div>
        </TokenBlock>
      </PsPanel>

      <PsPanel data-ps-analytics-card $height={poolsStudioLayout.analyticsHeight} style={{ padding: '16px 18px' }}>
        <Title>Most Staked Pool</Title>
        <div style={{ fontSize: 15, fontWeight: 700, color: poolsStudioColors.text, marginBottom: 8 }}>
          {analytics.topStakedPool.name} · {analytics.topStakedPool.tvl}
        </div>
        <LineChart viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" data-ps-line-chart>
          <path d={d} fill="none" stroke={poolsStudioColors.green} strokeWidth="2.5" strokeLinecap="round" />
        </LineChart>
      </PsPanel>
    </Row>
  )
}

export default PoolsAnalyticsRow
