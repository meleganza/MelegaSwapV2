import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type {
  PassportPortfolioOverviewViewModel,
  PortfolioPerformanceHorizon,
} from './passportPortfolioOverviewTypes'
import { PORTFOLIO_UNAVAILABLE } from './passportPortfolioOverviewTypes'

const Region = styled.div`
  width: ${passportOne.portfolioLeftW};
  height: 144px;
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 4px 0 0;

  @media (max-width: 1199px) {
    width: 100%;
    height: auto;
    padding: 0;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: ${passportOne.text};
`

const Label = styled.div`
  margin-top: 10px;
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const Total = styled.div`
  margin-top: 6px;
  font-size: 36px;
  line-height: 42px;
  font-weight: 760;
  letter-spacing: -0.02em;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 767px) {
    font-size: 32px;
    line-height: 38px;
  }
`

const PerfRow = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: baseline;
`

const PerfItem = styled.div`
  min-width: 0;
`

const PerfLabel = styled.span`
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  color: ${passportOne.muted};
  margin-right: 6px;
`

const PerfValue = styled.span`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.secondary};
`

const Disclosure = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 15px;
  color: ${passportOne.muted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

function formatHorizon(h: PortfolioPerformanceHorizon): string {
  return h.value ?? PORTFOLIO_UNAVAILABLE
}

export const PassportPortfolioSummary: React.FC<{
  model: PassportPortfolioOverviewViewModel
}> = ({ model }) => (
  <Region data-testid="passport-portfolio-summary">
    <Title>Portfolio Overview</Title>
    <Label>Total Portfolio Value</Label>
    <Total
      data-testid="passport-portfolio-total"
      data-total-availability={model.totalAvailability}
    >
      {model.totalValueDisplay}
    </Total>
    <PerfRow data-testid="passport-portfolio-performance" aria-label="Performance horizons">
      {model.performance.map((h) => (
        <PerfItem key={h.label} data-testid={`passport-portfolio-perf-${h.label}`}>
          <PerfLabel>{h.label}</PerfLabel>
          <PerfValue data-availability={h.availability}>{formatHorizon(h)}</PerfValue>
        </PerfItem>
      ))}
    </PerfRow>
    {model.totalDisclosure ? (
      <Disclosure data-testid="passport-portfolio-disclosure">{model.totalDisclosure}</Disclosure>
    ) : null}
  </Region>
)

export default PassportPortfolioSummary
