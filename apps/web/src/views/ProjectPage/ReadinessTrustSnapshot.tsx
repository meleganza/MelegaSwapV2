import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
`

const ScoreLine = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const Details = styled.details`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 0;

  &[open] > summary {
    margin-bottom: 8px;
  }
`

const Summary = styled.summary`
  cursor: pointer;
  font-size: 14px;
  min-height: 44px;
  display: flex;
  align-items: center;
  list-style-position: outside;
  word-break: break-word;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
`

const Progress = styled.div`
  width: 100%;
  max-width: 280px;
  height: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
  background: ${({ theme }) => theme.colors.textSubtle};
`

interface Props {
  readiness: ProjectReadinessDocument
}

const ReadinessTrustSnapshot: React.FC<Props> = ({ readiness }) => {
  const { readiness: overview, components, trustDimensions, warnings, methodology, limitations } = readiness
  const pct = overview.maxScore > 0 ? (overview.score / overview.maxScore) * 100 : 0

  return (
    <Stack data-testid="readiness-trust-snapshot" data-pp003="true">
      <div>
        <Heading as="h2" id="readiness-overview-heading" scale="md">
          Readiness overview
        </Heading>
        <ScoreLine
          as="p"
          aria-label={`Readiness score ${overview.score} out of ${overview.maxScore}, state ${overview.stateLabel}`}
          data-testid="readiness-score-line"
        >
          {overview.score} / {overview.maxScore} — {overview.stateLabel} readiness
        </ScoreLine>
        <Progress
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={overview.maxScore}
          aria-valuenow={overview.score}
          aria-label="Civilization readiness score"
          data-testid="readiness-progress"
        >
          <ProgressFill $pct={pct} />
        </Progress>
        <Fact style={{ marginTop: 8 }}>{overview.explanation}</Fact>
        <Fact>
          Last calculated: <time dateTime={overview.lastCalculatedAt}>{overview.lastCalculatedAt}</time>
        </Fact>
        <Fact>
          Calculation revision: {overview.calculationRevision} ·{' '}
          <a href="#methodology">Calculation details</a>
        </Fact>
      </div>

      <div>
        <Heading as="h3" id="component-breakdown-heading" scale="md">
          Component breakdown
        </Heading>
        <List aria-label="Readiness components">
          {components.map((component) => (
            <Item key={component.componentId}>
              <Details data-testid={`readiness-component-${component.componentId}`}>
                <Summary>
                  {component.label}: {component.achievedPoints.toFixed(1)} / {component.maxPoints} (
                  {component.status.replace(/_/g, ' ')})
                </Summary>
                <Fact>
                  <span aria-label={`Achieved ${component.achievedPoints} of ${component.maxPoints} points`}>
                    {component.achievedPoints.toFixed(2)} achieved of {component.maxPoints} maximum
                  </span>
                </Fact>
                <List>
                  {component.checks.map((check) => (
                    <Item key={check.checkId}>
                      {check.description}: {check.result.replace(/_/g, ' ')}
                      {check.evidenceIds.length ? ` · evidence ${check.evidenceIds.length}` : ''}
                    </Item>
                  ))}
                </List>
              </Details>
            </Item>
          ))}
        </List>
      </div>

      <div>
        <Heading as="h3" id="trust-snapshot-heading" scale="md">
          Trust snapshot
        </Heading>
        <Fact>
          Evidence coverage ratio:{' '}
          {readiness.trustSnapshot.evidenceCoverageRatio == null
            ? 'unavailable'
            : readiness.trustSnapshot.evidenceCoverageRatio}
          . {readiness.trustSnapshot.evidenceCoverageNote}
        </Fact>
        <List aria-label="Trust dimensions">
          {trustDimensions.map((dim) => (
            <Item key={dim.dimensionId} data-testid={`trust-dimension-${dim.dimensionId}`}>
              {dim.dimensionId.replace(/_/g, ' ')}: {dim.status.replace(/_/g, ' ')}
              {dim.availability === 'NOT_APPLICABLE' ? ' (not applicable)' : ''}
              {dim.staleEvidenceCount > 0 ? ` · stale ${dim.staleEvidenceCount}` : ''}
              {dim.conflictCount > 0 ? ` · conflicts ${dim.conflictCount}` : ''}
            </Item>
          ))}
        </List>
      </div>

      <div>
        <Heading as="h3" id="warnings-gaps-heading" scale="md">
          Warnings and gaps
        </Heading>
        {warnings.length === 0 ? (
          <Fact>No material warnings from registered public evidence.</Fact>
        ) : (
          <List aria-label="Material warnings">
            {warnings.map((warning) => (
              <Item key={warning.warningId} data-testid={`readiness-warning-${warning.category}`}>
                <strong>{warning.severity}</strong> — {warning.publicExplanation}
                {warning.evidenceIds.length ? (
                  <Fact>Evidence: {warning.evidenceIds.join(', ')}</Fact>
                ) : null}
              </Item>
            ))}
          </List>
        )}
      </div>

      <div id="methodology">
        <Heading as="h3" id="methodology-heading" scale="md">
          Methodology and limitations
        </Heading>
        <Fact>Score maximum: {methodology.scoreMaximum}</Fact>
        <Fact>Calculation revision: {methodology.calculationRevision}</Fact>
        <List aria-label="Component weights">
          {methodology.components.map((c) => (
            <Item key={c.componentId}>
              {c.label}: {c.maxPoints} points ({Math.round(c.weightFraction * 100)}%)
            </Item>
          ))}
        </List>
        <Fact>{methodology.checkEvaluation}</Fact>
        <Fact>{methodology.missingDataTreatment}</Fact>
        <Fact>{methodology.notApplicableTreatment}</Fact>
        <Fact>{methodology.staleEvidenceTreatment}</Fact>
        <Fact>{methodology.conflictTreatment}</Fact>
        <Fact>{methodology.privateEvidenceTreatment}</Fact>
        <Fact>{methodology.sourceDistinctions}</Fact>
        <List aria-label="Limitations">
          {limitations.map((line) => (
            <Item key={line}>{line}</Item>
          ))}
        </List>
      </div>
    </Stack>
  )
}

export default ReadinessTrustSnapshot
