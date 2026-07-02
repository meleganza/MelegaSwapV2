import React from 'react'
import styled from 'styled-components'
import type { RadarDiscoveryCard as RadarDiscoveryCardType } from '../radarStudioData'
import { statusColor } from '../radarStudioData'
import { RADAR_FONT, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import {
  AnimatedSparkline,
  RadarProjectLogo,
  RdGhostBtn,
  RdLabel,
  RdPrimaryBtn,
  StatusDot,
} from './radarStudioPrimitives'

const Card = styled.article`
  height: ${radarStudioLayout.discoveryCardHeight};
  min-height: ${radarStudioLayout.discoveryCardHeight};
  padding: 20px;
  border-radius: ${radarStudioLayout.discoveryCardRadius};
  border: 1px solid ${radarStudioColors.border};
  background: ${radarStudioColors.panel};
  box-shadow: ${radarStudioColors.shadow};
  box-sizing: border-box;
  display: flex;
  gap: 14px;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 767px) {
    flex-direction: column;
    height: auto;
    min-height: ${radarStudioLayout.discoveryCardHeight};
  }
`

const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const Intel = styled.div`
  width: 148px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-left: 1px solid ${radarStudioColors.border};
  padding-left: 12px;

  @media (max-width: 767px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid ${radarStudioColors.border};
    padding-left: 0;
    padding-top: 10px;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Rank = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid ${radarStudioColors.border};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${RADAR_FONT};
  font-size: 11px;
  font-weight: 800;
  color: ${radarStudioColors.grey};
  flex-shrink: 0;
`

const Name = styled.div`
  font-family: ${RADAR_FONT};
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: ${radarStudioColors.white};
`

const Pair = styled.div`
  margin-top: 2px;
  font-family: ${RADAR_FONT};
  font-size: 13px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
`

const ScoreBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
`

const Score = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 20px;
  font-weight: 800;
  color: ${radarStudioColors.green};
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`

const Tag = styled.span`
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${radarStudioColors.border};
  font-family: ${RADAR_FONT};
  font-size: 10px;
  font-weight: 700;
  color: ${radarStudioColors.grey};
  display: inline-flex;
  align-items: center;
`

const Summary = styled.p`
  margin: 8px 0 0;
  max-width: 220px;
  font-family: ${RADAR_FONT};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.45;
  color: ${radarStudioColors.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-top: auto;
  padding-top: 10px;
`

const MetricCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MetricValue = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 18px;
  font-weight: 700;
  color: ${radarStudioColors.white};
  line-height: 1;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: ${radarStudioLayout.discoveryBtnGap};
  margin-top: 10px;
`

const IntelTitle = styled.div`
  font-family: ${RADAR_FONT};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.gold};
  margin-bottom: 4px;
`

const IntelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${RADAR_FONT};
  font-size: 10px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
  line-height: 1.2;
`

const AuditCta = styled.a`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${radarStudioLayout.auditBtnHeight};
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${radarStudioColors.gold};
  font-family: ${RADAR_FONT};
  font-size: 10px;
  font-weight: 700;
  color: ${radarStudioColors.gold};
  text-decoration: none;
  text-align: center;
  line-height: 1.2;
  transition: transform 180ms ease;

  &:hover {
    transform: scale(0.98);
  }
`

interface Props {
  project: RadarDiscoveryCardType
}

export const RadarDiscoveryCard: React.FC<Props> = ({ project }) => (
  <Card data-rd-discovery-card>
    <Main>
      <TopRow>
        <HeaderMain>
          <Rank>{project.rank}</Rank>
          <RadarProjectLogo name={project.name} symbol={project.symbol} size={36} />
          <div>
            <Name>{project.name}</Name>
            <Pair>{project.pair}</Pair>
          </div>
        </HeaderMain>
        <ScoreBlock>
          <Score>{project.aiScore}/100</Score>
          <AnimatedSparkline points={project.sparkline} width={48} height={16} />
        </ScoreBlock>
      </TopRow>

      <Tags>
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Tags>

      <Summary>{project.summary}</Summary>

      <Metrics>
        <MetricCell>
          <RdLabel>Liquidity</RdLabel>
          <MetricValue>{project.liquidity}</MetricValue>
        </MetricCell>
        <MetricCell>
          <RdLabel>24h Vol</RdLabel>
          <MetricValue>{project.volume}</MetricValue>
        </MetricCell>
        <MetricCell>
          <RdLabel>Holders</RdLabel>
          <MetricValue>{project.holders}</MetricValue>
        </MetricCell>
        <MetricCell>
          <RdLabel>Whales</RdLabel>
          <MetricValue>{project.whaleActivity}</MetricValue>
        </MetricCell>
        <MetricCell>
          <RdLabel>Age</RdLabel>
          <MetricValue>{project.age}</MetricValue>
        </MetricCell>
      </Metrics>

      <Footer>
        <RdPrimaryBtn type="button">Trade</RdPrimaryBtn>
        <RdGhostBtn type="button">Open Project</RdGhostBtn>
        <RdGhostBtn type="button">★ Watch</RdGhostBtn>
      </Footer>
    </Main>

    <Intel>
      <IntelTitle>AI Contract Intel</IntelTitle>
      {project.contractIntel.slice(0, 6).map((item) => (
        <IntelRow key={item.label}>
          <StatusDot level={item.status} />
          <span style={{ color: statusColor(item.status) }}>{item.label}</span>
        </IntelRow>
      ))}
      <AuditCta href="https://space.melega.io" target="_blank" rel="noopener noreferrer">
        Professional AI Contract Audit — Melega Space
      </AuditCta>
    </Intel>
  </Card>
)

export default RadarDiscoveryCard
