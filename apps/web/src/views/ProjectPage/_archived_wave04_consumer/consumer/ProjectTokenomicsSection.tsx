import React from 'react'
import styled from 'styled-components'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import { humanChainName, shortenAddress } from '../presentation/humanLabels'
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateTitle,
  MetricLabel,
  MetricValue,
  MutedText,
  Section,
  SectionTitle,
  SoftCard,
} from './theme'
import { humanProvenanceLabel } from './helpers'

const FactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`

const FactCard = styled(SoftCard)`
  gap: 6px;
  padding: 14px;
  min-height: 88px;
`

interface Props {
  tokenomicsDocument: ProjectTokenomicsDocument | null
}

const FACT_ORDER = ['symbol', 'decimals', 'contract', 'chains', 'totalSupply', 'circulatingSupply'] as const

const FACT_LABELS: Record<string, string> = {
  symbol: 'Symbol',
  decimals: 'Decimals',
  contract: 'Contract',
  chains: 'Chains',
  totalSupply: 'Total supply',
  circulatingSupply: 'Circulating',
}

function formatFactValue(id: string, value: string | null): string {
  if (!value) return '—'
  if (id === 'chains') {
    return value
      .split(',')
      .map((chainId) => humanChainName(Number(chainId.trim())))
      .join(', ')
  }
  if (id === 'contract') return shortenAddress(value)
  return value
}

const ProjectTokenomicsSection: React.FC<Props> = ({ tokenomicsDocument }) => {
  if (!tokenomicsDocument) {
    return (
      <Section id="tokenomics" aria-labelledby="tokenomics-heading">
        <SectionTitle id="tokenomics-heading">Tokenomics</SectionTitle>
        <EmptyState>
          <EmptyStateTitle>Publishing soon</EmptyStateTitle>
          <EmptyStateBody>Token details for this project are being prepared.</EmptyStateBody>
        </EmptyState>
      </Section>
    )
  }

  const factMap = new Map(tokenomicsDocument.facts.map((f) => [f.id, f]))
  const allocations = tokenomicsDocument.allocationCategories
  const isUnpublished = !tokenomicsDocument.published

  return (
    <Section id="tokenomics" aria-labelledby="tokenomics-heading">
      <SectionTitle id="tokenomics-heading">Tokenomics</SectionTitle>

      {isUnpublished ? (
        <EmptyState>
          <EmptyStateTitle>Publishing soon</EmptyStateTitle>
          <EmptyStateBody>
            Full tokenomics will be shared here. Registry facts below are available today.
          </EmptyStateBody>
        </EmptyState>
      ) : null}

      <FactGrid>
        {FACT_ORDER.map((factId) => {
          const fact = factMap.get(factId)
          const label = FACT_LABELS[factId] ?? fact?.label ?? factId
          const value = fact?.value ? formatFactValue(factId, fact.value) : '—'

          return (
            <FactCard key={factId}>
              <MetricLabel>{label}</MetricLabel>
              <MetricValue>{value}</MetricValue>
              {fact?.provenance ? (
                <MutedText style={{ fontSize: 12 }}>{humanProvenanceLabel(fact.provenance)}</MutedText>
              ) : null}
            </FactCard>
          )
        })}
      </FactGrid>

      {allocations.length > 0 ? (
        <FactGrid>
          {allocations.map((row) => (
            <FactCard key={row.id}>
              <MetricLabel>{row.label}</MetricLabel>
              <MetricValue>{row.percent != null ? `${row.percent}%` : '—'}</MetricValue>
            </FactCard>
          ))}
        </FactGrid>
      ) : null}
    </Section>
  )
}

export default ProjectTokenomicsSection
