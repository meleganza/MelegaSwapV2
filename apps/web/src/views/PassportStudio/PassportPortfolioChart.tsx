import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PortfolioMetricAvailability } from './passportPortfolioOverviewTypes'

const Frame = styled.div`
  width: ${passportOne.portfolioChartW};
  height: 144px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid ${passportOne.border};
  background: ${passportOne.elevated};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  min-width: 0;

  @media (max-width: 1199px) {
    width: 100%;
    height: 140px;
  }
`

const Title = styled.div`
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const Placeholder = styled.div`
  width: 100%;
  height: 72px;
  border-radius: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(221, 185, 47, 0.04) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
  box-sizing: border-box;
`

const PlaceholderText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: ${passportOne.secondary};
  max-width: 240px;
`

export const PassportPortfolioChart: React.FC<{
  availability: PortfolioMetricAvailability
  label: string
}> = ({ availability, label }) => (
  <Frame
    data-testid="passport-portfolio-chart"
    data-chart-availability={availability}
    aria-label="Portfolio performance chart"
  >
    <Title>Performance</Title>
    <Placeholder data-testid="passport-portfolio-chart-placeholder">
      <PlaceholderText>{label}</PlaceholderText>
    </Placeholder>
  </Frame>
)

export default PassportPortfolioChart
