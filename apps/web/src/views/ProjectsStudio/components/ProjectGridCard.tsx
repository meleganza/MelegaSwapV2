import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import type { ProjectPreviewCard } from '../projectsStudioData'
import { ratingColor } from '../projectsStudioData'
import { PR_FONT_BODY, projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import {
  PrCardFollowBtn,
  PrCardOutlineBtn,
  PrCardOutlineBtnDisabled,
  PrCardPrimaryBtn,
  PrMetricLabel,
  PrMetricValue,
  ProjectLogo,
} from './projectsStudioPrimitives'

const Card = styled.article`
  height: ${projectsStudioLayout.projectCardHeight};
  padding: 24px;
  border-radius: ${projectsStudioLayout.cardRadius};
  background: ${projectsStudioColors.card};
  border: 1px solid ${projectsStudioColors.cardBorder};
  box-sizing: border-box;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 180ms ease;

  &:hover {
    border-color: ${projectsStudioColors.cardBorderHover};
  }
`

const Split = styled.div`
  display: grid;
  grid-template-columns: ${projectsStudioLayout.cardSplitLeft} ${projectsStudioLayout.cardSplitRight};
  gap: 20px;
  flex: 1;
  min-height: 0;

  @media (max-width: ${projectsStudioLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

const LeftPane = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RightPane = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding-left: ${projectsStudioLayout.cardRightPanePadding};
  box-sizing: border-box;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`

const Name = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  color: ${projectsStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Tags = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
`

const Tag = styled.span`
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  font-family: ${PR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${projectsStudioColors.secondary};
  display: inline-flex;
  align-items: center;
`

const Summary = styled.p`
  margin: 0;
  font-family: ${PR_FONT_BODY};
  font-size: 14px;
  line-height: 1.45;
  color: ${projectsStudioColors.summary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-top: auto;
`

const MetricCell = styled.div`
  min-width: 0;
`

const RatingTop = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  color: ${({ $color }: { $color: string }) =>
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

const RatingLabel = styled.div`
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
  margin-bottom: 4px;
`

const SideField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ButtonRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${projectsStudioLayout.cardBtnGap};
  width: 100%;
  flex-shrink: 0;
  margin-top: ${projectsStudioLayout.cardActionRowSpacing};
`

const FOLLOW_STORAGE_KEY = 'melega-projects-follow'

function readFollowedSlugs(): string[] {
  try {
    const raw = localStorage.getItem(FOLLOW_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeFollowedSlugs(slugs: string[]) {
  localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(slugs))
}

interface Props {
  project: ProjectPreviewCard
}

function metricValue(project: ProjectPreviewCard, label: string) {
  return project.metrics.find((m) => m.label === label)?.value ?? '—'
}

function isEmptyMetric(v: string) {
  return v === '—' || v === 'Unavailable'
}

function metricTone(project: ProjectPreviewCard, label: string) {
  const v = metricValue(project, label)
  if (isEmptyMetric(v)) return 'gray' as const
  return project.metrics.find((m) => m.label === label)?.tone
}

export const ProjectGridCard: React.FC<Props> = ({ project }) => {
  const color = ratingColor(project.rating)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    setFollowing(readFollowedSlugs().includes(project.slug))
  }, [project.slug])

  const toggleFollow = useCallback(() => {
    const current = readFollowedSlugs()
    const next = current.includes(project.slug)
      ? current.filter((s) => s !== project.slug)
      : [...current, project.slug]
    writeFollowedSlugs(next)
    setFollowing(next.includes(project.slug))
  }, [project.slug])

  const tradeHref = project.tradeHref ?? '/trade'
  const projectHref = project.importHref ?? project.projectHref ?? `/projects/${project.slug}`
  const radarHref = project.radarHref

  return (
    <Card data-pr-project-card>
      <Split>
        <LeftPane>
          <HeaderRow>
            <ProjectLogo
              name={project.name}
              symbol={project.symbol}
              size={48}
              address={project.contractAddress}
            />
            <div style={{ minWidth: 0 }}>
              <Name>{project.name}</Name>
              <Tags>
                <Tag>{project.category}</Tag>
                {project.chains.slice(0, 3).map((chain) => (
                  <Tag key={chain}>{chain}</Tag>
                ))}
              </Tags>
            </div>
          </HeaderRow>
          <Summary>{project.aiSummary}</Summary>
          <Metrics>
            {project.metrics.slice(0, 4).map((metric) => (
              <MetricCell key={metric.label}>
                <PrMetricLabel>{metric.label}</PrMetricLabel>
                <PrMetricValue $muted={isEmptyMetric(metric.value)} $tone={metric.tone}>
                  {metric.value}
                </PrMetricValue>
              </MetricCell>
            ))}
          </Metrics>
        </LeftPane>
        <RightPane>
          <div>
            <RatingLabel>AI Rating</RatingLabel>
            <RatingTop $color={color}>{project.rating}</RatingTop>
            <PrMetricValue $muted={project.aiConfidence === 'Unavailable'}>
              {project.aiConfidence} confidence
            </PrMetricValue>
          </div>
          <SideField>
            <PrMetricLabel>Risk</PrMetricLabel>
            <PrMetricValue $tone={project.riskTone} $muted={project.risk === 'Unavailable'}>
              {project.risk}
            </PrMetricValue>
          </SideField>
          <SideField>
            <PrMetricLabel>Audit</PrMetricLabel>
            <PrMetricValue $tone={metricTone(project, 'Audit')} $muted={metricValue(project, 'Audit') === 'Unavailable'}>
              {metricValue(project, 'Audit')}
            </PrMetricValue>
          </SideField>
          <SideField>
            <PrMetricLabel>Website</PrMetricLabel>
            <PrMetricValue $muted={project.website === 'Unavailable'}>{project.website}</PrMetricValue>
          </SideField>
          <SideField>
            <PrMetricLabel>Contract</PrMetricLabel>
            <PrMetricValue
              $tone={project.contract === 'Unverified' ? 'red' : project.contract === 'Unavailable' ? 'gray' : undefined}
              $muted={project.contract === 'Unavailable'}
            >
              {project.contract}
            </PrMetricValue>
          </SideField>
        </RightPane>
      </Split>
      <ButtonRow data-pr-action-bar>
        <PrCardPrimaryBtn href={tradeHref}>Trade</PrCardPrimaryBtn>
        <PrCardOutlineBtn href={projectHref}>Open Project</PrCardOutlineBtn>
        {radarHref ? (
          <PrCardOutlineBtn href={radarHref}>Radar</PrCardOutlineBtn>
        ) : (
          <PrCardOutlineBtnDisabled>Radar</PrCardOutlineBtnDisabled>
        )}
        <PrCardFollowBtn type="button" onClick={toggleFollow}>
          {following ? 'Following' : 'Follow'}
        </PrCardFollowBtn>
      </ButtonRow>
    </Card>
  )
}

export default ProjectGridCard
