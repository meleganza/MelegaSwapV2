/**
 * LIQUIDITY IA — unified Liquidity Insights (Market Snapshot + Analytics).
 * Presentation merge only. Reuses existing read-only builders/hooks.
 */
import React from 'react'
import styled from 'styled-components'
import { LiquidityMarketSnapshotModule } from './LiquidityMarketSnapshotModule'
import { LiquidityAnalyticsModule } from './LiquidityAnalyticsModule'
import { liquidityMarketSnapshot } from './liquidityMarketSnapshotTokens'

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

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;

  /* Suppress nested module titles — one Insights heading only. */
  [data-liquidity-module='005-market-snapshot'] > div:first-child,
  [data-liquidity-module='007-analytics'] > div:first-child {
    display: none;
  }

  [data-liquidity-module='005-market-snapshot'],
  [data-liquidity-module='007-analytics'] {
    margin-top: 0 !important;
    min-height: 0 !important;
    max-width: none;
    padding: 0 !important;
  }
`

export const LiquidityInsightsModule: React.FC = () => (
  <Shell
    data-testid="liquidity-insights-module"
    data-liquidity-module="insights"
    data-liquidity-insights="merged"
    aria-labelledby="liquidity-insights-title"
  >
    <Header>
      <Title id="liquidity-insights-title">Liquidity Insights</Title>
      <Description>Factual TVL, activity, distribution, and liquidity behavior — one analytics surface.</Description>
    </Header>
    <Stack>
      <LiquidityMarketSnapshotModule />
      <LiquidityAnalyticsModule />
    </Stack>
  </Shell>
)

export default LiquidityInsightsModule
