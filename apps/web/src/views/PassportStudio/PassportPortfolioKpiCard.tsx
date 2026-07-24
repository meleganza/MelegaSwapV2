import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PortfolioKpiCardModel } from './passportPortfolioOverviewTypes'

const Card = styled.article`
  width: ${passportOne.portfolioKpiW};
  height: ${passportOne.portfolioKpiH};
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid ${passportOne.border};
  background: ${passportOne.card};
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 1199px) {
    width: 100%;
    max-width: none;
    height: 120px;
  }
`

const Title = styled.h3`
  margin: 0;
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const Value = styled.div`
  margin-top: 8px;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Status = styled.div`
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: ${passportOne.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PassportPortfolioKpiCard: React.FC<{ kpi: PortfolioKpiCardModel }> = ({ kpi }) => (
  <Card
    data-testid={`passport-portfolio-kpi-${kpi.id}`}
    data-kpi-availability={kpi.availability}
    aria-label={`${kpi.title}: ${kpi.value}. ${kpi.status}`}
  >
    <div>
      <Title>{kpi.title}</Title>
      <Value data-testid={`passport-portfolio-kpi-${kpi.id}-value`}>{kpi.value}</Value>
    </div>
    <Status data-testid={`passport-portfolio-kpi-${kpi.id}-status`}>{kpi.status}</Status>
  </Card>
)

export default PassportPortfolioKpiCard
