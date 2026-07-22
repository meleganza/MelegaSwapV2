import React from 'react'
import styled from 'styled-components'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import { isTokenProjectTemplate } from './helpers'

const Strip = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
  min-height: 168px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 17px 20px;
    min-height: 82px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`

const Cell = styled.div<{ $mobileHide?: boolean; $mobileOrder?: number }>`
  padding: 8px 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.055);
  min-width: 0;
  display: ${({ $mobileHide }) => ($mobileHide ? 'none' : 'block')};
  order: ${({ $mobileOrder }) => $mobileOrder ?? 0};

  @media (min-width: 768px) {
    display: block;
    order: 0;
  }

  @media (min-width: 1024px) {
    &:last-child {
      border-right: none;
    }
  }
`

const Label = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.42);
`

const Value = styled.div`
  margin-top: 5px;
  font-size: 15px;
  font-weight: 650;
  color: #f7f7f7;
  line-height: 1.2;

  @media (min-width: 1024px) {
    font-size: 19px;
  }

  &[data-unavailable='true'] {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.42);
  }
`

interface Metric {
  label: string
  value: string
  unavailable?: boolean
  mobilePrimary?: boolean
  mobileOrder?: number
}

interface Props {
  document: CanonicalProjectDocument
  marketsDocument: ProjectMarketsDocument
}

/**
 * UX003 metrics strip — layout matches mockup; values stay truthful.
 * Illustrative mockup numbers are never copied into production.
 */
const ProjectMetricsStrip: React.FC<Props> = ({ document, marketsDocument }) => {
  const tokenMode = isTokenProjectTemplate(document)
  const activeMarkets = marketsDocument.summary.activeMarketCount

  const tokenMetrics: Metric[] = [
    { label: 'Price', value: 'Not available', unavailable: true, mobilePrimary: true, mobileOrder: 1 },
    { label: 'Market Cap', value: 'Not available', unavailable: true, mobilePrimary: true, mobileOrder: 3 },
    { label: '24h Volume', value: 'Not available', unavailable: true, mobilePrimary: true, mobileOrder: 2 },
    { label: 'Liquidity', value: 'Not available', unavailable: true },
    { label: 'Holders', value: 'Not available', unavailable: true, mobilePrimary: true, mobileOrder: 4 },
    { label: 'Circulating Supply', value: 'Not available', unavailable: true },
  ]

  const protocolMetrics: Metric[] = [
    {
      label: 'Active markets',
      value: activeMarkets > 0 ? String(activeMarkets) : 'Not available',
      unavailable: activeMarkets <= 0,
      mobilePrimary: true,
    },
    {
      label: 'Supported chains',
      value: document.chains.length ? String(document.chains.length) : 'Not available',
      unavailable: document.chains.length === 0,
      mobilePrimary: true,
    },
    { label: 'Active farms', value: 'Not available', unavailable: true, mobilePrimary: true },
    { label: 'Active pools', value: 'Not available', unavailable: true, mobilePrimary: true },
    { label: 'Liquid pairs', value: 'Not available', unavailable: true },
    { label: 'Indexed assets', value: 'Not available', unavailable: true },
  ]

  const metrics = tokenMode ? tokenMetrics : protocolMetrics

  return (
    <Strip aria-label="Project metrics" data-testid="project-metrics-strip" data-token-mode={tokenMode}>
      {metrics.map((m) => (
        <Cell
          key={m.label}
          $mobileHide={tokenMode ? !m.mobilePrimary : false}
          $mobileOrder={m.mobileOrder}
        >
          <Label>{m.label}</Label>
          <Value data-unavailable={m.unavailable ? 'true' : undefined}>{m.value}</Value>
        </Cell>
      ))}
    </Strip>
  )
}

export default ProjectMetricsStrip
