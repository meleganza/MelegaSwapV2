import React from 'react'
import styled from 'styled-components'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { homeTypography } from './homeTradeTokens'
import QuickMarketStrip from './QuickMarketStrip'
import type { MarketCard } from './useHomeTradeData'

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

export interface HomeMarketOverviewProps {
  cards: MarketCard[]
}

/** R785 — market overview with up to three canonical cards; section hidden when empty. */
export const HomeMarketOverview: React.FC<HomeMarketOverviewProps> = ({ cards }) => {
  if (cards.length === 0) return null

  return (
    <Shell data-home-market-overview>
      <Title>Market overview</Title>
      <QuickMarketStrip cards={cards} />
    </Shell>
  )
}

export default HomeMarketOverview
