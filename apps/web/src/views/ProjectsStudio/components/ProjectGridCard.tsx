import React from 'react'
import styled from 'styled-components'
import type { ProjectPreviewCard } from '../projectsStudioData'
import { ratingColor } from '../projectsStudioData'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import {
  PrFollowBtn,
  PrMetricLabel,
  PrMetricValue,
  PrSmallGhostBtn,
  PrSmallPrimaryBtn,
  ProjectLogo,
} from './projectsStudioPrimitives'

const Card = styled.article`
  display: flex;
  flex-direction: column;
  height: ${projectsStudioLayout.cardHeight};
  min-height: ${projectsStudioLayout.cardHeight};
  padding: ${projectsStudioLayout.cardPadding};
  border-radius: ${projectsStudioLayout.cardRadius};
  background: ${projectsStudioColors.panelGradient};
  border: 1px solid ${projectsStudioColors.border};
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 767px) {
    height: auto;
    min-height: ${projectsStudioLayout.cardHeight};
  }
`

const Split = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 16px;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`

const LeftPane = styled.div`
  flex: 0 0 60%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RightPane = styled.div`
  flex: 0 0 calc(40% - 16px);
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${projectsStudioColors.rowBorder};
  padding-left: 16px;

  @media (max-width: 767px) {
    flex: 1;
    border-left: none;
    border-top: 1px solid ${projectsStudioColors.rowBorder};
    padding-left: 0;
    padding-top: 12px;
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
`

const HeaderText = styled.div`
  min-width: 0;
  flex: 1;
`

const Name = styled.div`
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  color: ${projectsStudioColors.text};
`

const Category = styled.div`
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

const Chains = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`

const ChainBadge = styled.span`
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid ${projectsStudioColors.borderStrong};
  font-size: 10px;
  font-weight: 700;
  color: ${projectsStudioColors.secondary};
  display: inline-flex;
  align-items: center;
`

const SummaryLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.gold};
`

const SummaryWrap = styled.div`
  position: relative;
  max-height: calc(1.45em * 4);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1.2em;
    background: linear-gradient(180deg, rgba(16, 16, 16, 0) 0%, #101010 100%);
    pointer-events: none;
  }
`

const Summary = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${projectsStudioColors.summary};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
  row-gap: 10px;
  margin-top: auto;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const RatingBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin-bottom: 12px;
`

const RatingLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

const RatingScore = styled.span<{ $color: string }>`
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: ${({ $color }) =>
    $color === 'green'
      ? projectsStudioColors.green
      : $color === 'gold'
        ? projectsStudioColors.gold
        : $color === 'orange'
          ? projectsStudioColors.orange
          : $color === 'red'
            ? projectsStudioColors.red
            : projectsStudioColors.muted};
`

const RatingSub = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${projectsStudioColors.muted};
`

const SideFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
`

const SideField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SideValue = styled.span<{ $tone?: 'green' | 'gold' | 'red' | 'gray' }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? projectsStudioColors.green
      : $tone === 'gold'
        ? projectsStudioColors.gold
        : $tone === 'red'
          ? projectsStudioColors.red
          : $tone === 'gray'
            ? projectsStudioColors.muted
            : projectsStudioColors.text};
  word-break: break-all;
`

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${projectsStudioLayout.btnGap};
  padding-top: 10px;
  padding-right: 4px;
  min-height: ${projectsStudioLayout.cardFooterHeight};
  flex-shrink: 0;

  @media (max-width: 767px) {
    flex-wrap: wrap;
    width: 100%;

    a,
    button {
      flex: 1;
      min-width: 0;
    }
  }
`

interface Props {
  project: ProjectPreviewCard
}

function metricValue(project: ProjectPreviewCard, label: string) {
  return project.metrics.find((m) => m.label === label)?.value ?? '—'
}

function metricTone(project: ProjectPreviewCard, label: string) {
  return project.metrics.find((m) => m.label === label)?.tone
}

export const ProjectGridCard: React.FC<Props> = ({ project }) => {
  const color = ratingColor(project.rating)
  const liquidity = metricValue(project, 'Liquidity')
  const audit = metricValue(project, 'Audit')

  return (
    <Card data-pr-project-card>
      <Split>
        <LeftPane>
          <HeaderRow>
            <ProjectLogo name={project.name} symbol={project.symbol} size={44} />
            <HeaderText>
              <Name>{project.name}</Name>
              <Category>{project.category}</Category>
              <Chains>
                {project.chains.map((chain) => (
                  <ChainBadge key={chain}>{chain}</ChainBadge>
                ))}
              </Chains>
            </HeaderText>
          </HeaderRow>

          <div>
            <SummaryLabel>AI Summary</SummaryLabel>
            <SummaryWrap>
              <Summary>{project.aiSummary}</Summary>
            </SummaryWrap>
          </div>

          <Metrics>
            {project.metrics.map((metric) => (
              <MetricCell key={metric.label}>
                <PrMetricLabel>{metric.label}</PrMetricLabel>
                <PrMetricValue $tone={metric.tone}>{metric.value}</PrMetricValue>
              </MetricCell>
            ))}
          </Metrics>
        </LeftPane>

        <RightPane>
          <RatingBlock>
            <RatingLabel>AI Rating</RatingLabel>
            <RatingScore $color={color}>{project.rating}</RatingScore>
            <RatingSub>/100 · {project.aiConfidence} confidence</RatingSub>
          </RatingBlock>

          <SideFields>
            <SideField>
              <PrMetricLabel>Risk</PrMetricLabel>
              <SideValue $tone={project.riskTone}>{project.risk}</SideValue>
            </SideField>
            <SideField>
              <PrMetricLabel>Liquidity</PrMetricLabel>
              <SideValue $tone={metricTone(project, 'Liquidity')}>{liquidity}</SideValue>
            </SideField>
            <SideField>
              <PrMetricLabel>Audit</PrMetricLabel>
              <SideValue $tone={metricTone(project, 'Audit')}>{audit}</SideValue>
            </SideField>
            <SideField>
              <PrMetricLabel>Website</PrMetricLabel>
              <SideValue>{project.website}</SideValue>
            </SideField>
            <SideField>
              <PrMetricLabel>Contract</PrMetricLabel>
              <SideValue
                $tone={
                  project.contract === 'Unverified' ? 'red' : project.contract === '—' ? 'gray' : undefined
                }
              >
                {project.contract}
              </SideValue>
            </SideField>
          </SideFields>
        </RightPane>
      </Split>

      <ButtonRow>
        <PrSmallPrimaryBtn as="a" href="/swap">
          Trade
        </PrSmallPrimaryBtn>
        <PrSmallGhostBtn as="a" href={`/projects/${project.slug}`}>
          Open Project
        </PrSmallGhostBtn>
        <PrFollowBtn type="button">Follow</PrFollowBtn>
      </ButtonRow>
    </Card>
  )
}

export default ProjectGridCard
