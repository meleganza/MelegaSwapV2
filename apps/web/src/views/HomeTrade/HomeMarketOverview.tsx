import React, { useMemo } from 'react'
import styled from 'styled-components'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import TradePairStats from 'views/Trade/components/TradePairStats'
import useTradeTerminalData from 'views/Trade/useTradeTerminalData'
import type { TradePairStat } from 'views/Trade/useTradeTerminalData'
import { homeTypography } from './homeTradeTokens'

const Shell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${homeTypography.sectionTitle.size};
  font-weight: ${homeTypography.sectionTitle.weight};
  line-height: ${homeTypography.sectionTitle.lineHeight};
  color: ${premiumStudioColors.text};
`

/** R760 — protocol market overview aligned with Trade pair stats. */
export const HomeMarketOverview: React.FC = () => {
  const { pairStats, isIndexingMetrics } = useTradeTerminalData('BNB', 'MARCO', MARCO_BSC_ADDRESS)

  const overviewStats = useMemo((): TradePairStat[] => {
    const order = ['marketCap', 'volume', 'liquidity', 'transactions', 'holders'] as const
    const labels: Record<(typeof order)[number], string> = {
      marketCap: 'Market Cap',
      volume: 'Volume',
      liquidity: 'Liquidity',
      transactions: 'Trades',
      holders: 'Holders',
    }
    const byId = Object.fromEntries(pairStats.map((stat) => [stat.id, stat]))

    return order.map((id) => {
      const stat = byId[id]
      return {
        id,
        label: labels[id],
        value: stat?.value,
        change: stat?.change,
        changePositive: stat?.changePositive,
        reasonCode: isIndexingMetrics ? 'SUBGRAPH_LOADING' : stat?.reasonCode,
      }
    })
  }, [pairStats, isIndexingMetrics])

  return (
    <Shell data-home-market-overview>
      <Title>Market overview</Title>
      <TradePairStats stats={overviewStats} />
    </Shell>
  )
}

export default HomeMarketOverview
