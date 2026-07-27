/**
 * LIQUIDITY_MODULE_005_MARKET_SNAPSHOT — compact factual ecosystem visibility.
 * Read-only. No trading dashboard. No fake metrics.
 */
import React from 'react'
import styled, { keyframes } from 'styled-components'
import type { LiquiditySnapshotCardModel } from './buildLiquidityMarketSnapshot'
import { LIQUIDITY_MARKET_SNAPSHOT_COPY, liquidityMarketSnapshot } from './liquidityMarketSnapshotTokens'
import { useLiquidityMarketSnapshot } from './useLiquidityMarketSnapshot'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.85; }
  100% { opacity: 0.45; }
`

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityMarketSnapshot.contentMax};
  min-height: ${liquidityMarketSnapshot.moduleH};
  margin: ${liquidityMarketSnapshot.gapAfterAdd} auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityMarketSnapshot.tabletBreak}) {
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
  color: ${liquidityMarketSnapshot.text};
`

const Description = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 18px;
  color: ${liquidityMarketSnapshot.muted};
`

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: ${liquidityMarketSnapshot.columnGap};
  row-gap: ${liquidityMarketSnapshot.columnGap};
  min-width: 0;

  @media (max-width: ${liquidityMarketSnapshot.tabletBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${liquidityMarketSnapshot.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.article`
  width: 100%;
  max-width: ${liquidityMarketSnapshot.cardW};
  min-height: ${liquidityMarketSnapshot.cardH};
  margin: 0 auto;
  box-sizing: border-box;
  border-radius: ${liquidityMarketSnapshot.cardRadius};
  border: ${liquidityMarketSnapshot.cardBorder};
  background: ${liquidityMarketSnapshot.cardBg};
  padding: ${liquidityMarketSnapshot.cardPad};
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
  color: ${liquidityMarketSnapshot.dim};
`

const Value = styled.div`
  font-size: 28px;
  line-height: 34px;
  font-weight: 800;
  color: ${liquidityMarketSnapshot.text};
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
  color: ${liquidityMarketSnapshot.dim};
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

function SnapshotCard({ card }: { card: LiquiditySnapshotCardModel }) {
  return (
    <Card
      data-testid={`liquidity-snapshot-card-${card.id}`}
      data-snapshot-state={card.state}
      data-snapshot-status={card.status}
    >
      <Label>{card.label}</Label>
      {card.state === 'loading' ? (
        <Skeleton data-testid={`liquidity-snapshot-skeleton-${card.id}`} aria-hidden />
      ) : (
        <Value title={card.value}>{card.value}</Value>
      )}
      <Support>{card.supporting}</Support>
      <Meta>
        <span data-testid={`liquidity-snapshot-source-${card.id}`}>Source: {card.source}</span>
        <span data-testid={`liquidity-snapshot-timestamp-${card.id}`}>
          {card.timestamp ? `Updated: ${card.timestamp}` : 'Timestamp: —'}
        </span>
        <span data-testid={`liquidity-snapshot-status-${card.id}`}>Status: {card.status}</span>
      </Meta>
    </Card>
  )
}

export const LiquidityMarketSnapshotModule: React.FC = () => {
  const snapshot = useLiquidityMarketSnapshot()

  return (
    <Shell
      data-testid="liquidity-market-snapshot-module"
      data-liquidity-module="005-market-snapshot"
      data-liquidity-module-005="mounted"
      data-snapshot-phase={snapshot.phase}
      data-liquidity-snapshot-geometry="1376x220"
      aria-labelledby="liquidity-market-snapshot-title"
    >
      <Header>
        <Title id="liquidity-market-snapshot-title">{LIQUIDITY_MARKET_SNAPSHOT_COPY.title}</Title>
        <Description>{LIQUIDITY_MARKET_SNAPSHOT_COPY.description}</Description>
      </Header>
      <Grid data-testid="liquidity-market-snapshot-grid">
        {snapshot.cards.map((card) => (
          <SnapshotCard key={card.id} card={card} />
        ))}
      </Grid>
    </Shell>
  )
}

export default LiquidityMarketSnapshotModule
