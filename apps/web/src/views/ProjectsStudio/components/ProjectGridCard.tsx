import React, { useCallback, useEffect, useState } from 'react'
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
  min-height: ${projectsStudioLayout.cardMinHeight};
  height: auto;
  padding: ${projectsStudioLayout.cardPadding};
  border-radius: ${projectsStudioLayout.cardRadius};
  background: ${projectsStudioColors.panelGradient};
  border: 1px solid ${projectsStudioColors.borderStrong};
  box-sizing: border-box;
  min-width: 0;
  overflow: visible;

  @media (max-width: 767px) {
    min-height: auto;
    padding: 14px;
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

const PendingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  margin-top: 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${projectsStudioColors.gold};
  border: 1px solid rgba(214, 180, 69, 0.45);
  background: rgba(214, 180, 69, 0.08);
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
  min-height: 57px;
`

const Summary = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 19px;
  color: ${projectsStudioColors.summary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  flex-wrap: wrap;
  gap: ${projectsStudioLayout.btnGap};
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${projectsStudioColors.rowBorder};
  flex-shrink: 0;

  a,
  button {
    flex: 0 1 auto;
    min-height: ${projectsStudioLayout.btnHeight};
  }

  @media (max-width: 767px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;

    a,
    button {
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
    }
  }
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

function metricTone(project: ProjectPreviewCard, label: string) {
  return project.metrics.find((m) => m.label === label)?.tone
}

export const ProjectGridCard: React.FC<Props> = ({ project }) => {
  const color = ratingColor(project.rating)
  const liquidity = metricValue(project, 'Liquidity')
  const audit = metricValue(project, 'Audit')
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
  const isPending = project.registryTier === 'pending' || project.status === 'pending'

  return (
    <Card data-pr-project-card>
      <Split>
        <LeftPane>
          <HeaderRow>
            <ProjectLogo name={project.name} symbol={project.symbol} size={44} />
            <HeaderText>
              <Name>{project.name}</Name>
              <Category>{project.category}</Category>
              {isPending ? (
                <PendingBadge data-pr-pending-badge>
                  {project.reviewStatus ?? 'Pending Review'}
                </PendingBadge>
              ) : null}
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
        <PrSmallPrimaryBtn as="a" href={tradeHref}>
          Trade
        </PrSmallPrimaryBtn>
        <PrSmallGhostBtn as="a" href={projectHref}>
          {isPending ? 'Review Import' : 'Open Project'}
        </PrSmallGhostBtn>
        {radarHref ? (
          <PrSmallGhostBtn as="a" href={radarHref}>
            Radar
          </PrSmallGhostBtn>
        ) : null}
        <PrFollowBtn type="button" onClick={toggleFollow} aria-pressed={following}>
          {following ? 'Following' : 'Follow'}
        </PrFollowBtn>
      </ButtonRow>
    </Card>
  )
}

export default ProjectGridCard
