import React from 'react'
import styled from 'styled-components'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
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

/** R760 — protocol market overview (homepage-safe; avoids Trade terminal hook on overview). */
export const HomeMarketOverview: React.FC = () => (
  <Shell data-home-market-overview>
    <Title>Market overview</Title>
  </Shell>
)

export default HomeMarketOverview
