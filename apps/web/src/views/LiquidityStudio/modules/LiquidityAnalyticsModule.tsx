/**
 * LIQUIDITY_MODULE_007_ANALYTICS — compact factual liquidity behavior.
 * Read-only. Not a trading dashboard. No fake metrics.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import type { LiquidityAnalyticsCardModel } from './buildLiquidityAnalytics'
import { LIQUIDITY_ANALYTICS_COPY, liquidityAnalytics } from './liquidityAnalyticsTokens'
import { useLiquidityAnalytics } from './useLiquidityAnalytics'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.85; }
  100% { opacity: 0.45; }
`

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityAnalytics.contentMax};
  min-height: ${liquidityAnalytics.moduleH};
  margin: ${liquidityAnalytics.gapAfterPositions} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityAnalytics.tabletBreak}) {
    padding: 0 16px;
    min-height: 0;
  }
`

const Header = styled.div`
  margin-bottom: 12px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${liquidityAnalytics.text};
`

const Description = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 18px;
  color: ${liquidityAnalytics.muted};
`

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: ${liquidityAnalytics.columnGap};
  row-gap: ${liquidityAnalytics.columnGap};
  min-width: 0;

  @media (max-width: ${liquidityAnalytics.tabletBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${liquidityAnalytics.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.article`
  width: 100%;
  max-width: ${liquidityAnalytics.cardW};
  min-height: ${liquidityAnalytics.cardH};
  margin: 0 auto;
  box-sizing: border-box;
  border-radius: ${liquidityAnalytics.cardRadius};
  border: ${liquidityAnalytics.cardBorder};
  background: ${liquidityAnalytics.cardBg};
  padding: ${liquidityAnalytics.cardPad};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Label = styled.div`
  font-size: 11px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liquidityAnalytics.dim};
`

const Value = styled.div`
  font-size: 28px;
  line-height: 34px;
  font-weight: 800;
  color: ${liquidityAnalytics.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Support = styled.div`
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
`

const Meta = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  line-height: 14px;
  color: ${liquidityAnalytics.dim};
`

const Skeleton = styled.div`
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
`

function AnalyticsCard({ card }: { card: LiquidityAnalyticsCardModel }) {
  return (
    <Card
      data-testid={`liquidity-analytics-card-${card.id}`}
      data-analytics-state={card.state}
      data-analytics-status={card.status}
    >
      <Label>{card.label}</Label>
      {card.state === 'loading' ? (
        <Skeleton data-testid={`liquidity-analytics-skeleton-${card.id}`} aria-hidden />
      ) : (
        <Value title={card.value}>{card.value}</Value>
      )}
      <Support>{card.supporting}</Support>
      <Meta>
        <span data-testid={`liquidity-analytics-source-${card.id}`}>Source: {card.source}</span>
        <span data-testid={`liquidity-analytics-timestamp-${card.id}`}>
          {card.timestamp ? `Updated: ${card.timestamp}` : 'Timestamp: —'}
        </span>
        <span data-testid={`liquidity-analytics-status-${card.id}`}>Status: {card.status}</span>
      </Meta>
    </Card>
  )
}

export const LiquidityAnalyticsModule: React.FC = () => {
  const analytics = useLiquidityAnalytics()

  return (
    <Shell
      data-testid="liquidity-analytics-module"
      data-liquidity-module="007-analytics"
      data-liquidity-module-007="mounted"
      data-analytics-phase={analytics.phase}
      data-liquidity-analytics-geometry="1376x240"
      aria-labelledby="liquidity-analytics-title"
    >
      <Header>
        <Title id="liquidity-analytics-title">{LIQUIDITY_ANALYTICS_COPY.title}</Title>
        <Description>{LIQUIDITY_ANALYTICS_COPY.description}</Description>
      </Header>
      <Grid data-testid="liquidity-analytics-grid">
        {analytics.cards.map((card) => (
          <AnalyticsCard key={card.id} card={card} />
        ))}
      </Grid>
    </Shell>
  )
}

export default LiquidityAnalyticsModule
