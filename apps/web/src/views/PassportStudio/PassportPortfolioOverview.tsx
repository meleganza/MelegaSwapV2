/**
 * PASSPORT_MODULE_002 — Portfolio Overview (desktop 1376×176).
 * Does not modify Module 001. Does not implement Modules 003–009.
 */
import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportPortfolioSummary } from './PassportPortfolioSummary'
import { PassportPortfolioChart } from './PassportPortfolioChart'
import { PassportPortfolioKpiCard } from './PassportPortfolioKpiCard'
import {
  usePassportPortfolioOverview,
  type UsePassportPortfolioOverviewOptions,
} from './usePassportPortfolioOverview'
import type { PassportPortfolioOverviewViewModel } from './passportPortfolioOverviewTypes'

const Module = styled.section`
  position: relative;
  width: 100%;
  max-width: ${passportOne.contentMax};
  height: ${passportOne.portfolioH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: ${passportOne.portfolioModuleRadius};
  border: ${passportOne.portfolioModuleBorder};
  background: ${passportOne.portfolioModuleBg};
  box-shadow: ${passportOne.portfolioModuleShadow};
  padding: ${passportOne.portfolioModulePadY} ${passportOne.portfolioModulePadX};
  font-family: ${passportOne.font};
  color: ${passportOne.text};

  @media (max-width: 1199px) {
    height: auto;
    overflow: visible;
    padding: 16px;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    padding: 16px 0;
    border-radius: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Inner = styled.div`
  width: 100%;
  height: 144px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  /* No CSS gap: 560+320+480=1360 inside 1376; residual 16px becomes inter-column spacing. */
  gap: 0;
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    height: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`

const KpiRow = styled.div`
  width: ${passportOne.portfolioRightW};
  height: 144px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  flex-shrink: 0;
  min-width: 0;

  @media (max-width: 1199px) {
    width: 100%;
    height: auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`

export type PassportPortfolioOverviewProps = UsePassportPortfolioOverviewOptions & {
  model?: PassportPortfolioOverviewViewModel
}

export const PassportPortfolioOverview: React.FC<PassportPortfolioOverviewProps> = ({
  model: injected,
  fixture,
}) => {
  const live = usePassportPortfolioOverview({ fixture })
  const model = injected ?? live

  return (
    <Module
      id="passport-module-next"
      data-testid="passport-portfolio-overview"
      data-passport-module="002"
      data-pixel-passport-portfolio="1376x176"
      aria-label="Portfolio overview"
    >
      <Inner data-testid="passport-portfolio-inner">
        <PassportPortfolioSummary model={model} />
        <PassportPortfolioChart
          availability={model.chartAvailability}
          label={model.chartPlaceholderLabel}
        />
        <KpiRow data-testid="passport-portfolio-kpi-row">
          {model.kpis.map((kpi) => (
            <PassportPortfolioKpiCard key={kpi.id} kpi={kpi} />
          ))}
        </KpiRow>
      </Inner>
    </Module>
  )
}

export default PassportPortfolioOverview
