import React from 'react'
import styled from 'styled-components'
import { buildAiSummary } from 'views/ProjectsStudio/projectsRuntime/buildAiSummary'
import { buildOnChainMetrics } from 'views/ProjectsStudio/projectsRuntime/onChainMetrics'
import { buildProjectRating } from 'views/ProjectsStudio/projectsRuntime/buildProjectRating'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import {
  RADAR_FONT_BODY,
  RADAR_FONT_DISPLAY,
  radarStudioColors,
  radarStudioLayout,
  radarStudioType,
} from '../radarStudioTokens'
import { RadarProjectLogo, RdPanel } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  height: ${radarStudioLayout.featuredHeight};
  padding: ${radarStudioLayout.featuredPadding};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    height: auto;
    overflow: visible;
    padding: 20px;
  }
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: ${radarStudioLayout.featuredSplitLeft} ${radarStudioLayout.featuredSplitRight};
  gap: ${radarStudioLayout.cardGap};
  height: 100%;
  min-height: 0;
  padding-bottom: 4px;
  box-sizing: border-box;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
    height: auto;
    gap: 20px;
  }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`

const Name = styled.h2`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.featuredName};
  font-weight: 700;
  line-height: 1.05;
  color: ${radarStudioColors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    white-space: normal;
    word-break: break-word;
  }
`

const Verified = styled.span`
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  background: rgba(27, 231, 122, 0.08);
  border: 1px solid ${radarStudioColors.green};
  color: ${radarStudioColors.green};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Tag = styled.span`
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${radarStudioColors.cardBorder};
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${radarStudioColors.secondary};
  white-space: nowrap;
`

const Summary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 15px;
  line-height: 1.5;
  color: ${radarStudioColors.summary};
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px 20px;
  margin-top: ${radarStudioLayout.metricsSummaryGap};

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
  }
`

const Metric = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MetricLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.muted};
`

const MetricValue = styled.span<{ $muted?: boolean }>`
  font-family: ${RADAR_FONT_BODY};
  font-size: ${({ $muted }) => ($muted ? '13px' : '14px')};
  font-weight: ${({ $muted }) => ($muted ? 500 : 600)};
  color: ${({ $muted }) => ($muted ? radarStudioColors.secondary : radarStudioColors.text)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const ActionGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${radarStudioLayout.actionGroupGap};
  margin-top: ${radarStudioLayout.featuredMetricsBtnGap};
  width: 100%;
  flex-shrink: 0;
  padding: ${radarStudioLayout.actionGroupPadding};
  border-radius: ${radarStudioLayout.actionGroupRadius};
  border: 1px solid ${radarStudioColors.cardBorder};
  background: rgba(255, 255, 255, 0.02);
  box-sizing: border-box;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    row-gap: calc(${radarStudioLayout.actionGroupGap} + 8px);
  }
`

const ActionBtn = styled.a<{ $primary?: boolean }>`
  height: ${radarStudioLayout.btnHeight};
  border-radius: ${radarStudioLayout.btnRadius};
  border: 1px solid ${({ $primary }) => ($primary ? radarStudioColors.gold : radarStudioColors.gold)};
  background: ${({ $primary }) => ($primary ? radarStudioColors.gold : 'transparent')};
  color: ${({ $primary }) => ($primary ? '#050505' : radarStudioColors.gold)};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-sizing: border-box;
  min-width: 0;
  padding: 0 8px;
  text-align: center;
`

const ScoreBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 0;
  text-align: center;
  height: 100%;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    height: auto;
    padding-top: 4px;
    border-top: 1px solid ${radarStudioColors.cardBorder};
  }
`

const ScoreRing = styled.div`
  width: ${radarStudioType.scoreRingSize};
  height: ${radarStudioType.scoreRingSize};
  border-radius: 50%;
  border: 3px solid ${radarStudioColors.gold};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: ${radarStudioType.scoreLarge};
  font-weight: 700;
  color: ${radarStudioColors.green};
  line-height: 1;
  flex-shrink: 0;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    width: ${radarStudioType.scoreRingSizeMobile};
    height: ${radarStudioType.scoreRingSizeMobile};
    font-size: ${radarStudioType.scoreLargeMobile};
  }
`

const ScoreLabel = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.muted};
`

const Reason = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  line-height: 1.45;
  color: ${radarStudioColors.secondary};
  max-width: 240px;
`

const SignalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${radarStudioLayout.signalGridGap};
  width: 100%;
  max-width: 240px;
`

const Signal = styled.span`
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${radarStudioColors.cardBorder};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${radarStudioColors.gold};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EMPTY = '—'

function isEmpty(v: string) {
  return v === EMPTY || v === 'Unavailable'
}

function displayMetric(v: string) {
  return isEmpty(v) ? EMPTY : v
}

function signalLabel(reason: string) {
  return reason.split(' ').slice(0, 2).join(' ')
}

export const RadarFeaturedAnalysisPanel: React.FC = () => {
  const { featured, opportunity } = useRadarRuntime()

  if (!featured) {
    return (
      <Panel data-rd-featured>
        <Summary>No indexed projects in Radar runtime.</Summary>
      </Panel>
    )
  }

  const project = featured
  const token = project.resources.tokens[0]
  const sym = token?.symbol ?? project.displayName
  const onChain = buildOnChainMetrics(project)
  const rating = buildProjectRating(project)
  const audit =
    project.trustBadges.includes('canonical') ? 'Canonical' : project.verificationStatus === 'observed' ? 'Observed' : EMPTY
  const risk =
    rating.tier === 'exceptional' || rating.tier === 'strong'
      ? 'Low'
      : rating.tier === 'high-risk'
        ? 'High'
        : 'Medium'

  const metrics = [
    { label: 'Liquidity', value: onChain.liquidity },
    { label: 'Volume', value: onChain.volume },
    { label: 'Whales', value: onChain.holders },
    { label: 'Holder Growth', value: EMPTY },
    { label: 'Contract', value: token?.address ? `${token.address.slice(0, 6)}…${token.address.slice(-4)}` : EMPTY },
    { label: 'Risk', value: risk },
    { label: 'Audit', value: audit },
    { label: 'Freshness', value: 'Registry' },
  ]

  const tags = [...project.sectorTags.slice(0, 3)]
  const signals = opportunity.reasons.slice(0, 4).map(signalLabel)

  const scoreBlock = (
    <ScoreBlock>
      <ScoreLabel>AI Opportunity Score</ScoreLabel>
      <ScoreRing>{opportunity.score}</ScoreRing>
      <Reason>{opportunity.summary}</Reason>
      <MetricValue $muted={false}>{opportunity.confidence}% confidence</MetricValue>
      <SignalGrid data-rd-signal-grid>
        {signals.map((label, i) => (
          <Signal key={`${label}-${i}`}>{label}</Signal>
        ))}
      </SignalGrid>
    </ScoreBlock>
  )

  return (
    <Panel data-rd-featured>
      <Inner>
        <Main>
          <TitleRow>
            <RadarProjectLogo name={sym} symbol={sym} size={72} address={token?.address} />
            <div style={{ minWidth: 0 }}>
              <Name>{sym}</Name>
              {project.trustBadges.includes('canonical') ? <Verified>Verified</Verified> : null}
            </div>
          </TitleRow>
          <Tags>
            {tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </Tags>
          <Summary>{buildAiSummary(project)}</Summary>
          <Metrics>
            {metrics.map((m) => (
              <Metric key={m.label}>
                <MetricLabel>{m.label}</MetricLabel>
                <MetricValue $muted={isEmpty(m.value)}>{displayMetric(m.value)}</MetricValue>
              </Metric>
            ))}
          </Metrics>
          <ActionGroup data-rd-featured-actions>
            <ActionBtn $primary href={token?.address ? `/trade?outputCurrency=${token.address}` : '/trade'}>
              Trade
            </ActionBtn>
            <ActionBtn href={`/projects/${project.slug}`}>Project</ActionBtn>
            <ActionBtn href={token?.address ? `/radar?contract=${token.address}` : '/radar'}>
              Contract Intelligence
            </ActionBtn>
            <ActionBtn href={project.spaceProfileUrl ?? project.websiteUrl ?? '#'} target="_blank" rel="noopener noreferrer">
              Professional Audit
            </ActionBtn>
          </ActionGroup>
        </Main>
        {scoreBlock}
      </Inner>
    </Panel>
  )
}

export default RadarFeaturedAnalysisPanel
