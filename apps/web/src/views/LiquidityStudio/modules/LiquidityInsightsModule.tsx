/**
 * LIQUIDITY IA — Liquidity Insights (exactly 4 factual cards).
 * Presentation only. Reuses snapshot + analytics builders/hooks — does not mount both modules.
 */
import React, { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { useLiquidityAnalytics } from './useLiquidityAnalytics'
import { useLiquidityMarketSnapshot } from './useLiquidityMarketSnapshot'
import { liquidityMarketSnapshot } from './liquidityMarketSnapshotTokens'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.85; }
  100% { opacity: 0.45; }
`

const Shell = styled.section`
  width: 100%;
  max-width: ${liquidityMarketSnapshot.contentMax};
  margin: 20px auto 0;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: ${liquidityMarketSnapshot.tabletBreak}) {
    padding: 0 16px;
  }
`

const Header = styled.div`
  margin-bottom: 10px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
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

  /* Founder mobile: keep 2×2 at 390/430; only collapse below ~360. */
  @media (max-width: ${liquidityMarketSnapshot.mobileBreak}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 10px;
    row-gap: 10px;
  }

  @media (max-width: 359px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.article`
  width: 100%;
  min-height: 140px;
  margin: 0;
  box-sizing: border-box;
  border-radius: ${liquidityMarketSnapshot.cardRadius};
  border: ${liquidityMarketSnapshot.cardBorder};
  background: ${liquidityMarketSnapshot.cardBg};
  padding: ${liquidityMarketSnapshot.cardPad};
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  @media (max-width: ${liquidityMarketSnapshot.mobileBreak}) {
    min-height: 108px;
    padding: 12px;
    gap: 6px;
  }
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

  @media (max-width: ${liquidityMarketSnapshot.mobileBreak}) {
    font-size: 20px;
    line-height: 24px;
  }
`

const Support = styled.div`
  margin-top: auto;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);

  @media (max-width: ${liquidityMarketSnapshot.mobileBreak}) {
    font-size: 11px;
    line-height: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
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

type InsightCard = {
  id: string
  label: string
  value: string
  supporting: string
  state: 'loading' | 'available' | 'unavailable'
  title?: string
}

function InsightCardView({ card }: { card: InsightCard }) {
  return (
    <Card
      data-testid={`liquidity-insights-card-${card.id}`}
      data-insight-state={card.state}
      title={card.title}
    >
      <Label>{card.label}</Label>
      {card.state === 'loading' ? (
        <Skeleton data-testid={`liquidity-insights-skeleton-${card.id}`} aria-hidden />
      ) : (
        <Value title={card.value}>{card.value}</Value>
      )}
      <Support>{card.supporting}</Support>
    </Card>
  )
}

export const LiquidityInsightsModule: React.FC = () => {
  const snapshot = useLiquidityMarketSnapshot()
  const analytics = useLiquidityAnalytics()

  const cards = useMemo((): InsightCard[] => {
    const byId = Object.fromEntries(snapshot.cards.map((c) => [c.id, c]))
    const activity = analytics.cards.find((c) => c.id === 'activity')
    const tvl = byId.tvl
    const volume = byId.volume24h
    const active = byId.activePools

    return [
      {
        id: 'total-liquidity',
        label: 'Total Liquidity',
        value: tvl?.value ?? '—',
        supporting: tvl?.state === 'available' ? 'Verified protocol liquidity' : tvl?.supporting ?? '—',
        state: tvl?.state ?? 'unavailable',
        title: tvl ? `${tvl.source}${tvl.timestamp ? ` · ${tvl.timestamp}` : ''}` : undefined,
      },
      {
        id: 'volume-24h',
        label: '24H Volume',
        value: volume?.value ?? '—',
        supporting: volume?.state === 'available' ? 'Verified 24H swap volume' : volume?.supporting ?? '—',
        state: volume?.state ?? 'unavailable',
        title: volume ? `${volume.source}${volume.timestamp ? ` · ${volume.timestamp}` : ''}` : undefined,
      },
      {
        id: 'active-markets',
        label: 'Markets',
        value: active?.value ?? '—',
        supporting: active?.state === 'available' ? 'Active tradeable / funded pools' : active?.supporting ?? '—',
        state: active?.state ?? 'unavailable',
        title: active ? `${active.source}${active.timestamp ? ` · ${active.timestamp}` : ''}` : undefined,
      },
      {
        id: 'liquidity-activity',
        label: 'Liquidity Activity',
        value: activity?.value ?? '—',
        supporting:
          activity?.state === 'available' ? activity.supporting : activity?.supporting ?? '—',
        state: activity?.state ?? 'unavailable',
        title: activity
          ? `${activity.source}${activity.timestamp ? ` · ${activity.timestamp}` : ''}`
          : undefined,
      },
    ]
  }, [snapshot.cards, analytics.cards])

  return (
    <Shell
      data-testid="liquidity-insights-module"
      data-liquidity-module="insights"
      data-liquidity-insights="four-cards"
      aria-labelledby="liquidity-insights-title"
    >
      <Header>
        <Title id="liquidity-insights-title">Liquidity Insights</Title>
        <Description>Factual TVL, volume, markets, and liquidity activity.</Description>
      </Header>
      <Grid data-testid="liquidity-insights-grid">
        {cards.map((card) => (
          <InsightCardView key={card.id} card={card} />
        ))}
      </Grid>
    </Shell>
  )
}

export default LiquidityInsightsModule
