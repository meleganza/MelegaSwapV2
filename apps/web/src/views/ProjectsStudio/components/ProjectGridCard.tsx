import React from 'react'
import styled from 'styled-components'
import type { ProjectPreviewCard } from '../projectsStudioData'
import { ratingColor } from '../projectsStudioData'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import {
  PrMetricLabel,
  PrMetricValue,
  PrSmallGhostBtn,
  PrSmallPrimaryBtn,
  ProjectLogo,
} from './projectsStudioPrimitives'

const Card = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 10px;
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`

const Rank = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${projectsStudioColors.muted};
  min-width: 20px;
`

const HeaderMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
`

const HeaderText = styled.div`
  min-width: 0;
  flex: 1;
`

const Name = styled.div`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: ${projectsStudioColors.text};
`

const Category = styled.div`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

const Chains = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
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

const StatusBadge = styled.span<{ $status: ProjectPreviewCard['status'] }>`
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  border: 1px solid
    ${({ $status }) =>
      $status === 'verified'
        ? projectsStudioColors.green
        : $status === 'new'
          ? projectsStudioColors.gold
          : projectsStudioColors.borderStrong};
  color: ${({ $status }) =>
    $status === 'verified'
      ? projectsStudioColors.green
      : $status === 'new'
        ? projectsStudioColors.gold
        : projectsStudioColors.secondary};
  background: ${({ $status }) =>
    $status === 'verified' ? 'rgba(0,230,118,0.08)' : $status === 'new' ? projectsStudioColors.previewBadgeBg : 'transparent'};
`

const RatingBadge = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
`

const RatingScore = styled.span<{ $color: string }>`
  font-size: 18px;
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
  font-size: 10px;
  font-weight: 700;
  color: ${projectsStudioColors.muted};
`

const SummaryLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.gold};
`

const Summary = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${projectsStudioColors.summary};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
  row-gap: 8px;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const RatingBox = styled.div`
  height: ${projectsStudioLayout.ratingBoxHeight};
  min-height: ${projectsStudioLayout.ratingBoxHeight};
  border-radius: 12px;
  border: 1px solid ${projectsStudioColors.border};
  background: rgba(255, 255, 255, 0.02);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 12px;
  align-items: center;
`

const RatingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const RatingItemLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
`

const RatingItemValue = styled.span<{ $tone?: 'green' | 'gold' | 'red' | 'gray' }>`
  font-size: 13px;
  font-weight: 800;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? projectsStudioColors.green
      : $tone === 'gold'
        ? projectsStudioColors.gold
        : $tone === 'red'
          ? projectsStudioColors.red
          : projectsStudioColors.text};
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${projectsStudioLayout.btnGap};
  flex-shrink: 0;
  padding-top: 10px;

  @media (max-width: 359px) {
    flex-direction: column;
    width: 100%;

    a,
    button {
      width: 100%;
    }
  }
`

interface Props {
  project: ProjectPreviewCard
}

export const ProjectGridCard: React.FC<Props> = ({ project }) => {
  const color = ratingColor(project.rating)
  const displayMetrics = project.metrics.slice(0, 8)

  return (
    <Card data-pr-project-card>
      <Body>
        <TopRow>
          <Rank>#{project.rank}</Rank>
          <HeaderMain>
            <ProjectLogo name={project.name} symbol={project.symbol} size={48} />
            <HeaderText>
              <Name>{project.name}</Name>
              <Category>{project.category}</Category>
              <Chains>
                {project.chains.map((chain) => (
                  <ChainBadge key={chain}>{chain}</ChainBadge>
                ))}
                <StatusBadge $status={project.status}>
                  {project.status === 'verified' ? 'Verified' : project.status === 'new' ? 'New' : 'Community'}
                </StatusBadge>
              </Chains>
            </HeaderText>
          </HeaderMain>
          <RatingBadge $color={color}>
            <RatingScore $color={color}>{project.rating}</RatingScore>
            <RatingSub>/100</RatingSub>
          </RatingBadge>
        </TopRow>

        <div>
          <SummaryLabel>AI Summary</SummaryLabel>
          <Summary>{project.aiSummary}</Summary>
        </div>

        <Metrics>
          {displayMetrics.map((metric) => (
            <MetricCell key={metric.label}>
              <PrMetricLabel>{metric.label}</PrMetricLabel>
              <PrMetricValue $tone={metric.tone}>{metric.value}</PrMetricValue>
            </MetricCell>
          ))}
        </Metrics>

        <RatingBox>
          <RatingItem>
            <RatingItemLabel>AI Confidence</RatingItemLabel>
            <RatingItemValue>{project.aiConfidence}</RatingItemValue>
          </RatingItem>
          <RatingItem>
            <RatingItemLabel>Melega Rating</RatingItemLabel>
            <RatingItemValue $tone="green">{project.melegaRating}</RatingItemValue>
          </RatingItem>
          <RatingItem>
            <RatingItemLabel>Risk</RatingItemLabel>
            <RatingItemValue $tone={project.riskTone}>{project.risk}</RatingItemValue>
          </RatingItem>
        </RatingBox>
      </Body>

      <Footer>
        <PrSmallPrimaryBtn as="a" href="/swap">
          Trade
        </PrSmallPrimaryBtn>
        <PrSmallGhostBtn as="a" href={`/projects/${project.slug}`}>
          Open Project
        </PrSmallGhostBtn>
      </Footer>
    </Card>
  )
}

export default ProjectGridCard
