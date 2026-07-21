import React from 'react'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import { humanChainName, humanEnumLabel } from '../presentation/humanLabels'
import {
  Card,
  MetricCell,
  MetricGrid,
  MetricLabel,
  MetricValue,
  MutedText,
  Section,
  SectionTitle,
  SubTitle,
} from './theme'

interface Props {
  tokenomicsDocument: ProjectTokenomicsDocument | null
}

const ProjectTokenomicsSection: React.FC<Props> = ({ tokenomicsDocument }) => {
  if (!tokenomicsDocument) {
    return (
      <Section id="tokenomics" aria-labelledby="tokenomics-heading">
        <SectionTitle id="tokenomics-heading">Tokenomics</SectionTitle>
        <MutedText>Tokenomics data is unavailable for this project.</MutedText>
      </Section>
    )
  }

  const publishedFacts = tokenomicsDocument.facts.filter((f) => f.value)
  const allocations = tokenomicsDocument.allocationCategories

  return (
    <Section id="tokenomics" aria-labelledby="tokenomics-heading">
      <SectionTitle id="tokenomics-heading">Tokenomics</SectionTitle>

      {!tokenomicsDocument.published && tokenomicsDocument.unpublishedReason ? (
        <MutedText>{tokenomicsDocument.unpublishedReason}</MutedText>
      ) : null}

      {publishedFacts.length > 0 ? (
        <Card>
          <MetricGrid>
            {publishedFacts.map((fact) => (
              <MetricCell key={fact.id}>
                <MetricLabel>{fact.label}</MetricLabel>
                <MetricValue>
                  {fact.id === 'chains' && fact.value
                    ? fact.value
                        .split(',')
                        .map((id) => humanChainName(Number(id.trim())))
                        .join(', ')
                    : fact.value}
                </MetricValue>
                {fact.note ? <MutedText style={{ fontSize: 13 }}>{fact.note}</MutedText> : null}
                <MutedText style={{ fontSize: 12 }}>{humanEnumLabel(fact.provenance)}</MutedText>
              </MetricCell>
            ))}
          </MetricGrid>
        </Card>
      ) : (
        <MutedText>No tokenomics facts are published in the certified registry.</MutedText>
      )}

      {allocations.length > 0 ? (
        <>
          <SubTitle>Allocation</SubTitle>
          <Card>
            {allocations.map((row) => (
              <MetricCell key={row.id}>
                <MetricLabel>{row.label}</MetricLabel>
                <MetricValue>{row.percent != null ? `${row.percent}%` : 'Unavailable'}</MetricValue>
              </MetricCell>
            ))}
          </Card>
        </>
      ) : null}
    </Section>
  )
}

export default ProjectTokenomicsSection
